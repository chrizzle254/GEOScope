create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references public.users(id),
  created_at timestamptz default now()
);

alter table public.organizations enable row level security;

create policy "Organization members can view their organization"
  on public.organizations for select
  using (
    id in (
      select organization_id from public.organization_members where user_id = auth.uid()
    )
  );

create policy "Users can create organizations"
  on public.organizations for insert
  with check (
    auth.uid() = created_by
  );

create policy "Organization owners/admins can update their organization"
  on public.organizations for update
  using (
    id in (
      select organization_id from public.organization_members where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

create policy "Organization owners can delete their organization"
  on public.organizations for delete
  using (
    id in (
      select organization_id from public.organization_members where user_id = auth.uid() and role = 'owner'
    )
  );

