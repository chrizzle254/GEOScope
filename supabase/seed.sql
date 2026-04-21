-- seed auth users
-- All token columns must be '' (not NULL) for GoTrue compatibility.
-- instance_id must be '00000000-0000-0000-0000-000000000000' (the GoTrue instance UUID).
insert into auth.users (
  instance_id, id, email, encrypted_password, role, aud,
  email_confirmed_at, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000001',
    'jeffrey@expl.com',
    crypt('123456', gen_salt('bf')),  -- pw: 123456
    'authenticated',
    'authenticated',
    now(), now(), now(),
    '', '', '', '', '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000002',
    'test@expl.com',
    crypt('123456', gen_salt('bf')),  -- pw: 123456
    'authenticated',
    'authenticated',
    now(), now(), now(),
    '', '', '', '', '', '', '', ''
  );

-- auth.identities rows are required for GoTrue to authenticate users
insert into auth.identities (id, user_id, identity_data, provider, provider_id, created_at, updated_at, last_sign_in_at)
values
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001',
    '{"sub":"00000000-0000-0000-0000-000000000001","email":"jeffrey@expl.com"}',
    'email',
    '00000000-0000-0000-0000-000000000001',
    now(), now(), now()
  ),
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000002',
    '{"sub":"00000000-0000-0000-0000-000000000002","email":"test@expl.com"}',
    'email',
    '00000000-0000-0000-0000-000000000002',
    now(), now(), now()
  );

-- NOTE: The trigger `on_auth_user_created` (migration 20260305060107) automatically creates
-- a public.users profile, a default organization, and an owner membership for each new auth user.
-- We do NOT manually insert into public.users or create organizations here.

--
-- Seed data for Brand Management (Phase 1)
--
-- Add a reporting subject to jeffrey@expl.com's auto-created organization.

INSERT INTO public.reporting_subject (organization_id, name, industry)
SELECT
    om.organization_id,
    'Acme Website Builder',
    'Website Builder'
FROM public.organization_members om
JOIN public.users u ON u.id = om.user_id
WHERE u.auth_id = '00000000-0000-0000-0000-000000000001'
LIMIT 1
ON CONFLICT (organization_id, name) DO NOTHING;

-- Add competitors for 'Acme Website Builder'
WITH subject AS (
    SELECT rs.id
    FROM public.reporting_subject rs
    JOIN public.organization_members om ON om.organization_id = rs.organization_id
    JOIN public.users u ON u.id = om.user_id
    WHERE u.auth_id = '00000000-0000-0000-0000-000000000001'
    AND rs.name = 'Acme Website Builder'
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

-- ── Tech & SaaS ──────────────────────────────────────────────────────────────
('a1b2c3d4-0001-4001-8001-1234567890ab', 'tech-crm-v1',         'recommendation', 'What are the best {{industry}} platforms for {{target_audience}} in 2025?', true),
('a1b2c3d4-0002-4002-8002-1234567890ab', 'tech-pm-v1',          'comparison',     'Compare the top 3 project management tools for remote software teams.', true),
('a1b2c3d4-0003-4003-8003-1234567890ab', 'tech-cloud-v1',       'recommendation', 'Describe the current landscape of cloud storage providers for enterprise.', true),
('a1b2c3d4-0011-4011-8011-1234567890ab', 'tech-serverless-v1',  'recommendation', 'What are the leading platforms for building and deploying serverless applications?', true),
('a1b2c3d4-0016-4016-8016-1234567890ab', 'tech-devtools-v1',    'recommendation', 'Which developer tools are considered essential for modern full-stack engineers in {{industry}}?', true),
('a1b2c3d4-0017-4017-8017-1234567890ab', 'tech-nocode-v1',      'recommendation', 'What are the best no-code and low-code tools for building web applications without coding?', true),
('a1b2c3d4-0018-4018-8018-1234567890ab', 'tech-analytics-v1',   'comparison',     'Compare the top web analytics platforms in terms of privacy, features, and ease of use.', true),
('a1b2c3d4-0019-4019-8019-1234567890ab', 'tech-cicd-v1',        'recommendation', 'Which CI/CD platforms are most popular among engineering teams in 2025?', true),
('a1b2c3d4-0020-4020-8020-1234567890ab', 'tech-security-v1',    'recommendation', 'What are the leading cybersecurity tools for protecting SaaS applications?', true),
('a1b2c3d4-0021-4021-8021-1234567890ab', 'tech-ai-v1',          'market_leader',  'Which AI-powered {{industry}} tools are getting the most attention from product teams?', true),
('a1b2c3d4-0022-4022-8022-1234567890ab', 'tech-monitoring-v1',  'recommendation', 'What are the best application performance monitoring (APM) tools for cloud-native services?', true),

-- ── E-commerce & Retail ──────────────────────────────────────────────────────
('a1b2c3d4-0004-4004-8004-1234567890ab', 'retail-dtc-v1',       'recommendation', 'Which direct-to-consumer {{industry}} brands offer the best value for money?', true),
('a1b2c3d4-0005-4005-8005-1234567890ab', 'retail-platform-v1',  'use_case',       'What are the key features to look for in a modern e-commerce platform for a growing business?', true),
('a1b2c3d4-0023-4023-8023-1234567890ab', 'retail-payment-v1',   'comparison',     'Compare the most popular payment processors for online stores in terms of fees and reliability.', true),
('a1b2c3d4-0024-4024-8024-1234567890ab', 'retail-headless-v1',  'recommendation', 'What are the best headless commerce solutions for enterprise retailers?', true),
('a1b2c3d4-0025-4025-8025-1234567890ab', 'retail-loyalty-v1',   'recommendation', 'Which customer loyalty and rewards platforms are best suited for e-commerce brands?', true),

-- ── Finance & Fintech ────────────────────────────────────────────────────────
('a1b2c3d4-0006-4006-8006-1234567890ab', 'finance-trading-v1',  'recommendation', 'List the most popular mobile apps for stock trading and their primary benefits for beginners.', true),
('a1b2c3d4-0007-4007-8007-1234567890ab', 'finance-robo-v1',     'comparison',     'What are the main differences between robo-advisors for automated investing?', true),
('a1b2c3d4-0026-4026-8026-1234567890ab', 'finance-b2b-v1',      'recommendation', 'What are the top B2B payment and invoicing platforms used by small and medium businesses?', true),
('a1b2c3d4-0027-4027-8027-1234567890ab', 'finance-crypto-v1',   'recommendation', 'Which crypto exchanges are considered safest and most reliable for retail investors?', true),
('a1b2c3d4-0028-4028-8028-1234567890ab', 'finance-banking-v1',  'comparison',     'Compare the most popular neobanks and digital-first banking platforms.', true),

-- ── Marketing & Advertising ──────────────────────────────────────────────────
('a1b2c3d4-0012-4012-8012-1234567890ab', 'marketing-email-v1',  'recommendation', 'Which email marketing platforms are best suited for content creators and newsletters?', true),
('a1b2c3d4-0029-4029-8029-1234567890ab', 'marketing-seo-v1',    'recommendation', 'What are the best SEO tools for tracking keyword rankings and site health?', true),
('a1b2c3d4-0030-4030-8030-1234567890ab', 'marketing-social-v1', 'recommendation', 'Which social media management platforms are most effective for growing a brand online?', true),
('a1b2c3d4-0031-4031-8031-1234567890ab', 'marketing-ads-v1',    'comparison',     'Compare the main self-serve advertising platforms for reaching B2B {{target_audience}}.', true),
('a1b2c3d4-0032-4032-8032-1234567890ab', 'marketing-crm-v1',    'recommendation', 'What CRM platforms do fast-growing startups typically use for managing customer relationships?', true),
('a1b2c3d4-0033-4033-8033-1234567890ab', 'marketing-video-v1',  'recommendation', 'Which video hosting and marketing platforms are best for B2B demand generation?', true),

-- ── Health & Wellness ────────────────────────────────────────────────────────
('a1b2c3d4-0010-4010-8010-1234567890ab', 'health-meditation-v1','recommendation', 'What are the top-rated meditation and mindfulness apps available today for reducing stress?', true),
('a1b2c3d4-0034-4034-8034-1234567890ab', 'health-fitness-v1',   'comparison',     'Compare the most popular fitness tracking apps and wearables for personal health management.', true),
('a1b2c3d4-0035-4035-8035-1234567890ab', 'health-telehealth-v1','recommendation', 'What are the leading telehealth and online therapy platforms for mental health support?', true),
('a1b2c3d4-0036-4036-8036-1234567890ab', 'health-nutrition-v1', 'recommendation', 'Which nutrition and meal planning apps are most recommended by dietitians?', true),

-- ── HR & Productivity ────────────────────────────────────────────────────────
('a1b2c3d4-0037-4037-8037-1234567890ab', 'hr-ats-v1',           'recommendation', 'What are the best applicant tracking systems (ATS) for growing startups?', true),
('a1b2c3d4-0038-4038-8038-1234567890ab', 'hr-payroll-v1',       'comparison',     'Compare the top payroll and HR management platforms for remote-first companies.', true),
('a1b2c3d4-0039-4039-8039-1234567890ab', 'hr-learning-v1',      'recommendation', 'Which corporate learning management systems (LMS) are most effective for onboarding?', true),
('a1b2c3d4-0040-4040-8040-1234567890ab', 'productivity-docs-v1','recommendation', 'What are the best collaborative document and knowledge management platforms for teams?', true),

-- ── Travel & Hospitality ─────────────────────────────────────────────────────
('a1b2c3d4-0008-4008-8008-1234567890ab', 'travel-booking-v1',   'recommendation', 'What are the best booking websites for finding budget-friendly international flights and hotels?', true),
('a1b2c3d4-0041-4041-8041-1234567890ab', 'travel-business-v1',  'recommendation', 'Which corporate travel management platforms are most popular among mid-sized companies?', true),
('a1b2c3d4-0042-4042-8042-1234567890ab', 'travel-rental-v1',    'comparison',     'Compare the leading short-term rental platforms for property owners looking to list globally.', true),

-- ── Real Estate ──────────────────────────────────────────────────────────────
('a1b2c3d4-0013-4013-8013-1234567890ab', 'realestate-rental-v1','recommendation', 'What are the most effective online platforms for finding residential properties for rent?', true),
('a1b2c3d4-0043-4043-8043-1234567890ab', 'realestate-prop-v1',  'recommendation', 'Which real estate investment platforms allow individuals to invest with small amounts of capital?', true),
('a1b2c3d4-0044-4044-8044-1234567890ab', 'realestate-crm-v1',   'recommendation', 'What CRM and lead management tools do successful real estate agents rely on?', true),

-- ── Automotive ───────────────────────────────────────────────────────────────
('a1b2c3d4-0009-4009-8009-1234567890ab', 'auto-ev-v1',          'comparison',     'Compare the latest electric vehicle models from major manufacturers in terms of range, charging speed, and features.', true),
('a1b2c3d4-0045-4045-8045-1234567890ab', 'auto-fleet-v1',       'recommendation', 'Which fleet management software platforms are most used by logistics companies?', true),

-- ── Food & Beverage ──────────────────────────────────────────────────────────
('a1b2c3d4-0014-4014-8014-1234567890ab', 'food-mealkit-v1',     'recommendation', 'Which meal kit delivery services offer the best options for vegetarian and vegan diets?', true),
('a1b2c3d4-0046-4046-8046-1234567890ab', 'food-pos-v1',         'comparison',     'Compare the most popular point-of-sale systems for independent restaurants and cafes.', true),
('a1b2c3d4-0047-4047-8047-1234567890ab', 'food-delivery-v1',    'recommendation', 'What are the leading third-party food delivery platforms for restaurants in urban markets?', true),

-- ── Entertainment & Media ────────────────────────────────────────────────────
('a1b2c3d4-0015-4015-8015-1234567890ab', 'entertainment-stream-v1','comparison',  'Compare the libraries and original content of major video streaming services.', true),
('a1b2c3d4-0048-4048-8048-1234567890ab', 'entertainment-pod-v1', 'recommendation','Which podcast hosting and distribution platforms are best for independent creators?', true),
('a1b2c3d4-0049-4049-8049-1234567890ab', 'entertainment-music-v1','recommendation','What are the best music distribution services for independent artists releasing on streaming platforms?', true),

-- ── Education ────────────────────────────────────────────────────────────────
('a1b2c3d4-0050-4050-8050-1234567890ab', 'edu-online-v1',       'recommendation', 'What are the most highly regarded online learning platforms for professional upskilling?', true),
('a1b2c3d4-0051-4051-8051-1234567890ab', 'edu-coding-v1',       'recommendation', 'Which platforms are best for learning to code from scratch in {{industry}}-adjacent skills?', true),
('a1b2c3d4-0052-4052-8052-1234567890ab', 'edu-lms-v1',          'comparison',     'Compare the top learning management systems used by universities and online course creators.', true),

-- ── Emerging Trends ──────────────────────────────────────────────────────────
('a1b2c3d4-0053-4053-8053-1234567890ab', 'trend-ai-tools-v1',   'market_leader',  'Which AI-powered tools are considered market leaders in the {{industry}} space right now?', true),
('a1b2c3d4-0054-4054-8054-1234567890ab', 'trend-automation-v1', 'recommendation', 'What are the best workflow automation platforms for teams looking to reduce manual work?', true),
('a1b2c3d4-0055-4055-8055-1234567890ab', 'trend-b2b-saas-v1',   'market_leader',  'Name the fastest-growing B2B SaaS companies in the {{industry}} category and what sets them apart.', true),
('a1b2c3d4-0056-4056-8056-1234567890ab', 'trend-startup-v1',    'emerging_trend', 'What are the emerging startups disrupting the {{industry}} industry in 2025?', true),
('a1b2c3d4-0057-4057-8057-1234567890ab', 'trend-bestpractice-v1','best_practice', 'What are the current best practices for scaling a {{industry}} product to enterprise customers?', true),
('a1b2c3d4-0058-4058-8058-1234567890ab', 'trend-vc-v1',         'market_leader',  'Which {{industry}} companies have attracted the most venture capital investment recently?', true),
('a1b2c3d4-0059-4059-8059-1234567890ab', 'trend-problem-v1',    'best_practice',  'What are the biggest pain points that {{target_audience}} face when choosing a {{industry}} solution?', true),
('a1b2c3d4-0060-4060-8060-1234567890ab', 'trend-comparison-v1', 'comparison',     'If someone is evaluating {{industry}} tools for the first time, what are the top 5 options they should consider?', true)

ON CONFLICT (id) DO NOTHING;