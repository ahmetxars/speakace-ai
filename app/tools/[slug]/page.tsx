import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IeltsSpeakingBandCalculator } from "@/components/ielts-speaking-band-calculator";
import { LeadCaptureForm } from "@/components/lead-capture-form";
import { ToolWorkbench } from "@/components/tool-workbench";
import { siteConfig } from "@/lib/site";
import { toolPages } from "@/lib/seo-growth";
import { getToolVisual } from "@/lib/tool-visuals";

const INDEXABLE_TOOL_SLUGS = new Set([
  "ielts-band-score-calculator",
  "ielts-speaking-band-score-calculator",
  "ielts-cue-card-generator"
]);

const SPEAKING_BAND_CALCULATOR_SLUG = "ielts-speaking-band-score-calculator";
const OVERALL_BAND_CALCULATOR_SLUG = "ielts-band-score-calculator";
const CUE_CARD_GENERATOR_SLUG = "ielts-cue-card-generator";

const overallBandExamples = [
  { listening: "6.5", reading: "6.5", writing: "5.5", speaking: "6.0", average: "6.13", overall: "6.0" },
  { listening: "6.5", reading: "6.5", writing: "6.0", speaking: "6.0", average: "6.25", overall: "6.5" },
  { listening: "7.0", reading: "6.5", writing: "6.5", speaking: "6.0", average: "6.50", overall: "6.5" },
  { listening: "7.0", reading: "7.0", writing: "6.5", speaking: "6.5", average: "6.75", overall: "7.0" }
];

const toolFaqs: Record<string, Array<{ question: string; answer: string }>> = {
  "ielts-band-score-calculator": [
    {
      question: "How is the overall IELTS band calculated?",
      answer: "Add the Listening, Reading, Writing, and Speaking scores, divide the total by four, then round the average to the nearest whole or half band."
    },
    {
      question: "How does IELTS round an average ending in .25 or .75?",
      answer: "An average ending in .25 rounds up to the next half band. An average ending in .75 rounds up to the next whole band."
    },
    {
      question: "Can one low section score reduce the overall band?",
      answer: "Yes. All four section scores have equal weight in the overall average, so a lower score in one section can reduce the final band."
    },
    {
      question: "Is this calculator an official IELTS result?",
      answer: "No. It applies the public overall-band calculation for planning. Only the score on an official IELTS Test Report Form is authoritative."
    }
  ],
  "ielts-speaking-band-score-calculator": [
    {
      question: "How is this IELTS Speaking band estimate calculated?",
      answer: "The calculator gives equal weight to fluency and coherence, lexical resource, grammatical range and accuracy, and pronunciation. It averages your four self-ratings and displays the nearest half band for planning."
    },
    {
      question: "Is this an official IELTS Speaking score prediction?",
      answer: "No. It is an educational self-assessment. A certified examiner judges your performance throughout the complete Speaking test, and only an official Test Report Form reports your IELTS Speaking band."
    },
    {
      question: "What does Band 7 IELTS Speaking usually require?",
      answer: "The public descriptors point to coherent longer turns, flexible vocabulary and paraphrasing, a flexible range of simple and complex structures with frequent accurate sentences, and pronunciation that remains clear while showing stronger control of connected speech."
    },
    {
      question: "Why does the calculator focus on my lowest criterion?",
      answer: "A four-score average can hide an uneven profile. Working on the lowest criterion first gives you a clearer retry goal and makes it easier to compare two recordings of the same prompt."
    },
    {
      question: "Do I need a native accent for Band 7 pronunciation?",
      answer: "No. The public criteria focus on intelligibility and control of pronunciation features such as rhythm, stress, intonation, and connected speech, not on copying a particular accent."
    }
  ],
  "ielts-cue-card-generator": [
    {
      question: "How long should I speak for an IELTS cue card?",
      answer: "In IELTS Speaking Part 2 you receive one minute to prepare and should be ready to speak for up to two minutes."
    },
    {
      question: "Do I need to cover every cue-card bullet?",
      answer: "The bullets are prompts rather than a strict checklist, but using them helps you develop a complete and organized answer."
    },
    {
      question: "Should I write a full script during preparation?",
      answer: "No. Write short keywords, a simple sequence, and one useful example. A full script is too slow and can make the answer sound memorized."
    },
    {
      question: "How should I practice the same cue card twice?",
      answer: "Record the first answer, review the transcript, choose one weakness, and repeat the card while applying only that improvement."
    }
  ]
};

function getToolLinks(slug: string) {
  if (slug === SPEAKING_BAND_CALCULATOR_SLUG) {
    return [
      { href: "/guides/ielts-speaking-band-6-to-7", label: "Use the Band 7 retry guide" },
      { href: "/free-ielts-speaking-test", label: "Take a free speaking test" }
    ];
  }
  if (slug.includes("toefl")) {
    return [
      { href: "/speaking-timer", label: "Open timer" },
      { href: "/toefl-speaking-practice", label: "TOEFL AI practice" }
    ];
  }
  if (slug.includes("cue-card")) {
    return [
      { href: "/ielts-speaking-part-2-topics", label: "Open Part 2 guide" },
      { href: "/ielts-speaking-topics", label: "Browse topic list" }
    ];
  }
  if (slug.includes("replay")) {
    return [
      { href: "/app/practice", label: "Start a new session" },
      { href: "/pricing", label: "Unlock full review" }
    ];
  }
  if (slug.includes("calculator") || slug.includes("checker")) {
    return [
      { href: "/ielts-band-estimator", label: "Try free estimator" },
      { href: "/free-ielts-speaking-test", label: "Take free test" }
    ];
  }
  return [
    { href: "/app/practice", label: "Start practice" },
    { href: "/resources", label: "Open resources" }
  ];
}

export function generateStaticParams() {
  return toolPages.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = toolPages.find((item) => item.slug === slug);
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/tools/${page.slug}` },
    robots: {
      index: INDEXABLE_TOOL_SLUGS.has(page.slug),
      follow: true
    },
    openGraph: {
      title: `${page.title} | SpeakAce`,
      description: page.description,
      url: `${siteConfig.domain}/tools/${page.slug}`,
      siteName: siteConfig.name,
      type: "article"
    }
  };
}

export default async function ToolDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = toolPages.find((item) => item.slug === slug);
  if (!page) notFound();
  const visual = getToolVisual(page.slug);
  const relatedLinks = getToolLinks(page.slug);
  const faqs = toolFaqs[page.slug] ?? [];
  const isSpeakingBandCalculator = page.slug === SPEAKING_BAND_CALCULATOR_SLUG;
  const isOverallBandCalculator = page.slug === OVERALL_BAND_CALCULATOR_SLUG;
  const isBandCalculator = isSpeakingBandCalculator || isOverallBandCalculator;
  const isCueCardGenerator = page.slug === CUE_CARD_GENERATOR_SLUG;
  const practiceHref = (isOverallBandCalculator
    ? "/free-ielts-speaking-test"
    : isCueCardGenerator
      ? "/app/practice?quickStart=1&runMode=interview&activation=cue_card_generator"
      : "/app/practice") as Route;
  const canonicalUrl = `${siteConfig.domain}/tools/${page.slug}`;

  return (
    <>
      <main className="page-shell section" style={{ display: "grid", gap: "1.2rem" }}>
        <div className="section-head">
          <span className="eyebrow">Free tool</span>
          {isSpeakingBandCalculator ? (
            <div className="speaking-band-hero-marker" aria-hidden="true">
              <span>4 criteria</span>
              <strong>25% each</strong>
            </div>
          ) : (
            <div className="tool-card-visual" aria-hidden="true" style={{ margin: "0.25rem 0 0.75rem" }}>
              <span className="tool-card-icon">{visual.emoji}</span>
              <span className="pill">{visual.badge}</span>
            </div>
          )}
          <h1 style={{ fontSize: "clamp(2.8rem, 6vw, 4.6rem)", lineHeight: 0.96 }}>{page.title}</h1>
          <p>{page.intro}</p>
        </div>
        {isSpeakingBandCalculator ? (
          <IeltsSpeakingBandCalculator />
        ) : (
          <ToolWorkbench slug={page.slug} title={page.title} />
        )}
        {isOverallBandCalculator ? (
          <section
            className="card"
            aria-labelledby="overall-band-formula-title"
            style={{ padding: "clamp(1.25rem, 3vw, 2rem)", display: "grid", gap: "1.2rem" }}
          >
            <div style={{ maxWidth: "54rem" }}>
              <span className="eyebrow">IELTS overall band formula</span>
              <h2 id="overall-band-formula-title" style={{ margin: "0.75rem 0 0.6rem" }}>
                Add the four section scores, then divide by four
              </h2>
              <p className="practice-copy" style={{ margin: 0 }}>
                Overall band = (Listening + Reading + Writing + Speaking) / 4. IELTS reports the
                resulting average as a whole or half band: an average ending in .25 moves to the
                next half band, while .75 moves to the next whole band.
              </p>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", minWidth: "660px", borderCollapse: "collapse" }}>
                <caption style={{ textAlign: "left", paddingBottom: "0.8rem", color: "var(--muted)" }}>
                  Worked IELTS overall band score examples
                </caption>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--line)" }}>
                    {[
                      "Listening",
                      "Reading",
                      "Writing",
                      "Speaking",
                      "Raw average",
                      "Overall band"
                    ].map((label) => (
                      <th key={label} scope="col" style={{ padding: "0.75rem", textAlign: "left" }}>
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {overallBandExamples.map((example) => (
                    <tr key={`${example.listening}-${example.reading}-${example.writing}-${example.speaking}`} style={{ borderBottom: "1px solid var(--line)" }}>
                      <td style={{ padding: "0.75rem" }}>{example.listening}</td>
                      <td style={{ padding: "0.75rem" }}>{example.reading}</td>
                      <td style={{ padding: "0.75rem" }}>{example.writing}</td>
                      <td style={{ padding: "0.75rem" }}>{example.speaking}</td>
                      <td style={{ padding: "0.75rem" }}>{example.average}</td>
                      <td style={{ padding: "0.75rem", fontWeight: 800 }}>{example.overall}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="practice-copy" style={{ margin: 0 }}>
              This calculator is a planning aid, not a test result. Review the published rule on the{" "}
              <a href="https://ielts.org/take-a-test/your-results/ielts-scoring-in-detail" target="_blank" rel="noreferrer">
                official IELTS scoring page
              </a>. Only your Test Report Form contains your official scores.
            </p>
          </section>
        ) : null}
        <div
          id={isCueCardGenerator ? "practice-cta" : undefined}
          className="card"
          style={{ padding: "1.2rem", display: "grid", gap: "0.8rem", scrollMarginTop: "6rem" }}
        >
          <span className="eyebrow">How to use this result</span>
          <h2 style={{ margin: 0 }}>
            {isSpeakingBandCalculator
              ? "Treat the score as a hypothesis, then test the weakest criterion"
              : isOverallBandCalculator
                ? "Turn your overall band into a speaking target"
              : "Turn the tool output into one speaking action"}
          </h2>
          <p className="practice-copy" style={{ margin: 0 }}>
            {isSpeakingBandCalculator
              ? "Keep the prompt, core idea, and speaking time similar across two recordings. Change only the weakest criterion shown above, then compare the transcript and audio. That controlled retry gives you better evidence than raising a self-rating because an answer merely felt easier."
              : isOverallBandCalculator
                ? "Use the overall result to decide which section needs attention, then record one free speaking answer to get a separate IELTS-style speaking estimate and a focused retry."
              : `Use the ${page.title.toLowerCase()} as a starting point, not a final diagnosis. Choose one prompt, speak for the full time, and compare the result with the target you set here.`}
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link className="button button-primary" href={practiceHref}>
              {isSpeakingBandCalculator
                ? "Test with free practice"
                : isOverallBandCalculator
                  ? "Check my speaking score free"
                : isCueCardGenerator
                  ? "Practice this cue card free"
                  : page.actionLabel ?? "Use tool"}
            </Link>
            {relatedLinks.map((item) => (
              <Link key={item.href} className="button button-secondary" href={item.href as Route}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="marketing-grid">
          {page.bullets.map((bullet) => (
            <article key={bullet} className="card feature-card">
              <h2 style={{ fontSize: "1.25rem" }}>Practical note</h2>
              <p>{bullet}</p>
            </article>
          ))}
        </div>
        {isSpeakingBandCalculator ? (
          <section className="speaking-band-reference" aria-labelledby="speaking-band-reference-title">
            <div className="speaking-band-reference__heading">
              <span className="eyebrow">What the four scores mean</span>
              <h2 id="speaking-band-reference-title">Look for repeatable evidence, not a perfect performance</h2>
              <p>
                IELTS assesses the four criteria equally. Use at least two recordings on different
                topics before treating a self-rating as stable.
              </p>
            </div>
            <dl className="speaking-band-reference__criteria">
              <div>
                <dt>Fluency and coherence</dt>
                <dd>Can you keep a longer answer moving, develop it logically, and recover from hesitation without losing the listener?</dd>
              </div>
              <div>
                <dt>Lexical resource</dt>
                <dd>Can you discuss varied topics, choose words precisely enough, and paraphrase when the first expression is unavailable?</dd>
              </div>
              <div>
                <dt>Grammatical range and accuracy</dt>
                <dd>Can you use both simple and complex structures flexibly while producing frequent stretches that are error-free?</dd>
              </div>
              <div>
                <dt>Pronunciation</dt>
                <dd>Is your speech easy to understand, with useful control of thought groups, rhythm, stress, intonation, and connected speech?</dd>
              </div>
            </dl>
            <aside className="speaking-band-reference__sources">
              <div>
                <span className="eyebrow">Primary references</span>
                <h3>Check your self-ratings against the public criteria</h3>
                <p>
                  SpeakAce is not affiliated with or endorsed by IELTS. The calculation and guidance
                  on this page are based on public scoring information and are provided for study planning.
                </p>
              </div>
              <div>
                <a href="https://ielts.org/take-a-test/your-results/ielts-scoring-in-detail" target="_blank" rel="noreferrer">
                  IELTS scoring in detail
                </a>
                <a href="https://ielts.org/cdn/ielts-guides/ielts-speaking-band-descriptors.pdf" target="_blank" rel="noreferrer">
                  Official Speaking band descriptors (PDF)
                </a>
                <a href="https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-speaking" target="_blank" rel="noreferrer">
                  Official Speaking test format
                </a>
              </div>
            </aside>
          </section>
        ) : null}
        {isSpeakingBandCalculator ? (
          <section
            className="card"
            aria-labelledby="speaking-band-diagnostic-title"
            style={{ padding: "clamp(1.25rem, 3vw, 2rem)", display: "grid", gap: "1rem" }}
          >
            <div>
              <span className="eyebrow">Save the diagnostic method</span>
              <h2 id="speaking-band-diagnostic-title" style={{ margin: "0.65rem 0 0.5rem" }}>
                Get the four-criterion checklist and three retry prompts
              </h2>
              <p className="practice-copy" style={{ margin: 0 }}>
                Get the checklist in the first email, then confirm inside it if you want three short
                exercises that move from self-assessment to a focused free speaking attempt.
              </p>
            </div>
            <LeadCaptureForm source="speaking_band_calculator" />
          </section>
        ) : null}
        {faqs.length ? (
          <section className="card" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
            <span className="eyebrow">FAQ</span>
            <h2 style={{ margin: 0 }}>Common questions about {page.title.toLowerCase()}</h2>
            <div className="marketing-grid">
              {faqs.map((item) => (
                <article key={item.question} className="card feature-card">
                  <h3>{item.question}</h3>
                  <p>{item.answer}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}
        <div className="card institution-cta">
          <div>
            <span className="eyebrow">Next step</span>
            <h2 style={{ margin: "0.8rem 0 0.5rem" }}>{page.cta}</h2>
            <p className="practice-copy">
              Keep the result nearby and complete one real attempt while the goal is still fresh.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <Link className="button button-primary" href={practiceHref}>
              {isSpeakingBandCalculator
                ? "Start a free speaking attempt"
                : isOverallBandCalculator
                  ? "Take the free speaking test"
                : isCueCardGenerator
                  ? "Start free Part 2 practice"
                  : page.actionLabel ?? "Start practice"}
            </Link>
            {relatedLinks.map((item) => (
              <Link key={item.href} className="button button-secondary" href={item.href as Route}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        {faqs.length ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: faqs.map((item) => ({
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
        ) : null}
        {isBandCalculator ? (
          <>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "WebApplication",
                  name: page.title,
                  description: page.description,
                  url: canonicalUrl,
                  applicationCategory: "EducationalApplication",
                  operatingSystem: "Any",
                  browserRequirements: "Requires JavaScript",
                  isAccessibleForFree: true,
                  offers: {
                    "@type": "Offer",
                    price: "0",
                    priceCurrency: "USD"
                  },
                  featureList: isOverallBandCalculator
                    ? [
                        "Four-section IELTS overall band calculator",
                        "Published whole- and half-band rounding",
                        "Raw average display",
                        "Worked overall band examples"
                      ]
                    : [
                        "Four equally weighted IELTS Speaking self-ratings",
                        "Half-band planning estimate",
                        "Weakest-criterion diagnostic retry",
                        "Shareable result summary"
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
                      name: isOverallBandCalculator ? "IELTS tools" : "IELTS speaking tools",
                      item: `${siteConfig.domain}/tools`
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
          </>
        ) : null}
      </main>
    </>
  );
}
