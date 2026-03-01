# PRD: GEO Scope (AI Reputation Analytics)

## 1. Objective

GEO Scope is a SaaS platform providing brands with data-driven insights into how they are perceived, represented, and recommended by Large Language Models (LLMs). It serves as "SEO for the AI era," helping brands manage their presence in the LLM ecosystem.

## 2. User Stories

- **As a Marketer:** I want to track my brand's "Share of Voice" across GPT-4, Claude, and Gemini so I can justify AI-focused marketing spend.
- **As a Brand Strategist:** I want to see which competitors are recommended alongside my brand so I can identify market threats.
- **As a Product Manager:** I want to identify factual hallucinations about my product features to coordinate "source data" corrections.

## 3. Core Features (MVP)

### 3.1 User Authentication & Billing

- **Provider:** Supabase Auth (Email + Google Social).
- **Payments:** Stripe integration handled via `apps/api` (Express).
- **Access Control:** Middleware to verify an active subscription before allowing "Brand Analysis" requests.

### 3.2 Brand Analysis Engine (Sampling)

- **Input:** Brand name, industry, and up to 10 competitors.
- **Orchestration:** `apps/api` (Express) to handle long-running LLM calls (~100 prompts) to avoid Vercel Serverless function timeouts.
- **Providers:** OpenAI, Anthropic, and Google Gemini via Vercel AI SDK.

### 3.3 Data Visualization Dashboard

- **Charts:** Recharts for "Mention Frequency" and "Sentiment Trends."
- **UI Components:** Shadcn/ui (Radix + Tailwind) using a responsive dashboard layout.
- **Competitive Visibility & Share of Voice (SoV):** How often the user brand is mentioned compared to its competitors.
- **Accuracy Check:** A dedicated section highlighting "Fact vs. Hallucination" detected in LLM responses.

### 3.4 Report Exports

- **Format:** CSV/PDF generated on the `apps/api` backend.
- **Storage:** Exported files stored in Supabase Storage buckets with signed URLs for secure user download.

## 4. Technical Constraints & Stack

- **Monorepo:** Turborepo managing `apps/web` (Next.js) and `apps/api` (Node/Express).
- **Database:** Supabase (PostgreSQL) for user data, brand logs, and analysis results.
- **Communication:** `apps/web` uses Supabase Client for Auth/DB; uses Fetch/Axios to hit `apps/api` for LLM orchestration and Stripe.
- **Design System:** Shadcn/ui (Tailwind CSS, Radix UI, Lucide React).

## 5. Directory Mapping (Agent Context)

The agent must respect the following structure:

- **UI Components:** `apps/web/src/components/ui/` (Shadcn primitives).
- **Feature Components:** `apps/web/src/components/shared/`.
- **Database Clients:** `apps/web/src/lib/supabase/`.
- **API Logic:** `apps/api/src/` (Express routes and services).
- **Types:** Shared TypeScript interfaces should be prioritized.

## 6. Success Criteria (MVP Definition of Done)

1. User can successfully sign up and complete a Stripe checkout.
2. User can submit a brand name and trigger a sampling analysis.
3. The `apps/api` queries at least 2 LLM providers and saves structured results to Supabase.
4. Accurately detecting brand mention/omission from a generic industry query.
5. The Dashboard displays a "Visibility Score" (percentage of mentions) and a "Sentiment Chart."

## 7. Non-Goals

- No custom prompt engineering by the user (Prompts are system-managed).
- No real-time "Social Listening" (Analysis is batch/on-demand).
- No multi-user organizations or team-sharing features.
