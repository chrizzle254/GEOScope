create table public.prompts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  category text not null,
  template_text text not null,
  is_active boolean default true not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_prompts_active on public.prompts(is_active) where is_active = true;
