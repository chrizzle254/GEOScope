import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import pLimit from 'p-limit';
import { supabaseAdmin } from '../lib/supabase';
import { MentionParser } from './mentionParser';
import { generateAnalysisPrompts, GeneratedPrompt } from './promptGenerator';
import {
  SupportedModel,
  LLMProvider,
  ParseOptions,
  MentionResult,
} from '@geoscope/shared/types';
import type { LanguageModel } from 'ai';

// Restrict concurrency to 10 simultaneous LLM calls
const limit = pLimit(10);

export interface AnalysisOptions {
  reportingSubjectId: string;
  organizationId: string;
  models: SupportedModel[];
}


/**
 * Runs a blind share-of-voice analysis across multiple LLM providers.
 * - Throttles concurrency to avoid rate-limiting.
 * - Persists raw LLM responses atomically to the database.
 * - Manages the status of the analysis run.
 * - Dynamically selects models based on analysis configuration.
 *
 * @param analysisId - The UUID of the analysis run to execute.
 * @param options - The analysis configuration containing brand, competitors, and selected models.
 */
async function persistTaskError(runId: string, promptId: string, modelId: string, error: Error) {
  console.error(
    `[persistTaskError] Logging failure for run ${runId}, prompt ${promptId}, model ${modelId}:`,
    error.message,
  );
  // Log the error as a response entry (prompt_id is nullable for generated prompts)
  await supabaseAdmin.rpc('insert_llm_response', {
    p_analysis_run_id: runId,
    p_provider: modelId,
    p_prompt_id: null,
    p_response_text: `Task Error: ${error.message}`,
  });
}

async function persistTaskSuccess(
  runId: string,
  promptId: string | null,
  modelId: string,
  rawResponse: string,
  mentionData: MentionResult,
) {
  // 1. Insert into internal.llm_responses via the existing RPC function
  // prompt_id is nullable — generated prompts have no DB UUID
  const { data: responseId, error: responseLogError } = await supabaseAdmin.rpc(
    'insert_llm_response',
    {
      p_analysis_run_id: runId,
      p_provider: modelId,
      p_response_text: rawResponse,
      p_prompt_id: null,
    },
  );

  if (responseLogError || !responseId) {
    throw new Error(`Failed to log via rpc('insert_llm_response'): ${responseLogError?.message}`);
  }

  console.log(
    `[persistTaskSuccess] Saved raw response via RPC for prompt ${promptId}, response ID: ${responseId}`,
  );

  // 2. Insert into public.mentions, using the ID returned from the RPC
  const { error: mentionError } = await supabaseAdmin.from('mentions').insert({
    run_id: runId,
    response_id: responseId, // Use the ID from the RPC call
    brand_mentioned: mentionData.brandMentioned,
    competitors_mentioned: mentionData.competitorsMentioned,
    excerpt_brand: mentionData.excerpts.brand,
    excerpt_competitors: mentionData.excerpts.competitors || {},
    confidence: mentionData.confidence,
  });

  if (mentionError) {
    throw new Error(
      `Failed to save to public.mentions for response ${responseId}: ${mentionError.message}`,
    );
  }

  console.log(`[persistTaskSuccess] Saved mention data for prompt ${promptId}.`);
}

export async function runAnalysis(analysisId: string, options: AnalysisOptions) {
  console.log(`[runAnalysis] Starting analysis ${analysisId} with options:`, options);

  // Set Status to 'processing'
  await supabaseAdmin.from('analysis_runs').update({ status: 'processing' }).eq('id', analysisId);

  try {
    // 1. Fetch brand metadata and competitors
    const { data: brand, error: brandError } = await supabaseAdmin
      .from('reporting_subject')
      .select('*, reporting_subject_competitors(*)')
      .eq('id', options.reportingSubjectId)
      .single();

    if (brandError || !brand) {
      throw new Error(`Brand not found: ${brandError?.message}`);
    }

    console.log(`[runAnalysis] Brand: ${brand.name}, industry: ${brand.industry}`);

    // 2. Dynamically generate analysis prompts via LLM (brand-blind)
    console.log(`[runAnalysis] Generating analysis prompts for brand: ${brand.name} (${brand.industry})`);
    const prompts: GeneratedPrompt[] = await generateAnalysisPrompts(
      {
        brandName: brand.name,
        industry: brand.industry || 'general',
        targetAudience: brand.target_audience || 'consumers',
        competitors: brand.reporting_subject_competitors.map(
          (c: { name: string }) => c.name,
        ),
      },
      100,
    );
    if (!prompts || prompts.length === 0) {
      throw new Error('Prompt generator returned no prompts.');
    }
    console.log(`[runAnalysis] Generated ${prompts.length} analysis prompts`);

    // 3. Fetch provider details from database
    const { data: providers, error: providersError } = await supabaseAdmin.rpc('get_llm_providers');
    if (providersError) throw providersError;
    if (!providers || providers.length === 0) {
      throw new Error('No active LLM providers found in the database.');
    }
    console.log(`[runAnalysis] Loaded ${providers.length} providers`);

    // 4. Filter to only requested models and build instances dynamically
    const requestedProviders = providers.filter((p: LLMProvider) =>
      options.models.includes(p.id as SupportedModel),
    );
    console.log(
      `[runAnalysis] Filtered to ${requestedProviders.length} requested providers:`,
      requestedProviders.map((p: LLMProvider) => p.id),
    );

    if (requestedProviders.length === 0) {
      throw new Error('No valid providers found for the requested models.');
    }

    // 5. Build model instances dynamically based on provider configuration
    interface ModelInstance {
      id: SupportedModel;
      instance: LanguageModel;
    }

    const models: ModelInstance[] = requestedProviders.map((provider: LLMProvider) => {
      let instance: LanguageModel;
      switch (provider.id) {
        case 'openai':
          instance = openai(provider.model_version); // e.g., 'gpt-5.2'
          break;
        case 'anthropic':
          instance = anthropic(provider.model_version); // e.g., 'claude-4.6'
          break;
        case 'google':
          instance = google(provider.model_version); // e.g., 'gemini-3.1-pro'
          break;
        default:
          throw new Error(`Unsupported provider: ${provider.id}`);
      }
      return { id: provider.id, instance };
    });
    console.log(`[runAnalysis] Built ${models.length} model instances`);

    // 6. Create a queue of tasks using p-limit
    console.log(
      `[runAnalysis] Creating task queue: ${prompts.length} prompts × ${models.length} models = ${prompts.length * models.length} total tasks`,
    );

    const tasks = prompts.flatMap((promptDoc: GeneratedPrompt) =>
      models.map((model: ModelInstance) =>
        limit(async () => {
          try {
            // Generated prompts are already fully formed — no template filling needed
            console.log(`[runAnalysis] Calling ${model.id} for prompt ${promptDoc.id}`);

            const { text } = await generateText({
              model: model.instance,
              messages: [{ role: 'user', content: promptDoc.text }],
            });
            console.log(
              `[runAnalysis] ${model.id} responded for prompt ${promptDoc.id}, length: ${text.length}`,
            );

            console.log(
              `[runAnalysis] Parsing response from ${model.id} for prompt ${promptDoc.id}...`,
            );
            const parseOptions: ParseOptions = {
              brandName: brand.name,
              brandAliases: brand.aliases || [],
              competitorMap: brand.reporting_subject_competitors.reduce(
                (acc: Record<string, string[]>, c: { name: string; aliases: string[] | null }) => {
                  acc[c.name] = c.aliases || [];
                  return acc;
                },
                {},
              ),
              responseText: text,
            };
            const mentionResult = MentionParser.parse(parseOptions);

            await persistTaskSuccess(analysisId, promptDoc.id, model.id, text, mentionResult);
          } catch (e: unknown) {
            const error = e instanceof Error ? e : new Error(String(e));
            await persistTaskError(analysisId, promptDoc.id, model.id, error);
          }
        }),
      ),
    );

    console.log(
      `[runAnalysis] Starting execution of ${tasks.length} tasks with concurrency limit of 10`,
    );

    // Wait for all throttled promises to resolve
    await Promise.all(tasks);

    console.log(`[runAnalysis] All tasks completed for analysis ${analysisId}`);

    // Set Status to 'completed'
    await supabaseAdmin.from('analysis_runs').update({ status: 'completed' }).eq('id', analysisId);
  } catch (error) {
    console.error(`Critical failure in analysis run ${analysisId}:`, error);
    // On critical failure (e.g., failed to fetch prompts), mark the run as 'failed'
    await supabaseAdmin
      .from('analysis_runs')
      .update({ status: 'failed', error: (error as Error).message })
      .eq('id', analysisId);
  }
}
