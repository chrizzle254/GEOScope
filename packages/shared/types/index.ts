/**
 * Shared type definitions for GEO Scope
 * Used across apps/web and apps/api
 */

/**
 * Supported LLM model providers
 */
export type SupportedModel = 'openai' | 'anthropic' | 'google';

/**
 * Readonly array of all supported models
 * Used for validation and default selection
 */
export const SUPPORTED_MODELS: readonly SupportedModel[] = [
  'openai',
  'anthropic',
  'google',
] as const;

/**
 * LLM Provider from internal.llm_providers table
 */
export interface LLMProvider {
  id: SupportedModel;
  provider_name: string;
  model_version: string;
  is_active: boolean;
}

/**
 * Prompt from internal.prompts table
 */
export interface Prompt {
  id: string;
  slug: string;
  category: 'recommendation' | 'comparison' | 'use_case' | 'problem_solving';
  template_text: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Template data for filling prompt placeholders
 */
export interface TemplateData {
  brand_name: string;
  industry: string;
  target_audience?: string;
  competitor_1?: string;
  competitor_2?: string;
  competitor_3?: string;
}

export interface MentionResult {
  brandMentioned: boolean;
  competitorsMentioned: string[];
  excerpts: {
    brand?: string;
    competitors: Record<string, string>;
  };
  confidence: 'high' | 'low';
}

export interface ParseOptions {
  brandName: string;
  brandAliases: string[];
  competitorMap: Record<string, string[]>;
  responseText: string;
}
