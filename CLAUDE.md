# CLAUDE.md — SpeakAce AI Quick Reference

Read this file first on every task. Then open only the files listed for that task category below.
Full detail lives in `AGENTS.md` and `PROJECT_CONTEXT.md` — come here first, go there only if needed.

---

## What this app is

Single Next.js 15 App Router repo. AI-assisted IELTS/TOEFL speaking and writing practice platform.

Products inside:
- Public marketing + SEO site
- Learner dashboard (`/app`)
- Speaking practice
- Writing practice
- Teacher dashboard
- Institution/school admin
- Admin/CMS panel
- Billing (Lemon Squeezy), Emails (Resend), Analytics (PostHog + internal)

---

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 15 App Router |
| Language | TypeScript strict |
| Styling | Global CSS (`app/globals.css`) + utility classes |
| DB | PostgreSQL (Neon), raw SQL, no ORM |
| Auth | Custom cookie/session (`speakace_session`) |
| AI | OpenAI (transcription + feedback) |
| Email | Resend |
| Billing | Lemon Squeezy (ignore Stripe refs in docs — outdated) |
| Analytics | PostHog + internal `analytics_events` table |
| Tests | Vitest (`lib/security.test.ts`, `lib/store.test.ts`) |
| Deploy | Vercel + cron via `vercel.json` |
| Package mgr | npm (`package-lock.json` is present) |

---

## Directory map

```
app/              → pages, layouts, API routes
components/       → feature UI components
lib/              → domain logic, stores, evaluators, types
lib/server/       → DB, auth, OpenAI, email, billing, admin, org helpers
db/schema.sql     → canonical schema (raw SQL + additive ALTER TABLE patches)
scripts/          → schema push, i18n audit, campaign sender
public/           → static assets, email HTML
vercel.json       → cron schedule
middleware.ts     → HTTPS redirect, maintenance mode
next.config.ts    → security headers, PostHog rewrites, SEO redirects
```

Do not open: `.next/`, `node_modules/`, `.claude/worktrees/`, `design-previews/`

---

## Role model

`guest → member/student → teacher → school/admin`

- Role routing: `lib/roles.ts`
- Session auth: `lib/server/auth.ts`
- Teacher privilege: `lib/teacher.ts`
- Admin privilege: `lib/admin.ts`
- Session cookie: `speakace_session` | Admin cookie: `speakace_admin_session`

---

## Store pattern (critical)

Every major store supports two modes:
- **Postgres mode** when `DATABASE_URL` exists (production)
- **In-memory fallback** when it does not (local dev without DB)

Never break this dual-mode pattern.

| Store file | Owns |
|---|---|
| `lib/store.ts` | Speaking sessions, usage, billing sync, member plan |
| `lib/writing-store.ts` | Writing session lifecycle |
| `lib/student-profile-store.ts` | Learner profile CRUD |
| `lib/classroom-store.ts` | Teacher classes, enrollments, institution billing |
| `lib/homework-store.ts` | Homework assignments |
| `lib/announcements-store.ts` | Class announcements |
| `lib/server/org-store.ts` | Organization membership, school invites |

---

## Task → files cheatsheet

### Page looks wrong
1. `app/.../page.tsx`
2. Owning component in `components/`
3. Relevant CSS namespace in `app/globals.css` (see namespaces below)

### Button does nothing / action fails
1. Owning component
2. Fetch/submit handler inside it
3. `app/api/**/route.ts`
4. Store/helper called by that route

### Auth / role / access issue
1. Route page guard
2. `lib/roles.ts`
3. `lib/server/auth.ts`
4. `lib/admin.ts` or `lib/teacher.ts`

### Teacher / classroom issue
1. `components/teacher-hub.tsx`
2. `app/api/teacher/**` or `app/api/classes/**`
3. `lib/classroom-store.ts`
4. `lib/homework-store.ts` or `lib/announcements-store.ts`

### Institution admin issue
1. `app/app/institution-admin/page.tsx`
2. `components/institution-admin-panel.tsx`
3. `app/api/institution-admin/**`
4. `lib/server/org-store.ts`

### Speaking practice issue
1. `components/practice-console.tsx`
2. `app/api/speaking/session/start/route.ts`
3. `lib/store.ts`
4. `lib/evaluator.ts` / `lib/prompts.ts`

### Writing practice issue
1. `components/writing-console.tsx`
2. `app/api/writing/session/start/route.ts`
3. `lib/writing-store.ts`
4. `lib/writing-evaluator.ts` / `lib/writing-prompts.ts`

### Billing issue
1. `app/app/billing/page.tsx`
2. `app/api/account/plan/route.ts`
3. `app/api/payments/lemon/**`
4. `lib/server/lemon.ts`

### Email / cron issue
1. `app/api/cron/**`
2. `lib/server/email-sequences.ts`
3. `lib/server/email.ts`

### DB / schema issue
1. Relevant store file
2. `lib/server/db.ts`
3. `db/schema.sql` (only when field/table mismatch suspected)

### SEO / content issue
1. Route page
2. `lib/seo*.ts`
3. `lib/blog-content.ts` or `lib/marketing-content.ts`

### Analytics issue
1. Component emitting event
2. `lib/analytics-client.ts`
3. `app/api/analytics/track/route.ts`

---

## CSS namespace map

Search ONLY the relevant namespace in `app/globals.css`:

| Area | Namespace |
|---|---|
| Teacher | `.teacher-*` |
| Practice | `.practice-*`, `.task-*`, `.simulation-*` |
| Dashboard | `.dashboard-*`, `.db-*` |
| Admin | `.admin-*`, `.adm-*` |
| Marketing | `.sa-*` |
| Shared surfaces | `.card`, `.button-*` |
| Theme tokens | Top of `app/globals.css` |

---

## API route families

| Domain | Route prefix |
|---|---|
| Auth | `app/api/auth/**` |
| Learner | `app/api/profile`, `app/api/progress`, `app/api/speaking`, `app/api/writing` |
| Teacher | `app/api/teacher/**`, `app/api/classes/**`, `app/api/homework`, `app/api/announcements` |
| Institution | `app/api/institution-admin/**` |
| Billing | `app/api/account/plan`, `app/api/payments/lemon/**` |
| Admin | `app/api/admin/**` |
| Analytics | `app/api/analytics/**` |
| Cron | `app/api/cron/**` |

---

## Known fragile areas — check before editing

- `components/providers.tsx` calls `POST /api/account/plan` but that route currently only exposes `GET` → billing flow is fragile
- `components/practice-console.tsx` references speaking upload/evaluate endpoints not confirmed present in route tree
- `components/writing-console.tsx` references submit/evaluate endpoints not confirmed present
- Some docs/envs still mention Stripe — active code is Lemon Squeezy only
- `db/schema.sql` has additive `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` patches — review carefully
- `middleware.ts`, `next.config.ts`, `app/layout.tsx`, `app/globals.css` — global impact, edit with care

---

## Hotspot files (large, multi-responsibility)

Open only the relevant section, not the whole file:

- `components/teacher-hub.tsx`
- `components/practice-console.tsx`
- `components/writing-console.tsx`
- `components/dashboard.tsx`
- `components/admin-panel.tsx`
- `app/globals.css`
- `lib/store.ts`
- `lib/classroom-store.ts`

---

## Architecture rules

- Single Next.js App Router project — do not split
- Route handlers stay thin — logic belongs in `lib/` and `lib/server/`
- Use types from `lib/types.ts` — do not create duplicate shapes
- Auth and privilege checks must remain server-side
- Postgres + in-memory dual-mode must be preserved
- `"use client"` only when state/effects/browser APIs are needed
- Import alias: `@/*` → repo root
- Naming: PascalCase component files, camelCase lib exports

---

## Commands

```bash
npm run dev
npm run build
npm run lint
npm run test
npm run db:push          # applies db/schema.sql to DATABASE_URL
npm run audit:i18n
npm run send:campaign -- --campaign <name> --to <email>
```

---

## DB tables (quick list)

`users` · `auth_sessions` · `student_profiles` · `teacher_classes` · `teacher_class_enrollments` · `institution_billing` · `homework_assignments` · `homework_auto_assign_rules` · `class_shared_study_items` · `study_list_folders` · `study_list_items` · `study_list_tasks` · `study_task_reminders` · `analytics_events` · `auth_activity` · `billing_events` · `announcements` · `marketing_leads` · `referral_codes` · `custom_blog_posts` · `usage_daily` · `speaking_sessions` · `feedback_reports` · `writing_sessions` · `writing_reports` · `teacher_notes`
