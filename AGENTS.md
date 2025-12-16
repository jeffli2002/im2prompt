# Repository Guidelines

## Project Structure & Module Organization
Next.js routes live in `src/app`, shared UI components in `src/components`, stores in `src/store`, and backend helpers in `src/server`. Configuration is split across `src/config`, `src/payment`, and `src/i18n`, while environment helpers reside in `src/env.ts`. Database schema files live under `drizzle`, with docs in `docs` and CLI utilities in `scripts`. Static assets belong in `public`, and automated test helpers sit in `tests` (mirroring `unit`, `integration`, `e2e`, and `fixtures`). Keep new features close to their slice so routing logic, state, and presentation stay co-located.

## Build, Test, and Development Commands
Install dependencies via `pnpm install`, then start the dev server with `pnpm dev` (Next.js on port 3000). Create production bundles using `pnpm build`; validate locally through `pnpm preview` or run the server with `pnpm start`. Quality checks run through `pnpm check` (Biome lint + formatting) or `pnpm check:write` to auto-fix. Types are validated with `pnpm typecheck`. Execute all Jest suites via `pnpm test`; scope depth with `pnpm test:unit`, `pnpm test:integration`, or `pnpm test:e2e`, and append `:coverage` for reports.

## Coding Style & Naming Conventions
Biome enforces two-space indentation, 100-character lines, single quotes, and ES5 trailing commas; run `pnpm check` before pushing. Name React components with PascalCase (`UploadPanel`), hooks with `use` prefixes, and server utilities by capability (e.g., `src/server/credits/service.ts`). Keep UI logic lean with early returns and leverage Tailwind classes, which Biome auto-sorts. Expose configuration strictly through `src/env.ts`.

## Testing Guidelines
Jest specs sit beside code or within `tests/unit` and `tests/integration` as `*.test.ts` or `*.spec.ts`. Playwright suites and shared fixtures live in `tests/e2e` and `tests/fixtures`. Regression coverage is expected for payments, credit accounting, and Google Vision adapters; run `pnpm test:coverage` for feature work. Update Playwright baselines with `pnpm test:e2e --update-snapshots` whenever UI changes.

## Commit & Pull Request Guidelines
Use conventional commits such as `feat: billing retries` or `fix: i18n locale`. Each PR should summarize the change, link issues, and document validation steps (`pnpm test`, `pnpm check`). Include screenshots for UI updates, call out env or config adjustments, and flag reviewers responsible for auth, billing, or vision flows. Keep Drizzle migrations isolated per commit to simplify rollbacks.

## Security & Configuration Tips
Store secrets in `.env.local` based on `env.example`, and consume them via `src/env.ts`. Run `pnpm db:generate`, `pnpm db:migrate`, or `pnpm db:migrate:deploy` for schema changes. Confirm Stripe, Google Vision, and R2 credentials before deployment, and execute `pnpm test:all` for a final gate. Use `cf:*` scripts when targeting Cloudflare builds and `pnpm analyze` when bundle size might shift.
