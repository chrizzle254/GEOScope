import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { env } from '../env';
import { SupportedModel, SUPPORTED_MODELS } from '@repo/shared/types';

/**
 * Extend Express Request to include validated models
 */
declare module 'express-serve-static-core' {
  interface Request {
    validatedModels?: SupportedModel[];
  }
}

/**
 * Middleware to validate model selection and API key availability.
 * 
 * Validates:
 * 1. Models array is valid (defaults to all if not provided)
 * 2. Requested models are supported
 * 3. Models exist in internal.llm_providers
 * 4. Required API keys are configured
 * 
 * Attaches validated models to req.validatedModels
 */
export async function validateModelAccess(req: Request, res: Response, next: NextFunction) {
  try {
    let { models } = req.body;

    // 1. Default to all supported models if not provided
    if (!models || !Array.isArray(models) || models.length === 0) {
      models = [...SUPPORTED_MODELS];
    }

    // 2. Validate that all requested models are supported
    const invalidModels = models.filter((m: string) => !SUPPORTED_MODELS.includes(m as SupportedModel));
    if (invalidModels.length > 0) {
      return res.status(400).json({
        error: 'Invalid model selection',
        hint: `Supported models: ${SUPPORTED_MODELS.join(', ')}`,
      });
    }

    // 3. Check if models exist in internal.llm_providers
    const { data: providers, error: providersError } = await supabaseAdmin.rpc('get_llm_providers');

    if (providersError) {
      console.error('Failed to fetch LLM providers:', providersError);
      return res.status(500).json({ error: 'Configuration error' });
    }

    if (!providers || providers.length === 0) {
      console.error('No active LLM providers found in database');
      return res.status(500).json({ error: 'Configuration error' });
    }

    const availableProviderIds = providers.map((p: any) => p.provider_id);
    const unavailableModels = models.filter((m: string) => !availableProviderIds.includes(m));

    if (unavailableModels.length > 0) {
      return res.status(403).json({
        error: 'One or more requested models are not available',
      });
    }

    // 4. Verify API keys are configured (via envalid)
    const keyMap: Record<SupportedModel, string | undefined> = {
      openai: env.OPENAI_API_KEY,
      anthropic: env.ANTHROPIC_API_KEY,
      google: env.GOOGLE_API_KEY,
    };

    const missingKeys = models.filter((m: SupportedModel) => !keyMap[m]);

    if (missingKeys.length > 0) {
      console.error(`Missing API keys for models: ${missingKeys.join(', ')}`);
      return res.status(500).json({
        error: 'Server configuration error. Please contact support.',
      });
    }

    // 5. Attach validated models to request
    req.validatedModels = models as SupportedModel[];
    next();
  } catch (error) {
    console.error('Model validation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
