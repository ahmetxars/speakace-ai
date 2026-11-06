# Workspace and admin follow-up — 6 November 2026

Baseline: `c97a1c7`. Continued the authorized site restoration using the signed-in Chrome session and a separate local admin session. No new users, plan changes, published content, referral codes, purchases or emails were created for this check.

## Confirmed and corrected

- Workspace and admin still displayed the old ≋ logo glyph. Both now use the public four-bar voice mark. Public brand output is unchanged.
- Workspace account-menu Escape now returns focus to its summary. Pointer selection, keyboard dismissal and light/dark controls were checked in the browser.
- Workspace UI was English/Turkish while its language picker advertised five active translations. Header and settings now reflect the actual interface language, explain public learning-page language availability, and only enable EN/TR for the workspace. Public five-language selection remains unchanged. Settings link directly to membership management and remove implementation-specific payment wording.
- Admin PostHog was intentionally disabled but displayed “action required”. Optional tracking is now neutral when disabled. Database/webhook/mail configuration is labelled as configuration, with a separate live test; a stored key no longer implies confirmed delivery.
- Account verification mail and commercial mail now have separate health rows. Missing commercial sender identity continues to stop commercial sending without being presented as a failed account-mail connection. No tracker or marketing flow was enabled.
- Checkout starts with no corresponding completion are labelled as unmatched records rather than proven lost customers. Custom CMS post counts are labelled as custom posts, avoiding the implication that the site's built-in guides are absent.
- Admin create-code, member-save, post-save, publication-status and email-test actions now release busy state on network/JSON failures. Draft input is retained on failure. A bounded request helper never retries mutations: an unreadable or lost response is reported as an uncertain outcome, so a possibly committed action is not duplicated.
- A new live service check clears previous results and timestamps each completed run. Old successful results no longer remain visible alongside a failed rerun.

## Evidence

- Authenticated production synthetic check returned successful PostgreSQL, OpenAI model response and Resend verified-domain checks. No user data was sent to the model, and no test message was sent. This verifies connectivity, not inbox delivery or merchant webhook completion.
- All nine admin sections opened locally, including users, billing, content, institutions and system health. No partial-query failure was shown. Navigation evidence is in ignored `dist/qa/panel-followup-2026-11-06/admin-tabs.json`.
- Admin and settings layouts were measured at actual 375, 390, 768 and 1440 CSS pixels without horizontal overflow. Admin light/dark and workspace light/dark views were inspected. Both logo bars and account-menu focus were checked through the rendered DOM.
- Ten focused tests cover optional/configured service distinctions and mutation success, provider rejection, interrupted requests, malformed successful responses and gateway errors. The full suite passes 42 files / 231 tests. Lint has zero errors and the same 18 existing warnings. The production build completes all 205 pages.
- Screenshots, responsive measurements, test, lint and production-build logs are in the ignored QA directory. No private production member lists are included in this report.

## Boundaries

No provider configuration, billing entitlement, database schema or public-page design was changed. Existing monthly revenue remains a plan-based estimate, not verified payment reconciliation. Real purchase completion, inbox delivery, microphone recording and screen-reader certification were not tested in this follow-up. Commercial sender postal identity is still incomplete, so commercial mail stays disabled.
