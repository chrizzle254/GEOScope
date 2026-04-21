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
│   ├── app/                    # Routes and Layouts (Next.js App Router)
│   │   ├── auth/               # Auth pages (login, sign-up, forgot-password, etc.)
│   │   ├── dashboard/          # Main app UI (home, llm-comparison, competitors, convo-context)
│   │   ├── settings/           # Brand config, prompts, competitors sub-pages
│   │   └── account/            # Account / billing page
│   ├── components/
│   │   ├── ui/                 # Shadcn primitives (Button, Input, etc.) — customised for brutalist style
│   │   └── shared/             # Shared layout components:
│   │       ├── AppLayout.tsx   # Sidebar + scrollable main shell used by all app layouts
│   │       ├── Sidebar.tsx     # Nav with ANALYSIS / CONFIG sections, active state via usePathname()
│   │       └── SettingsNav.tsx # Sub-tab nav for settings (Brand config / Prompts / Competitors)
│   ├── lib/
│   │   ├── supabase/           # Client, Server, and Middleware Supabase configs
│   │   ├── apiClient.ts        # Authenticated fetch helpers (apiGet, apiPost, apiPatch)
│   │   └── config.ts           # Zod-validated env schema
│   ├── services/               # Service layer for Express API calls
│   │   └── brandService.ts     # getBrands, createBrand, updateBrand
│   ├── styles/
│   │   └── globals.css         # Tailwind v4 theme (CSS-only config, no tailwind.config.ts)
│   └── types/                  # Frontend TypeScript interfaces
│       └── brand.ts            # Brand, Competitor, CreateBrandInput

```

### 4.2 Backend (`apps/api`)

```text
api/
├── src/
│   ├── controllers/
│   │   └── brandController.ts     # GET /brands, POST /brands, PATCH /brands/:id
│   ├── services/
│   │   ├── samplingEngine.ts      # LLM orchestration (OpenAI, Anthropic, Gemini)
│   │   └── mentionParser.ts       # Regex-based brand/competitor extraction
│   ├── middleware/
│   │   ├── auth.ts                # JWT verification via remote JWKS (ES256/RS256/HS256)
│   │   └── validateModelAccess.ts # Guard for model availability
│   ├── lib/
│   │   └── supabase.ts            # Service Role client
│   ├── env.ts                     # Zod-validated env schema
│   └── index.ts                   # Express entry point

```

### 4.3 API Routes

| Method | Path               | Auth | Description                                  |
| ------ | ------------------ | ---- | -------------------------------------------- |
| GET    | `/health`          | —    | Health check                                 |
| GET    | `/brands`          | JWT  | List reporting subjects for the user's org   |
| POST   | `/brands`          | JWT  | Create a new reporting subject + competitors |
| PATCH  | `/brands/:id`      | JWT  | Update brand name/industry                   |
| POST   | `/api/v1/analyses` | JWT  | Trigger a sampling analysis run              |

## 5. Data Schema

### 5.1 Public Schema (User-Facing Data)

- **`users`**: Maps `auth.users` to application metadata and Stripe IDs.
- **`organizations`**: Top-level entity for grouping users and resources.
- **`organization_members`**: Pivot table assigning roles (`owner`, `admin`, `viewer`).
- **`reporting_subject`**: The target brand/product being tracked (includes `industry`, `target_audience`).
- **`reporting_subject_competitors`**: A list of competitors associated with a brand.
- **`analysis_runs`**: Tracks the execution status (pending, processing, completed, failed) of the sampling engine.
- **`mentions`**: Stores the parsed results from a single LLM response. Includes `brand_mentioned` (boolean), `competitors_mentioned` (array), and excerpts for both the brand and competitors.
- **`reporting_subject_metrics`**: High-level aggregated scores (Visibility, Accuracy, Sentiment) derived from an analysis run.

### 5.2 Internal Schema (System-Only)

- **`llm_providers`**: Registry of available models (e.g., `openai`, `anthropic`, `google`) with version tracking.
- **`prompts`**: Template-based prompt library with placeholders (e.g., `{{brand_name}}`, `{{industry}}`). Includes `slug`, `category`, `is_active` for management.
- **`llm_responses`**: Raw logs of LLM outputs for auditing, including `tokens_used` and `latency_ms`.

### 5.3 Billing Schema

- **`customers`**: Maps users to Stripe customer IDs.
- **`subscriptions`**: Manages organization-level subscription status.

## 6. Security & Infrastructure

- **JWT Verification:** `apps/api` verifies Supabase JWTs via remote JWKS (`/auth/v1/.well-known/jwks.json`), supporting ES256/RS256/HS256 automatically.
- **Auth Context:** The `authenticateUser` middleware resolves `user.id`, `user.auth_id`, `user.role`, and `user.organization_id` from the JWT in a single DB round-trip using an inner join on `organization_members`.
- **Hosting:**
  - **Web:** Vercel (Edge-optimized).
  - **API:** Render/Railway (Persistent Node.js environment to prevent LLM timeout).
  - **DB:** Supabase (Postgres).
- **Environment Variables:** Mirrored in `apps/web/.env.example` and `apps/api/.env.example`. Key web vars:
  - `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` — JWT-format ANON key (from `npx supabase status --output json` → `ANON_KEY`)
  - `NEXT_PUBLIC_API_BASE_URL` — Express API base URL (no trailing slash, no `/api` suffix)

## 7. Development Guidelines for AI Agent

- **Logic Placement:** Do not put LLM sampling logic in Next.js Server Actions; it belongs in `apps/api` to ensure process longevity.
- **Type Safety:** Prioritize shared types if a definition is used across both `web` and `api`.
- **UI Consistency:** Use `shadcn/ui` primitives in `apps/web/src/components/ui`. Design system is brutalist monochrome — Roboto Mono, 4px solid borders, `#1E1E1E`/`#757575`/`#FFFFFF` palette. Tailwind v4 uses CSS-only config in `globals.css` (no `tailwind.config.ts`).
- **Prompt Management:** System prompts are stored in `internal.prompts` and use template placeholders. Never hardcode brand names in prompts — use the template injection system in `samplingEngine.ts`.
- **Local Dev Seeding:** `supabase/seed.sql` seeds `auth.users` with `instance_id`, empty-string token columns, and matching `auth.identities` rows. The trigger `on_auth_user_created` auto-creates `public.users`, a default org, and org membership — do not insert into `public.users` manually in seeds.
