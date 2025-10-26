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
1) Install dependencies (at the repo root):
```
npm ci
```

2) Start development:
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

## Workspace-specific docs
- Web app: `apps/web/README.md`

## Conventions
- Commit messages: prefer Conventional Commits (e.g., `feat:`, `fix:`, `chore:`)
- Branch naming: `feature/*`, `fix/*`, `chore/*`

## Notes
- Environment variables: place per-app `.env` files in `apps/web` and `apps/api` as needed.
- Turbo cache is stored in `.turbo/`. If you see unexpected behavior, try clearing it.
