# Architecture Spec: GEO Scope

## 1. System Overview

GEO Scope is a specialized SaaS platform built on a Turborepo monorepo architecture. It separates the high-velocity UI/Frontend from the long-running, resource-intensive LLM Sampling Engine.

## 2. Tech Stack

- **Monorepo:** Turborepo with npm workspaces.
- **Frontend (`apps/web`):** Next.js 15 (App Router), React 19, TypeScript.
- **Backend (`apps/api`):** Node.js with Express, TypeScript.
- **Database & Auth:** Supabase (PostgreSQL + Supabase Auth).
- **LLM Orchestration:** Vercel AI SDK (implemented in `apps/api`).
- **UI/Styling:** Tailwind CSS, `shadcn/ui` (Radix UI), Lucide React.
- **Data Viz:** Recharts.
- **Payments:** Stripe (via Express middleware/webhooks).

## 3. High-Level Data Flow

1. **Authentication:** Users sign in via `apps/web` using Supabase Auth. The JWT is passed to the backend for authorized requests.
2. **Analysis Trigger:** Frontend sends a POST request to `apps/api` with brand name, industry, and competitors.
3. **Brand Resolution:** API creates or fetches the `reporting_subject` record and stores competitors.
4. **Template Injection:** The Sampling Engine fetches system prompts from `internal.prompts` and fills placeholders (e.g., `{{brand_name}}`, `{{industry}}`) with actual brand metadata.
5. **LLM Orchestration:** The Express API orchestrates multiple LLM calls (OpenAI, Claude, Gemini) with personalized prompts.
6. **Data Persistence:** API writes raw responses to `internal.llm_responses` and extracted mentions to `public.mentions` using the Service Role Key.
7. **UI Update:** `apps/web` reflects changes via Supabase Realtime or SWR/React Query polling.

## 4. Directory Structure

### 4.1 Frontend (`apps/web`)

```text
web/
├── src/
│   ├── app/                # Routes, Layouts, Server Actions
│   │   ├── (auth)/         # Auth route group
│   │   ├── dashboard/      # Main application UI
│   │   └── api/            # Local Next.js route handlers
│   ├── components/
│   │   ├── ui/             # Shadcn primitives
│   │   └── shared/         # Feature components (BrandForm, Charts)
│   ├── lib/
│   │   ├── supabase/       # Client, Server, and Middleware configs
│   │   └── stripe.ts       # Frontend Stripe elements config
│   ├── services/           # Logic for hitting the Express API
│   └── types/              # Frontend-specific UI types

```

### 4.2 Backend (`apps/api`)

```text
api/
├── src/
│   ├── controllers/        # Route handlers
│   ├── services/           # LLM logic & Sampling Engine
│   ├── middleware/         # Supabase JWT verification
│   ├── lib/                # Client initializations (Stripe, OpenAI)
│   └── index.ts            # Entry point

```

## 5. Data Schema

### 5.1 Public Schema (User-Facing Data)

- **`users`**: Maps `auth.users` to application metadata and Stripe IDs.
- **`organizations`**: Top-level entity for grouping users and resources.
- **`organization_members`**: Pivot table assigning roles (`owner`, `admin`, `viewer`).
- **`reporting_subject`**: The target brand/product being tracked (includes `industry`, `search_context`).
- **`reporting_subject_competitors`**: A list of competitors associated with a brand.
- **`analysis_runs`**: Tracks the execution status (pending, processing, completed, failed) of the sampling engine.
- **`mentions`**: Stores results of individual LLM queries (brand presence, sentiment, excerpt, competitor mentions).
- **`reporting_subject_metrics`**: High-level aggregated scores (Visibility, Accuracy, Sentiment) derived from an analysis run.

### 5.2 Internal Schema (System-Only)

- **`llm_providers`**: Registry of available models (e.g., `openai`, `anthropic`, `google`) with version tracking.
- **`prompts`**: Template-based prompt library with placeholders (e.g., `{{brand_name}}`, `{{industry}}`). Includes `slug`, `category`, `is_active` for management.
- **`llm_responses`**: Raw logs of LLM outputs for auditing, including `tokens_used` and `latency_ms`.

### 5.3 Billing Schema

- **`customers`**: Maps users to Stripe customer IDs.
- **`subscriptions`**: Manages organization-level subscription status.

## 6. Security & Infrastructure

- **JWT Verification:** `apps/api` must verify the Supabase JWT in the `Authorization` header for all protected routes.
- **Hosting:** - **Web:** Vercel (Edge-optimized).
- **API:** Render/Railway (Persistent Node.js environment to prevent LLM timeout).
- **DB:** Supabase (Postgres).

- **Environment Variables:** Must be mirrored in `.env.example` at the root and within respective app folders.

## 7. Development Guidelines for AI Agent

- **Logic Placement:** Do not put LLM sampling logic in Next.js Server Actions; it belongs in `apps/api` to ensure process longevity.
- **Type Safety:** Prioritize shared types if a definition is used across both `web` and `api`.
- **UI Consistency:** Always reference `@style-guide.md` and use `shadcn/ui` primitives located in `apps/web/src/components/ui`.
- **Prompt Management:** System prompts are stored in `internal.prompts` and use template placeholders. Never hardcode brand names in prompts—use the template injection system in `samplingEngine.ts`.
