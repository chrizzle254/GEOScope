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
- [ ] **Database Seeding (Development Anchor)**
  - Manually seed `organizations`, `reporting_subject`, and `reporting_subjectcompetitors`.
- [ ] **Express API: Brand Endpoints**
  - Create `POST /brands` and `GET /brands` in `apps/api/src/controllers/brandController.ts`.
  - Map to `public.reporting_subject` and `public.reporting_subjectcompetitors`.

---

#### **Phase 2: LLM Sampling Engine (Blind Share-of-Voice)**

- [ ] **Express API: Orchestration Service**
  - Implement `apps/api/src/services/samplingEngine.ts`.
  - Support **GPT-5.2**, **Claude 4.6**, and **Gemini 3.1**.
- [ ] **The "Blind" Prompt Library**
  - Create `apps/api/src/lib/prompts.ts` with ~100 industry-specific questions.
  - **Rule:** These prompts must NOT mention the User's Brand.
- [ ] **Mention Extraction Parser**
  - Build a regex or LLM-based utility to scan raw responses for `reporting_subject.name` and `competitors.name`.
- [ ] **Data Persistence**
  - Record `mentions`: Was the brand present? (Boolean)
  - Record `sentiment`: How was the brand described? (Post-analysis only)
  - Update `reporting_subject_metrics` for Share of Voice (SoV) calculation.

---

#### **Phase 3: Dashboard & Visualization**

- [ ] **Frontend: Brand Configuration UI**
  - Build `BrandForm` in `apps/web/src/components/shared/` using `shadcn/ui`.
- [ ] **Dashboard Layout**
  - Implement responsive grid in `apps/web/src/app/dashboard/page.tsx`.
- [ ] **Data Visualization**
  - Create **Visibility Score** and **Sentiment Trend** components using `Recharts`.
- [ ] **Accuracy/Hallucination Reporting**
  - UI to highlight factual inaccuracies detected by GPT-5.2/Gemini 3.1 reasoning.

---

#### **Phase 4: Billing & Payments**

- [ ] **Stripe Integration**
  - Set up Stripe Webhooks in `apps/api/src/controllers/billingController.ts`.
- [ ] **Access Control Middleware**
  - Backend middleware to block analysis if a valid subscription is missing.

---

#### **Phase 5: Exports & Maintenance**

- [ ] **Export Service**
  - Implement PDF/CSV generation in `apps/api/src/services/reportService.ts`.
- [ ] **Automated Scheduler**
  - Set up cron job to trigger periodic re-analysis.
