# Backend and Deploy Setup

## Recommended Stack
- Hosting: Vercel
- Domain registrar + DNS: Cloudflare Registrar
- Database: Neon Postgres
- Cache / rate limiting later: Upstash Redis
- Speech-to-text: OpenAI `gpt-4o-mini-transcribe`
- Feedback scoring: OpenAI `gpt-4o-mini`
- Product analytics: built-in lightweight event tracking, optional later upgrade to PostHog or Plausible

## Backend Plan
- Keep the current API surface stable:
  - `POST /api/account/profile`
  - `GET /api/progress/summary`
  - `POST /api/speaking/session/start`
  - `POST /api/speaking/session/:id/upload`
  - `POST /api/speaking/session/:id/evaluate`
- Replace the in-memory store with Postgres-backed repositories in this order:
  1. users
  2. usage_daily
  3. speaking_sessions
  4. feedback_reports
- Reuse `db/schema.sql` as the first source of truth for the production database.

## Neon Setup
1. Create a Neon project named `speakace-prod`.
2. Copy the pooled connection string into `DATABASE_URL`.
3. Run the SQL in `db/schema.sql`.
4. Store the same `DATABASE_URL` in Vercel project environment variables.

## Vercel Setup
1. Create a new Vercel project from this repo.
2. Set environment variables from `.env.example`.
3. Set `NEXT_PUBLIC_SITE_URL` to the final production domain, for example `https://speakace.ai`.
4. Deploy `main` to production and preview branches for testing.
5. The app already exposes security headers through `next.config.ts`.
6. After the first deploy, verify:
   - `/robots.txt`
   - `/sitemap.xml`
   - `/api/health`
   - `/api/analytics/summary?userId=...` for signed-in smoke testing

## Domain Setup
1. Buy the domain from Cloudflare Registrar.
2. In Vercel, add the domain to the project.
3. In Cloudflare DNS, point:
   - apex/root domain to Vercel using the recommended A record or flattening
   - `www` as a CNAME to Vercel
4. Set the primary domain in Vercel to the version you want indexed.
5. Update `NEXT_PUBLIC_SITE_URL` to that primary domain and redeploy.

## Production Checklist
- Add a real database adapter
- Add real authentication provider
- Add OpenAI transcription and feedback integration
- Add Stripe billing
- Add rate limiting and abuse controls
- Replace in-memory analytics with persistent analytics storage
- Add error monitoring
