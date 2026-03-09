create table public.llm_providers (
  id text primary key, -- 'gpt-4o', 'claude-3-opus'
  provider_name text,
  model_version text,
  is_active boolean default true not null
);
