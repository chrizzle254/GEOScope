create table internal.llm_providers (
  id text primary key, -- 'gpt-4o', 'claude-3-opus'
  vendor text,
  model_version text
);
