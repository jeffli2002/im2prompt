# Repository Guidelines

## Project Structure & Module Organization
Application routes live in `src/app`, shared UI in `src/components`, server utilities in `src/server`, and stores in `src/store`. Configuration for auth, payments, and localization is split into `src/config`, `src/payment`, and `src/i18n`. Database schema lives in `drizzle`, docs in `docs`, and automated test helpers in `tests` (`unit`, `integration`, `e2e`, `fixtures`). Static assets belong in `public`, and command-line tools in `scripts`.

## Build, Test, and Development Commands
Install dependencies with `pnpm install`. Use `pnpm dev` for the Next.js dev server (port 3000). `pnpm build` generates a production build; `pnpm preview` validates it and `pnpm start` serves it. Run linting with `pnpm check` or auto-fix via `pnpm check:write`; `pnpm typecheck` verifies types. `pnpm test` runs all Jest suites, while `pnpm test:unit`, `pnpm test:integration`, and `pnpm test:e2e` target specific layers. Append `:coverage` to collect reports.

## Coding Style & Naming Conventions
Biome enforces two-space indentation, 100-character lines, single quotes, and ES5 trailing commas. Keep React components typed, lean on early returns, and co-locate UI logic with its slice. Name components with `PascalCase` (`src/components/UploadPanel.tsx`), hooks with `use` prefixes, and server modules by capability (`src/server/credits/service.ts`). Tailwind classes are auto-sorted by Biome; run `pnpm check` before committing. Expose configuration through `src/env.ts`.

## Testing Guidelines
Store Jest specs next to features or in the mirrored `tests/unit` and `tests/integration` directories using `*.test.ts` or `*.spec.ts`. Playwright suites belong in `tests/e2e`; reuse data through `tests/fixtures`. Add regression coverage for payment flows, credit accounting, and Google Vision adapters. Refresh visual baselines with `pnpm test:e2e --update-snapshots`, and run `pnpm test:coverage` on feature work to watch critical paths.

## Commit & Pull Request Guidelines
Follow conventional commits (`feat:`, `fix:`, `chore:`) with concise scopes (e.g., `feat: billing retries`). PRs should explain the change, link issues, and list validation steps (`pnpm test`, `pnpm check`). Provide UI screenshots for user-facing updates, call out config or env changes, and tag reviewers responsible for auth, billing, or vision workflows. Keep Drizzle migrations in dedicated commits to simplify rollbacks.

## Environment & Deployment Notes
Keep secrets in `.env.local` (see `env.example`) and consume them through `src/env.ts`. Manage schema changes with `pnpm db:generate`, `pnpm db:migrate`, or `pnpm db:migrate:deploy`. Use the `cf:*` scripts when preparing Cloudflare builds, and run `pnpm analyze` if bundle size might shift. Confirm Stripe, Google Vision, and R2 credentials before deploying, then execute `pnpm test:all` for an end-to-end check.
