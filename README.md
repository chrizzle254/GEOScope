# GEOScope Monorepo

This repository is a JavaScript/TypeScript monorepo managed with npm workspaces and Turbo.

## Structure

- `apps/web` — Next.js 15 (React 18) web app
- `apps/api` — Express API in TypeScript
- `packages/shared` — Shared utilities/types used by apps

## Requirements

- Node.js 20.x
- npm 10.x

## Setup

1. Install dependencies (at the repo root):

```
npm ci
```

2. Start development:

- Web & API: `npm run dev`
  - Web: `npm run dev:web`
  - API: `npm run dev:api`

## Common scripts

- Build all: `npm run build`
- Lint (delegated to workspaces): `npm run lint`
- Type check: `npm run type-check`
- Test (placeholder in apps): `npm run test`

## Formatting (Prettier)

Prettier is configured at the repository root and enforced in CI.

- Format: `npm run format`
- Check formatting: `npm run format:check`

Config files:

- `.prettierrc` — formatting rules
- `.prettierignore` — files/directories excluded from formatting

## Continuous Integration

GitHub Actions workflow: `.github/workflows/ci.yml`

- Installs dependencies
- Checks formatting with Prettier
- Builds all apps via Turbo

## Environment Management

Per-app example env files:

- `apps/web/.env.example` (client-safe defaults using `NEXT_PUBLIC_`)
- `apps/api/.env.example` (server secrets like `STRIPE_API_KEY`)

Ignore real env files (already in `.gitignore`):

- Root: `.env`, `.env.local`, `.env.*.local`
- Apps: `apps/*/.env*`

Frontend (Next.js):

- Use `.env.local` for local dev; `.env.development` / `.env.production` for environment-specific defaults.
- Only expose client-visible variables with `NEXT_PUBLIC_` prefix (e.g., `NEXT_PUBLIC_API_BASE_URL`).
- Server-only values must not use `NEXT_PUBLIC_` and should only be read in server contexts.

Backend (Express):

- Loads `.env.local` with `dotenv` in development.
- Validates critical variables using `envalid` in `apps/api/src/env.ts`.
- Import `env` wherever needed (e.g., `apps/api/src/index.ts`).

CI/CD and deployment:

- Store secrets in GitHub Actions or your hosting provider (Railway/Vercel/Render) environment settings.
- Inject only the necessary variables per environment (dev, preview, production).

Conventions / policies:

- Never commit real `.env.*` files. Commit only `.env.example`.
- Keep API secrets server-side; do not expose via `NEXT_PUBLIC_`.
- Document all required env variables in README and `.env.example`.

## Workspace-specific docs

- Web app: `apps/web/README.md`

## Notes

- Turbo cache is stored in `.turbo/`. If you see unexpected behavior, try clearing it.

# Functionality

## Auth

Utilizes **Supabase SSR** for Next.js to manage user identity. Authentication is synchronized across Client Components, Server Components, and Middleware using secure cookies.

**Auth Flow:**

#### 1. Client-Side Login

- **Entry Point:** `LoginForm` component (`login-form.tsx`).
- **Process:** When a user submits their email and password, the browser-side Supabase client (`client.ts`) calls `signInWithPassword()`.
- **Persistence:** Upon success, Supabase returns a session which the client library automatically stores in a browser cookie.
- **Redirect:** The user is then routed to the `/protected` dashboard.

#### 2. Session Middleware (The "Gatekeeper")

- **Location:** `middleware.ts`.
- **Logic:** On every request, the middleware uses `createClient(request)` to intercept the session cookie.
- **Auto-Refresh:** If a session token has expired, the middleware automatically refreshes it with Supabase and updates the cookie in the response header. This keeps the user session seamless without requiring a re-login.

#### 3. Server-Side Access

- **Location:** `server.ts`.
- **Usage:** When Server Components or Server Actions need to fetch user data or perform authorized database queries, they use the server-specific Supabase client.
- **Security:** This client reads the forwarded cookies directly from the request, ensuring the server environment is fully aware of the user's identity.

---

**Auth Routes:**

| Route                   | Purpose                                                    |
| :---------------------- | :--------------------------------------------------------- |
| `/login`                | Primary entry point for user authentication.               |
| `/protected`            | Secured dashboard/area accessible only to logged-in users. |
| `/auth/sign-up`         | Registration flow for new account creation.                |
| `/auth/forgot-password` | Recovery flow for forgotten credentials.                   |

## DB Setup

Using the **Supabase CLI** to manage a local PostgreSQL environment. This ensures all developers work against a consistent schema and have access to the same mock data.

### Config (`config.toml`)

Using **PostgreSQL v17** to maintain parity between local development and production Supabase instance.
Local environment is defined in `supabase/config.toml`. It ensures all developers run an identical database stack.

| Component       | Setting   | Description                                     |
| --------------- | --------- | ----------------------------------------------- |
| **PostgreSQL**  | `v17`     | Matches production version for parity.          |
| **DB Port**     | `54322`   | Direct connection port for local development.   |
| **Shadow Port** | `54320`   | Used by the CLI to safely generate migrations.  |
| **Migrations**  | `Enabled` | Imperative workflow (timestamped `.sql` files). |
| **Seeding**     | `Enabled` | Automatic data population on reset.             |

### Migration Workflow

Following an **imperative migration workflow**. Instead of manually editing a single schema file, we generate timestamped migration scripts that track changes over time.

---

### Schema Architecture

The database is divided into three functional schemas. **Row Level Security (RLS)** is enabled on all user-facing tables.

#### 1. `public` Schema

_Core application data. Access is governed by Organization membership._

- **`users`**: User profile information, linked to `auth.users`.
- **`organizations`**: Top-level entity for grouping users and resources.
- **`organization_members`**: Pivot table assigning roles (`owner`, `admin`, `viewer`).
- **`reporting_subject`**: The primary entity being analyzed (e.g., a brand).
- **`reporting_subject_competitors`**: Competitors linked to a subject.
- **`analysis_runs`**: Lifecycle tracking for analysis jobs (`pending` → `completed`).
- **`mentions`**: Specific data points, sentiment, and accuracy excerpts.
- **`reporting_subject_metrics`**: Aggregated visibility and sentiment scores.

#### 2. `billing` Schema

_Handles Stripe integration and subscription lifecycles._

- **`customers`**: Maps application users to `stripe_customer_id`.
- **`subscriptions`**: Manages organization-level subscription status.

#### 3. `internal` Schema

_System-only tables for LLM operations. Not accessible via Client SDKs._

- **`llm_providers`**: Registry of available models (e.g., `gpt-4o`) with version tracking.
- **`prompts`**: Template-based prompt library with placeholders (e.g., `{{brand_name}}`, `{{industry}}`). Each prompt has a `slug`, `category`, and `is_active` flag for system management.
- **`llm_responses`**: Raw logs of LLM outputs for auditing, including `tokens_used` and `latency_ms` for performance tracking.

- **System Status:** `Enabled`
- **Workflow:** 1. Make changes to your local database (via Dashboard or SQL). 2. Run `supabase db diff -f <migration_name>` to capture changes. 3. Commit the resulting `.sql` file in `supabase/migrations/`.
- **Deployment:** Pending migrations are applied using `supabase db push`.

### Data Seeding

Seeding script to populate the database with initial data.

- Seed File: `supabase/seed.sql`
- How to Reset: Running `supabase db reset` will...
  1. Drop the local database.
  2. Re-apply all migrations in order.
  3. Execute the `seed.sql` file to populate your local tables with dummy users and test data.

> [!TIP]
> Always run `supabase db reset` after pulling new migrations from the main branch to ensure your local data matches the current schema.

### Common Commands

- Reset Database: `supabase db reset` (Re-runs migrations and `seed.sql`).
- Create Migration: `supabase migration new <name>` (Creates a blank file).
- Auto-generate Migration: `supabase db diff -f <name>` (Diffs your local changes).
