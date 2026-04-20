### **Tasks: GEO Scope Development**

---

#### **Phase 0: Foundation (Completed)**

- [x] **Project Scaffolding**
  - [x] CI/CD gitpipeline
  - [x] Initial monorepo layout (Turborepo)
  - [x] Tool configuration (Turbo, Prettier, ESLint)
  - [x] Readme + Scripts
  - [x] Env management
- [x] **Supabase Setup**
  - [x] Project setup
  - [x] RLS setup
  - [x] Setup DB schema (with migration files)
- [x] **Auth**
  - [x] Protect routes with middleware
    - **Session Note (CHR-25):** Created `apps/web/src/middleware.ts` — was missing entirely. Uses `@supabase/ssr` to check session server-side. Protects `/dashboard`, `/settings`, `/account`. Redirects unauthenticated users to `/auth/login?next=<path>`. Commit: `927d235`.
  - [x] Add auth routes (login, register, reset passwords)

---

#### **Phase 1: Brand Management & API Integration (Refocused)**

- [x] **Express API: JWT Verification Middleware**
- [x] **Database Seeding (Development Anchor)**
  - Manually seed `organizations`, `reporting_subject`, and `reporting_subject_competitors`.
  - **Session Note:** Added idempotent seed data for `organizations`, `reporting_subject`, and `reporting_subject_competitors` to `supabase/seed.sql` to support brand endpoint development.
- [x] **Express API: Brand Endpoints**
  - Create `POST /brands` and `GET /brands` in `apps/api/src/controllers/brandController.ts`.
  - Map to `public.reporting_subject` and `public.reporting_subject_competitors`.

---

#### **Phase 2: LLM Sampling Engine**

- [x] **Express API: Orchestration Service**
  - Implement `apps/api/src/services/samplingEngine.ts`.
  - Support **GPT-5.2**, **Claude 4.6**, and **Gemini 3.1**.
- [x] **The "Blind" Prompt Library**
  - Create `apps/api/src/lib/prompts.ts` with ~100 industry-specific questions.
  - **Rule:** These prompts must NOT mention the User's Brand.
  - **Session Note (CHR-22):** Expanded `supabase/seed.sql` from 15 → 60 prompt templates across 13 industry categories. Table is `internal.prompts` (not `internal.prompt_templates` as in ticket). Commit: `927d235`.
- [x] **Mention Extraction Parser**
  - **Session Note:** Implemented a Regex-based `MentionParser` using TDD. The `samplingEngine` was refactored to use this parser and persist results to a newly defined `public.mentions` schema.
- [x] **Data Persistence**
  - Record `mentions`: Was the brand present? (Boolean)

---

#### **Phase 3: Frontend Implementation**

> Design system: Roboto Mono font, monochromatic palette (#1E1E1E, #757575, #D9D9D9, #FFFFFF), 4px solid borders, border-radius 3–6px. Source of truth: Figma board `hx0n5moRs1zHjhG4SUDWum`.

---

##### **3.0 — Design System & Foundation**

- [x] **Tailwind Theme**
  - Updated `globals.css` (Tailwind v4 CSS-based config): brand color tokens via CSS custom properties. `--radius: 0.1875rem` (3px). `--border` and `--input` mapped to `#757575`. `--primary` mapped to `#1E1E1E`.
- [x] **Typography**
  - Roboto Mono loaded via `next/font/google` in `layout.tsx`. CSS variable `--font-roboto-mono` referenced in `@theme inline` as `--font-sans` and `--font-mono`.
- [x] **Sidebar Component** (`apps/web/src/components/shared/Sidebar.tsx`)
  - Logo, ANALYSIS and CONFIG nav sections, active state via `usePathname()`. 4px right border.
- [x] **Dashboard Shell Layout** (`apps/web/src/app/dashboard/layout.tsx`)
  - Fixed sidebar + scrollable `<main>`.
- [x] **shadcn primitives updated** — `Input` (4px border, h-12), `Button` (4px border, brutalist variants).
  - **Session Note:** Tailwind v4 uses CSS-only config; no `tailwind.config.ts` needed. All color tokens set in `globals.css`.
- [x] **AppLayout** (`apps/web/src/components/shared/AppLayout.tsx`) — shared sidebar shell used by all authenticated layouts.

---

##### **3.1 — Auth Pages**

- [x] **Login Page** (`apps/web/src/app/auth/login/page.tsx`)
  - Rebuilt: logo, uppercase heading, Roboto Mono, 4px border inputs, dark filled CTA. Supabase logic kept intact. Redirects to `/dashboard`.
- [x] **Sign-Up Page** (`apps/web/src/app/auth/sign-up/page.tsx`)
  - Rebuilt to match login design. Redirects to `/auth/sign-up-success`.
- [x] **Forgot Password Page** (`apps/web/src/app/auth/forgot-password/page.tsx`)
  - Single email field + inline success state (no page change).
- [x] **Sign-Up Success Page** — Rebuilt without Card, matches brutalist style.
  - **Session Note:** All Supabase auth logic preserved; only markup/styles replaced.

---

##### **3.2 — Home / Dashboard**

- [x] **Empty State** (`apps/web/src/app/dashboard/page.tsx`)
  - "Setup brand to see mentions of LLM" + "Look up brand" CTA → `/settings`.
- [x] **Populated State**
  - Brand header (name + industry + competitor chips).
  - Three metric placeholder cards (Visibility Score, Share of Voice, Sentiment) with `—` until analysis runs.
  - "Run analysis" CTA stub.
- [x] **Foundation**
  - `apps/web/src/types/brand.ts` — Brand, Competitor, CreateBrandInput interfaces.
  - `apps/web/src/lib/apiClient.ts` — `apiGet`, `apiPost`, `apiPatch` with Supabase JWT auth header. Reads `NEXT_PUBLIC_API_BASE_URL` (no `/api` suffix).
  - `apps/web/src/services/brandService.ts` — `getBrands`, `createBrand`, `updateBrand`.
  - `apps/web/src/components/shared/AppLayout.tsx` — shared sidebar shell used by all app pages.
  - **Session Note:** `PATCH /brands/:id` added to Express API (`updateBrand` controller + route) as it was required for settings save to work. `NEXT_PUBLIC_API_URL` in `.env.local` renamed to `NEXT_PUBLIC_API_BASE_URL` to match `apiClient.ts`.

---

##### **3.3 — Settings / Brand Config**

- [x] **Settings Layout** (`apps/web/src/app/settings/layout.tsx`)
  - Sidebar via `AppLayout` + `SettingsNav` sub-tabs (Brand config / Prompts / Competitors). Active tab uses bottom border indicator.
- [x] **Brand Config — Create + Edit + View** (`apps/web/src/app/settings/page.tsx`)
  - Create mode (no brand): form with BRAND NAME, WEBSITE, INDUSTRY inputs + Save.
  - View mode (brand exists): read-only rows with `✎` edit icon per row.
  - Edit mode: same form pre-filled + Save / Discard changes.
  - Calls `POST /brands` (create) or `PATCH /brands/:id` (update). Success/error via `sonner` toast.
- [x] **Prompts Sub-Page** (`apps/web/src/app/settings/prompts/page.tsx`)
  - Textarea with "EXAMPLE PROMPT" label + uppercase helper text + Save.
- [x] **Competitors Sub-Page** (`apps/web/src/app/settings/competitors/page.tsx`)
  - Lists existing competitors fetched from `GET /brands`. Add (Enter or button) / Remove per row. Max 10.
- [x] **Account Page** (`apps/web/src/app/account/`) — layout + placeholder billing form (Stripe integration pending).
  - **Session Note:** Website field is frontend-only (not in DB schema yet). `sonner` Toaster added to root layout.
- [x] **SettingsNav** (`apps/web/src/components/shared/SettingsNav.tsx`) — sub-tab nav for settings pages (Brand config / Prompts / Competitors). Active tab uses `border-b-4 -mb-[4px] border-foreground`.
- [x] **Supabase Auth Seeding Fixed** — `supabase/seed.sql` rewritten to include `instance_id`, empty-string token columns, `auth.identities` rows, and `updated_at`. Removed manual `public.users` inserts (the `on_auth_user_created` trigger handles them). Seeded brand now added to the trigger-created personal org instead of a separate 'Acme Inc.' org.
  - **Session Note:** Migration `014_apply_rls_and_move_schemas.sql` had a bug (`analysis_run_id` → `run_id` for mentions RLS policies) — fixed. `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` must be the JWT-format `ANON_KEY` from `npx supabase status --output json`, not the `sb_publishable_*` format.

---

##### **3.4 — Analysis Pages**

- [x] **LLM Comparison Page** (`apps/web/src/app/dashboard/llm-comparison/page.tsx`)
  - Table or card grid comparing mention rates per LLM provider (OpenAI, Anthropic, Gemini).
  - Data: query `public.mentions` grouped by `llm_provider`.
  - Use Recharts `BarChart` for visual comparison.
  - **Session Note:** Added `GET /api/v1/analyses` and `GET /api/v1/analyses/:runId/mentions` API endpoints. New migration `20260322000000_add_rpc_get_mentions_with_provider.sql` provides a `SECURITY DEFINER` RPC that joins `public.mentions` with `internal.llm_responses` to expose `llm_provider`. Page shows run summary stats, BarChart with per-provider colors, and a summary table. Empty states for no brand / no completed runs. 5 unit tests added to `apps/api/src/services/analysisUtils.test.ts`.
- [x] **Competitors Page** (`apps/web/src/app/dashboard/competitors/page.tsx`)
  - Share of Voice chart: brand vs. each competitor's mention frequency.
  - Data from `public.mentions` → `competitors_mentioned` array aggregation.
  - Use Recharts `PieChart` or `BarChart`.
  - **Session Note:** Horizontal `BarChart layout="vertical"` chosen for readability of entity names. Brand bar uses `#1E1E1E`, competitors use `#757575`. Inline `%` labels on each bar via custom `BarLabel`. Summary table with "you" badge on brand row. `computeSoV` tests added to `analysisUtils.test.ts` (10 total).
- [x] **Convo Context Page** (`apps/web/src/app/dashboard/convo-context/page.tsx`)
  - List of raw LLM response excerpts where the brand was mentioned.
  - Display `brand_excerpt` and `competitors_excerpt` fields from `public.mentions`.
  - Pagination or infinite scroll for large result sets.
  - **Session Note:** Client-side pagination (PAGE_SIZE=10). Filters to `brand_mentioned=true`. Each card shows provider badge, confidence level, brand excerpt (left border `#1E1E1E`), competitor excerpts (left border `#757575`). Prev/Next controls with disabled states.

---

##### **3.5 — Account Page**

- [x] **Account / Billing Form** (`apps/web/src/app/account/page.tsx`)
  - Heading: `"DO YOU TAKE IT SERIOUSLY?"` in Roboto Mono.
  - Labelled input fields: `CREDIT CARD`, `NAME`, `ADDRESS`.
  - Disclaimer text: `"You won't be charged anything. We just want to verify that you are not spamming."` (small, `#757575`).
  - Integrate Stripe Elements for the credit card field.
  - `"Save"` and `"Back"` buttons.
  - **Session Note:** Installed `@stripe/stripe-js` + `@stripe/react-stripe-js`. Page wraps with `<Elements>` provider; `CardElement` styled to match design system via Stripe's style API. `stripePromise` is `null` when `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is unset (graceful degradation). Save is a stub — shows `sonner` toast. `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` added to `apps/web/.env.example`.

---

##### **3.6 — API Service Layer (Frontend)**

- [x] **Brand Service** (`apps/web/src/services/brandService.ts`)
  - `getBrand()`, `createBrand()`, `updateBrand()` — wraps Express API calls with Supabase JWT in `Authorization` header.
  - **Session Note:** Implemented in Phase 3.2 alongside `apiClient.ts`.
- [x] **Analysis Service** (`apps/web/src/services/analysisService.ts`)
  - `triggerAnalysis()`, `getAnalysisRuns()`, `getMentions()` — fetches from Express API.
  - **Session Note:** Implemented in Phase 3.4 alongside the LLM Comparison page. New types in `apps/web/src/types/analysis.ts`.
- [ ] **React Query / SWR Setup**
  - Add `@tanstack/react-query` provider in `apps/web/src/app/layout.tsx`.
  - Create typed query hooks: `useBrand()`, `useAnalysisRuns()`, `useMentions()`.

---

##### **3.7 — Quality Assurance**

- [ ] **Lint & Type Check**
  - `npm run lint --filter=web` passes with zero errors.
  - `tsc --noEmit` passes in `apps/web`.
- [ ] **Component Tests**
  - Unit tests for `Sidebar` active state logic.
  - Integration test for Brand Config form (edit → save → view mode transition).
- [ ] **Responsive Design**
  - Sidebar collapses to icon-only on `md` breakpoint.
  - All forms remain usable on mobile viewport (375px min).

---

#### **Phase 4: Billing & Payments**

- [ ] **Stripe Integration**
  - Set up Stripe Webhooks in `apps/api/src/controllers/billingController.ts`.
- [ ] **Access Control Middleware**
  - Backend middleware to block analysis if a valid subscription is missing.
- [ ] **Secure LLM API Key Management**
  - Create `organization_llm_keys` table to store encrypted API keys.
  - Build API endpoints for CRUD operations on keys.
  - Tie key usage to organization membership.

---

#### **Phase 5: Exports & Maintenance**

- [ ] **Export Service**
  - Implement PDF/CSV generation in `apps/api/src/services/reportService.ts`.
- [ ] **Automated Scheduler**
  - Set up cron job to trigger periodic re-analysis.

---

#### **Future Ideas**

- Record `sentiment`: How was the brand described? (Post-analysis only)
- Update `reporting_subject_metrics` for Share of Voice (SoV) calculation.
