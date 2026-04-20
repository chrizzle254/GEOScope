import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export interface BrandContext {
  brandName: string;
  industry: string;
  targetAudience?: string;
  competitors: string[];
}

export interface GeneratedPrompt {
  id: string; // ephemeral slug, e.g. "gen-0042"
  text: string;
  category: string;
}

/**
 * Generates a batch of brand-blind analysis prompts via LLM.
 *
 * The prompts are designed to elicit natural brand mentions without
 * directly asking about the user's brand (blind sampling).
 *
 * @param context - Brand metadata used to tailor the prompt generation
 * @param targetCount - How many prompts to generate (default: 100)
 * @returns Array of generated prompts ready to feed into the sampling engine
 */
export async function generateAnalysisPrompts(
  context: BrandContext,
  targetCount = 100,
): Promise<GeneratedPrompt[]> {
  const { brandName: _brandName, industry, targetAudience, competitors } = context;

  // Build the meta-prompt — ask LLM to generate questions about the space,
  // WITHOUT mentioning the user's specific brand by name.
  const competitorList =
    competitors.length > 0 ? competitors.slice(0, 5).join(', ') : 'various providers';

  const metaPrompt = `You are helping build a brand visibility research tool.

Generate exactly ${targetCount} diverse, natural-sounding questions that a ${targetAudience ?? 'user'} might ask an AI assistant when researching the "${industry}" market.

Rules:
1. Questions must NOT mention any specific brand by name (brand-blind sampling)
2. Cover a wide range of angles: recommendations, comparisons, best practices, market leaders, use cases, problem-solving, and emerging trends
3. Each question should be realistic — something a real person would type into an AI chatbot
4. Vary sentence structure and length
5. Some questions should reference competitors implicitly (e.g. "tools like ${competitorList}") but without naming our specific brand
6. Format: output ONLY a JSON array of objects with this shape:
   [{"id":"gen-0001","category":"recommendation","text":"<question>"},...]
7. Categories must be one of: recommendation, comparison, use_case, market_leader, best_practice, emerging_trend
8. Number slugs sequentially: gen-0001, gen-0002, ... gen-${String(targetCount).padStart(4, '0')}

Output only the JSON array, no preamble or explanation.`;

  const { text } = await generateText({
    model: openai('gpt-4o-mini'), // cost-efficient for meta-generation
    messages: [{ role: 'user', content: metaPrompt }],
    temperature: 0.8, // some diversity
  });

  return parseGeneratedPrompts(text, targetCount);
}

/**
 * Parses the raw LLM output into structured GeneratedPrompt objects.
 * Falls back gracefully if the LLM returns malformed JSON.
 */
function parseGeneratedPrompts(raw: string, targetCount: number): GeneratedPrompt[] {
  // Strip markdown code blocks if the LLM wrapped the JSON
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // Attempt to extract JSON array from anywhere in the response
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (!match) {
      throw new Error(`promptGenerator: LLM returned non-parseable output. Raw: ${raw.slice(0, 200)}`);
    }
    try {
      parsed = JSON.parse(match[0]);
    } catch {
      throw new Error(`promptGenerator: Could not parse extracted JSON. Raw: ${raw.slice(0, 200)}`);
    }
  }

  if (!Array.isArray(parsed)) {
    throw new Error('promptGenerator: Parsed output is not an array.');
  }

  const results: GeneratedPrompt[] = [];

  for (const item of parsed) {
    if (
      typeof item === 'object' &&
      item !== null &&
      typeof (item as Record<string, unknown>).id === 'string' &&
      typeof (item as Record<string, unknown>).text === 'string' &&
      typeof (item as Record<string, unknown>).category === 'string'
    ) {
      const typedItem = item as Record<string, unknown>;
      results.push({
        id: typedItem.id as string,
        text: typedItem.text as string,
        category: typedItem.category as string,
      });
    }
  }

  if (results.length === 0) {
    throw new Error('promptGenerator: No valid prompts parsed from LLM output.');
  }

  // Log if we got fewer than requested (LLMs sometimes truncate)
  if (results.length < targetCount) {
    console.warn(
      `[promptGenerator] Requested ${targetCount} prompts, got ${results.length}. Proceeding with available prompts.`,
    );
  }

  return results;
}
