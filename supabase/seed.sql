-- seed auth user first
insert into auth.users (id, email, encrypted_password, role, created_at)
values (
  '00000000-0000-0000-0000-000000000001',
  'jeffrey@example.com',
  '$2a$10$g8aFln7j0IALzUGWzulKzut1UEOeUFmxl/C3fUEbDmfbD8o.RSa3O',  -- pw to enter: 123456 
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
INSERT INTO public.reporting_subject_competitors (reporting_subject_id, name)
SELECT id, 'Webflow' FROM subject
UNION ALL
SELECT id, 'Framer' FROM subject
UNION ALL
SELECT id, 'Squarespace' FROM subject
ON CONFLICT (reporting_subject_id, name) DO NOTHING;

--
-- Seed data for LLM Providers (Phase 2)
--

-- These are the supported LLM providers and their model identifiers
-- The `provider_id` maps to the SupportedModel type in packages/shared/types
INSERT INTO internal.llm_providers (provider_id, provider_name, model_name, is_active) VALUES
('openai', 'OpenAI', 'gpt-5.2', true),
('anthropic', 'Anthropic', 'claude-4.6', true),
('google', 'Google', 'gemini-3.1-pro', true)
ON CONFLICT (provider_id) DO NOTHING;

--
-- Seed data for Blind Prompt Library (Phase 2)
--

-- These prompts are "blind" and should not mention the user's brand.
-- The `id` is a UUID to ensure stable identifiers across environments.
INSERT INTO internal.prompts (id, text) VALUES
-- Tech & SaaS
('a1b2c3d4-0001-4001-8001-1234567890ab', 'What are the most innovative CRM platforms for small businesses right now?'),
('a1b2c3d4-0002-4002-8002-1234567890ab', 'Compare the top 3 project management tools for remote software teams.'),
('a1b2c3d4-0003-4003-8003-1234567890ab', 'Describe the current landscape of cloud storage providers for enterprise.'),
('a1b2c3d4-0011-4011-8011-1234567890ab', 'What are the leading platforms for building and deploying serverless applications?'),

-- E-commerce & Retail
('a1b2c3d4-0004-4004-8004-1234567890ab', 'Which direct-to-consumer mattress brands offer the best value for money?'),
('a1b2c3d4-0005-4005-8005-1234567890ab', 'What are the key features to look for in a modern e-commerce platform for a growing business?'),

-- Finance & Fintech
('a1b2c3d4-0006-4006-8006-1234567890ab', 'List the most popular mobile apps for stock trading and their primary benefits for beginners.'),
('a1b2c3d4-0007-4007-8007-1234567890ab', 'What are the main differences between robo-advisors like Wealthfront and Betterment?'),

-- Travel & Hospitality
('a1b2c3d4-0008-4008-8008-1234567890ab', 'What are the best booking websites for finding budget-friendly international flights and hotels?'),

-- Automotive
('a1b2c3d4-0009-4009-8009-1234567890ab', 'Compare the latest electric vehicle models from major manufacturers in terms of range, charging speed, and features.'),

-- Health & Wellness
('a1b2c3d4-0010-4010-8010-1234567890ab', 'What are the top-rated meditation and mindfulness apps available today for reducing stress?'),

-- Marketing & Advertising
('a1b2c3d4-0012-4012-8012-1234567890ab', 'Which email marketing platforms are best suited for content creators and newsletters?'),

-- Real Estate
('a1b2c3d4-0013-4013-8013-1234567890ab', 'What are the most effective online platforms for finding residential properties for rent?'),

-- Food & Beverage
('a1b2c3d4-0014-4014-8014-1234567890ab', 'Which meal kit delivery services offer the best options for vegetarian and vegan diets?'),

-- Entertainment
('a1b2c3d4-0015-4015-8015-1234567890ab', 'Compare the libraries and original content of major video streaming services.')
ON CONFLICT (id) DO NOTHING;