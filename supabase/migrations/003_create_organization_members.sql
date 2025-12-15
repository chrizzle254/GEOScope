create table public.organization_members (
  organization_id uuid references public.organizations(id),
  user_id uuid references public.users(id),
  role text check (role in ('owner','admin','viewer')),
  primary key (organization_id, user_id)
);

alter table public.organization_members enable row level security;

create policy "Members can view other members of their organization"
  on public.organization_members for select
  using (
    organization_id in (
      select organization_id from public.organization_members where user_id = auth.uid()
    )
  );

create policy "Owners/admins can manage organization members"
  on public.organization_members for all
  using (
    organization_id in (
      select organization_id from public.organization_members where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

