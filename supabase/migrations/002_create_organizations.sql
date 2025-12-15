create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references public.users(id),
  created_at timestamptz default now()
);

