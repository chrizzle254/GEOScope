create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references public.users(id),
  created_at timestamptz default now()
);

alter table public.organizations enable row level security;

create policy "Authenticated users can create organizations"
  on public.organizations for insert
  with check (
    auth.role() = 'authenticated'
  );

