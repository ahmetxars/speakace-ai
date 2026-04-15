# SpeakAce Email Campaigns

This project already has transactional email helpers and onboarding sequences. The files in this guide add a cleaner marketing campaign workflow inspired by `email-campaigns-claude`, but adapted to SpeakAce branding and infrastructure.

## What was added

- `public/email-assets/spring-practice-push/preview.html`
  - A polished HTML campaign template for SpeakAce.
  - Safe to preview locally in the browser.
  - Uses `{{FIRST_NAME}}` and `{{UNSUBSCRIBE_URL}}` placeholders.

- `scripts/send-campaign.mjs`
  - Reads a campaign HTML file from `public/email-assets/<campaign>/preview.html`
  - Converts `/...` asset paths into absolute `https://...` URLs before sending
  - Personalizes first name and unsubscribe link
  - Sends through the existing Resend config in env vars

## Env requirements

These should already exist in your setup:

- `NEXT_PUBLIC_SITE_URL`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `EMAIL_REPLY_TO` optional

## Preview the template

Run the app and open:

```bash
npm run dev
```

Then visit:

```text
http://localhost:3000/email-assets/spring-practice-push/preview.html
```

## Send a single test email

```bash
npm run send:campaign -- --campaign spring-practice-push --to your@email.com --name Ahmet
```

## Dry-run without sending

```bash
npm run send:campaign -- --campaign spring-practice-push --to your@email.com --dry-run
```

## Send to a list

Create a file like this:

```text
student1@example.com,Ayse
student2@example.com,Mehmet
student3@example.com
```

Then run:

```bash
npm run send:campaign -- --campaign spring-practice-push --list ./recipients.csv
```

## Recommended segmentation for SpeakAce

Avoid blasting the same copy to everyone. Start with small segments:

1. New signups with low activation
2. Users who practiced once but did not come back
3. Free users who hit daily limits
4. Inactive users who have not practiced in 7 to 14 days
5. Teacher or school leads with a separate school-focused message

## Good next campaign ideas

1. `part-1-daily-habit`
   - Nudge users into one short daily Part 1 practice
2. `retry-loop`
   - Teach transcript review plus retry behavior
3. `band-6-to-7`
   - More authority-driven educational email with examples
4. `teacher-demo`
   - Separate campaign for schools and teachers

## Important notes

- Always test with your own inbox first.
- Keep assets inside `public/email-assets/<campaign>/` when you add campaign-specific images.
- Email clients require absolute asset URLs, so the send script fixes that automatically.
- Keep unsubscribe links intact for marketing emails.
- For bigger sends, batch a small segment first and watch open and click data in Resend.
