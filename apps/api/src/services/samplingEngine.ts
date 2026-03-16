import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import pLimit from 'p-limit';
import { supabaseAdmin } from '../lib/supabase';
import { MentionParser } from './mentionParser';
import { SupportedModel, LLMProvider, Prompt, TemplateData, ParseOptions, MentionResult } from '@geoscope/shared/types';
import type { LanguageModel } from 'ai';

// Restrict concurrency to 10 simultaneous LLM calls
const limit = pLimit(10);

export interface AnalysisOptions {
  reportingSubjectId: string;
  organizationId: string;
  models: SupportedModel[];
}

/**
 * Fill template placeholders with actual brand data
 */
function fillTemplate(template: string, data: TemplateData): string {
  if (!template || template.trim() === '') {
    throw new Error('Template text is empty or undefined');
  }

  let filled = template;

  Object.entries(data).forEach(([key, value]) => {
    if (value) {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      filled = filled.replace(placeholder, value);
    }
  });

  // Remove any unfilled placeholders
  filled = filled.replace(/{{[^}]+}}/g, '').trim();

  // Ensure we still have content after processing
  if (!filled || filled === '') {
    console.warn(`Template resulted in empty string. Original: "${template}"`);
    return template; // Return original if processing resulted in empty string
  }

  return filled;
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
  console.error(`[persistTaskError] Logging failure for run ${runId}, prompt ${promptId}, model ${modelId}:`, error.message);
  // Use the existing RPC to log the error
  await supabaseAdmin.rpc('insert_llm_response', {
    p_analysis_run_id: runId,
    p_provider: modelId,
    p_prompt_id: promptId,
    p_response_text: `Task Error: ${error.message}`,
    p_is_error: true, // Assuming the RPC function is designed to handle this parameter
  });
}

async function persistTaskSuccess(
  runId: string,
  promptId: string,
  modelId: string,
  rawResponse: string,
  mentionData: MentionResult,
) {
  // 1. Insert into internal.llm_responses via the existing RPC function
  const { data: responseId, error: responseLogError } = await supabaseAdmin.rpc(
    'insert_llm_response',
    {
      p_analysis_run_id: runId,
      p_provider: modelId,
      p_response_text: rawResponse,
      p_prompt_id: promptId,
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
    throw new Error(`Failed to save to public.mentions for response ${responseId}: ${mentionError.message}`);
  }

   console.log(
    `[persistTaskSuccess] Saved mention data for prompt ${promptId}.`,
  );
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

    // Prepare template data
    const templateData: TemplateData = {
      brand_name: brand.name,
      industry: brand.industry || 'general',
      target_audience: brand.target_audience || 'consumers',
      competitor_1: brand.reporting_subject_competitors[0]?.name,
      competitor_2: brand.reporting_subject_competitors[1]?.name,
      competitor_3: brand.reporting_subject_competitors[2]?.name,
    };

    console.log(`[runAnalysis] Prepared template data:`, templateData);

    // 2. Load System Prompts from the database via RPC (internal schema)
    const { data: prompts, error: promptsError } = await supabaseAdmin.rpc('get_internal_prompts');
    if (promptsError) throw promptsError;
    if (!prompts || prompts.length === 0) {
      throw new Error('No system prompts found in the database.');
    }
    console.log(`[runAnalysis] Loaded ${prompts.length} prompts`);

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

    const tasks = prompts.flatMap((promptDoc: Prompt) =>
      models.map((model: ModelInstance) =>
        limit(async () => {
          try {
            const filledPrompt = fillTemplate(promptDoc.template_text, templateData);
            console.log(`[runAnalysis] Calling ${model.id} for prompt ${promptDoc.id}`);

            const { text } = await generateText({
              model: model.instance,
              messages: [{ role: 'user', content: filledPrompt }],
            });
            console.log(`[runAnalysis] ${model.id} responded for prompt ${promptDoc.id}, length: ${text.length}`);

            console.log(`[runAnalysis] Parsing response from ${model.id} for prompt ${promptDoc.id}...`);
            const parseOptions: ParseOptions = {
              brandName: brand.name,
              brandAliases: brand.aliases || [],
              competitorMap: brand.reporting_subject_competitors.reduce((acc: any, c: any) => {
                acc[c.name] = c.aliases || [];
                return acc;
              }, {}),
              responseText: text,
            };
            const mentionResult = MentionParser.parse(parseOptions);

            await persistTaskSuccess(analysisId, promptDoc.id, model.id, text, mentionResult);

          } catch (error: any) {
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
