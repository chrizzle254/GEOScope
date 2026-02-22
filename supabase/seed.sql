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

--
-- Seed data for Brand Management (Phase 1)
--

-- Upsert 'Acme Inc.' organization
INSERT INTO public.organizations (name) VALUES ('Acme Inc.') ON CONFLICT (name) DO NOTHING;

-- Grant ownership of 'Acme Inc.' to the test user
-- This query finds the organization's ID and the user's ID from public.users
-- and uses them to create the membership link.
INSERT INTO public.organization_members (organization_id, user_id, role)
SELECT 
    (SELECT id FROM public.organizations WHERE name = 'Acme Inc.'),
    (SELECT id FROM public.users WHERE auth_id = '00000000-0000-0000-0000-000000000001'),
    'owner'
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- Upsert the reporting subject 'Acme Website Builder' for 'Acme Inc.'
INSERT INTO public.reporting_subject (organization_id, name)
SELECT id, 'Acme Website Builder'
FROM public.organizations WHERE name = 'Acme Inc.'
ON CONFLICT (organization_id, name) DO NOTHING;

-- Upsert competitors for 'Acme Website Builder'
WITH subject AS (
    SELECT id
    FROM public.reporting_subject
    WHERE name = 'Acme Website Builder'
    AND organization_id = (SELECT id FROM public.organizations WHERE name = 'Acme Inc.')
)
INSERT INTO public.reporting_subjectcompetitors (reporting_subject_id, name)
SELECT id, 'Webflow' FROM subject
UNION ALL
SELECT id, 'Framer' FROM subject
UNION ALL
SELECT id, 'Squarespace' FROM subject
ON CONFLICT (reporting_subject_id, name) DO NOTHING;