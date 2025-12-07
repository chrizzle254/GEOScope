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
