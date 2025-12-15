create table public.reporting_subject_metrics (
  analysis_run_id uuid references public.analysis_runs(id),
  reporting_subject_visibility_score numeric,
  accuracy_rate numeric,
  sentiment_score numeric,
  primary key (analysis_run_id)
);

