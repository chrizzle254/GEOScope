create table public.llm_responses (
  id uuid primary key default gen_random_uuid(),
  analysis_run_id uuid references public.analysis_runs(id),
  provider_id text references public.llm_providers(id),
  prompt_id uuid references public.prompts(id),
  response_text text not null,
  tokens_used integer,
  latency_ms integer,
  created_at timestamptz default now()
);

create index idx_llm_responses_run on public.llm_responses(analysis_run_id);
