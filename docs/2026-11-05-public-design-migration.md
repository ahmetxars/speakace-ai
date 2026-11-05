# Public design migration — 5 November 2026

## Protected baseline and source of truth

Baseline b244dab. The homepage hero, product assembly, Practice Room, phrase transformation, scroll journey, audience switcher and closing scene are protected. Desktop/mobile initial and full-page baseline images are saved under the ignored dist/qa/public-migration directory. The long topics page exceeded the browser screenshot timeout for its mobile full-page capture; its initial viewport and semantic section checks remain available.

Canonical observed values: paper #f5f4ee; ink #202722; cobalt #3155df; lime #e5edab; muted #60675f; line #dcded4; white #fff. Content width 1280px with 48px desktop outer spacing, 20px mobile. Main button radius 5px, 56px desktop primary action; product panel radius 8px. Header height 104px at 1440. Body is DM Sans, italic emphasis Instrument Serif. Importantly, the live homepage H1 computes to the existing Manrope/ui-sans-serif/system-ui stack, not DM Sans; preserve that exact heading stack rather than guessing a replacement.

## Findings and migration contract

- Two public header/wordmark families and two footer implementations. Build one shared header and footer family; retain the compact homepage footer and appearance. Keep the workspace shell separate.
- Audience pages show static score/percentage fixtures and a false-looking Updated now cue. Replace with labelled, capability-based original learner, teacher and programme scenes; preserve five-locale value propositions, paths and lead forms.
- Pricing is repetitive; weekly-to-monthly arithmetic and a weekly crossed-out value beside an annual price are misleading. Rebuild around the real selected offer and one comparison.
- Read-only provider inspection verified weekly $3.99/week with a 3-day trial; annual checkout shows $49.99 payable upfront and no trial or recurring billing text. Do not invent an automatic annual-renewal promise. Owner clarification requested while independent migration continues.
- Code entitlements: PLAN_LIMITS supplies 4/8 and 18/35 speaking quotas. Existing result view gives practice feedback/transcript to Free as well; paid report export is gated. Do not invent a Free feedback blur/gate. Legacy PLAN_LIMITS.price is not the commercial source; commerceNumbers and the actual provider offer are.
- Resources/blog filters and forms already work. Reuse their result/query state, add shared editorial cards and search controls, keep motion out of typing/reading.
- Legal files must remain byte-identical. Auth, recording, classroom and billing APIs remain in their existing owners. Public route coverage includes SEO landings, tools, nested editorial pages, aliases and intentional system/share states.
- Full live initial inspection covered the static marketing routes; compare currently has 88px desktop horizontal overflow. Dynamic families are audited through their shared template and a published representative. A valid shared-result URL is not available for visual QA; do not fabricate one.

## Architecture

One public token source extracted from the homepage, a public frame and composable hero/section/CTA/card/form primitives. Native disclosure navigation reuses the repository's existing details pattern with keyboard, outside-click and route-change dismissal. New audience scenes share the Voice Signal motif but have distinct compositions. No second pinned story on internal pages. Pricing, consent and checkout state remain real and explicit.

## Route inventory

| Route pattern | Owning family | Existing component entry points |
| --- | --- | --- |
| /about | Reading / shared public frame |  |
| /ai-english-speaking-practice | SEO landing / replace legacy component | marketing-page |
| /auth | Focused account shell / preserve form | providers |
| /blog/[slug] | Editorial / preserve article content | adsense-unit, blog-audio-example, blog-reading-enhancements |
| /blog/ielts-speaking-part-1-sample-answers | Editorial / preserve article content |  |
| /blog/ielts-speaking-part-2-cue-card-examples | Editorial / preserve article content |  |
| /blog/ielts-speaking-part-2-sample-answer | Editorial / preserve article content |  |
| /blog | Editorial / preserve article content | adsense-unit, blog-library |
| /case-studies | Reading / shared public frame |  |
| /compare/[slug] | Reading / shared public frame |  |
| /compare | Reading / shared public frame | adsense-unit, compare-hub |
| /contact | Reading / shared public frame |  |
| /cookie-policy | Reading / shared public frame |  |
| /daily-ielts-speaking-prompt | Reading / shared public frame | adsense-unit |
| /english-speaking-confidence | Reading / shared public frame |  |
| /for-schools | Audience page / complete rebuild | audience-page |
| /for-students | Audience page / complete rebuild | audience-page |
| /for-teachers | Audience page / complete rebuild | audience-page |
| /free-ielts-speaking-test | Reading / shared public frame | adsense-unit, mini-speaking-demo |
| /guides/[slug] | Reading / shared public frame | adsense-unit, lead-capture-form |
| /guides | Reading / shared public frame | adsense-unit |
| /ielts-band-estimator | Tool / preserve interaction |  |
| /ielts-band-score-guide | Reading / shared public frame | adsense-unit |
| /ielts-speaking-ai | SEO landing / replace legacy component | marketing-page |
| /ielts-speaking-part-1-questions | Reading / shared public frame |  |
| /ielts-speaking-part-2-topics | Reading / shared public frame |  |
| /ielts-speaking-part-3-questions | Reading / shared public frame |  |
| /ielts-speaking-practice | SEO landing / replace legacy component | marketing-page |
| /ielts-speaking-sample-answers | Reading / shared public frame | adsense-unit |
| /ielts-speaking-topics/[slug] | Reading / shared public frame |  |
| /ielts-speaking-topics | Reading / shared public frame | adsense-unit, tracked-link |
| /ielts-writing-ai | Reading / shared public frame |  |
| /improve-ielts-speaking-score | SEO landing / replace legacy component | marketing-page |
| /maintenance | Intentional standalone system status |  |
| / | Protected homepage | marketing-schema, editorial-home |
| /pricing | Pricing / complete rebuild | pricing-cards, tracked-link |
| /privacy-policy | Reading / shared public frame |  |
| /resources | Resource discovery / shared library | adsense-unit, lead-capture-form, resource-library |
| /reviews | Reading / shared public frame | adsense-unit, tracked-link |
| /share/[slug] | Shared result / preserve permission boundary | share-attribution-capture |
| /speaking-phrase-bank | Tool / preserve interaction |  |
| /speaking-test-simulator-ielts | SEO landing / replace legacy component | marketing-page |
| /speaking-timer | Tool / preserve interaction |  |
| /success-stories | Reading / shared public frame |  |
| /teacher-demo | Teacher demo / preserve fixture and controls | teacher-demo-page |
| /terms | Reading / shared public frame |  |
| /toefl-speaking-practice | SEO landing / replace legacy component | marketing-page |
| /tools/[slug] | Tool / preserve interaction | ielts-speaking-band-calculator, lead-capture-form, tool-workbench |
| /tools | Tool / preserve interaction |  |
| /unsubscribe | Reading / shared public frame |  |
| /weekly-ielts-speaking-challenge | Reading / shared public frame | adsense-unit |

## Validation

Implementation and final route-by-route results are recorded below as work completes.


## Implemented system

- `app/public-tokens.css` owns paper, ink, cobalt, lime, borders, type families, radii and public motion values. The homepage aliases these values without changing its computed identity.
- `components/public/page-primitives.tsx` supplies the public frame, hero, section, CTA, buttons, breadcrumb and resource card. `app/public-design.css` owns their styles and the public reading/tool anatomy. The frame excludes the homepage, private workspaces, admin and the intentional maintenance state.
- `EditorialPublicHeader` is the single public header, with an account variant. The homepage imports it directly. Native details retain semantic disclosure behavior; enhanced controls add Arrow/Home/End navigation, Escape focus restoration, outside-click, route-change and mutually exclusive menus. Resources has a destination link and a separate disclosure. Compact mobile CTA labels accommodate translated text. `PublicFooter` has compact and expanded variants of the same original mark and typographic system.
- Removed 471 obsolete public CSS rules from the old programme, resource, editorial, about and teacher-demo families. Their current owners are the public system. Removed the global sales sticky CTA so it does not compete with reading, filters or the selected pricing offer.
- Students, teachers and schools have distinct product compositions: a speaking/writing notebook, an attempt-review/assignment/class-communication workspace, and a connected programme-role map. Three feature tabs select meaningful scenes. Their workflow is a compact illustrated sequence. Existing five-locale audience content and lead-source identifiers remain. When commercial email is unavailable, the lead area becomes a useful contact section; it does not promise an automated checklist or display an unavailable subscription form.
- Product scenes reuse the original Voice Signal and the existing visibility/reduced-motion lifecycle. Assembly is finite; waveform motion lasts under two seconds. No additional pinned scroll stories, animation framework or runtime dependency was added. Reading and search results remain quiet while typing.
- Pricing is one offer decision, Free/Plus cards, one entitlement comparison, an interactive allowance/report example, payment steps, billing FAQ, school link and one final CTA. Limits derive from `PLAN_LIMITS`; both Free and Plus receive real practice feedback. Free has 4 daily sessions/8 speaking minutes and Plus 18/35. PDF export is the real paid distinction. Removed guaranteed-score, private-tutoring-price and misleading crossed-out-price language. The example does not invent a gated full-feedback feature.
- Resources and Blog share `ResourceCard` and `LibrarySearch`, preserving category/search/deferred results/show-more behavior and adding explicit clear-search controls. Topic questions, article content/anchors, metadata, published blog data, timer, calculations and recording handlers remain with their existing owners. The old generic marketing component was replaced with the same public primitives and the actual mini demo.
- About, Contact, Reviews, tool discovery, free-test and topic hubs have new compositions. Reviews uses product use cases. Case studies no longer present unverified band improvements or two/three-week success timelines as observed customer evidence.
- Teacher demo retains clearly labelled illustrative fixtures and its four views. Tabs now expose full ARIA relationships/roving keyboard focus. The priority button expands useful details; the roster control opens the student view instead of remaining inert.
- Privacy, Terms and Cookie Policy source files are byte-identical to the baseline. Signup/login/role/checkout/webhook/database/email-consent rules were not changed. Auth uses the shared brand and focused header; workspaces keep their existing header and permissions.

## Billing decision and actual provider conditions

The public Lemon Squeezy weekly checkout was inspected directly: $3.99 per week, with a three-day free trial. The existing Plus Annual checkout was also inspected directly: $49.99 as a single payment, with no recurring or trial wording. The user initially requested twelve-month automatic renewal, then explicitly instructed **not to change the provider for now**. No merchant setting, existing purchase, webhook, checkout URL or environment variable was changed.

The redesigned price selector therefore says **Plus Annual · one payment** and explains the actual single payment without promising automatic annual renewal or a free annual trial. It does not infer an access expiry or permanent entitlement from the product name. The weekly and existing one-payment checkout destinations are preserved, including account attribution, paid-account management and server-owned checkout tracking. Future recurring annual billing remains a separate merchant configuration change.

## Verification record

- `npm run test`: 39 files / 218 tests passed, including consent, roles, auth redirects, checkout and webhook entitlement tests.
- TypeScript and production build passed. A production-mode HTTP sweep of 50 concrete public URLs returned 200 with H1 content; ten additional server-render checks confirmed the student and price pages in all five public languages. ESLint has zero errors and 18 existing warnings in unaffected workspace/result/server files. The generated Next.js `next-env.d.ts` is ignored by lint, alongside other generated outputs; source lint rules remain enabled.
- Route inventory: 51 public route patterns. All 45 concrete static routes (including aliases, maintenance, auth and invalid-token unsubscribe) were inspected, plus published representatives of five dynamic families. Shared-result permissions were reviewed in source; there was no valid public share fixture to expose or invent.
- Responsive matrix: homepage plus 14 priority routes at **320, 375, 390, 768, 1024 and 1440 CSS pixels**: **90 checks, zero horizontal overflow**, all H1 content present. Thirty other static routes and five nested representatives also passed the 390px mobile check; `/compare` changed from 88px desktop overflow to zero.
- Desktop keyboard navigation: ArrowDown opens/focuses disclosure links, arrows move between links, Escape closes and restores the trigger. Audience/resource menus and outside-click dismissal were exercised. All three audience feature explorers were activated by keyboard; pricing allowance/offer toggles, resource categories, empty search and clear-search were exercised.
- Calculator: four self-ratings of 7 produce 7.0 and correctly report no unique weakest criterion. Timer preset, start, pause and reset were exercised. Teacher student view and expanded priorities were exercised.
- Reduced motion was actually emulated in Chrome DevTools. Both school scenes reported `data-motion="still"` and computed `animation-name: none`, with visible content. Emulation was reset and DevTools closed afterward.
- Homepage `<main id="main">` remains byte-identical. At matched 1440px / 100% browser zoom, all recorded properties of **seven protected elements match exactly**: hero H1, primary button, hero product, journey story, footer, header and workbench. This includes dimensions, fonts, colors and radii. Shared navigation destinations/disclosures and auth awareness are the intentional visible homepage differences.
- Desktop initial/full-page captures and mobile initial captures are in ignored `dist/qa/public-migration/`. The very long topics mobile full-page capture exceeded the browser screenshot limit; its initial view, visible question content and overflow checks passed. Raw route/viewport measurements are stored beside the captures.
- Build first-load JS: homepage 137 kB, pricing 123 kB, resources 121 kB, teacher demo 128 kB; shared base 102 kB. The homepage is approximately 9 kB above the previous 128 kB baseline due to the richer shared public navigation/localized chrome. No new runtime dependencies or external trackers were introduced. Unrelated global CSS selectors/declarations were compared semantically against the baseline after excluding only the migrated namespaces.

## Limits of this phase

No payment was completed and no merchant settings were changed. No microphone recording, private shared report, new account registration or marketing email was submitted during this design migration. Those protected handlers remain covered by existing server tests and the restoration record. The sender-readiness restriction remains in force. Existing editorial articles and comparison content are preserved; their factual claims were not re-researched as part of a visual migration. A later browser connection interruption prevented completing the final exhaustive locale matrix; completed locale checks and the shared five-locale source remain available, and the six-width route matrix is fully recorded.
