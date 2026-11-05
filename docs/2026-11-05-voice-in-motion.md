# SpeakAce 2.0 — Voice in Motion

## Audit and direction

Baseline: 1471028, verified live desktop and 390px mobile. Next 15 / React 19, local DM Sans + Instrument Serif, paper/cobalt/lime. Homepage owns its navigation and footer; global SEO and app integrations remain outside this change. Existing scene stacks, native FAQ, keyboard navigation and shared timing tokens remain useful. The first phase's generic group reveals must not compete with the new product scenes.

References opened in both the browser and web reader:

- [Foundable](https://foundable.com/tr): clear central product input, a single coherent visual world and product/artifact storytelling in accessible content.
- [Holo](https://tryholo.ai/): substantial dimensional product composition with small contextual capability labels, rather than a tiny decorative illustration.
- [MAIN AI](https://mainai.works/): large concentric technical visual field and confident hierarchy. Web reader returned 502; the actual browser rendered the page.
- [Gamma](https://gamma.app/tr): varied visual artifacts below the hero, a coherent color field and clear product category navigation.

These are verified layout observations, not claims about specific timing or animation internals. No reference assets or brand styles are copied.

## Implementation map

1. Shared original Voice Signal SVG + deterministic illustrative voice bars, with viewport/visibility/reduced-motion lifecycle.
2. Assemble a substantial hero product scene: existing question, voice, authored transcript, specific feedback and next-attempt destination.
3. Recompose the existing practice room with dimensional question/audio layers, a signal connection and a phrase-focused reversible answer transformation.
4. One desktop sticky journey: the same question, voice, transcript and retry objects change position as scroll progresses. Natural scrolling, reversible progress, resize handling. Three independent visual chapters on mobile/reduced motion.
5. Audience-specific personal journal, assignment review and programme/class compositions using existing capabilities. Keep original notes and links.
6. A restrained dimensional Plus treatment and a closing Voice Signal drawing tie the page together.

Use native CSS/SVG/Web Animations and an isolated passive/rAF scroll bridge. No extra animation dependency, WebGL, provider calls or app-workflow changes. Examples use authored home demo data, remain clearly illustrative and never show a generated score or pretend to record.

## Validation record (5 November 2026)

- Real browser inspections: desktop, tablet and mobile. Final checks at 320, 375, 390, 768, 1024 and 1440 CSS pixels have zero horizontal overflow. Mobile has three visual chapters, with no product object clipped by the chapter canvas. Mobile question buttons are at least 44px.
- Hero cards use intrinsic rows below 1190px; this resolved min-content growth from the waveform and prevents translated text from sitting under another artifact. At 390px the main product question and voice visualization are visible in the first viewport.
- Reversible scroll stages verified at 0 -> 1 -> 2 and browser back to 1. Stage ranges follow narrative chapter centers, with a sticky desktop canvas and natural page scrolling. Resize switches to stacked visual chapters.
- Rapid seven-click retry test: correct final state, unique active IDs, focus remains on show-retry, identical answer-panel height before/after. Phrase prompt/detail accessibility switches with the actual selected state; every topic uses its matching authored transcript and correction.
- Audience pointer + arrow-key switching verified: teacher assignment review and school programme links are correct. Only the active audience scene runs; inactive scenes are inert and paused.
- Pause/resume control verified. One-shot assembly settles to its final readable composition on leaving view or hiding the page; ambient CSS loops pause. Scroll animations remain directly controlled by user scrolling. No per-frame React state.
- Chrome Rendering's actual prefers-reduced-motion: reduce override tested: hero and waveform animations are none, preview transition is 0s, desktop sticky illustration is hidden and all three static visual chapters are shown. Native accessible control activation changed the authored example correctly. Override reset to No emulation and DevTools closed afterward.
- EN/TR, mobile menu and language selection, keyboard focus, disclosure semantics and final signal entry inspected. No application JavaScript errors in the checks; browser-extension messages excluded. Anonymous account/plan 401 is pre-existing.
- Targeted ESLint passed; 39 test files / 218 tests passed; optimized production build passed. Baseline homepage route 11.4 kB / First Load JS 121 kB; final homepage route 18.3 kB / First Load JS 128 kB (rounded build output). No package dependency changed.

Limitations: Chrome viewport testing is not physical touch-device testing. Safari/Firefox, screen-reader spoken output and real-user LCP/CLS/INP were not measured. Bundle/build and geometry checks are not a substitute for field Core Web Vitals. No real provider requests, account registrations, mail sends or purchases were needed for this frontend change.

## Complete source map

- components/voice-in-motion/voice-signal.tsx: original shared SVG motif and authored illustrative bars.
- components/voice-in-motion/use-scene-life.ts: visibility, reduced-motion, selection and finite-timeline settlement.
- components/voice-in-motion/product-scenes.tsx: assembled hero, practice audio layer, student/teacher/school compositions and final signal. Fine-pointer depth uses cached geometry and a single pending frame.
- components/voice-in-motion/feedback-transformation.tsx: a specific phrase revealed through its annotation path, masked authored answer, preserved focus and stable geometry.
- components/voice-in-motion/scroll-practice-journey.tsx: shared-object native animation timelines, passive scroll and measured chapter ranges; independent mobile chapters.
- components/editorial-home.tsx: integrates scenes while retaining copy, questions, navigation, plans, FAQ and product links.
- app/voice-in-motion.css + app/page.tsx: homepage-scoped art direction and motion. Existing shared tokens are extended; no duplicate design system or animation runtime.
- PROJECT_CONTEXT.md + this document: operating map and evidence.

## Deliberate choices

No new dependency, WebGL, video background, reference artwork, random particles, live-recording simulation, official score animation, fake learner statistics or automatic question carousel. Learning progress is a labelled illustrative question -> review -> retry pathway rather than an invented performance chart. Existing app/auth/billing/email/database behavior remains in its owning modules.

The meaningful new visual scenes are the assembled hero, connected practice room, phrase transformation, three-stage shared-object journey, audience-specific product scenes and signal-led closing CTA. Long reading, actual scores and authenticated workflows stay calm.
