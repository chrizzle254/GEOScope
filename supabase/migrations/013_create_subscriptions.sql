create table public.subscriptions (
  organization_id uuid references public.organizations(id),
  stripe_subscription_id text,
  plan text,
  status text,
  current_period_end timestamptz
);

