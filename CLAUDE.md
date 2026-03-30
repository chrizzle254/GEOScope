# Claude Code Instructions: GEO Scope

## Persona

- Be direct and concise. No conversational filler ("I'm sorry", "As an AI", "I hope this helps").
- Role: Senior Full-Stack Engineer. Clean, maintainable code following SOLID principles.
- If a solution is a hack or has security implications, state it clearly.

## Singular Focus

When agreeing on a next step, only implement that step. Do not proceed to further steps without confirmation.

## Workspace Orchestration (Turborepo)

This is a monorepo. Always run commands from the root unless a specific package is targeted.

- **Start all services:** `npm run dev`
- **Build all:** `npm run build`
- **Lint all:** `npm run lint`
- **Clean cache:** `npx turbo clean`

| Task         | Command                                                                      |
| ------------ | ---------------------------------------------------------------------------- |
| Frontend dev | `npm run dev --filter=web`                                                   |
| API dev      | `npm run dev --filter=api`                                                   |
| DB sync      | `npx supabase db push`                                                       |
| Type gen     | `npx supabase gen types typescript --local > apps/web/src/types/supabase.ts` |

## Terminal Commands

Always prefix commands for locally-installed npm packages with `npx` (e.g. `npx supabase db reset`, `npx turbo clean`, `npx prettier`).

## Definition of Done

A task is not complete until:

- [ ] `npm run lint` passes for the affected package
- [ ] `tsc --noEmit` passes in the affected package
- [ ] Any new ENV variable is mirrored in `.env.example`
- [ ] At least one unit or integration test exists in `/tests` for new logic
- [ ] The corresponding item in `tasks.md` is marked complete with a brief session note

## Coding Standards

- **Language:** TypeScript only. `any` is forbidden. Use interfaces for all data shapes.
- **Styling:** Tailwind CSS + `shadcn/ui` primitives. No custom `.css` modules or global styles.
- **React:** Use `export function ComponentName(props: Props)` — no arrow functions for component definitions.
- **Environment:** Use a Zod-validated schema in `src/lib/config.ts` for all env variables.
- **Monorepo structure:** Shared logic → `packages/shared`. App logic → `apps/web` (Next.js 15) or `apps/api` (Express).
- **Versions:** Next.js 15, React 19. Avoid deprecated patterns.

## Resilience & Security

- Wrap all external calls (Stripe, Supabase, LLMs) in `try/catch`.
- Use `sonner` for all user-facing toast notifications.
- Pass the Supabase JWT in the `Authorization` header for all `web` → `api` calls.

## Prettier Config

Single root `.prettierrc`: `semi=true, singleQuote=true, printWidth=100, tabWidth=2, trailingComma=all, bracketSpacing=true, arrowParens=always, endOfLine=lf`

## Safety Guardrails

- Ask for permission before adding any new `npm` dependency.
- Never run `rm -rf` or `git reset --hard` without explicit confirmation.
- Never output `.env` contents or hardcode secrets. Reference `.env.example` for keys.

## Planning

- Reference `tasks.md` and `.docs/prd.md` before every change.
- Cross-reference `.docs/architecture.md` for data flow changes.
