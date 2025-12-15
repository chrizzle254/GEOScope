create table public.analysis_runs (
  id uuid primary key default gen_random_uuid(),
  reporting_subject_id uuid references public.reporting_subject(id),
  status text check (status in ('pending','running','completed','failed')),
  started_at timestamptz,
  completed_at timestamptz
);

