import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSenseUnit } from "@/components/adsense-unit";
import { LeadCaptureForm } from "@/components/lead-capture-form";
import { guidePages } from "@/lib/seo-growth";
import { siteConfig } from "@/lib/site";

const BAND_SEVEN_GUIDE_SLUG = "ielts-speaking-band-6-to-7";
const INDEXABLE_GUIDE_SLUGS = new Set([BAND_SEVEN_GUIDE_SLUG]);

const bandSevenCriteria = [
  {
    number: "01",
    title: "Fluency and coherence",
    bandSixPattern:
      "You can speak at length, but searching for language, repeating yourself, or adding side points sometimes weakens the thread.",
    bandSevenEvidence:
      "Longer turns remain coherent. Some hesitation or self-correction can occur, but it does not make the listener reconstruct your argument.",
    retry:
      "Keep the same idea and shorten the route: direct answer, reason, specific example, short implication. Re-record without adding new content.",
    compare:
      "Count abandoned starts and places where the transcript changes direction mid-sentence. The second recording should contain fewer, not merely sound faster."
  },
  {
    number: "02",
    title: "Lexical resource",
    bandSixPattern:
      "You have enough vocabulary to explain the topic and can usually paraphrase, but repeated general words or inaccurate combinations limit flexibility.",
    bandSevenEvidence:
      "Vocabulary adapts to different topics, paraphrasing works when needed, and some less common language or collocation is used with reasonable control.",
    retry:
      "Underline two repeated words in the transcript. Replace one with a natural collocation and paraphrase the other idea; do not insert a list of memorised idioms.",
    compare:
      "Check whether both changes fit the meaning and register. A simpler accurate phrase is stronger evidence than an ambitious phrase used incorrectly."
  },
  {
    number: "03",
    title: "Grammatical range and accuracy",
    bandSixPattern:
      "You mix simple and complex forms, but control becomes less reliable when the sentence grows or when you try to express several relationships at once.",
    bandSevenEvidence:
      "Simple and complex structures are both useful, the range is more flexible, and accurate sentences occur frequently even though some errors remain.",
    retry:
      "Choose one recurring error, correct two examples from the transcript, and say the full answer again from notes. Do not read the corrected sentences aloud.",
    compare:
      "Look for the same grammar decision in a new sentence. That transfer matters more than producing one memorised correction perfectly."
  },
  {
    number: "04",
    title: "Pronunciation",
    bandSixPattern:
      "You are generally understandable, but control of rhythm, stress, intonation, or individual sounds varies and occasionally makes a phrase less clear.",
    bandSevenEvidence:
      "The profile keeps Band 6 intelligibility and adds some of the wider, more sustained pronunciation control described at Band 8.",
    retry:
      "Mark thought groups with slashes and one stressed word per group. Re-record at a calm pace, keeping word endings and key contrasts audible.",
    compare:
      "Listen once without the transcript. Note any phrase that needs a second listen; clarity and listener effort matter more than copying a particular accent."
  }
];

const retryProtocol = [
  {
    title: "Record a baseline",
    body: "Answer one Part 1, Part 2, or Part 3 prompt under realistic timing. Do not stop and restart when a sentence goes wrong."
  },
  {
    title: "Collect evidence",
    body: "Read the transcript while listening once. Mark pauses, repetitions, vague words, grammar patterns, and phrases that are difficult to understand."
  },
  {
    title: "Choose one criterion",
    body: "Use the four-criterion calculator or the checklist below. Pick the lowest area, even if another problem feels easier to fix."
  },
  {
    title: "Change the notes, not the script",
    body: "Write three to five keywords that support the chosen fix. Full sentences make the retry a reading or memory task instead of a speaking test."
  },
  {
    title: "Retry the same prompt",
    body: "Keep the core idea and approximate length stable. This control makes the difference between the two recordings easier to interpret."
  },
  {
    title: "Transfer once",
    body: "Use a different prompt with the same criterion focus. If the improvement disappears, repeat the drill before raising your self-rating."
  }
];

const cueCardNotes = [
  { label: "Anchor", example: "The one person, place, object, or event you will describe" },
  { label: "Sequence", example: "A simple before, turning point, and after order" },
  { label: "Two details", example: "One sensory or factual detail and one small example" },
  { label: "Meaning", example: "Why the experience matters or what changed afterwards" }
];

const bandSevenFaqs = [
  {
    question: "Can I reach IELTS Speaking Band 7 if I still make grammar mistakes?",
    answer:
      "Yes. The public Band 7 descriptors allow some errors. The stronger signal is a flexible range of simple and complex structures with frequent accurate sentences, rather than error-free speech throughout."
  },
  {
    question: "Should I repeat the same answer word for word?",
    answer:
      "No. Keep the prompt, core idea, and rough length similar, but speak again from short notes. The aim is to improve a speaking decision, not memorise a script."
  },
  {
    question: "How many times should I retry one IELTS Speaking prompt?",
    answer:
      "Usually one diagnostic retry and one transfer attempt are enough for a focused session. If you keep repeating without a single measurable target, the extra attempts provide little new evidence."
  },
  {
    question: "Do I need idioms to get Band 7 in IELTS Speaking?",
    answer:
      "You need flexible, appropriate vocabulary and effective paraphrasing. Some less common or idiomatic language can support Band 7, but forced idioms and inaccurate collocations can weaken the lexical evidence."
  },
  {
    question: "Should I cover every bullet on an IELTS Part 2 cue card?",
    answer:
      "The task-card points help you structure and extend the talk. Use them as a route through one coherent story, not as separate questions that require four disconnected mini-answers."
  }
];

function getGuideLinks(slug: string) {
  if (slug === BAND_SEVEN_GUIDE_SLUG) {
    return [
      { href: "/tools/ielts-speaking-band-score-calculator", label: "Estimate your speaking profile" },
      { href: "/app/practice", label: "Record a diagnostic retry" }
    ];
  }
  if (slug.includes("cue-card") || slug.includes("part-2")) {
    return [
      { href: "/ielts-speaking-part-2-topics", label: "Open Part 2 topics" },
      { href: "/tools/ielts-cue-card-generator", label: "Use cue card generator" }
    ];
  }
  if (slug.includes("fluency")) {
    return [
      { href: "/ielts-speaking-part-1-questions", label: "Practice Part 1 fluency" },
      { href: "/daily-ielts-speaking-prompt", label: "Open daily prompt" }
    ];
  }
  if (slug.includes("toefl")) {
    return [
      { href: "/toefl-speaking-practice", label: "Open TOEFL practice" },
      { href: "/speaking-timer", label: "Use speaking timer" }
    ];
  }
  return [
    { href: "/app/practice", label: "Start practice" },
    { href: "/pricing", label: "See Plus plan" }
  ];
}

export function generateStaticParams() {
  return guidePages.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = guidePages.find((item) => item.slug === slug);
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/guides/${page.slug}` },
    robots: { index: INDEXABLE_GUIDE_SLUGS.has(page.slug), follow: true },
    openGraph: {
      title: `${page.title} | SpeakAce`,
      description: page.description,
      url: `${siteConfig.domain}/guides/${page.slug}`,
      siteName: siteConfig.name,
      type: "article"
    }
  };
}

export default async function GuideDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = guidePages.find((item) => item.slug === slug);
  if (!page) notFound();
  const relatedLinks = getGuideLinks(page.slug);
  const isBandSevenGuide = page.slug === BAND_SEVEN_GUIDE_SLUG;
  const canonicalUrl = `${siteConfig.domain}/guides/${page.slug}`;

  if (isBandSevenGuide) {
    return (
      <>
        <main className="page-shell section band-seven-guide">
          <nav className="band-seven-guide__breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/guides">Guides</Link>
            <span aria-hidden="true">/</span>
            <span>Band 7 retry guide</span>
          </nav>

          <header className="band-seven-guide__hero">
            <div>
              <span className="eyebrow">Evidence-based retry plan</span>
              <h1>{page.title}: From Band 6 to Band 7</h1>
              <p>{page.intro}</p>
              <div className="band-seven-guide__hero-actions">
                <Link className="button button-primary" href="/tools/ielts-speaking-band-score-calculator">
                  Estimate your speaking profile
                </Link>
                <Link className="button button-secondary" href="/app/practice">
                  Record a free attempt
                </Link>
              </div>
            </div>
            <aside className="band-seven-guide__quick-answer">
              <span className="eyebrow">The short answer</span>
              <h2>Band 7 is controlled communication, not perfect English</h2>
              <p>
                The official public descriptors still allow hesitation, self-correction, and errors
                at Band 7. What changes from Band 6 is the consistency of coherence, flexibility,
                accurate sentence production, and listener-friendly delivery.
              </p>
              <dl>
                <div>
                  <dt>4</dt>
                  <dd>equally weighted criteria</dd>
                </div>
                <div>
                  <dt>1</dt>
                  <dd>criterion per retry</dd>
                </div>
              </dl>
            </aside>
          </header>

          <section className="band-seven-guide__section" aria-labelledby="band-seven-criteria-title">
            <div className="band-seven-guide__section-heading">
              <span className="eyebrow">Band 6 to 7 diagnosis</span>
              <h2 id="band-seven-criteria-title">Translate each descriptor into observable evidence</h2>
              <p>
                Do not score a recording from confidence alone. Compare what happened in the audio
                and transcript with a specific criterion, then design the retry around that gap.
              </p>
            </div>
            <div className="band-seven-guide__criteria">
              {bandSevenCriteria.map((criterion) => (
                <article key={criterion.title}>
                  <div className="band-seven-guide__criterion-title">
                    <span>{criterion.number}</span>
                    <h3>{criterion.title}</h3>
                  </div>
                  <dl>
                    <div>
                      <dt>Common Band 6 pattern</dt>
                      <dd>{criterion.bandSixPattern}</dd>
                    </div>
                    <div>
                      <dt>Band 7 evidence to look for</dt>
                      <dd>{criterion.bandSevenEvidence}</dd>
                    </div>
                    <div>
                      <dt>Controlled retry</dt>
                      <dd>{criterion.retry}</dd>
                    </div>
                    <div>
                      <dt>What to compare</dt>
                      <dd>{criterion.compare}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </section>

          <section className="band-seven-guide__retry" aria-labelledby="band-seven-retry-title">
            <div className="band-seven-guide__section-heading">
              <span className="eyebrow">The Band 7 retry loop</span>
              <h2 id="band-seven-retry-title">Six steps that make two recordings comparable</h2>
              <p>
                A retry works when one variable changes. If you switch the question, story,
                vocabulary list, structure, and timing together, you cannot tell what helped.
              </p>
            </div>
            <ol>
              {retryProtocol.map((step, index) => (
                <li key={step.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <aside>
              <strong>The control rule</strong>
              <p>
                Same prompt, same core idea, similar speaking time, one criterion change. Move to a
                new prompt only after you can explain what improved and point to evidence.
              </p>
            </aside>
          </section>

          <section className="band-seven-guide__cue-card" aria-labelledby="band-seven-cue-card-title">
            <div className="band-seven-guide__section-heading">
              <span className="eyebrow">Part 2 cue-card strategy</span>
              <h2 id="band-seven-cue-card-title">Use the one-minute preparation time to build a route, not a script</h2>
              <p>
                In Part 2, IELTS gives you one minute to prepare and expects you to keep talking for
                up to two minutes. Four compact note zones are enough to hold a coherent answer.
              </p>
            </div>
            <div className="band-seven-guide__cue-layout">
              <div className="band-seven-guide__note-map" aria-label="Four-zone cue card note map">
                {cueCardNotes.map((note, index) => (
                  <div key={note.label}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{note.label}</strong>
                    <p>{note.example}</p>
                  </div>
                ))}
              </div>
              <aside className="band-seven-guide__worked-example">
                <span className="eyebrow">Worked note example</span>
                <h3>Describe a skill you learned</h3>
                <dl>
                  <div>
                    <dt>Anchor</dt>
                    <dd>Cooking at university</dd>
                  </div>
                  <div>
                    <dt>Sequence</dt>
                    <dd>Failed first meal, practised weekly, cooked for family</dd>
                  </div>
                  <div>
                    <dt>Details</dt>
                    <dd>Video recipe, burnt sauce, Sunday routine</dd>
                  </div>
                  <div>
                    <dt>Meaning</dt>
                    <dd>More independent and willing to make mistakes</dd>
                  </div>
                </dl>
              </aside>
            </div>

            <div className="band-seven-guide__cue-retries">
              <article>
                <span>First attempt</span>
                <h3>Diagnose the story, not the score</h3>
                <p>
                  Notice where you list bullet points, repeat a connector, abandon a sentence, or
                  give a detail that does not support the main story. Choose the one problem tied to
                  your lowest criterion.
                </p>
              </article>
              <article>
                <span>Second attempt</span>
                <h3>Keep the story and change one speaking decision</h3>
                <p>
                  A fluency retry may simplify the sequence. A lexical retry may replace two vague
                  words. A grammar retry may repair one recurring form. A pronunciation retry may
                  mark thought groups and contrastive stress.
                </p>
              </article>
              <article>
                <span>Transfer attempt</span>
                <h3>Use a new cue card with the same criterion focus</h3>
                <p>
                  Transfer reveals whether you learned a reusable speaking behaviour or simply
                  became familiar with one story. Keep the four-zone note map and change the topic.
                </p>
              </article>
            </div>
          </section>

          <section className="band-seven-guide__session-plan" aria-labelledby="band-seven-session-plan-title">
            <div className="band-seven-guide__section-heading">
              <span className="eyebrow">Four-session micro-cycle</span>
              <h2 id="band-seven-session-plan-title">Repeat the method across one study week</h2>
            </div>
            <div className="band-seven-guide__session-grid">
              <article>
                <span>Session 1</span>
                <h3>Baseline and profile</h3>
                <p>Record one Part 2 answer, score all four criteria, and select the lowest one.</p>
              </article>
              <article>
                <span>Session 2</span>
                <h3>Same-prompt retry</h3>
                <p>Use the matched drill above and compare the new audio and transcript with the baseline.</p>
              </article>
              <article>
                <span>Session 3</span>
                <h3>Transfer prompt</h3>
                <p>Change the topic but keep the same criterion goal. Do not add a second improvement target.</p>
              </article>
              <article>
                <span>Session 4</span>
                <h3>Re-score with evidence</h3>
                <p>Raise a self-rating only if the improvement appears in both the retry and transfer recording.</p>
              </article>
            </div>
          </section>

          <section className="band-seven-guide__sources" aria-labelledby="band-seven-sources-title">
            <div>
              <span className="eyebrow">Primary references</span>
              <h2 id="band-seven-sources-title">Verify the criteria at the source</h2>
              <p>
                This guide paraphrases public IELTS information for study planning. SpeakAce is not
                affiliated with or endorsed by IELTS, and practice feedback is not an official score.
              </p>
            </div>
            <div>
              <a href="https://ielts.org/cdn/ielts-guides/ielts-speaking-band-descriptors.pdf" target="_blank" rel="noreferrer">
                Official IELTS Speaking band descriptors (PDF)
              </a>
              <a href="https://ielts.org/take-a-test/your-results/ielts-scoring-in-detail" target="_blank" rel="noreferrer">
                IELTS scoring in detail
              </a>
              <a href="https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-speaking" target="_blank" rel="noreferrer">
                Official IELTS Speaking test format
              </a>
            </div>
          </section>

          <section
            className="card"
            aria-labelledby="band-seven-diagnostic-title"
            style={{ padding: "clamp(1.25rem, 3vw, 2rem)", display: "grid", gap: "1rem" }}
          >
            <div>
              <span className="eyebrow">Free score diagnostic</span>
              <h2 id="band-seven-diagnostic-title" style={{ margin: "0.65rem 0 0.5rem" }}>
                Take the four-criterion retry checklist with you
              </h2>
              <p className="practice-copy" style={{ margin: 0 }}>
                Get the compact score diagnostic in the first email. Confirm inside it if you also
                want three short messages that turn a transcript into a controlled Band 7 retry.
              </p>
            </div>
            <LeadCaptureForm source="band_7_retry_guide" />
          </section>

          <section className="band-seven-guide__faq" aria-labelledby="band-seven-faq-title">
            <div className="band-seven-guide__section-heading">
              <span className="eyebrow">Questions learners ask</span>
              <h2 id="band-seven-faq-title">IELTS Speaking Band 7 retry FAQ</h2>
            </div>
            <div>
              {bandSevenFaqs.map((item) => (
                <details key={item.question}>
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </section>

          <AdSenseUnit />

          <section className="band-seven-guide__cta">
            <div>
              <span className="eyebrow">Your next controlled retry</span>
              <h2>{page.cta}</h2>
              <p>
                Start with the calculator if you already have a recording. Start with a free prompt
                if you need a baseline. Either way, change one criterion before changing the topic.
              </p>
            </div>
            <div>
              <Link className="button button-primary" href="/tools/ielts-speaking-band-score-calculator">
                Calculate your speaking profile
              </Link>
              <Link className="button button-secondary" href="/app/practice">
                Record a free attempt
              </Link>
            </div>
          </section>

          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                headline: page.title,
                description: page.description,
                mainEntityOfPage: canonicalUrl,
                author: {
                  "@type": "Organization",
                  name: siteConfig.name,
                  url: siteConfig.domain
                },
                publisher: {
                  "@type": "Organization",
                  name: siteConfig.name,
                  url: siteConfig.domain
                },
                about: [
                  "IELTS Speaking Band 7",
                  "IELTS Speaking assessment criteria",
                  "IELTS Speaking Part 2 cue cards"
                ]
              })
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: siteConfig.domain
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "IELTS speaking guides",
                    item: `${siteConfig.domain}/guides`
                  },
                  {
                    "@type": "ListItem",
                    position: 3,
                    name: page.title,
                    item: canonicalUrl
                  }
                ]
              })
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: bandSevenFaqs.map((item) => ({
                  "@type": "Question",
                  name: item.question,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: item.answer
                  }
                }))
              })
            }}
          />
        </main>
      </>
    );
  }

  return (
    <>
      <main className="page-shell section" style={{ display: "grid", gap: "1.2rem" }}>
        <div className="section-head">
          <span className="eyebrow">Guide</span>
          <h1 style={{ fontSize: "clamp(2.8rem, 6vw, 4.6rem)", lineHeight: 0.96 }}>{page.title}</h1>
          <p>{page.intro}</p>
        </div>
        <div className="marketing-grid">
          {page.bullets.map((bullet) => (
            <article key={bullet} className="card feature-card">
              <h2 style={{ fontSize: "1.25rem" }}>Key takeaway</h2>
              <p>{bullet}</p>
            </article>
          ))}
        </div>
        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
          <span className="eyebrow">Use it today</span>
          <h2 style={{ margin: 0 }}>Apply one idea in your next answer</h2>
          <p className="practice-copy" style={{ margin: 0 }}>
            Pick the takeaway that matches your current weakness, answer one related prompt, then
            listen back once. Focused repetition makes the guidance easier to remember under exam pressure.
          </p>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            {relatedLinks.map((item) => (
              <Link key={item.href} className="button button-secondary" href={item.href as Route}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <AdSenseUnit />

        <div className="card institution-cta">
          <div>
            <span className="eyebrow">Next step</span>
            <h2 style={{ margin: "0.8rem 0 0.5rem" }}>{page.cta}</h2>
            <p className="practice-copy">
              Use a short practice session to turn the method into a habit you can repeat on test day.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <Link className="button button-primary" href="/app/practice">
              Start practice
            </Link>
            {relatedLinks.map((item) => (
              <Link key={item.href} className="button button-secondary" href={item.href as Route}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
