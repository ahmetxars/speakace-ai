# SpeakAce AI

AI speaking coach for IELTS and TOEFL practice.

## Local development

1. Copy `.env.example` to `.env.local`
2. Fill the variables you need
3. Run:

```bash
npm install
npm run db:push
npm run dev
```

## Current product areas
- Marketing landing page
- IELTS and TOEFL speaking practice flow
- User profile with free / premium membership tags
- Daily usage limits by plan
- Audio playback, transcript compare, and score review
- Weekly checklist, streak tracking, and dashboard goal planning
- Mock exam report with readiness band and study plan
- Lightweight in-app analytics for page views and practice flow
- SEO pages, sitemap, and robots setup

## Backend status
- Current runtime storage supports Neon Postgres when `DATABASE_URL` is present
- Production schema draft is in `db/schema.sql`
- Database bootstrap command is `npm run db:push`
- Deploy and infra notes are in `docs/backend-and-deploy.md`
- Runtime environment expectations are in `.env.example`

## Next production steps
- Add Neon `DATABASE_URL` and push schema
- Add OpenAI speech-to-text
- Add Stripe billing

## Deploy notes
- Production hosting target is Vercel
- Security headers are configured in `next.config.ts`
- Required env values are listed in `.env.example`
- Recommended release flow:
  1. `npm run build`
  2. set Vercel env vars
  3. connect custom domain
  4. run `npm run db:push` against production Neon
