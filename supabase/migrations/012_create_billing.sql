create table billing.customers (
  user_id uuid references public.users(id),
  stripe_customer_id text,
  primary key (user_id)
);

alter table billing.customers enable row level security;

create policy "Users can view their own customer record"
  on billing.customers for select
  using (user_id = auth.uid());

create policy "Users can create their own customer record"
  on billing.customers for insert
  with check (user_id = auth.uid());

create policy "Users can update their own customer record"
  on billing.customers for update
  using (user_id = auth.uid());

