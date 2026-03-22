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
- [x] **Mention Extraction Parser**
  - **Session Note:** Implemented a Regex-based `MentionParser` using TDD. The `samplingEngine` was refactored to use this parser and persist results to a newly defined `public.mentions` schema.
- [x] **Data Persistence**
  - Record `mentions`: Was the brand present? (Boolean)

---

#### **Phase 3: Frontend Implementation**

> Design system: Roboto Mono font, monochromatic palette (#1E1E1E, #757575, #D9D9D9, #FFFFFF), 4px solid borders, border-radius 3–6px. Source of truth: Figma board `hx0n5moRs1zHjhG4SUDWum`.

---

##### **3.0 — Design System & Foundation**

- [ ] **Tailwind Theme**
  - Extend `tailwind.config.ts` with brand color tokens: `brand-black: #1E1E1E`, `brand-gray: #757575`, `brand-muted: #D9D9D9`.
  - Add `borderWidth: { DEFAULT: '4px' }` and `borderRadius: { sm: '3px', md: '6px' }` tokens.
- [ ] **Typography**
  - Install and configure **Roboto Mono** via `next/font/google` in `apps/web/src/app/layout.tsx`.
  - Set as the default `font-sans` in Tailwind config.
- [ ] **Sidebar Component** (`apps/web/src/components/shared/Sidebar.tsx`)
  - Logo mark: `"GEO Visibility 🤖"` in Roboto Mono.
  - Two nav sections with uppercase labels: `ANALYSIS` (Home, LLM comparison, Competitors, Convo context) and `CONFIG` (Settings, Account).
  - Active link: `#1E1E1E` text + left border indicator. Inactive: `#757575`.
  - Use Next.js `usePathname()` for active state detection.
- [ ] **Dashboard Shell Layout** (`apps/web/src/app/dashboard/layout.tsx`)
  - Fixed sidebar (left) + scrollable main content area.
  - Wrap all `/dashboard`, `/settings`, and `/account` routes in this layout.

---

##### **3.1 — Auth Pages**

- [ ] **Login Page** (`apps/web/src/app/(auth)/login/page.tsx`)
  - Discard placeholder. Rebuild with brutalist mono style: Roboto Mono, 4px borders, white background.
  - Fields: Email, Password. CTA: "Login" button (dark fill, `#757575` border).
  - Link to sign-up and forgot-password routes.
- [ ] **Sign-Up Page** (`apps/web/src/app/(auth)/sign-up/page.tsx`)
  - Same design system as login.
  - Fields: Email, Password, Confirm Password.
- [ ] **Forgot Password Page** (`apps/web/src/app/(auth)/forgot-password/page.tsx`)
  - Single email field + submit CTA.

---

##### **3.2 — Home / Dashboard**

- [ ] **Empty State** (`apps/web/src/app/dashboard/page.tsx`)
  - When no brand is configured: display `"Setup brand to see mentions of LLM"` message with a `"Look up brand"` CTA button that routes to `/settings`.
  - Include a small brand placeholder icon/box.
- [ ] **Populated State**
  - Brand name + metadata displayed in a summary header.
  - Visibility Score metric card (percentage of LLM mentions).
  - Placeholder sections for LLM comparison, competitor mentions, sentiment trend (to be fleshed out in 3.4).
  - Wire up data fetching from `GET /brands` and `GET /analysis-runs` API endpoints.

---

##### **3.3 — Settings / Brand Config**

- [ ] **Settings Layout** (`apps/web/src/app/settings/layout.tsx`)
  - Sub-navigation tabs: **Brand config**, **Prompts**, **Competitors**.
  - Active tab highlighted with bottom border or bold weight.
- [ ] **Brand Config — Edit Mode** (`apps/web/src/app/settings/page.tsx`)
  - Three labelled input fields (uppercase label above, placeholder text in `#D9D9D9`):
    - `BRAND NAME` → input placeholder `"Brand name"`
    - `WEBSITE` → input placeholder `"brand.com"`
    - `INDUSTRY` → input placeholder `"Industry"`
  - Two action buttons: `"Save"` (dark/filled) and `"Discard changes"` (ghost/outlined).
  - On save: `POST /brands` or `PATCH /brands/:id`, then switch to view mode.
- [ ] **Brand Config — View Mode**
  - Same three fields rendered read-only.
  - Each field row has an inline `✎` edit icon (pencil) that switches that field (or the whole form) to edit mode.
  - `"Save"` and `"Back"` action buttons.
- [ ] **Prompts Sub-Page** (`apps/web/src/app/settings/prompts/page.tsx`)
  - Section label: `EXAMPLE PROMPT`.
  - Helper text (uppercase, small): `"ENTER A PROMPT THAT YOU WOULD EXPECT YOUR BRAND TO BE MENTIONED FOR"`.
  - Textarea with placeholder `"Your example prompt..."`.
  - `"Save"` button.
- [ ] **Competitors Sub-Page** (`apps/web/src/app/settings/competitors/page.tsx`)
  - List of current competitors (name only, fetched from `GET /brands` competitors array).
  - Add competitor input + button.
  - Remove competitor (delete icon per row).
  - Wire to `POST /brands` competitors field.

---

##### **3.4 — Analysis Pages**

- [ ] **LLM Comparison Page** (`apps/web/src/app/dashboard/llm-comparison/page.tsx`)
  - Table or card grid comparing mention rates per LLM provider (OpenAI, Anthropic, Gemini).
  - Data: query `public.mentions` grouped by `llm_provider`.
  - Use Recharts `BarChart` for visual comparison.
- [ ] **Competitors Page** (`apps/web/src/app/dashboard/competitors/page.tsx`)
  - Share of Voice chart: brand vs. each competitor's mention frequency.
  - Data from `public.mentions` → `competitors_mentioned` array aggregation.
  - Use Recharts `PieChart` or `BarChart`.
- [ ] **Convo Context Page** (`apps/web/src/app/dashboard/convo-context/page.tsx`)
  - List of raw LLM response excerpts where the brand was mentioned.
  - Display `brand_excerpt` and `competitors_excerpt` fields from `public.mentions`.
  - Pagination or infinite scroll for large result sets.

---

##### **3.5 — Account Page**

- [ ] **Account / Billing Form** (`apps/web/src/app/account/page.tsx`)
  - Heading: `"DO YOU TAKE IT SERIOUSLY?"` in Roboto Mono.
  - Labelled input fields: `CREDIT CARD`, `NAME`, `ADDRESS`.
  - Disclaimer text: `"You won't be charged anything. We just want to verify that you are not spamming."` (small, `#757575`).
  - Integrate Stripe Elements for the credit card field.
  - `"Save"` and `"Back"` buttons.

---

##### **3.6 — API Service Layer (Frontend)**

- [ ] **Brand Service** (`apps/web/src/services/brandService.ts`)
  - `getBrand()`, `createBrand()`, `updateBrand()` — wraps Express API calls with Supabase JWT in `Authorization` header.
- [ ] **Analysis Service** (`apps/web/src/services/analysisService.ts`)
  - `triggerAnalysis()`, `getAnalysisRuns()`, `getMentions()` — fetches from Express API.
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
