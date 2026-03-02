import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import pLimit from 'p-limit';
import { supabaseAdmin } from '../lib/supabase';

// Restrict concurrency to 10 simultaneous LLM calls
const limit = pLimit(10);

export interface AnalysisOptions {
  brand: string;
  // Note: competitors and industry are used by the extraction logic, not the prompt itself
}

/**
 * Runs a blind share-of-voice analysis across multiple LLM providers.
 * - Throttles concurrency to avoid rate-limiting.
 * - Persists raw LLM responses atomically to the database.
 * - Manages the status of the analysis run.
 *
 * @param analysisId - The UUID of the analysis run to execute.
 * @param options - The analysis configuration containing brand info.
 */
export async function runAnalysis(analysisId: string, options: AnalysisOptions) {
  // 1. Set Status to 'processing'
  await supabaseAdmin.from('analysis_runs').update({ status: 'processing' }).eq('id', analysisId);

  try {
    // 2. Load System Prompts from the database
    const { data: prompts, error: promptsError } = await supabaseAdmin.from('prompts').select('*');
    if (promptsError) throw promptsError;
    if (!prompts || prompts.length === 0) {
      throw new Error('No system prompts found in the database.');
    }

    // Define models using latest available stack
    const models = [
      { id: 'openai', instance: openai('gpt-5.2') },
      { id: 'anthropic', instance: anthropic('claude-4.6') },
      { id: 'google', instance: google('gemini-3.1-pro') }
    ];

    // Create a queue of tasks using p-limit
    const tasks = prompts.flatMap(promptDoc =>
      models.map(model => limit(async () => {
        try {
          // Use generateText for full backend responses
          const { text } = await generateText({
            model: model.instance,
            prompt: promptDoc.content, // Prompts are "blind" and don't mention the brand
          });

          // 3. Atomic Write to the persistence layer
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

    // 4. Set Status to 'completed'
    await supabaseAdmin.from('analysis_runs').update({ status: 'completed' }).eq('id', analysisId);

  } catch (error) {
    console.error(`Critical failure in analysis run ${analysisId}:`, error);
    // On critical failure (e.g., failed to fetch prompts), mark the run as 'failed'
    await supabaseAdmin.from('analysis_runs').update({ status: 'failed', error: (error as Error).message }).eq('id', analysisId);
  }
}
