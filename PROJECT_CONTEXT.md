# PROJECT_CONTEXT.md

## Overview

SpeakAce AI is a single-repo Next.js 15 application for AI-assisted English speaking and writing practice, primarily around IELTS and TOEFL preparation.

The product combines:

- a marketing and SEO-heavy public website
- a signed-in learner dashboard under `/app`
- speaking and writing practice workflows
- teacher and institution/classroom features
- an admin panel
- Postgres-backed persistence with in-memory fallbacks
- Lemon Squeezy billing hooks
- Resend email flows
- PostHog plus internal event tracking
- Vercel deployment and scheduled cron routes

## Tech stack

- Framework: Next.js 15 App Router
- UI: React 19
- Language: TypeScript with `strict: true`
- Styling: global CSS in `app/globals.css`, Tailwind v4 dependencies, utility classes, and hand-authored design tokens/CSS variables
- Motion/UI helpers: `framer-motion`, Radix Slot, `class-variance-authority`, `clsx`, `tailwind-merge`
- Database access: raw SQL through `postgres`
- Database: PostgreSQL, Neon intended for production
- Auth: custom cookie/session auth, not NextAuth
- AI: OpenAI transcription and feedback generation
- Email: Resend
- Analytics: PostHog plus internal `analytics_events`
- Tests: Vitest
- Deployment target: Vercel

## Top-level structure

### Application code

- `app/`
  - public pages, app dashboard pages, admin pages, API routes, metadata routes
- `components/`
  - feature UI for dashboards, practice consoles, admin, teacher tools, and marketing pages
- `lib/`
  - shared domain logic, prompts, evaluators, content, stores, type definitions
- `lib/server/`
  - server-only helpers for DB, auth, env, email, OpenAI, billing, admin, orgs, permissions

### Data and operations

- `db/schema.sql`
  - production schema draft and compatibility patches
- `scripts/`
  - DB push, i18n audit, campaign sender
- `public/`
  - brand assets, robots, ad config, email HTML assets
- `vercel.json`
  - cron configuration
- `next.config.ts`
  - security headers, rewrites, redirects
- `middleware.ts`
  - HTTPS redirect, maintenance mode, request metadata headers

### Reference / non-source directories

- `.next/`
  - build output
- `.claude/`
  - local agent/worktree state, not app source of truth
- `design-previews/`
  - design/reference material
- `email-campaigns-claude/`
  - auxiliary campaign-related material outside the core app

## Read order for future work

For almost every task, the shortest useful read order is:

1. `AGENTS.md`
2. this file
3. exact route page
4. exact owning component
5. exact route handler or store file
6. only then broader context if still needed

Do not begin with repo-wide search unless the task itself is architectural.

## Functional ownership matrix

This is the project-wide “where things live” map.

### Shell, layout, and cross-cutting UI

- `app/layout.tsx`
  - root metadata, scripts, canonical links, providers, marketing chrome
- `app/app/layout.tsx`
  - signed-in app shell
- `components/providers.tsx`
  - language/theme/session bootstrapping and client app state
- `app/globals.css`
  - global design system, dark mode, shared namespaces
- `middleware.ts`
  - HTTPS enforcement, `www` to apex host canonicalization, and maintenance mode

### Public marketing product

- Pages:
  - `app/page.tsx`
  - public route pages under `app/*`
- Main UI:
  - `components/marketing-page.tsx`
  - `components/audience-page.tsx`
  - `components/site-header.tsx`
  - `components/site-footer.tsx`
  - `components/marketing-sticky-cta.tsx`
  - `components/resource-library.tsx` owns the filterable, progressively revealed Resources archive.
  - `components/blog-library.tsx` owns Blog archive filtering, search, and progressive loading.
  - `components/blog-reading-enhancements.tsx` owns article reading progress and the delayed, dismissible practice reminder.
- Content:
  - `lib/marketing-content.ts`
  - `lib/blog-content.ts`
  - `lib/copy.ts`
- SEO:
  - `lib/seo.ts`
  - `lib/blog-seo.ts`
  - `lib/seo-growth.ts`
  - `lib/seo-topics.ts`
- Content-route styling:
  - Resources uses `.resource-hub-*` and `.resource-library-*`.
  - Blog index/detail use `.blog-index-*`, `.blog-library-*`, and `.blog-article-*`.
  - About uses `.about-story-*` and avoids unverified usage or geography claims.
  - Resources, Blog chrome, and About have full public UI copy for EN/TR/DE/ES/FR.

### Learner dashboard product

- Entry:
  - `app/app/page.tsx`
- Main UI:
  - `components/dashboard.tsx`
  - `components/student-profile.tsx`
  - `components/onboarding-wizard.tsx`
  - `components/notifications-center.tsx`
  - `components/study-plan-board.tsx`
  - `components/study-lists-board.tsx`
- Authenticated learner profile, onboarding, review, plan, teacher-student, and institution person-detail pages share the `.inside-*` workspace namespace in `app/globals.css`. Preserve this hierarchy instead of reintroducing nested `.card` grids.
- Learner onboarding is a three-step target, baseline, and rhythm flow. Its completion screen keeps the first free practice as the primary action and presents Plus as an optional accelerator after the plan.
- Data:
  - `lib/store.ts`
  - `lib/practice-streak.ts` counts streaks from distinct UTC days with completed audio uploads; multiple sessions on one day never inflate the streak
  - `lib/student-profile-store.ts`
  - `lib/study-lists-store.ts`
  - `lib/notifications.ts`

### Speaking product

- UI:
  - `components/practice-console.tsx`
  - `components/practice-upgrade-dialog.tsx` owns the localized, high-intent Plus trial offer shown after free practice limits.
  - `components/result-view.tsx`
  - `components/review-mistakes.tsx`
  - `components/mock-exam-launchpad.tsx`
  - `components/mock-exam-report.tsx`
- Data and scoring:
  - `lib/store.ts`
  - `lib/evaluator.ts`
  - `lib/prompts.ts`
  - `lib/shared-result-cards.ts`
- AI integration:
  - `lib/server/openai.ts`

### Writing product

- UI:
  - `components/writing-console.tsx`
  - `components/writing-result-view.tsx`
- Data and scoring:
  - `lib/writing-store.ts`
  - `lib/writing-evaluator.ts`
  - `lib/writing-prompts.ts`
- AI integration:
  - `lib/server/openai.ts`

### Teacher product

- Route entry:
  - `app/app/teacher/page.tsx`
- Main UI:
  - `components/teacher-hub.tsx`
  - `components/teacher-student-detail.tsx`
  - `components/teacher-student-compare.tsx`
  - `components/teacher-note-templates.tsx`
  - `components/teacher-billing.tsx`
- Data and business rules:
  - `lib/classroom-store.ts`
  - `lib/homework-store.ts`
  - `lib/announcements-store.ts`
  - `lib/teacher.ts`

### Institution admin product

- Route entry:
  - `app/app/institution-admin/page.tsx`
- Main UI:
  - `components/institution-admin-panel.tsx`
  - `components/institution-analytics.tsx`
  - `components/institution-student-detail.tsx`
  - `components/institution-teacher-detail.tsx`
- Data:
  - `lib/classroom-store.ts`
  - `lib/server/org-store.ts`

### Admin/CMS product

- Route entry:
  - `app/admin/page.tsx`
- Main UI:
  - `components/admin-panel.tsx`
  - `components/admin-blog-editor.tsx`
- Data:
  - `lib/server/admin-panel.ts`
  - `lib/server/custom-blog.ts`
  - `lib/server/editable-pages.ts`

### Billing product

- UI:
  - `app/app/billing/page.tsx`
  - `app/app/billing/success/page.tsx`
- API:
  - `app/api/account/plan/route.ts`
  - `app/api/payments/lemon/**`
- Logic:
  - `lib/server/lemon.ts`
  - `lib/store.ts`
  - `lib/commerce.ts`
  - `app/api/account/plan/route.ts` is also the signed-in billing-state sync endpoint used by client refresh flows.
  - learner checkouts carry a generated `checkout_id` through the Lemon custom payload and attribution cookie so GA4 purchases can use a stable transaction ID.

### Analytics product

- Client:
  - `components/providers.tsx`
  - `components/pricing-cards.tsx`
  - `components/practice-console.tsx`
  - `lib/analytics-client.ts`
- API and persistence:
  - `app/api/analytics/**`
  - `lib/analytics-store.ts`
- External tracking:
  - `instrumentation-client.ts`
  - `lib/posthog-server.ts`
  - first-payment funnel events include `pricing_view`, `pricing_plus_click`, `practice_limit_hit`, `upgrade_prompt_view`, `checkout_initiated`, `checkout_completed`, `billing_success_seen`, and `billing_sync_pending`
  - `checkout_completed` is emitted server-side only for Lemon `order_created`; `subscription_created` arrives for the same initial sale and must not be counted as a second conversion.
  - `billing_sync_pending` is emitted from the signed-in billing success page only after repeated secure plan-sync checks still return free access; admin reporting counts distinct affected accounts over 7 and 30 days.
  - successful or recovered subscription payments emit `subscription_revenue_received` with Lemon invoice value and currency.

### Email and lifecycle product

- Transport/templates:
  - `lib/server/email.ts`
  - public contact and reply-to fallback use `siteConfig.contactEmail` (`aa.arslan@outlook.com.tr`); keep `EMAIL_FROM` on a provider-verified sending domain rather than replacing it with the Outlook inbox
- Sequences:
  - `lib/server/email-sequences.ts`
  - password signups receive onboarding only after successful email verification; unverified accounts are excluded from lifecycle marketing
  - onboarding email #2 is sent after one day; activated learners receive a checkout-free, attributed `email_day_one_return` practice link while non-activated learners keep the first-score prompt
  - learners with no speaking sessions receive first-score activation content instead of checkout pressure on day 7/10
  - the legacy `daily_tip` template is limited to verified learners active in the last 30 days, at most once per 7 days, and never within 24 hours of an onboarding email
  - the lifecycle cron suppresses all provider sends when a current Resend daily/monthly quota failure is present; `IGNORE_EMAIL_QUOTA_BLOCK=true` is the explicit operational override after a quota upgrade
  - Admin reports 24-hour email delivery/failure health, active quota blocking, and attributed day-one practice returns over 30 days
  - email quick-start links retain their attributed `/app/practice` destination through both password and Google sign-in using `lib/auth-redirect.ts`
- Cron:
  - `app/api/cron/onboarding-emails/route.ts`
  - `app/api/cron/study-task-reminders/route.ts`
- Campaign tooling:
  - `scripts/send-campaign.mjs`
  - `public/email-assets/**`

## Main route groups

### Public marketing and SEO pages

Examples:

- `/`
- `/pricing`
- `/about`
- `/contact`
- `/resources`
- `/reviews`
- `/success-stories`
- `/for-students`
- `/for-teachers`
- `/for-schools`
- many SEO landing pages under `app/*`
- blog, guides, compare, tools, topics, and share pages

Relevant files:

- `app/page.tsx`
- `components/marketing-page.tsx`
- `components/audience-page.tsx`
- `components/site-header.tsx`
- `components/site-footer.tsx`
- `lib/marketing-content.ts`
- `lib/blog-content.ts`
- `lib/seo*.ts`

### Learner app routes

Under `app/app/`:

- dashboard
- practice
- improve
- review
- placement
- mock exam/results
- study lists
- notifications
- onboarding
- profile
- settings
- billing
- analytics
- writing
- teacher
- institution-admin

Relevant files:

- `app/app/layout.tsx`
- `app/app/page.tsx`
- feature components such as `components/dashboard.tsx`, `components/practice-console.tsx`, `components/writing-console.tsx`

Sub-groups worth treating as separate mini-products:

- `/app/practice`
  - speaking practice workflow
- `/app/writing`
  - writing workflow
- `/app/teacher`
  - teacher dashboard
- `/app/institution-admin`
  - school/institution operations
- `/app/profile`, `/app/onboarding`, `/app/settings`
  - learner account/profile setup
- `/app/study-lists`, `/app/plan`, `/app/notifications`
  - retention and organization workflows

### Admin routes

- `app/admin/login/page.tsx`
- `app/admin/page.tsx`
- `app/admin/layout.tsx`
- `app/api/admin/**`

### Metadata/platform routes

- `app/manifest.ts`
- `app/robots.ts`
- `app/sitemap.ts`
- `app/sitemap.xml/route.ts`
- `app/share/[slug]/opengraph-image.tsx`

## API surface by domain

### Auth and session

- `app/api/auth/signup/route.ts`
- `app/api/auth/signin/route.ts`
- `app/api/auth/signout/route.ts`
- `app/api/auth/session/route.ts`
- `app/api/auth/verify-email/route.ts`
- `app/api/auth/request-password-reset/route.ts`
- `app/api/auth/reset-password/route.ts`
- `app/api/auth/google/**`
- `app/api/auth/accept-invite/route.ts`

Core logic:

- `lib/server/auth.ts`
- `lib/admin.ts`
- `lib/teacher.ts`
- `lib/roles.ts`

Activation behavior:

- A successful one-time email verification creates the normal server-side session cookie and the auth page sends a newly verified learner to `/app/practice?quickStart=1&runMode=interview`; do not reintroduce a second password step after verification.
- Student onboarding is optional personalization, not an access gate. Incomplete profiles remain on the dashboard with first-score practice as the primary action and onboarding as the secondary action.
- Google OAuth initiation requires an independently signed state key, rejects external `next` destinations, and is covered by `app/api/auth/google/route.test.ts`; the live account chooser and callback were verified end to end in July 2026.

### Learner profile, progress, speaking, writing

- `app/api/profile/route.ts`
- `app/api/progress/summary/route.ts`
- `app/api/speaking/session/start/route.ts`
- `app/api/speaking/session/[id]/route.ts`
- `app/api/writing/session/start/route.ts`
- `app/api/writing/session/[id]/route.ts`
- `app/api/writing/summary/route.ts`

Core logic:

- `lib/store.ts`
- `lib/student-profile-store.ts`
- `lib/evaluator.ts`
- `lib/writing-store.ts`
- `lib/writing-evaluator.ts`
- `lib/server/openai.ts`

### Teacher, classroom, institution

- `app/api/classes/**`
- `app/api/homework/route.ts`
- `app/api/announcements/route.ts`
- `app/api/teacher/**`
- `app/api/institution-admin/**`

Core logic:

- `lib/classroom-store.ts`
- `lib/homework-store.ts`
- `lib/announcements-store.ts`
- `lib/server/org-store.ts`

### Billing and referrals

- `app/api/account/plan/route.ts`
- `app/api/payments/lemon/**`
- `app/api/referrals/me/route.ts`
- `app/api/admin/referrals/route.ts`

Core logic:

- `lib/server/lemon.ts`
- `lib/commerce.ts`
- `lib/referrals.ts`
- `lib/store.ts`

### Analytics, notifications, marketing

- `app/api/analytics/**`
- `app/api/notifications/route.ts`
- `app/api/marketing/lead/route.ts`
- `app/api/results/share/route.ts`
- `app/api/tools/study-plan/route.ts`

Core logic:

- `lib/analytics-store.ts`
- `lib/analytics-client.ts`
- `lib/posthog-server.ts`
- `lib/marketing-leads.ts`
- `lib/share-growth.ts`

### Cron

- `app/api/cron/study-task-reminders/route.ts`
- `app/api/cron/onboarding-emails/route.ts`

Scheduled by:

- `vercel.json`

## Important modules and what they do

### Root application shell

- `app/layout.tsx`
  - global metadata, canonical handling, analytics scripts, theme bootstrap, global providers, marketing chrome
- `app/globals.css`
  - design tokens, theme variables, shared component classes, large amount of visual system styling
- `middleware.ts`
  - HTTPS redirect, maintenance mode rewrite, request path headers
- `next.config.ts`
  - security headers, PostHog rewrites, SEO redirects

Styling note:

- `app/globals.css` is not a small reset file.
- It contains multiple feature namespaces and many dark-mode overrides.
- For UI bugs, always search only the relevant namespace first:
  - teacher: `.teacher-*`
  - practice: `.practice-*`, `.task-*`, `.simulation-*`
  - dashboard: `.dashboard-*`, `.db-*`
  - admin: `.admin-*`, `.adm-*`
  - marketing: `.sa-*`
  - audience programmes: `.programme-*`
  - teacher demo: `.teacher-demo-*`
  - writing hub and task studio: `.writing-*`, `.writing-studio-*`
  - account access: `.auth-entry-*`

### Providers and client state

- `components/providers.tsx`
  - client app context for language, theme, session refresh, local guest state, tracking
- `lib/language.ts`
  - server language/direction helpers
- `lib/copy.ts`
  - supported languages and localization helpers
- `lib/language-context.tsx`
  - separate older language context implementation; appears less central than `components/providers.tsx`

Important implication:

- if a bug is about session state, theme mode, language mode, or client bootstrapping, start with `components/providers.tsx`
- do not start with DB or API routes unless the UI state is clearly correct but server data is wrong
- the public language selector is intentionally limited to the five core locales with complete conversion-page coverage: English, Turkish, German, Spanish, and French
- `app/layout.tsx` passes the server-resolved language into `components/providers.tsx`; keep this server/client initialization aligned to avoid a language flash or stale unsupported locale
- `/auth` uses the compact, five-language branch in `components/site-header.tsx`; `components/site-footer.tsx` and `components/floating-theme-toggle.tsx` intentionally stay hidden there so account access remains a viewport-contained task instead of a marketing page
- `components/site-footer.tsx` carries shared public navigation and newsletter copy for all five public locales; do not fall back to English for German, Spanish, or French footer chrome
- `components/audience-page.tsx` owns the localized student, teacher, and school programme experiences; the three `app/for-*` routes should stay thin metadata wrappers
- the audience programme pages share an active, localized student/teacher/school path switcher; preserve `aria-current` and the audience-specific accent when changing that navigation
- `components/teacher-demo-page.tsx` owns the localized interactive teacher demo rendered by `app/teacher-demo/page.tsx`
- the teacher demo hero surfaces a real class-pulse summary and deliberately reveals the larger dashboard preview within the first desktop viewport; its overview, students, assignments, and announcements tabs are interactive client-side views, not decorative navigation
- `components/writing-console.tsx` owns the five-language Task 1/Task 2 studio; keep the mobile prompt carousel, desktop sticky prompt library, and editor in the `.writing-studio-*` namespace
- `/auth` uses the viewport-contained `.auth-entry-*` shell in `app/auth/page.tsx`; sign-in and compact sign-up should fit without forced scrolling on common laptop and mobile viewports
- `components/app-header.tsx` owns both language and theme controls for `/app`; do not reintroduce a floating mobile theme button over learner content

### Persistence and store layer

- `lib/server/db.ts`
  - singleton Postgres connection helper and `DATABASE_URL` detection
- `lib/store.ts`
  - speaking sessions, member state, usage tracking, billing sync, progress summaries
- `lib/writing-store.ts`
  - writing session lifecycle and summaries
- `lib/student-profile-store.ts`
  - student profile CRUD with schema compatibility guards
- `lib/classroom-store.ts`
  - teacher classes, enrollments, institution billing, permissions

Important architectural pattern:

- most store modules support two modes:
  - Postgres-backed when `DATABASE_URL` exists
  - in-memory fallback when it does not

This pattern is core to the repo and should not be broken casually.

Store ownership hints:

- `lib/store.ts`
  - speaking session lifecycle, usage tracking, member plan sync, progress summaries
- `lib/writing-store.ts`
  - writing session lifecycle
- `lib/student-profile-store.ts`
  - learner profile and onboarding persistence
- `lib/classroom-store.ts`
  - teacher classes, student membership, organization and institution-adjacent data

If a route handler calls one of these, that file is almost always the next place to inspect.

### Auth and authorization

- `lib/server/auth.ts`
  - password auth, session cookies, verify/reset flows, privilege handling, fallback auth store
- `lib/server/admin-panel.ts`
  - admin session cookie, configured admin credentials, admin auth activity, referrals, admin queries
- `lib/admin.ts`
  - admin privilege helpers
- `lib/teacher.ts`
  - teacher privilege helpers
- `lib/roles.ts`
  - dashboard routing role resolution

Cookie names:

- user session: `speakace_session`
- admin session: `speakace_admin_session`

Role model:

- guest
- member/student
- teacher
- school/admin

Role routing starts in `lib/roles.ts`, while capability enforcement is split across `lib/server/auth.ts`, `lib/admin.ts`, `lib/teacher.ts`, route guards, and store-level checks.

### AI evaluation

- `lib/evaluator.ts`
  - local speaking evaluation heuristics and improved-answer generation
- `lib/writing-evaluator.ts`
  - local writing scoring heuristics and structured guidance
- `lib/server/openai.ts`
  - OpenAI transcription and structured feedback generation for speaking and writing
- `lib/prompts.ts`
  - speaking prompt selection
- `lib/writing-prompts.ts`
  - writing prompt selection

### Content and SEO

- `lib/marketing-content.ts`
  - major marketing copy blocks and blog seed content
- `lib/blog-content.ts`
  - blog/article content helpers
- `lib/server/custom-blog.ts`
  - DB-backed custom blog CMS
- `lib/seo.ts`, `lib/blog-seo.ts`, `lib/seo-growth.ts`, `lib/seo-topics.ts`
  - metadata/SEO helpers

### Billing and payments

- `lib/server/lemon.ts`
  - Lemon webhook verification and billing-plan mapping
- `app/api/payments/lemon/webhook/route.ts`
  - webhook ingestion, billing event recording, plan updates, PostHog events
  - successful and recovered subscription payment events map to active billing state; initial checkout conversion is counted from `order_created` only
  - subscription invoice payloads do not carry product names, so plan resolution must preserve the current paid plan or recover it from trusted custom metadata and undiscounted USD subtotal values; never default an unknown paid invoice to Free

Important caution:

- some docs/envs still mention Stripe
- current code path is Lemon-first
- when debugging billing, trust route code and `lib/server/lemon.ts` over older docs

### Email

- `lib/server/email.ts`
  - Resend transport and transactional email templates
- `lib/server/email-sequences.ts`
  - onboarding and daily tip workflows
- `scripts/send-campaign.mjs`
  - one-off email campaign sender from `public/email-assets/<campaign>/preview.html`

## Database model summary

Main tables in `db/schema.sql`:

- `users`
- `auth_sessions`
- `admin_panel_sessions`
- `auth_tokens`
- `student_profiles`
- `teacher_classes`
- `teacher_class_enrollments`
- `institution_billing`
- `homework_assignments`
- `homework_auto_assign_rules`
- `class_shared_study_items`
- `study_list_folders`
- `study_list_items`
- `study_list_tasks`
- `study_task_reminders`
- `analytics_events`
- `auth_activity`
- `billing_events`
- `announcements`
- `marketing_leads`
- `referral_codes`
- `custom_blog_posts`
- `usage_daily`
- `speaking_sessions`
- `feedback_reports`
- `writing_sessions`
- `writing_reports`
- `teacher_notes`

Observations:

- There is no ORM. SQL schema and handwritten queries are the canonical data layer.
- The schema includes many `alter table ... add column if not exists` lines for compatibility.
- Several stores also create/ensure tables at runtime.

Practical rule:

- do not open `db/schema.sql` first for normal UI bugs
- open it only when:
  - a field seems missing
  - a table mismatch is suspected
  - persistence or migration behavior is the issue

## How the app works

### Public/marketing flow

1. Request enters `middleware.ts`.
2. Middleware may redirect to HTTPS or rewrite to `/maintenance`.
3. `app/layout.tsx` sets metadata, canonical URL, global scripts, providers, and shared chrome.
4. Public pages render mostly through feature components and content modules in `lib/`.
5. Marketing interactions may call tracking or lead-capture endpoints.

### Learner session flow

1. Client bootstraps through `components/providers.tsx`.
2. Provider fetches `/api/auth/session`.
3. Signed-in state comes from `speakace_session`; guest state can still exist in local storage.
4. Dashboard role is derived via `lib/roles.ts`.
5. App routes under `/app` render the proper feature consoles.

Fast debugging split:

- wrong UI state before request: `components/providers.tsx` or component-local state
- request fails: route handler
- request succeeds but saved data is wrong: store file
- data is correct but page still wrong: component render or CSS

### Speaking practice data flow

1. UI starts a session via `POST /api/speaking/session/start`.
2. Route delegates to `lib/store.ts`.
3. Store checks plan limits from `lib/membership.ts`, usage data, and prompt selection.
4. Transcript and feedback logic are handled through:
   - local heuristics in `lib/evaluator.ts`
   - optional OpenAI calls in `lib/server/openai.ts`
5. Sessions, usage, and reports persist to Postgres when available, otherwise memory.

### Writing practice data flow

1. UI starts a session via `POST /api/writing/session/start`.
2. `lib/writing-store.ts` creates the draft session and enforces limits.
3. Draft submission/evaluation logic uses:
   - `lib/writing-evaluator.ts`
   - optional OpenAI writing feedback in `lib/server/openai.ts`
4. Reports persist in `writing_sessions` and `writing_reports` when DB mode is active.

### Teacher and institution flow

1. Role resolution sends teachers and school admins to dedicated app areas.
2. Route handlers call classroom/homework/announcement store modules.
3. Access checks rely on explicit ownership and enrollment validation.
4. Institution billing and user summaries are layered on top of classroom and user data.

### Billing flow

1. Checkout and webhook routes live under `app/api/payments/lemon/**`.
2. Webhook route verifies HMAC signature via `lib/server/lemon.ts`.
3. User or institution billing state is updated in the store layer before audit logging so an audit-table outage cannot withhold paid access.
4. Billing events are recorded.
5. PostHog captures billing lifecycle events.
6. The learner billing success page retries the signed-in server sync, warns against a duplicate purchase when access remains pending, and directs the buyer to support; it must never grant entitlement from client-side checkout attribution.

### Cron flow

1. Vercel invokes cron endpoints from `vercel.json`.
2. Routes authorize using `CRON_SECRET` or Vercel cron header fallback outside production.
3. Reminder and onboarding/email sequence jobs execute from store/server-email logic.

## Entry points and important files

- `package.json`
  - project scripts and dependency list
- `app/layout.tsx`
  - global rendering shell
- `app/page.tsx`
  - main marketing homepage
- `app/app/page.tsx`
  - dashboard role router
- `middleware.ts`
  - request middleware
- `next.config.ts`
  - app-wide config
- `db/schema.sql`
  - database schema
- `lib/types.ts`
  - central type system
- `lib/store.ts`
  - core speaking/member store
- `lib/writing-store.ts`
  - core writing store
- `lib/server/auth.ts`
  - session/auth backbone
- `lib/server/openai.ts`
  - AI service integration
- `lib/server/db.ts`
  - DB access
- `components/providers.tsx`
  - client app context
- `vercel.json`
  - cron scheduling

## “Inspect these first” lookup table

### UI-only bugs

- target `app/.../page.tsx`
- target component in `components/...`
- relevant namespace in `app/globals.css`

### Client interaction bugs

- target component
- `components/providers.tsx` if auth/theme/language/session is involved
- matching route handler

### Server/data bugs

- matching route handler
- relevant store/helper in `lib/`
- `db/schema.sql` only if shape mismatch is suspected

### Role/access bugs

- route page guard
- `lib/roles.ts`
- `lib/server/auth.ts`
- `lib/admin.ts` or `lib/teacher.ts`
- route/store enforcement

### Billing bugs

- billing UI
- `app/api/account/plan/route.ts`
- `app/api/payments/lemon/**`
- `lib/server/lemon.ts`
- `lib/store.ts`

### Cron/email bugs

- `vercel.json`
- exact cron route
- `lib/server/email-sequences.ts`
- `lib/server/email.ts`

## Files that cause most unnecessary scanning

Agents often waste time here because the surface is large. If the task clearly belongs to one of these, open that file directly first.

- `components/teacher-hub.tsx`
- `components/practice-console.tsx`
- `components/writing-console.tsx`
- `components/dashboard.tsx`
- `components/admin-panel.tsx`
- `app/globals.css`
- `lib/store.ts`
- `lib/classroom-store.ts`

These are hotspots, but still narrower than scanning the repo.

## Coding conventions and patterns

- Use TypeScript types from `lib/types.ts` whenever possible.
- Keep API route handlers thin and delegate to `lib/` or `lib/server/`.
- Prefer existing store modules over introducing new parallel data-access abstractions.
- Use the `@/` import alias.
- Favor server components unless state/effects/browser APIs require `"use client"`.
- Keep naming consistent with the repo:
  - components: PascalCase filenames
  - utilities/stores/helpers: camelCase exports
  - route handlers: `route.ts`
  - pages: `page.tsx`
  - layouts: `layout.tsx`
- Styling should extend the existing visual system in `app/globals.css` rather than replacing it.

## Setup, run, build, and test

### Core commands

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run test`

### Database

- `npm run db:push`

This runs `scripts/apply-schema.mjs`, which:

- loads `.env.local` if present
- reads `db/schema.sql`
- applies it directly to `DATABASE_URL`

### Utility scripts

- `npm run audit:i18n`
- `npm run send:campaign -- --campaign <campaign> --to <email>`

## Files/folders usually checked for common tasks

### New page or page bug

- target route in `app/...`
- related component in `components/...`
- `app/layout.tsx` or `app/app/layout.tsx` if chrome is involved

### Auth bug

- `lib/server/auth.ts`
- `app/api/auth/**`
- `components/providers.tsx`
- `lib/roles.ts`

### DB bug

- relevant store file in `lib/`
- `lib/server/db.ts`
- `db/schema.sql`

### Payment bug

- `app/api/payments/lemon/**`
- `lib/server/lemon.ts`
- `lib/store.ts`
- `app/api/account/plan/route.ts`

### Teacher / school bug

- `lib/classroom-store.ts`
- `lib/homework-store.ts`
- `app/api/teacher/**`
- `app/api/institution-admin/**`

### SEO/content bug

- route page
- `lib/marketing-content.ts`
- `lib/blog-content.ts`
- `lib/server/custom-blog.ts`
- `lib/seo*.ts`

## Files/folders not to touch unless necessary

- `.next/**`
- `node_modules/**`
- `.claude/**`
- `tsconfig.tsbuildinfo`
- `design-previews/**`
- generated or static campaign HTML unless doing email work

Use extra caution with:

- `db/schema.sql`
- `middleware.ts`
- `next.config.ts`
- `app/layout.tsx`
- `app/globals.css`
- `vercel.json`

Also avoid using these as first-read files unless the task explicitly points there:

- `README.md`
- `DEPLOYMENT.md`
- `docs/backend-and-deploy.md`

They are useful context, but not always the freshest source of truth.

## Known risks, inconsistencies, and assumptions

### Confirmed inconsistencies

- `README.md` mentions Stripe as a next step, but current active payment routes are Lemon Squeezy-based.
- `.env.example` includes both Stripe and Lemon variables.
- `DEPLOYMENT.md` and `docs/backend-and-deploy.md` are partly outdated relative to the current route tree.
- `components/practice-console.tsx` references speaking upload/evaluate endpoints that were not found under `app/api/speaking/session/**`.
- `components/writing-console.tsx` references submit/evaluate endpoints that were not found under `app/api/writing/session/**`.
- Custom domain behavior is split between repo code and Vercel project settings; `www.speakace.org` issues should be checked in both `middleware.ts` and the Vercel Domains dashboard.

These should be treated as real project risks before making changes to those flows.

## Examples of minimal file sets

These are here to reduce future over-scanning.

### Teacher dashboard dark mode text bug

Inspect only:

1. `app/app/teacher/page.tsx`
2. `components/teacher-hub.tsx`
3. relevant `.teacher-*` and shared surface rules in `app/globals.css`

Only expand further if:

- text comes from a child component not rendered directly in `TeacherHub`
- the issue is data-driven rather than visual

### Learner profile not saving

Inspect only:

1. profile/onboarding component
2. `app/api/profile/route.ts`
3. `lib/student-profile-store.ts`
4. `db/schema.sql` only if a field is missing

### Practice session start failing

Inspect only:

1. `components/practice-console.tsx`
2. `app/api/speaking/session/start/route.ts`
3. `lib/store.ts`
4. `lib/prompts.ts`
5. `lib/membership.ts`

### Class enrollment/teacher access bug

Inspect only:

1. `components/teacher-hub.tsx`
2. relevant `app/api/teacher/**` or `app/api/classes/**` route
3. `lib/classroom-store.ts`
4. `lib/teacher.ts` or `lib/server/auth.ts` if role enforcement is involved

### Fragile areas

- auth and privilege boundaries
- classroom isolation and teacher/student visibility
- billing state synchronization
- DB/in-memory dual-mode behavior
- large global CSS surface in `app/globals.css`
- cron jobs that may send emails or generate reminders

### Production revenue operations

- As verified in the live Lemon Squeezy dashboard on 2026-07-22, no webhook is configured for the store. Subscription events will not reach `app/api/payments/lemon/webhook/route.ts` until `https://speakace.org/api/payments/lemon/webhook` is registered and its signing secret is configured in production as `LEMON_SQUEEZY_WEBHOOK_SECRET`.
- SpeakAce Plus currently uses a three-day Lemon Squeezy trial. Trial conversion and access depend on preserving the provider's `on_trial` status and `trial_ends_at` value through the webhook billing sync.
- Live catalog values must be checked against site copy before changing pricing. On 2026-07-22, the Lemon product named Pro Monthly was configured with a weekly interval while the site described it as monthly.
- Authenticated learner checkout initiation is recorded server-side in `app/api/payments/lemon/checkout/route.ts`. Keep the database event there so navigation cannot drop it, and do not add a second client-side `checkout_initiated` write for links targeting that route.
- Lifecycle baseline before frequency controls on 2026-07-22: 520 daily-tip emails reached 180 recipients in 7 days, while only 43 users had practiced in 30 days; 71 emails reached 23 unverified accounts. Use these as reduction baselines and do not restore all-user daily sends.
- Retention baseline on 2026-07-22: 34 of 45 recently verified learners uploaded a speaking attempt, but only 5 returned on another day. Prioritize measured day-one return activation before adding more broad acquisition or checkout pressure.
- The learner dashboard uses a three-day momentum mission for early return behavior. Mission practice links carry `dashboard_momentum_day_*` activation attribution, and trial learners see the same daily-return loop with their remaining trial time.
- Streaks must count distinct UTC days with completed audio uploads, not started sessions. Before this correction on 2026-07-22, 212 learner streaks were inflated; only 4 learners had completed practice on 1-2 distinct days in the prior week and none had reached 3 distinct active days.
- Upgrade prompts are frequency-capped to one full modal per learner per UTC day through `lib/upgrade-prompt-frequency.ts`; later limit hits use a compact recovery card that preserves checkout and review actions without blocking the page.
- Prompt-fatigue baseline on 2026-07-23: 27 learners generated 160 upgrade-prompt views in 30 days, including 112 limit-hit views from 13 learners, while only 2 learners initiated checkout from the practice-limit path. Track `upgrade_prompt_cooldown_view` and `upgrade_prompt_dismissed` before increasing prompt pressure again.
- Resend's monthly quota was exhausted in production on 2026-07-18. The lifecycle cron now uses `email_log` as a quota circuit breaker to avoid repeated failed sends until the quota resets or `IGNORE_EMAIL_QUOTA_BLOCK=true` is intentionally configured after an account upgrade.
- High-intent practice-limit recovery emails are implemented behind `ENABLE_PRACTICE_LIMIT_RECOVERY_EMAILS=true`. Keep the flag off until the live Lemon webhook is configured and signed delivery is verified; the sequence excludes recent checkout starters, enforces a 14-day recovery cooldown, and avoids any user sent another email in the prior 24 hours.

### Assumptions

- `npm` is the safest package manager default because `package-lock.json` is present.
- Neon Postgres is the intended production DB.
- Vercel is the intended runtime/deployment platform.
- Postgres-backed behavior is the production path; in-memory mode mainly supports local fallback/testing behavior.
- In-memory classroom data may not remain coherent across separately compiled Next.js route modules during local development. Use Postgres-backed checks for teacher/student enrollment integration; do not treat an empty local cross-route roster as production evidence.

## Tests and verification

Current visible tests:

- `lib/security.test.ts`
- `lib/store.test.ts`

These focus on:

- privilege escalation prevention
- cross-tenant isolation
- teacher/classroom restrictions
- store behavior

There is no visible full E2E suite in the main app source.

## Guidance for future updates

If you discover:

- missing route implementations
- new API families
- additional DB tables or runtime migrations
- production-only behavior not captured here
- resolved contradictions in docs or billing flows

update this file so future agents do not need to repeat the same discovery work.
