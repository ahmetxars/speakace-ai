# SpeakAce Deployment Guide

## Overview

SpeakAce is an AI-powered IELTS & TOEFL speaking practice platform built with Next.js, React, and PostgreSQL. This guide covers deployment to Vercel with all integrations.

## Prerequisites

- Node.js 18+ and npm/pnpm
- PostgreSQL database (Neon recommended)
- OpenAI API key
- Lemon Squeezy account (for payments)
- Resend account (for emails)
- Vercel account

## Local Setup

### 1. Clone and Install

```bash
git clone https://github.com/YOUR_USERNAME/speakace-platform.git
cd speakace-platform
pnpm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
- `DATABASE_URL` - Neon PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API key
- `ADMIN_PANEL_USERNAME` - Admin username
- `ADMIN_PANEL_PASSWORD` - Admin password
- `LEMON_SQUEEZY_STORE_URL` - Your Lemon Squeezy store URL
- `RESEND_API_KEY` - Resend email API key

### 3. Database Setup

```bash
# Apply schema to Neon database
pnpm run db:push
```

### 4. Run Development Server

```bash
pnpm run dev
```

Visit `http://localhost:3000`

## Vercel Deployment

### 1. Create Vercel Project

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repository directly in Vercel dashboard.

### 2. Set Environment Variables

In Vercel dashboard → Settings → Environment Variables, add all variables from `.env.local`:

```
APP_ENV=production
NEXT_PUBLIC_SITE_URL=https://your-domain.com
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-proj-...
ADMIN_PANEL_USERNAME=admin
ADMIN_PANEL_PASSWORD=...
LEMON_SQUEEZY_STORE_URL=https://speakace.lemonsqueezy.com
LEMON_SQUEEZY_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@speakace.org
EMAIL_REPLY_TO=support@speakace.org
GOOGLE_SITE_VERIFICATION=google_verification_code
ADMIN_EMAILS=admin@example.com
TEACHER_EMAILS=teacher@example.com
```

### 3. Deploy

```bash
# Automatic deployment on git push
git push origin main
```

## SEO Setup

### 1. Google Search Console

1. Go to https://search.google.com/search-console
2. Add your domain
3. Verify with meta tag (add to `.env.local`):
   ```
   GOOGLE_SITE_VERIFICATION=your_verification_code
   ```
4. Submit sitemap: `https://your-domain.com/sitemap.xml`

### 2. Sitemap

Automatically generated at `/sitemap.xml` with all pages and blog posts.

### 3. Robots.txt

Configured at `/public/robots.txt` to allow search engines and block admin/api routes.

## Admin Panel

Access at `/admin` with credentials from `.env`:
- Username: `ADMIN_PANEL_USERNAME`
- Password: `ADMIN_PANEL_PASSWORD`

### Features

- **Blog Management** - Create, edit, publish blog posts in multiple languages
- **User Management** - View and manage users
- **Analytics** - Track usage and revenue
- **Content** - Edit pages and settings

## Multi-Language Support

Supported languages: English, Turkish, Dutch, German, French, Spanish

Language is stored in localStorage and persists across sessions.

## Payments (Lemon Squeezy)

Checkout link: `https://speakace.lemonsqueezy.com/checkout`

To handle webhooks:
1. Add webhook endpoint in Lemon Squeezy dashboard
2. Point to: `https://your-domain.com/api/webhooks/lemon-squeezy`
3. Set secret in `LEMON_SQUEEZY_WEBHOOK_SECRET`

## Email (Resend)

Emails are sent via Resend for:
- Welcome emails
- Password resets
- Notifications
- Admin alerts

Configure sender: `EMAIL_FROM` and reply-to: `EMAIL_REPLY_TO`

## AI Scoring

Powered by OpenAI:
- **Transcription** - `OPENAI_TRANSCRIBE_MODEL` (gpt-4o-mini-transcribe)
- **Feedback** - `OPENAI_FEEDBACK_MODEL` (gpt-4)

Scores are calculated based on:
- Fluency & Coherence
- Pronunciation
- Lexical Resource
- Grammatical Range
- Overall Band Score

## Monitoring

### Logs

View logs in Vercel dashboard → Deployments → Logs

### Database

Monitor Neon database at https://console.neon.tech

### Analytics

Google Analytics configured with ID: `G-806S0CWRWX`

## Troubleshooting

### Database Connection Error

```
Error: connect ECONNREFUSED
```

Solution:
1. Check `DATABASE_URL` is correct
2. Ensure Neon database is running
3. Verify IP whitelist in Neon settings

### OpenAI API Error

```
Error: Invalid API key
```

Solution:
1. Verify `OPENAI_API_KEY` is correct
2. Check API key has required permissions
3. Monitor usage at https://platform.openai.com/usage

### Admin Panel Login Failed

```
Error: Invalid credentials
```

Solution:
1. Verify `ADMIN_PANEL_USERNAME` and `ADMIN_PANEL_PASSWORD`
2. Check environment variables are set in Vercel
3. Redeploy after changing credentials

## Performance Optimization

- **Image Optimization** - Next.js Image component
- **Code Splitting** - Automatic route-based splitting
- **Caching** - Vercel Edge Caching for static content
- **Database** - Connection pooling via Neon

## Security

- Admin panel protected with password
- Database connections use SSL
- API routes require authentication
- CORS configured for trusted domains
- Environment variables never exposed to client

## Backup & Recovery

### Database Backups

Neon automatically backs up data. To restore:
1. Go to Neon console
2. Select branch
3. Click "Restore" and choose backup point

### Code Backups

GitHub automatically backs up your code. To restore:
1. Go to GitHub repository
2. Click "Releases"
3. Download previous version

## Support

For issues:
1. Check logs in Vercel dashboard
2. Review error messages in browser console
3. Check database connection
4. Verify environment variables
5. Contact support@speakace.org

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Set up Google Search Console
3. ✅ Configure Lemon Squeezy webhooks
4. ✅ Set up email templates
5. ✅ Monitor analytics
6. ✅ Test admin panel
7. ✅ Test payment flow
8. ✅ Launch publicly

---

**Last Updated:** April 2026
**Version:** 1.0.0
