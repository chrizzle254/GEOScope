create table public.reporting_subjectcompetitors (
  id uuid primary key default gen_random_uuid(),
  reporting_subject_id uuid references public.reporting_subject(id),
  name text not null
);

