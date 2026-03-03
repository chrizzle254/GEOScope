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
