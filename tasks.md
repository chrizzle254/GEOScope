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

#### **Phase 1: Brand Management & API Integration**

- [ ] **Express API: JWT Verification Middleware**
- Implement `apps/api/src/middleware/auth.ts` to validate Supabase JWTs.
- Use `jsonwebtoken` or `jose` to verify headers from `apps/web`.

- [ ] **Express API: Brand Endpoints**
- Create `POST /brands` and `GET /brands` in `apps/api/src/controllers/brandController.ts`.
- Map to `public.brands` (or `reporting_subject`) table via Supabase Service Role.

- [ ] **Frontend: Brand Configuration UI**
- Build `BrandForm` in `apps/web/src/components/shared/` using `shadcn/ui`.
- Integrate form with `apps/web/src/services/` to communicate with Express API.

#### **Phase 2: LLM Sampling Engine (Core Logic)**

- [ ] **Express API: Orchestration Service**
- Implement `apps/api/src/services/samplingEngine.ts` using **Vercel AI SDK**.
- **Constraint:** Logic must remain in Express to avoid Vercel Serverless timeouts.
- Support OpenAI (GPT-4o), Anthropic (Claude 3.5), and Google Gemini 1.5.

- [ ] **Prompt Library & Generation**
- Create system-managed prompt templates (~100 samples) in `apps/api/src/lib/prompts.ts`.
- Simulate realistic user queries (e.g., "What is the best [industry] tool?").

- [ ] **Data Extraction & Persistence**
- Implement parser to extract brand mentions, competitor mentions, and sentiment.
- Save structured logs to `public.analyses` and `public.analysis_results`.

#### **Phase 3: Dashboard & Visualization**

- [ ] **Dashboard Layout**
- Implement responsive grid in `apps/web/src/app/dashboard/page.tsx`.

- [ ] **Data Visualization**
- Create **Visibility Score** and **Sentiment Trend** components using `Recharts`.
- Display comparative ranking against competitors.

- [ ] **Accuracy/Hallucination Reporting**
- Build UI to highlight factual inaccuracies detected during LLM sampling.

#### **Phase 4: Billing & Payments**

- [ ] **Stripe Integration**
- Set up Stripe Webhooks in `apps/api/src/controllers/billingController.ts`.
- Sync subscription status to `profiles` or `billing.subscriptions` table.

- [ ] **Access Control Middleware**
- Add backend middleware to block analysis triggers if a valid subscription is missing.

#### **Phase 5: Exports & Maintenance**

- [ ] **Export Service**
- Implement PDF/CSV generation in `apps/api/src/services/reportService.ts`.
- Upload to Supabase Storage with signed URL access.

- [ ] **Automated Scheduler**
- Set up cron job (via GitHub Actions or Node-cron) to trigger periodic re-analysis.
