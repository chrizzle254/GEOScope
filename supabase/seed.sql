-- seed auth user first
insert into auth.users (id, email, encrypted_password, role, created_at)
values (
  '00000000-0000-0000-0000-000000000001',
  'jeffrey@example.com',
  'fakehashedpassword',  -- you can use gen_salt() / hash later
  'authenticated',
  now()
);

-- then insert into public.users
insert into users (auth_id, full_name)
values ('00000000-0000-0000-0000-000000000001', 'Jeffrey');