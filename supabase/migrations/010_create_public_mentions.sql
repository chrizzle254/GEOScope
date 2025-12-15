create table public.mentions (
  id uuid primary key default gen_random_uuid(),
  analysis_run_id uuid references public.analysis_runs(id),
  reporting_subject_id uuid references public.reporting_subject(id),
  provider_id text,
  sentiment text check (sentiment in ('positive','neutral','negative')),
  accurate boolean,
  excerpt text
);

