-- seed auth users
insert into auth.users (id, email, encrypted_password, role, created_at, email_confirmed_at,aud)
values 
  (
    '00000000-0000-0000-0000-000000000001',
    'jeffrey@expl.com',
    '$2a$10$vfMSc1Y9gmzhL1L2h4RFb.J93vVdVSb0dF/WlDAsPOX.D8h16BVGy',  -- pw to enter: 123456 
    'authenticated',
    now(),
    now(),
    'authenticated'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'test@expl.com',
    '$2a$10$vfMSc1Y9gmzhL1L2h4RFb.J93vVdVSb0dF/WlDAsPOX.D8h16BVGy',  -- pw to enter: 123456 
    'authenticated',
    now(),
    now(),
    'authenticated'
  );

-- then insert into public.users
insert into users (auth_id, full_name)
values 
  ('00000000-0000-0000-0000-000000000001', 'Jeffrey'),
  ('00000000-0000-0000-0000-000000000002', 'Test User');

--
-- Seed data for Brand Management (Phase 1)
--

-- Upsert 'Acme Inc.' organization
INSERT INTO public.organizations (name) VALUES ('Acme Inc.') ON CONFLICT (name) DO NOTHING;

-- Grant ownership of 'Acme Inc.' to the test users
-- This query finds the organization's ID and the user's ID from public.users
-- and uses them to create the membership link.
INSERT INTO public.organization_members (organization_id, user_id, role)
SELECT 
    (SELECT id FROM public.organizations WHERE name = 'Acme Inc.' LIMIT 1),
    (SELECT id FROM public.users WHERE auth_id = '00000000-0000-0000-0000-000000000001' LIMIT 1),
    'owner'
UNION ALL
SELECT 
    (SELECT id FROM public.organizations WHERE name = 'Acme Inc.' LIMIT 1),
    (SELECT id FROM public.users WHERE auth_id = '00000000-0000-0000-0000-000000000002' LIMIT 1),
    'owner'
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- Upsert the reporting subject 'Acme Website Builder' for 'Acme Inc.'
INSERT INTO public.reporting_subject (organization_id, name)
SELECT id, 'Acme Website Builder'
FROM public.organizations WHERE name = 'Acme Inc.'
LIMIT 1
ON CONFLICT (organization_id, name) DO NOTHING;

-- Upsert competitors for 'Acme Website Builder'
WITH subject AS (
    SELECT id
    FROM public.reporting_subject
    WHERE name = 'Acme Website Builder'
    AND organization_id = (SELECT id FROM public.organizations WHERE name = 'Acme Inc.' LIMIT 1)
    LIMIT 1
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
-- The `id` maps to the SupportedModel type in packages/shared/types
INSERT INTO internal.llm_providers (id, provider_name, model_version, is_active) VALUES
('openai', 'OpenAI', 'gpt-5-nano', true),
('anthropic', 'Anthropic', 'claude-4-haku', true),
('google', 'Google', 'gemini-2.5-flash', true)
ON CONFLICT (id) DO NOTHING;

--
-- Seed data for Blind Prompt Library (Phase 2)
--

-- These prompts use template placeholders and should not directly mention the user's brand.
-- The `id` is a UUID to ensure stable identifiers across environments.
INSERT INTO internal.prompts (id, slug, category, template_text, is_active) VALUES
-- Tech & SaaS
('a1b2c3d4-0001-4001-8001-1234567890ab', 'tech-crm-v1', 'recommendation', 'What are the best {{industry}} platforms for {{target_audience}} in 2024?', true),
('a1b2c3d4-0002-4002-8002-1234567890ab', 'tech-comparison-v1', 'comparison', 'Compare the top 3 project management tools for remote software teams.', true),
('a1b2c3d4-0003-4003-8003-1234567890ab', 'tech-cloud-v1', 'recommendation', 'Describe the current landscape of cloud storage providers for enterprise.', true),
('a1b2c3d4-0011-4011-8011-1234567890ab', 'tech-serverless-v1', 'recommendation', 'What are the leading platforms for building and deploying serverless applications?', true),

-- E-commerce & Retail
('a1b2c3d4-0004-4004-8004-1234567890ab', 'retail-mattress-v1', 'recommendation', 'Which direct-to-consumer {{industry}} brands offer the best value for money?', true),
('a1b2c3d4-0005-4005-8005-1234567890ab', 'retail-ecommerce-v1', 'use_case', 'What are the key features to look for in a modern e-commerce platform for a growing business?', true),

-- Finance & Fintech
('a1b2c3d4-0006-4006-8006-1234567890ab', 'finance-trading-v1', 'recommendation', 'List the most popular mobile apps for stock trading and their primary benefits for beginners.', true),
('a1b2c3d4-0007-4007-8007-1234567890ab', 'finance-robo-v1', 'comparison', 'What are the main differences between robo-advisors like Wealthfront and Betterment?', true),

-- Travel & Hospitality
('a1b2c3d4-0008-4008-8008-1234567890ab', 'travel-booking-v1', 'recommendation', 'What are the best booking websites for finding budget-friendly international flights and hotels?', true),

-- Automotive
('a1b2c3d4-0009-4009-8009-1234567890ab', 'auto-ev-v1', 'comparison', 'Compare the latest electric vehicle models from major manufacturers in terms of range, charging speed, and features.', true),

-- Health & Wellness
('a1b2c3d4-0010-4010-8010-1234567890ab', 'health-meditation-v1', 'recommendation', 'What are the top-rated meditation and mindfulness apps available today for reducing stress?', true),

-- Marketing & Advertising
('a1b2c3d4-0012-4012-8012-1234567890ab', 'marketing-email-v1', 'recommendation', 'Which email marketing platforms are best suited for content creators and newsletters?', true),

-- Real Estate
('a1b2c3d4-0013-4013-8013-1234567890ab', 'realestate-rental-v1', 'recommendation', 'What are the most effective online platforms for finding residential properties for rent?', true),

-- Food & Beverage
('a1b2c3d4-0014-4014-8014-1234567890ab', 'food-mealkit-v1', 'recommendation', 'Which meal kit delivery services offer the best options for vegetarian and vegan diets?', true),

-- Entertainment
('a1b2c3d4-0015-4015-8015-1234567890ab', 'entertainment-streaming-v1', 'comparison', 'Compare the libraries and original content of major video streaming services.', true)
ON CONFLICT (id) DO NOTHING;