create table public.reporting_subject (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id),
  name text not null,
  industry text,
  created_at timestamptz default now()
);

alter table public.reporting_subject enable row level security;

create policy "Members can view their organization's reporting subjects"
  on public.reporting_subject for select
  using (
    organization_id in (
      select organization_id from public.organization_members where user_id = auth.uid()
    )
  );

create policy "Owners/admins can manage their organization's reporting subjects"
  on public.reporting_subject for insert, update, delete
  using (
    organization_id in (
      select organization_id from public.organization_members where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

