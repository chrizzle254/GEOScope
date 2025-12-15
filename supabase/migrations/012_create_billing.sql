create table public.customers (
  user_id uuid references public.users(id),
  stripe_customer_id text,
  primary key (user_id)
);

