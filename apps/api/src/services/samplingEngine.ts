import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import pLimit from 'p-limit';
import { supabaseAdmin } from '../lib/supabase';
import { SupportedModel } from '@repo/shared/types';

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
  // Set Status to 'processing'
  await supabaseAdmin.from('analysis_runs').update({ status: 'processing' }).eq('id', analysisId);

  try {
    // 2. Load System Prompts from the database via RPC (internal schema)
    const { data: prompts, error: promptsError } = await supabaseAdmin.rpc('get_internal_prompts');
    if (promptsError) throw promptsError;
    if (!prompts || prompts.length === 0) {
      throw new Error('No system prompts found in the database.');
    }

    // 3. Fetch provider details from database
    const { data: providers, error: providersError } = await supabaseAdmin.rpc('get_llm_providers');
    if (providersError) throw providersError;
    if (!providers || providers.length === 0) {
      throw new Error('No active LLM providers found in the database.');
    }

    // 4. Filter to only requested models and build instances dynamically
    const requestedProviders = providers.filter((p: any) => 
      options.models.includes(p.provider_id as SupportedModel)
    );

    if (requestedProviders.length === 0) {
      throw new Error('No valid providers found for the requested models.');
    }

    // 5. Build model instances dynamically based on provider configuration
    const models = requestedProviders.map((provider: any) => {
      let instance;
      switch (provider.provider_id) {
        case 'openai':
          instance = openai(provider.model_name); // e.g., 'gpt-5.2'
          break;
        case 'anthropic':
          instance = anthropic(provider.model_name); // e.g., 'claude-4.6'
          break;
        case 'google':
          instance = google(provider.model_name); // e.g., 'gemini-3.1-pro'
          break;
        default:
          throw new Error(`Unsupported provider: ${provider.provider_id}`);
      }
      return { id: provider.provider_id, instance };
    });

    // 6. Create a queue of tasks using p-limit
    const tasks = prompts.flatMap((promptDoc: any) =>
      models.map(model => limit(async () => {
        try {
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

          // Atomic Write to the persistence layer
          await supabaseAdmin.from('llm_responses').insert({
            analysis_run_id: analysisId,
            provider: model.id,
            raw_content: text,
            prompt_id: promptDoc.id
          });

          // TODO: Trigger extraction logic here (Task: "Mention Extraction Parser")

        } catch (error) {
          // Log failure but allow the rest of the queue to proceed
          console.error(`Provider ${model.id} failed for prompt ${promptDoc.id}:`, error);
          // Optional: Record the failure in a dedicated log table
        }
      }))
    );

    // Wait for all throttled promises to resolve
    await Promise.all(tasks);

    // Set Status to 'completed'
    await supabaseAdmin.from('analysis_runs').update({ status: 'completed' }).eq('id', analysisId);

  } catch (error) {
    console.error(`Critical failure in analysis run ${analysisId}:`, error);
    // On critical failure (e.g., failed to fetch prompts), mark the run as 'failed'
    await supabaseAdmin.from('analysis_runs').update({ status: 'failed', error: (error as Error).message }).eq('id', analysisId);
  }
}
