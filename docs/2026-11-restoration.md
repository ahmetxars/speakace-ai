# SpeakAce restoration — 1 November 2026

## Shipped behavior

The homepage uses the existing editorial design reference from the sibling `speakace-redesign` project, implemented as React components in the existing Next.js app. Authored sample answers are interactive, explicitly illustrative and separate from real assessments. Public navigation, footer, account screens, typography and shared workspace tokens use the same paper/cobalt identity. Fonts are bundled locally with Fontsource. No Google Fonts request is needed.

Account signup requires separate, unchecked Terms acceptance and Privacy Notice acknowledgement. The server validates the current legal version before creating a password account. Google consent is carried in signed OAuth state and checked before creating a new account; returning Google users can sign in without being treated as new signups. Consent timestamps/version and separate optional marketing opt-in persist on `users`. Existing accounts receive no inferred marketing consent. Necessary verification and password emails remain independent of marketing.

Cookie controls offer rejection, optional analytics permission, and preference editing. Analytics are off until a valid, unexpired affirmative choice. Withdrawal clears accessible legacy tracking storage, stops new tracking, and expires the HttpOnly visitor cookie on the next request. Anonymous checkout still works without analytics consent. Its functional 72-hour checkout recovery cookie is separate from the optional visitor identifier. Google Analytics, AdSense, Clarity and browser/server PostHog are disabled. `/ingest` proxy rewrites are removed.

The privacy notice names the operator using `COMPANY_LEGAL_NAME`. A private home address is not invented or required just to render that notice. Commercial email still fails closed without both a real sender name and postal address. The operator approved the public name Ahmet Arslan and the existing contact email. This change does not establish vendor international-transfer safeguards or certify legal compliance. Those are operator/legal decisions, not implied by a signup checkbox.

The institution summary query now aggregates normalized organization names in CTEs, avoiding PostgreSQL `42803` on a correlated ungrouped column. Completed practice counts use real uploaded audio. Admin modules report failed queries explicitly instead of silently presenting them as genuine zeroes. An authenticated, rate-limited System-tab check verifies a real OpenAI model response, Postgres and the Resend sender domain without transmitting learner content.

When transcription fails, the upload route returns a retryable error and refunds a new usage reservation atomically. It does not invent a transcript or produce a score from sample text. A real transcript is required for production evaluation. If richer AI feedback fails after transcription, basic text-only fallback feedback is labelled and does not claim to assess pronunciation.

## Database

Applied `db/migrations/20261101_account_consent.sql` to production. This migration adds four nullable consent columns and does not backfill or change existing users. `db/schema.sql` includes the same additions; the account/email helpers also ensure these columns for existing installations.

## Verification

- All baseline admin read functions were exercised against production without logging member rows. The initial institution error was reproduced, fixed, and the query returned 5 groups. The account population was 401 before testing.
- A synthetic account at Resend's documented `delivered+label@resend.dev` destination exercised signup, consent persistence, marketing refusal, email delivery, one-time verification/session creation, and token-reuse rejection. It was removed after testing. No real learner received a test message.
- Admin password login and authenticated `/admin` returned 200 with user and institution data and no partial-query warning.
- Browser QA covers desktop and narrow mobile layouts, interactive examples, cookie rejection/preferences, Turkish copy and account-screen contrast.
- The test suite and production build are required before each deployment. Production dependency audit was zero vulnerabilities after compatible updates and a PostCSS 8.5.32 override. Development-tool advisories remain; do not run `npm audit fix --force` blindly.

## Provider findings and follow-up

The original OpenAI credential returned `401 invalid_api_key`. The operator replaced it with a production Sensitive environment variable. Sensitive production values cannot be downloaded with Vercel CLI; validate the new deployment through the admin service check and real synthetic practice flow. Never put keys into source, logs or chat.

Resend API access and the sending domain were valid. A synthetic verification message reached provider status `delivered`. The Resend dashboard also displayed an unpaid-invoice warning; settling billing remains the account owner's action. This technical test does not remove that warning or guarantee future delivery.

Marketing must remain blocked until real commercial sender requirements are configured. The code records explicit signup opt-in but never interprets old `email_opt_out=false` alone as consent.

## Production verification result

Production verification on 1 November 2026 succeeded for real OpenAI transcription (`source: openai`), four-category speaking feedback with a next exercise, and four-category writing feedback with corrections. The authenticated service check returned success for Postgres, OpenAI and Resend. Public legal/auth pages returned 200, tracking without consent returned 204 without recording an event, and unauthenticated service checks returned 401. The final automatic suite contains 213 passing tests. QA accounts were removed and the user population returned to 401.

Unavailable commercial capture forms now fall back to an email contact link and the footer guide offer remains hidden until genuine sender configuration is ready. This does not disable transactional signup or password emails.

## Follow-up: application navigation and interaction repair

The operator's existing live browser session reproduced a significant missed UI defect: `/app/practice` redirected to institution administration, which returned “No organization found”. Platform admin capability had been treated as school identity. Role resolution now keeps this learner account in the personal workspace and exposes site administration separately; authorized school and teacher routing stays intact. Five regression tests cover this distinction without granting new permissions.

Additional corrections: microphone-permission setup remains cancellable and ignores late device responses after exit; settings no longer offer eight unsupported locales that silently reverted to English; shared accent tokens restore readable buttons and the workspace wordmark supports dark mode; writing-result columns stack at narrow widths and PDF printing retains a usable, opener-isolated window handle. The report's existing score caveat is now visible.

Local browser checks used disposable accounts with privileges configured only in the local runtime. Speaking start reached permission setup and exit returned to the prompt list without approving microphone access. Writing draft submission reached the results screen; the printable report contained its actual draft, scores and corrections. Profile target 7.0 was verified persisted in Postgres, a study folder was created, settings changed the language, and resource filtering plus the speaking band calculator responded correctly. Local writing used the fallback evaluator because Sensitive production credentials cannot be downloaded; this is not a new production OpenAI verification.

HTTP checks covered 15 application pages and five data endpoints for both operator and student roles. Teacher routing retained its `/app/teacher` redirect and its classes, institution and homework endpoints returned 200. All 218 tests and the production build passed. Targeted lint had no errors and retained 10 existing unused-code warnings in the practice console. All three temporary fixture accounts were removed and the original local environment was restored.
