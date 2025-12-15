create table users (
    id uuid primary key default gen_random_uuid(),
    auth_id uuid references auth.users(id),
    full_name text,
    created_at timestamp with time zone default now()
);

alter table users enable row level security;

create policy "Users can select their own record"
  on users
  for select
  using (auth.uid() = auth_id);

create policy "Users can insert their own record"
  on users
  for insert
  with check (auth.uid() = auth_id);

create policy "Users can update their own record"
  on users
  for update
  using (auth.uid() = auth_id);
