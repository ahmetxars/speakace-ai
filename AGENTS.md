# AGENTS.md

Read this file first. Then read `PROJECT_CONTEXT.md`.

## Purpose

This repository is a single Next.js App Router application for SpeakAce AI, an IELTS/TOEFL speaking practice platform with:

- marketing and SEO pages
- learner dashboard flows
- speaking practice and writing practice
- teacher and institution tools
- admin panel tooling
- billing, emails, analytics, and cron jobs

Future agents should use this file as the operating guide and use `PROJECT_CONTEXT.md` as the architectural map.

## Required working behavior

1. Read `AGENTS.md` first.
2. Then read `PROJECT_CONTEXT.md`.
3. Do not scan the whole repository unless absolutely necessary.
4. For each task, inspect only the files relevant to that task.
5. Before changing code, briefly state which files you will inspect or modify.
6. Preserve the existing architecture, naming, and style.
7. Do not perform broad refactors unless explicitly requested.
8. Update `PROJECT_CONTEXT.md` if you discover important project facts that are missing or outdated.

## Fast repository map

- `app/`: Next.js App Router pages, layouts, metadata files, and API routes
- `components/`: UI components and feature consoles
- `lib/`: domain logic, shared content, stores, evaluators, types, server utilities
- `lib/server/`: DB, auth, OpenAI, email, billing, admin, env, rate-limit helpers
- `db/schema.sql`: main SQL schema source of truth
- `scripts/`: schema push, i18n audit, campaign sending
- `public/`: static assets, robots, email HTML assets
- `docs/`, `DEPLOYMENT.md`, `README.md`: human-oriented docs, partially outdated in places
- `.claude/`, `.next/`, `node_modules/`: do not treat as source of truth

## Zero-scan rule

Do not start with repo-wide search.

For almost every task:

1. classify the task
2. open the smallest relevant route/component/store/config set from the maps below
3. only search wider if those files do not explain the behavior

If you find yourself opening more than 5-8 files for a normal bugfix, stop and re-check these docs first.

## Primary ownership map

This is the highest-value shortcut in the repo.

- Global app shell, metadata, shared chrome:
  - `app/layout.tsx`
  - `app/globals.css`
  - `middleware.ts`
  - `next.config.ts`
- Learner dashboard shell:
  - `app/app/layout.tsx`
  - `app/app/page.tsx`
  - `components/dashboard.tsx`
- Speaking practice:
  - `components/practice-console.tsx`
  - `lib/store.ts`
  - `lib/evaluator.ts`
  - `lib/prompts.ts`
  - `app/api/speaking/session/start/route.ts`
- Writing practice:
  - `components/writing-console.tsx`
  - `lib/writing-store.ts`
  - `lib/writing-evaluator.ts`
  - `lib/writing-prompts.ts`
  - `app/api/writing/session/start/route.ts`
- Auth and sessions:
  - `components/providers.tsx`
  - `lib/server/auth.ts`
  - `app/api/auth/**`
- Teacher dashboard and classes:
  - `app/app/teacher/page.tsx`
  - `components/teacher-hub.tsx`
  - `lib/classroom-store.ts`
  - `app/api/teacher/**`
  - `app/api/classes/**`
- Institution admin:
  - `app/app/institution-admin/page.tsx`
  - `components/institution-admin-panel.tsx`
  - `lib/classroom-store.ts`
  - `app/api/institution-admin/**`
- Student profile and onboarding:
  - `components/student-profile.tsx`
  - `components/onboarding-wizard.tsx`
  - `lib/student-profile-store.ts`
  - `app/api/profile/route.ts`
- Billing and subscriptions:
  - `app/app/billing/page.tsx`
  - `app/api/account/plan/route.ts`
  - `app/api/payments/lemon/**`
  - `lib/server/lemon.ts`
  - `lib/store.ts`
- Admin panel and CMS:
  - `app/admin/page.tsx`
  - `components/admin-panel.tsx`
  - `components/admin-blog-editor.tsx`
  - `lib/server/admin-panel.ts`
  - `lib/server/custom-blog.ts`
  - `app/api/admin/**`
- Marketing pages and SEO:
  - `app/page.tsx`
  - route under `app/*`
  - `components/marketing-page.tsx`
  - `lib/marketing-content.ts`
  - `lib/blog-content.ts`
  - `lib/seo*.ts`
- Emails and campaigns:
  - `lib/server/email.ts`
  - `lib/server/email-sequences.ts`
  - `app/api/cron/onboarding-emails/route.ts`
  - `scripts/send-campaign.mjs`
  - `public/email-assets/**`
- Analytics and tracking:
  - `components/providers.tsx`
  - `lib/analytics-client.ts`
  - `lib/analytics-store.ts`
  - `lib/posthog-server.ts`
  - `app/api/analytics/**`

## What to inspect for common tasks

### Routing or page changes

- `app/layout.tsx`
- `app/page.tsx`
- `app/app/layout.tsx`
- target route under `app/...`
- matching feature component in `components/...`

### Speaking practice flow

- `components/practice-console.tsx`
- `app/api/speaking/session/start/route.ts`
- `lib/store.ts`
- `lib/evaluator.ts`
- `lib/server/openai.ts`
- `lib/prompts.ts`

### Writing practice flow

- `components/writing-console.tsx`
- `app/api/writing/session/start/route.ts`
- `lib/writing-store.ts`
- `lib/writing-evaluator.ts`
- `lib/writing-prompts.ts`
- `lib/server/openai.ts`

### Auth and session work

- `app/api/auth/**`
- `lib/server/auth.ts`
- `lib/server/admin-panel.ts`
- `lib/admin.ts`
- `lib/teacher.ts`
- `lib/roles.ts`

### Profile, dashboard, membership, billing

- `components/dashboard.tsx`
- `components/student-profile.tsx`
- `app/api/profile/route.ts`
- `app/api/account/plan/route.ts`
- `lib/membership.ts`
- `lib/store.ts`
- `lib/server/lemon.ts`

### Teacher / school / classroom work

- `app/app/teacher/page.tsx`
- `components/teacher-hub.tsx`
- `components/teacher-student-detail.tsx`
- `components/teacher-student-compare.tsx`
- `components/teacher-note-templates.tsx`
- `app/app/institution-admin/page.tsx`
- `components/institution-admin-panel.tsx`
- `components/institution-analytics.tsx`
- `components/institution-student-detail.tsx`
- `components/institution-teacher-detail.tsx`
- `app/api/teacher/**`
- `app/api/institution-admin/**`
- `app/api/classes/**`
- `lib/classroom-store.ts`
- `lib/homework-store.ts`
- `lib/announcements-store.ts`
- `lib/server/org-store.ts`

### Admin panel and blog CMS

- `app/admin/**`
- `components/admin-panel.tsx`
- `components/admin-blog-editor.tsx`
- `app/api/admin/**`
- `lib/server/admin-panel.ts`
- `lib/server/custom-blog.ts`
- `lib/server/editable-pages.ts`

### Analytics and cron jobs

- `components/session-replay.tsx`
- `lib/analytics-client.ts`
- `lib/analytics-store.ts`
- `lib/posthog-server.ts`
- `instrumentation-client.ts`
- `vercel.json`
- `app/api/cron/**`

### Database or persistence work

- `db/schema.sql`
- `lib/server/db.ts`
- relevant `lib/*store*.ts`
- `scripts/apply-schema.mjs`

## Task-to-file recipes

Use these instead of broad search.

### “A page looks wrong”

Open in this order:

1. target route in `app/.../page.tsx`
2. main feature component used by that page
3. `app/globals.css` only for the specific class names rendered by that component
4. `app/layout.tsx` or `app/app/layout.tsx` only if the bug is shared chrome

Do not start in `lib/` unless the page is data-driven.

### “Dark mode / text contrast / unreadable text”

Open in this order:

1. route page
2. owning component
3. exact CSS classes rendered by that component in `app/globals.css`
4. top-of-file theme variables in `app/globals.css`

For teacher dashboard specifically:

1. `app/app/teacher/page.tsx`
2. `components/teacher-hub.tsx`
3. `app/globals.css` rules for:
   - `.teacher-*`
   - `.card`
   - `.dashboard-*`
   - dark overrides under `body[data-theme="dark"]`

Do not inspect API routes for a pure color/readability issue.

### “Button does nothing / action fails”

Open in this order:

1. owning component
2. fetch call / submit handler inside that component
3. matching `app/api/**/route.ts`
4. store/helper called by that route

### “Saved data is wrong or missing”

Open in this order:

1. UI component making the request
2. matching route handler
3. relevant store file in `lib/`
4. `db/schema.sql` only if persistence shape is involved

### “Role/access issue”

Open in this order:

1. route page guard, if any
2. `lib/roles.ts`
3. `lib/server/auth.ts`
4. privilege helper in `lib/admin.ts` or `lib/teacher.ts`
5. route handler enforcing access

### “Teacher/classroom issue”

Open in this order:

1. `components/teacher-hub.tsx`
2. relevant `app/api/teacher/**` route
3. relevant `app/api/classes/**` route
4. `lib/classroom-store.ts`
5. `lib/homework-store.ts` or `lib/announcements-store.ts` if task-specific

### “Institution admin issue”

Open in this order:

1. `app/app/institution-admin/page.tsx`
2. `components/institution-admin-panel.tsx`
3. `app/api/institution-admin/**`
4. `lib/classroom-store.ts`
5. `lib/server/org-store.ts` if organization membership is involved

### “Admin panel / CMS issue”

Open in this order:

1. `app/admin/page.tsx`
2. `components/admin-panel.tsx`
3. relevant `app/api/admin/**`
4. `lib/server/admin-panel.ts`
5. `lib/server/custom-blog.ts` or `lib/server/editable-pages.ts`

### “SEO/content issue”

Open in this order:

1. route page
2. metadata export in that page or parent layout
3. `lib/seo*.ts`
4. `lib/blog-content.ts` or `lib/marketing-content.ts`
5. `app/sitemap.ts` or `app/robots.ts` only if crawl/indexing is involved

### “Email / onboarding / reminder issue”

Open in this order:

1. route under `app/api/cron/**` or triggering route
2. `lib/server/email-sequences.ts`
3. `lib/server/email.ts`
4. related store file

### “Billing issue”

Open in this order:

1. billing page or triggering UI
2. `app/api/account/plan/route.ts`
3. `app/api/payments/lemon/**`
4. `lib/server/lemon.ts`
5. `lib/store.ts`

### “Analytics/tracking issue”

Open in this order:

1. component emitting event
2. `lib/analytics-client.ts`
3. `app/api/analytics/track/route.ts`
4. `lib/analytics-store.ts`
5. `instrumentation-client.ts` and `lib/posthog-server.ts` if PostHog is involved

## Component hotspots

These are large, multi-responsibility files. Prefer reading only the relevant section, not the whole repo.

- `components/teacher-hub.tsx`
- `components/practice-console.tsx`
- `components/writing-console.tsx`
- `components/dashboard.tsx`
- `components/admin-panel.tsx`
- `app/globals.css`
- `lib/store.ts`
- `lib/classroom-store.ts`

If the bug clearly belongs to one of these, open that file first before searching elsewhere.

## Styling ownership map

This is a major source of unnecessary scanning.

- Theme variables and global tokens:
  - top of `app/globals.css`
- Shared generic surfaces:
  - `.card`
  - `.button-*`
  - form element dark overrides
- Marketing/header/footer:
  - `.sa-*`
- Admin:
  - `.admin-*`
  - `.adm-*`
- Teacher:
  - `.teacher-*`
- Practice:
  - `.practice-*`
  - `.task-*`
  - `.simulation-*`
- Dashboard:
  - `.dashboard-*`
  - `.db-*`
- Audience/landing variants:
  - `.audience-*`

If a component renders one of these namespaces, search only that namespace in `app/globals.css`.

## Route family map

Prefer exact family reads over `find` or full-tree scans.

- learner APIs: `app/api/profile`, `app/api/progress`, `app/api/speaking`, `app/api/writing`
- auth APIs: `app/api/auth`
- teacher APIs: `app/api/teacher`, `app/api/classes`, `app/api/homework`, `app/api/announcements`
- institution APIs: `app/api/institution-admin`
- admin APIs: `app/api/admin`
- billing APIs: `app/api/account`, `app/api/payments/lemon`
- analytics APIs: `app/api/analytics`
- cron APIs: `app/api/cron`

## Files and folders to avoid touching unless necessary

- `.next/`: generated build output
- `node_modules/`: dependencies
- `.claude/worktrees/`: agent worktrees, not app source
- `tsconfig.tsbuildinfo`: generated cache
- `design-previews/`: reference assets, not runtime code
- `public/email-assets/**`: marketing email HTML; edit only for email work
- `db/schema.sql`: high-impact file; changes affect production data shape
- `middleware.ts`, `next.config.ts`, `vercel.json`: global behavior and deployment impact

## Search strategy rules

- Prefer opening known files from these docs over using text search.
- If search is necessary, search one namespace only:
  - one component name
  - one API family
  - one CSS namespace like `.teacher-` or `.practice-`
- Do not search the whole repo for generic terms like `card`, `dark`, `text`, `data`, `save`.
- Do not inspect `.claude`, `.next`, or generated files for product bugs.

## Architectural rules to preserve

- Keep the app as a single Next.js App Router project.
- Prefer existing `lib/*store*.ts` modules for business logic instead of moving logic into route handlers.
- Keep route handlers thin; let `lib/` and `lib/server/` own data access and rules.
- Reuse `@/lib/types` types rather than creating duplicate type shapes.
- Follow the current in-memory fallback plus Postgres mode unless explicitly changing that strategy.
- Keep auth and privilege checks server-side.
- Preserve role boundaries: guest, student, teacher, school/admin.

## Project-specific implementation conventions

- TypeScript is strict.
- Import alias `@/*` points to repo root.
- The codebase uses App Router server components by default and `"use client"` only where needed.
- Components use PascalCase filenames.
- Shared logic uses camelCase function names in `lib/`.
- Strings often use double quotes and semicolons are consistently present.
- Styling is a hybrid:
  - global custom CSS in `app/globals.css`
  - utility classes are used in components, but this is not a pure utility-only codebase
- Environment access is mostly direct via `process.env`, with some normalization in `lib/server/env.ts`.

## Commands

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run test`
- `npm run db:push`
- `npm run audit:i18n`
- `npm run send:campaign -- --campaign <name> --to <email>`

Notes:

- `package-lock.json` is present, so `npm` is the safest default.
- Some docs still mention `pnpm`; treat that as secondary documentation drift unless the repo changes.

## Known risks and fragile areas

- The app mixes persistent Postgres mode with in-memory fallback stores. Behavior can differ when `DATABASE_URL` is absent.
- Billing docs and envs mention both Stripe and Lemon Squeezy, but active route code is Lemon-based.
- Some docs describe API routes that do not match the current route tree.
- UI code references some API endpoints that are not present in `app/api`, especially parts of the speaking and writing submit/evaluate flows. Verify route existence before editing related UI.
- `app/api/account/plan/route.ts` currently exposes `GET`, while `components/providers.tsx` attempts a `POST`. Treat billing/profile flows as fragile.
- `db/schema.sql` contains additive `alter table` statements and compatibility patches; review carefully before editing.
- Global files like `middleware.ts`, `next.config.ts`, `app/layout.tsx`, and `app/globals.css` affect large parts of the app.

## Practical “do not over-scan” examples

- Teacher dashboard dark mode bug:
  - open `app/app/teacher/page.tsx`
  - open `components/teacher-hub.tsx`
  - search only `.teacher-` and matching generic classes in `app/globals.css`
  - stop there unless data is also wrong
- Signup not persisting plan:
  - open signup UI
  - open `app/api/auth/signup/route.ts`
  - open `lib/server/auth.ts`
  - open `lib/store.ts`
  - only then inspect billing helpers
- Blog post not rendering:
  - open the blog route page
  - open `lib/blog-content.ts` or `lib/server/custom-blog.ts`
  - only inspect SEO helpers if the issue is metadata/indexing

## Testing guidance

- Existing tests are minimal and focused on store/security behavior:
  - `lib/security.test.ts`
  - `lib/store.test.ts`
- If you change auth, role access, classroom isolation, or shared store behavior, add or update tests there first.
- There is no obvious E2E test suite in the main repo.

## When you discover new information

Update `PROJECT_CONTEXT.md` when you confirm:

- new route families
- new deployment dependencies
- hidden architectural constraints
- important mismatches between UI, API, and docs
- fragile production behavior that future agents should know before editing
