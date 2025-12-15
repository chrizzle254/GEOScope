create table public.llm_responses (
  id uuid primary key default gen_random_uuid(),
  analysis_run_id uuid references public.analysis_runs(id),
  provider_id text references public.llm_providers(id),
  prompt_id uuid references public.prompts(id),
  response_text text,
  created_at timestamptz default now()
);
