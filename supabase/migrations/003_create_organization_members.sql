create table public.organization_members (
  organization_id uuid references public.organizations(id),
  user_id uuid references public.users(id),
  role text check (role in ('owner','admin','viewer')),
  primary key (organization_id, user_id)
);

