create table public.reporting_subject (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id),
  name text not null,
  industry text,
  search_context text,
  aliases text[],
  created_at timestamptz default now()
);

