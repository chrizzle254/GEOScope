-- Add selected_models column to analysis_runs table
-- This column stores which LLM providers were used in the analysis

ALTER TABLE public.analysis_runs 
ADD COLUMN selected_models JSONB;

COMMENT ON COLUMN public.analysis_runs.selected_models IS 'Array of model identifiers (e.g., ["openai", "anthropic", "google"]) used in this analysis run';
