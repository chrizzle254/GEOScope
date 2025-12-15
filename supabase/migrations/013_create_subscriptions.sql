create table billing.subscriptions (
  organization_id uuid references public.organizations(id),
  stripe_subscription_id text,
  plan text,
  status text,
  current_period_end timestamptz
);

alter table billing.subscriptions enable row level security;

create policy "Owners/admins can view and manage subscriptions"
  on billing.subscriptions for all
  using (
    organization_id in (
      select organization_id from public.organization_members where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

