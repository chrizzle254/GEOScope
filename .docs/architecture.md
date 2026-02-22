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
2. **Analysis Trigger:** Frontend sends a POST request to `apps/api`.
3. **Sampling Engine:** The Express API orchestrates multiple LLM calls (OpenAI, Claude, Gemini).
4. **Data Persistence:** API writes results directly to Supabase using the Service Role Key.
5. **UI Update:** `apps/web` reflects changes via Supabase Realtime or SWR/React Query polling.

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

## 5. Initial Data Schema

- **`profiles`:** Links to `auth.users`. Stores `stripe_customer_id` and subscription status.
- **`reporting_subject`:** Stores brand names and competitor metadata owned by a `profile_id`.
- **`analysis_runs`:** Logs an analysis attempt, its status (`pending`, `processing`, `completed`), and timestamps.
- **`mentions`:** Stores individual data points from each LLM sample. Fields: analysis_run_id, provider_id, sentiment (enum), accurate (boolean), and excerpt (text).
- **`reporting_subject_metrics`:** Stores the aggregated results for a specific run. Fields: analysis_run_id, visibility_score, accuracy_rate, and sentiment_score.

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
