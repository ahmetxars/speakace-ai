# November public-product regression audit

Baseline supplied: `c97a1c7`; working baseline: `ca16fbd`. The newer admin/workspace fixes are preserved.

## Confirmed findings before fixes

| Severity | File / initial line | Root cause and reproduction | Impact / planned correction |
|---|---|---|---|
| Critical | `lib/store.ts:967–1059`, webhook `route.ts:150–198` | Billing writes occur before duplicate detection; recovery chooses receipt order and an active-only query can resurrect a refunded older purchase. | Atomic event ingestion and deterministic per-purchase projections; test duplicates, delayed events, refunds and account claiming against an isolated database. |
| Critical | `lib/server/lemon.ts:118–177`, `lib/store.ts:1063–1173` | Annual order has no duration; cancellation dates share `trialEndsAt`; client-supplied custom plan text participates in plan resolution. | Use merchant product evidence, distinct server `accessEndsAt`/kind and explicit fixed-duration rule; prevent identity/custom-data escalation. |
| Decision resolved | Plus Annual | Operator confirmed in this chat: one payment grants 12 months **from purchase**, without automatic renewal. | Calculate calendar-month expiry from provider purchase timestamp; independent repeat purchases must never shorten another grant. No merchant settings or live customer test writes. |
| High | `components/editorial-public-header.tsx:42–48`, `providers.tsx:50–62` | Header uses preferred DE/ES/FR, selector shows EN, home body uses EN; switching forces location reload. | Keep preference separate from route-effective locale; consistent shell and document semantics without overwriting the preference. |
| Medium | `components/public/tool-directory.tsx:25–35,74` | English metadata-only search; generic All tools search name. | Normalized multilingual concept aliases and purpose-specific labels, with filter/search tests. |
| Medium | `app/reviews/page.tsx:15–124` | Only hero is translated; remaining sections/CTAs are English. | Complete EN/TR/DE/ES/FR content, preserve honest product-use framing and canonical. |
| Medium | `app/public-audience.css` mobile teacher rule | Task context is hidden below 900px, including review and lesson-note stages. | Retain a compact task summary in all stages and test long localized labels. |
| Medium | `lib/pricing-copy.ts`, `app/app/billing/page.tsx` | Trial language is unconditional; account billing still presents annual saving/monthly-equivalent comparisons and legacy offer assumptions. | Match verified merchant terms and confirmed 12-month access; keep important terms beside CTAs, remove incompatible claims. |
| Medium | Public header and tab panels | Landmarks/English learning-example language, hidden scene semantics and focus/keyboard behavior require rendered checks. | Verify and correct semantics and reduced-motion behavior; no certification claim without actual assistive testing. |

## Evidence and constraints

Lemon's [subscription object](https://docs.lemonsqueezy.com/api/subscriptions/the-subscription-object) distinguishes trial, renewal and cancellation end dates. Its [event documentation](https://docs.lemonsqueezy.com/help/webhooks/event-types) confirms separate order and subscription deliveries. Its [order object](https://docs.lemonsqueezy.com/api/orders/the-order-object) distinguishes full and partial refunds. These vendor semantics do not establish a product's access duration; the 12-month rule comes from the operator's explicit answer.

No real payment, refund, cancellation, merchant change or production customer-record test mutation is permitted. Tests use synthetic fixtures and an isolated local PostgreSQL instance.

## Additional reproduced findings

| Severity | File | Reproduction / cause | Implemented correction |
|---|---|---|---|
| High | `app/layout.tsx`, `components/public/page-primitives.tsx` | Open `/`, then follow Plans using Next navigation. The persistent root layout keeps its original request-path decision: pricing has no `.public-page` wrapper. Going back can retain public styles around the homepage. | A client `PublicPageFrame` follows `usePathname` and excludes home, workspace, admin and maintenance. Direct loads and client navigation now agree. |
| Medium | `components/public/library-search.tsx`, library reset/expansion buttons | Clear a query with the keyboard: the focused clear button unmounts and focus falls to BODY. Reset and final Show more have the same failure mode. | Clear/reset return focus to the search input; expansion focuses the first newly revealed article. |
| Medium | `app/globals.css` auth input rules | Signup with optional fields at narrow widths: the email input's intrinsic width exceeds its grid track, visibly protruding beyond the field. | Correct the owning field/input rules with `min-width: 0`, border-box and bounded full width. |
| Medium | Shared cookie controls, signup acknowledgements, English editorial metadata | DE/ES/FR chrome includes EN-only cookie choices and consent text; English examples and SEO-overridden blog excerpts inherit the surrounding language. | Five-language cookie/consent copy; explicit English metadata only where the canonical SEO source is English, preserving localized/custom-post metadata. |

The account comparison also claimed Basic versus Expanded feedback and limited versus full tracking. Its shared getter now reuses canonical pricing copy and actual plan limits: feedback and writing are included with both plans; PDF export is the paid distinction.

## Implemented billing contract and compatibility

- Operator decision: **$49.99 once, 12 calendar months from provider purchase time**, no automatic renewal, no Annual trial. Leap-day purchases clamp to the last valid day while retaining UTC time.
- Weekly orders alone cannot grant unbounded Plus. Real subscription state supplies trial and cancellation boundaries; a paid renewal clears the old trial boundary. A cancellation without a valid boundary cannot create indefinite access.
- `accessEndsAt` and `billingKind` are explicit profile fields. Fixed-duration policy is persisted inside new immutable ledger payloads. Existing purchase evidence is projected without a schema migration or production backfill; read-time expiry does not rewrite customer rows.
- Separate sources are aggregated by valid plan rank and longest remaining access. A repeat purchase cannot shorten a newer grant. Refunds revoke their own source, preserving other active purchases. Partial refunds do not revoke full access. A later full refund remains a distinct event even after an earlier partial refund. Known purchases can be refunded without repeating product metadata.
- Events are ordered by provider revision, including fractional milliseconds, rather than delivery time. Idempotency uses provider object/event/revision identity, also recognizing older raw-JSON event records. Audit insertion and the users cache commit together under an identity lock; failure rolls both back and allows retry.
- Merchant product attributes determine entitlement; buyer-controlled custom plan/billing/email text cannot escalate access. Captured account id and merchant customer email are cross-checked. Pre-registration purchases reconcile by the same verified account email.
- Authenticated profile reads, member reads, speaking creation/reservations and writing's existing member boundary enforce expiry. Memory-mode creation and quota summaries use the same projection.
- The local integration suite rejects any non-local database or any database name other than `speakace_regression`. Its fixtures are synthetic and its clock is fixed. No test contacted production customer records, charged a card, refunded a purchase, cancelled a subscription, accepted signup terms or changed merchant settings.

## Localization, navigation and content

The saved preference remains EN/TR/DE/ES/FR. Home and workspace effectively render EN/TR; admin remains TR. A home fallback never replaces the saved preference. Changing language commits server/client copy with `router.refresh()` instead of reloading the document. A storage-only legacy preference is recovered once. Home displays an explanatory English fallback notice when relevant.

Reviews sections, all nine use-case items, supporting text and CTAs are translated in all five languages, without fabricated testimonials or ratings. Tools use accent-insensitive multilingual concept aliases, combine search and group filters, expose an accurately named search field and distinguish reference-only content. The TOEFL timer and replay workbench entries provide reference/tip content; the standalone speaking timer remains the interactive timer. Canonicals and checkout destinations are unchanged.

Native disclosures retain native semantics, meaningful names and controlled expanded states. Roving tab keys skip disabled/nested tabs. Result panels are named and focusable; inactive scenes are `aria-hidden` and inert. Empty states no longer compete with the single live result counter. English questions, answers, transcripts and SEO-overridden editorial excerpts have explicit language metadata.

The teacher task context stays visible at every mobile stage. Scene geometry remains intrinsic, and keyboard changes skip transitions. Previously unbounded decorative waveform/scan/signal animations are finite; the existing hero pause control remains available. Reduced-motion CSS and the shared preference guard are preserved.

## Browser QA evidence

Evidence is saved locally under `dist/qa/regression-2026-11-06/` (ignored build artifacts, no customer data):

- `responsive-matrix.json`: **500** automated rendered checks across ten routes × five languages × ten target widths; no horizontal overflow beyond the 1px rounding allowance, broken `aria-controls`/`aria-labelledby` reference or hidden teacher context.
- `signup-matrix.json`: **300** additional checks: five languages × three account roles × ten widths × optional fields collapsed/expanded. No protruding inputs, unintended selected roles or preselected consent boxes.
- `workflows-{en,tr,de,es,fr}.json`: **450** keyboard-driven stage checks across three audience pages, three stages and ten widths. One selected tab, focus on that tab, valid panel naming, inert inactive scenes and visible teacher context. No clipped tab actions. Panel heights stay constant across stage changes at each width/locale.
- Targets: **320, 360, 375, 390, 430, 600, 768, 900, 1024, 1440px**. The IAB has an existing 82% zoom; viewport overrides were compensated and actual CSS widths recorded. The 320 target measures **319px**, a stricter narrow layout; the other nine widths measure exactly as requested. This also exercises the approximately 320px layout equivalent to a 1280px window at 400% zoom.
- Desktop dropdown: ArrowDown opening, End navigation, Escape closure/restored summary focus, Shift+Tab; visible focus outline.
- Mobile navigation: Enter opening, expanded state, Escape closure/restored toggle focus; hidden navigation is removed from exposure.
- Workflow keyboard Home, End, arrows and focus retention were checked; all stage labels/panels remain consistent. Pointer scene switching was also inspected.
- Resource discovery: 6 → 12 → 14 of 14 items; combined category/search → zero; reset/clear → restored results and input focus. Expansion focuses the first new article.
- Blog: promoted hometown article is searchable, combined TOEFL category yields zero, reset restores the archive; 12 → 24 → 32 of 32 items, with focus retained on a newly shown article.
- Tool search for Turkish `zamanlayıcı` works within Spanish/German UI and returns both correctly labeled timer entries; incompatible group yields zero and reset restores 22 tools. Pure tests cover all five languages and requested concepts.
- Signup consent labels and required/autocomplete purposes were checked in all five languages. Optional fields are truly hidden when collapsed; expanding does not submit a form. Cookie rejection returns focus to the settings trigger. No signup or live account/email operation was submitted.
- Home → Pricing → Home client navigation was explicitly reproduced and retested after fixing the wrapper. DE/ES/FR preference survives an EN home fallback and is restored on translated pages.
- Canonical palette contrast calculated from source colors: ink/paper **13.86:1**, muted/paper **5.29:1**, blue/white **6.01:1**, blue/paper **5.45:1**. The shared focus orange was darkened from `#de742c` (2.87:1 on paper) to `#b95a1c` (4.20:1 on paper, 4.62:1 on white, 3.75:1 on lime). This is a palette check, not a certification of every rendered state.

## Validation limits and remaining risks

**Verified limitations / boundaries**

- The connected browser exposes viewport control, but no text-only resizing or reduced-motion emulation. **200% text-only resizing was not performed**. Reduced-motion preference behavior has automated unit coverage and CSS review; no browser emulation claim is made.
- No actual assistive-technology session or full axe audit was available. Automated rendered semantics and DOM relationship checks plus keyboard inspection are evidence, not WCAG certification.
- No live purchase/refund/cancellation or production signup/mail retest was performed. Account expiry was exercised through real isolated PostgreSQL member/auth boundaries; the signed-in Billing page was not exercised against a live paying customer.
- A fresh Lemon checkout attempt returned an error in the available browser, and merchant admin authentication is unavailable. Earlier same-day public checkout evidence establishes the $3.99 weekly / $49.99 one-payment displays; the operator establishes the 12-month duration. Eligibility/taxes/final amount remain qualified at checkout. No merchant policy/configuration change was inferred from the access duration.
- Institution billing retains its older separate update path before individual-ledger deduplication. This audit does **not** certify institutional billing idempotency. Individual-plan projection excludes institution events.
- Admin aggregates reading the users plan cache can lag a read-time expiration; the cache is not the authority used to authorize customer access. No production cache backfill was run.
- Some legacy authentication API/error messages still have only EN/TR variants; the primary account form, consent controls and cookie choices are five-language. This work does not claim every historical error string or every article/tool body has been translated.

**Unverified possibilities**

- There may be legacy purchase rows without sufficient merchant product/timestamp evidence. The projection deliberately preserves unrelated manual legacy grants instead of guessing their commercial meaning. No claim is made about how many production records require reconciliation.
- Actual provider delivery, current merchant availability and every customer-specific trial eligibility cannot be established without the prohibited live payment/account operations or authenticated merchant configuration access.


## Final automated validation

- `BILLING_TEST_DATABASE_URL=postgres://127.0.0.1:55439/speakace_regression npm run test`: **47 files, 325 passing tests, 0 failures**, including ten real isolated PostgreSQL tests. Baseline: 42 files / 231 tests.
- `npm run lint`: **0 errors, 18 pre-existing warnings**; no new lint warnings.
- `npm run build`: production compilation, type validation and 205-page generation succeeded.
- `npx tsc --noEmit --pretty false`: passed with zero errors.
- `git diff --check`: clean.

The browser evidence is local regression verification, not a live payment certification. Release readiness/production alias confirmation is reported separately after the GitHub push.

## Files changed

| File | Reason |
|---|---|
| `PROJECT_CONTEXT.md` | Record the confirmed commercial rule, ledger authority, locale policy and route-boundary constraints. |
| `app/api/payments/lemon/webhook/route.test.ts` | Exercise atomic failures, duplicates, account mismatch and untrusted checkout metadata. |
| `app/api/payments/lemon/webhook/route.ts` | Atomic individual ingestion, stable event identity, merchant-email validation and safe plan association. |
| `app/app/billing/page.tsx` | Display fixed-duration expiry and consistent qualified weekly/one-payment terms. |
| `app/auth/page.tsx` | Translate consent choices; expose required/autocomplete purposes, role state and optional-field relationships. |
| `app/blog/page.tsx` | Mark canonical English SEO excerpts separately from localized/custom metadata. |
| `app/globals.css` | Fix intrinsic signup input overflow and preserve native hidden behavior for optional fields. |
| `app/layout.tsx` | Pass persistent preference separately and use a route-reactive public styling boundary. |
| `app/public-audience.css` | Keep compact teacher task context visible below the desktop breakpoint. |
| `app/public-design.css` | Bound the locale fallback notice, enlarge the search-clear target and correct focus-ring contrast. |
| `app/resources/page.tsx` | Mark English promoted article metadata without changing translated resource copy. |
| `app/reviews/page.tsx` | Use complete five-language use-case sections and CTAs, preserving canonical and honest framing. |
| `app/tools/page.tsx` | Translate the directory shell and label reference-only timer/replay entries truthfully. |
| `app/voice-in-motion.css` | Bound decorative ambient animations while retaining reduced-motion rules and hero pause control. |
| `components/blog-library.tsx` | Preserve focus on reset/expansion, language metadata and a single live result announcement. |
| `components/cookie-consent.tsx` | Use five-language choices and restore focus after saving/rejecting. |
| `components/editorial-home.tsx` | Identify embedded English questions without redesigning the homepage. |
| `components/editorial-public-header.tsx` | Align effective locale, localized landmarks and visible fallback explanation. |
| `components/pricing-cards.tsx` | Keep critical commercial terms adjacent to the CTA and mark English learning examples. |
| `components/providers.tsx` | Separate saved preference from route-effective locale and refresh server/client copy together. |
| `components/public/audience-scene.tsx` | Mark English prompts, transcripts and writing examples. |
| `components/public/library-search.tsx` | Separate input/button semantics and restore input focus after clearing. |
| `components/public/page-frame.tsx` | Follow the client pathname so persistent layouts cannot leak or lose public styles. |
| `components/public/page-primitives.tsx` | Support separate learning-content language and move route-aware framing to its owner. |
| `components/public/public-semantics.test.tsx` | Validate rendered route boundaries, labels, panel relations, inert scenes and single-link cards. |
| `components/public/tool-directory.tsx` | Use multilingual discovery logic, meaningful search names, focusable panels and reset focus. |
| `components/resource-library.tsx` | Preserve focus after reset/show-more and avoid duplicate live announcements. |
| `components/voice-in-motion/feedback-transformation.tsx` | Identify English answer fragments and transcripts. |
| `components/voice-in-motion/product-scenes.tsx` | Identify English hero questions, transcripts and class tasks. |
| `docs/2026-11-06-regression-audit.md` | Record findings, evidence, implemented behavior, validation and remaining boundaries. |
| `lib/billing-entitlements.test.ts` | Cover expiry, renewals, cancellation, repeated grants, delayed events and refunds. |
| `lib/billing-entitlements.ts` | Deterministically project subscription, fixed-duration and Lifetime grants by provider source/revision. |
| `lib/commerce.ts` | Reuse canonical pricing copy and actual quotas in the account comparison, removing invented feedback tiers. |
| `lib/client-motion.test.ts` | Exercise reduced-motion, hidden-document and server-rendering guards. |
| `lib/cookie-consent-copy.ts` | Own five-language cookie UI text without duplicating consent logic. |
| `lib/discovery-refinement-copy.ts` | Complete translated reviews, tools shell, CTAs and search-purpose labels. |
| `lib/language.ts` | Resolve server-effective language while exposing the persistent preference separately. |
| `lib/pricing-copy.ts` | Canonical five-language qualified trial and 12-month single-payment terms. |
| `lib/public-locale.ts` | Define route support and effective-language policy without mutating preference. |
| `lib/public-navigation.test.ts` | Protect styling exclusions and route transitions. |
| `lib/public-navigation.ts` | Own localized navigation landmarks and styling-boundary policy. |
| `lib/public-regression.test.ts` | Validate locale fallback/restoration, translation coverage, terms, checkout selection and multilingual search. |
| `lib/server/auth.ts` | Enforce projected access expiry at authenticated profile reads. |
| `lib/server/billing-ledger.integration.test.ts` | Ten guarded real-PostgreSQL scenarios including concurrency, rollback and account claiming. |
| `lib/server/billing-ledger.ts` | Atomic serialized audit/cache ingestion, legacy idempotency and read-time access projection. |
| `lib/server/lemon.test.ts` | Protect date separation and partial-to-full refund identity. |
| `lib/server/lemon.ts` | Separate trial/access dates, trust merchant identity and retain distinct refund revisions. |
| `lib/store.test.ts` | Verify memory-mode annual expiry before quotas and session creation. |
| `lib/store.ts` | Use ledger-backed entitlement reads and matching memory-mode quota boundaries. |
| `lib/tab-navigation.ts` | Exclude disabled and nested tabs from roving navigation. |
| `lib/tool-search.ts` | Normalize accent/Turkish-I matching and index five-language task concepts. |
| `lib/types.ts` | Expose explicit access boundary and billing kind on member profiles. |
| `vitest.config.ts` | Enable automatic JSX transformation for dependency-free rendered component checks. |
