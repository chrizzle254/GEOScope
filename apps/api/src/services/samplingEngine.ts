import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import pLimit from 'p-limit';
import { supabaseAdmin } from '../lib/supabase';
import { SupportedModel, LLMProvider, Prompt } from '@geoscope/shared/types';
import type { LanguageModel } from 'ai';

// Restrict concurrency to 10 simultaneous LLM calls
const limit = pLimit(10);

export interface AnalysisOptions {
  brand: string;
  competitors: string[];
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
export async function runAnalysis(analysisId: string, options: AnalysisOptions) {
  console.log(`[runAnalysis] Starting analysis ${analysisId} with options:`, options);

  // Set Status to 'processing'
  await supabaseAdmin.from('analysis_runs').update({ status: 'processing' }).eq('id', analysisId);

  try {
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
            console.log(`[runAnalysis] Calling ${model.id} for prompt ${promptDoc.id}`);

            // Use generateText for full backend responses
            const { text } = await generateText({
              model: model.instance,
              messages: [
                {
                  role: 'user',
                  content: promptDoc.text,
                },
              ],
            });

            console.log(
              `[runAnalysis] ${model.id} responded for prompt ${promptDoc.id}, length: ${text.length}`,
            );

            // Atomic Write to the persistence layer via RPC (internal schema)
            const { data: responseId, error: insertError } = await supabaseAdmin.rpc(
              'insert_llm_response',
              {
                p_analysis_run_id: analysisId,
                p_provider: model.id,
                p_raw_content: text,
                p_prompt_id: promptDoc.id,
              },
            );

            if (insertError) {
              console.error(
                `[runAnalysis] Failed to save response from ${model.id} for prompt ${promptDoc.id}:`,
                insertError,
              );
              throw insertError;
            }

            console.log(
              `[runAnalysis] Saved response from ${model.id} for prompt ${promptDoc.id}, response ID: ${responseId}`,
            );

            // TODO: Trigger extraction logic here (Task: "Mention Extraction Parser")
          } catch (error) {
            // Log failure but allow the rest of the queue to proceed
            console.error(`Provider ${model.id} failed for prompt ${promptDoc.id}:`, error);
            // Optional: Record the failure in a dedicated log table
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
