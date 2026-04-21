import { Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { runAnalysis } from '../services/samplingEngine';
import { SupportedModel } from '@geoscope/shared/types';

/**
 * Returns all analysis runs for the authenticated user's organization.
 */
export async function getAnalysisRuns(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const { organization_id: organizationId } = req.user;

    const { data: subjects, error: subjectsError } = await supabaseAdmin
      .from('reporting_subject')
      .select('id')
      .eq('organization_id', organizationId);

    if (subjectsError) {
      return res.status(500).json({ error: 'Failed to fetch reporting subjects.' });
    }

    const subjectIds = (subjects ?? []).map((s) => s.id);
    if (subjectIds.length === 0) {
      return res.json([]);
    }

    const { data: runs, error: runsError } = await supabaseAdmin
      .from('analysis_runs')
      .select('*')
      .in('reporting_subject_id', subjectIds);

    if (runsError) {
      return res.status(500).json({ error: 'Failed to fetch analysis runs.' });
    }

    return res.json(runs ?? []);
  } catch (error) {
    console.error('Unexpected error in getAnalysisRuns:', error);
    return res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}

/**
 * Returns all mentions for a specific analysis run, enriched with llm_provider via RPC.
 * Validates org ownership before returning data.
 */
export async function getMentionsByRun(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const { runId } = req.params;
    const { organization_id: organizationId } = req.user;

    // Verify the run exists
    const { data: run, error: runError } = await supabaseAdmin
      .from('analysis_runs')
      .select('id, reporting_subject_id')
      .eq('id', runId)
      .single();

    if (runError || !run) {
      return res.status(404).json({ error: 'Analysis run not found.' });
    }

    // Verify the run belongs to the user's org via reporting_subject
    const { data: subject, error: subjectError } = await supabaseAdmin
      .from('reporting_subject')
      .select('organization_id')
      .eq('id', run.reporting_subject_id)
      .single();

    if (subjectError || !subject || subject.organization_id !== organizationId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Fetch mentions enriched with provider info via RPC
    const { data: mentions, error: mentionsError } = await supabaseAdmin.rpc(
      'get_mentions_with_provider',
      { p_run_id: runId },
    );

    if (mentionsError) {
      return res.status(500).json({ error: 'Failed to fetch mentions.' });
    }

    return res.json(mentions ?? []);
  } catch (error) {
    console.error('Unexpected error in getMentionsByRun:', error);
    return res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}

interface TriggerAnalysisBody {
  brand: string;
  industry: string;
  competitors: string[];
  models?: SupportedModel[]; // Optional, defaults to all in middleware
}

/**
 * Triggers a new brand analysis run.
 * - Creates a pending analysis_run record
 * - Fires the sampling engine in the background (no await)
 * - Returns 202 Accepted with the analysisId for polling
 */
export async function triggerAnalysis(req: Request, res: Response) {
  try {
    // 1. Validate request body
    const { brand, industry, competitors } = req.body as TriggerAnalysisBody;

    if (!brand || typeof brand !== 'string') {
      return res.status(400).json({ error: 'Brand name is required and must be a string.' });
    }

    if (!industry || typeof industry !== 'string') {
      return res.status(400).json({ error: 'Industry is required and must be a string.' });
    }

    if (!Array.isArray(competitors)) {
      return res.status(400).json({ error: 'Competitors must be an array.' });
    }

    if (competitors.length === 0 || competitors.length > 10) {
      return res
        .status(400)
        .json({ error: 'Competitors array must contain between 1 and 10 items.' });
    }

    // 2. Extract authenticated user context and validated models
    if (!req.user) {
      return res.status(401).json({ error: 'User context not found. Authentication required.' });
    }

    const { id: userId, organization_id: organizationId } = req.user;
    const models = req.validatedModels!; // Already validated by middleware

    // 3. Resolve or create the reporting_subject for this brand
    // First, check if the brand already exists for this organization
    let reportingSubjectId: string;

    const { data: existingSubject, error: subjectFetchError } = await supabaseAdmin
      .from('reporting_subject')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('name', brand)
      .maybeSingle();

    if (subjectFetchError) {
      console.error('Error fetching reporting_subject:', subjectFetchError);
      return res.status(500).json({ error: 'Failed to resolve brand.' });
    }

    if (existingSubject) {
      reportingSubjectId = existingSubject.id;
    } else {
      // Create a new reporting_subject
      const { data: newSubject, error: subjectInsertError } = await supabaseAdmin
        .from('reporting_subject')
        .insert({
          organization_id: organizationId,
          name: brand,
          industry,
        })
        .select('id')
        .single();

      if (subjectInsertError || !newSubject) {
        console.error('Error creating reporting_subject:', subjectInsertError);
        return res.status(500).json({ error: 'Failed to create brand.' });
      }

      reportingSubjectId = newSubject.id;
    }

    // 4. Initial Persistence: Create analysis_run with status 'pending' and selected models
    const { data: analysisRun, error: analysisInsertError } = await supabaseAdmin
      .from('analysis_runs')
      .insert({
        reporting_subject_id: reportingSubjectId,
        status: 'pending',
        created_by: userId,
        selected_models: models, // Store the validated models
      })
      .select('id')
      .single();

    if (analysisInsertError || !analysisRun) {
      console.error('Error creating analysis_run:', analysisInsertError);
      return res.status(500).json({ error: 'Failed to create analysis run.' });
    }

    const analysisId = analysisRun.id;

    // 5. Fire-and-Forget: Trigger the sampling engine WITHOUT await
    runAnalysis(analysisId, {
      reportingSubjectId,
      organizationId,
      models,
    }).catch((error) => {
      console.error(`Background analysis ${analysisId} failed:`, error);
      // The runAnalysis service already handles its own error persistence
    });

    // 6. Immediate Response: Return 202 Accepted with analysisId
    return res.status(202).json({
      message: 'Analysis started successfully.',
      analysisId,
    });
  } catch (error) {
    console.error('Unexpected error in triggerAnalysis:', error);
    return res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}
