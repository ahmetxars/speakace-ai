# SpeakAce product refinement — 6 November 2026

Baseline: `671abe5c617fba27caedf31e8918efcf2644439c`. Current public production and source were audited before UI edits. The homepage identity and application/payment/authentication boundaries remain the reference.

## Verified audit

| Severity | Routes / owner | Verified problem | Refinement / expected benefit |
| --- | --- | --- | --- |
| High | `/pricing`, `PricingCards` | First displayed price starts at y=742px at 1440px and y=642px at 390px. The long hero delays the decision. The comparison table precedes the interactive benefit example. | Shorten the introduction, lift offer cards and terms, make the allowance/report comparison the primary explanation, group the reference table. |
| High | All three audience pages | One shared JSX sequence and two instances of the same scene produce near-identical composition. Student state 2 changes to writing instead of completing an answer → feedback → retry learning example. | Keep a common shell, create a learner answer lab, teacher assignment/review/lesson workspace, and school role/pilot presentation with distinct page bodies. |
| Medium | `/for-teachers` | Current scene starts with attempt review and ends with class communication. It never demonstrates the complete create-assignment → review → lesson-note decision. | Add a reversible classroom walkthrough with persistent task/class context and three actual product decisions. |
| Medium | `/for-schools` | Role map highlights roles but does not provide an explicitly labelled role selector or role-specific work to inspect. | Connect learner/teacher/coordinator perspectives with a restrained pilot timeline and a direct email next step. |
| Medium | `/tools` | All 19 detail tools are rendered in one undifferentiated helper grid below three starter tools. | Organize real destinations by speaking practice, level/score understanding and answer improvement; add lightweight discovery controls and honest tool kinds. |
| Medium | Header / nested articles and tools | Resources active state checks only `/resources`. Blog/tool detail pages have no active ecosystem indicator. Home language selector advertises fewer choices without explaining the translation difference. | Map nested routes to their owning nav section; make supported locale availability explicit and consistent with the existing homepage EN/TR content. |
| Medium | `public-design.css` | The stylesheet contains repeated audience animation declarations and several late additions for the same header/contact patterns. | Consolidate owning styles and shared timing tokens; create one dedicated file per genuinely distinct product scene rather than append override layers. |
| Low | Resources / Blog | Search/category controls work, but user intent is implicit; the blog featured article reappears in the archive, and cards expose two same-destination links per item. | Add real intent paths, avoid repeated prominent picks, simplify card focus targets and make result position/count language clear. |
| Low | `/reviews` | Content is honest product-use commentary, but the URL and some entry points can still imply customer reviews. | Keep the URL/canonical, label the page and every entry point as product experience; explain the absence of testimonial claims. |

## Baseline evidence

Thirteen required routes were inspected in the real browser at desktop and mobile widths. Initial measured horizontal overflow is zero; no new overflow defect is claimed. Desktop full-page and mobile screenshots plus DOM measurements are in ignored `dist/qa/refinement-2026-11-06/`. Published blog, guide and calculator representatives were also inspected. Cookie choices and existing recording/payment boundaries remain functional requirements.

## Implementation and validation

### Shipped compositions and interactions

- `/pricing`: compact hero; paired Free/Plus cards; both prices visible in a mobile summary; renewal/trial/single-payment terms beside Plus; shared feedback explained once; the manual allowance/PDF demonstration precedes a grouped comparison table; account linking, trial eligibility and purchase/refund contact added. All quotas still read `PLAN_LIMITS`; existing checkout/tracking/account logic remains in place.
- `/for-students`: a finite authored learner notebook and a manual first-answer → feedback → retry lab for the same question. The intrinsic scene stack reserves the largest panel. Writing is a separate compact feature with its actual workspace destination.
- `/for-teachers`: a persistent class/task context with assignment → illustrative attempts → next lesson note. Demo, signup and contact have separate destinations.
- `/for-schools`: a restrained programme composition with Learner / Teacher / Coordinator tabs, meaningful role-specific steps and a pilot timeline. Pilot contact is an actual email action, and the teacher demo is labelled as such.
- `/resources`: four intent shortcuts select real library categories; query, category, empty state, clear and show-more continue working. Result counts show displayed/total. Existing concise SEO titles also improve reading recommendations.
- `/blog`: featured content and learning paths remain; promoted articles move later in the full searchable archive. No post, URL, metadata or schema was removed. Archive reset/display counts improved.
- `/tools`: 22 existing tools now have purpose groups, search, reset and an explicit practice-aid limitation. Tool implementations are retained.
- `/reviews`: canonical retained; hero and footer entry points describe product experience and explicitly state that no verified testimonials are presented.
- Shared chrome: nested blog/guide/tool pages keep their Resources parent active; teacher demo belongs to the audience section; the direct Resources link remains separate from its disclosure; disclosure touch area improved. Five language choices are consistent, with unsupported homepage translations disabled and an explanatory title. Auth-aware existing destinations are retained.
- Shared cards now use one focus destination per card. Removed 31 obsolete audience feature/workflow CSS rules. New audience compositions have one owning stylesheet and reuse the existing colour, type and motion tokens. Avoided double parent/child panel animations; keyboard changes are immediate.
- Fixed a browser-observed article hydration mismatch: speech support now resolves after hydration, with an English browser-voice sample and accurate browser audio wording.

### Regression and evidence

- Before/after screenshots for all 13 principal public routes are saved under `dist/qa/refinement-2026-11-06/`, alongside responsive and interaction JSON. Browser coverage includes 375, 390, 768, 1024 and 1440 CSS-pixel widths. The browser's per-origin zoom quantizes the requested 320px width to 319/321px; both bracketing widths were checked. All inspected routes had one H1 and zero horizontal overflow. This is not a claim of physical-device or cross-browser testing.
- Pointer and keyboard tests cover all three audience walkthroughs (three states, Arrow/Home), mobile disclosure/Escape, resource/blog search-empty-reset-show-more, tool purpose/search/reset, plan/offer switching, trial FAQ, timer preset/start/pause/reset and a calculator input. `interactions.json` records observed values. Five pricing UI locales were exercised without overflow.
- Student, teacher and school panel heights remained constant across their three selections at desktop. No new forced timed/autoplay user interaction was introduced.
- Reduced-motion CSS/hook paths and keyboard instant changes were inspected; this browser connection does not expose media-preference emulation, so a native reduced-motion preference run is not claimed. No screen-reader or Lighthouse certification is claimed.
- Original homepage main source, editorial stylesheet, homepage motion stylesheet, privacy/terms/cookie text and billing/entitlement configuration are unchanged. Main text matches production; 1440px section geometry differed by at most 5px under the local browser zoom/font rasterization. The homepage first-load bundle is 138kB versus the 137kB baseline (shared navigation/accessibility changes; no new homepage scenes or animation libraries).
- All 51 original public route source patterns still exist. Existing content and private workspace/API/DB behavior were preserved.
- Public Lemon Squeezy checkout was inspected without submitting data: weekly is $3.99/week with a three-day trial; Plus Annual shows $49.99 single payment. Provider configuration was not changed.
- Final production-server HTTP sweep: 45 concrete routes plus five published dynamic representatives returned HTTP 200 with one H1 (50/50). Calculator self-rating changed to a correctly recalculated 6.5 estimate / 6.50 average. Final built narrow checks at both 319px and 321px remain overflow-free.
- Final first-load bundles: homepage 138kB; pricing 125kB; resources 125kB; blog 121kB; tools 120kB; audiences 144kB. Localized copy is split into separate modules to avoid loading unrelated page-family strings. No new dependency was added.
- Validation: 40 test files / 221 tests pass; production build generates all 205 pages; lint has zero errors and the same 18 pre-existing warnings. Build and QA logs are in the ignored evidence directory.

### Practical limitations

No purchase, signup, microphone permission, new real class data or merchant setting change was performed for this design phase. A full paid/authenticated service audit from earlier restoration is not counted as new validation here. The public shared-report route still requires a valid user-provided public share fixture. Native reduced-motion, screen-reader, physical-device and field Core Web Vitals checks remain outside this browser run.
