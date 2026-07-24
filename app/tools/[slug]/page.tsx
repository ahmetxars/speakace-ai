import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ToolWorkbench } from "@/components/tool-workbench";
import { siteConfig } from "@/lib/site";
import { toolPages } from "@/lib/seo-growth";
import { getToolVisual } from "@/lib/tool-visuals";

const INDEXABLE_TOOL_SLUGS = new Set([
  "ielts-band-score-calculator",
  "ielts-cue-card-generator"
]);

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

  return (
    <>
      <main className="page-shell section" style={{ display: "grid", gap: "1.2rem" }}>
        <div className="section-head">
          <span className="eyebrow">Free tool</span>
          <div className="tool-card-visual" aria-hidden="true" style={{ margin: "0.25rem 0 0.75rem" }}>
            <span className="tool-card-icon">{visual.emoji}</span>
            <span className="pill">{visual.badge}</span>
          </div>
          <h1 style={{ fontSize: "clamp(2.8rem, 6vw, 4.6rem)", lineHeight: 0.96 }}>{page.title}</h1>
          <p>{page.intro}</p>
        </div>
        <ToolWorkbench slug={page.slug} title={page.title} />
        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
          <span className="eyebrow">How to use this result</span>
          <h2 style={{ margin: 0 }}>Turn the tool output into one speaking action</h2>
          <p className="practice-copy" style={{ margin: 0 }}>
            Use the {page.title.toLowerCase()} as a starting point, not a final diagnosis. Choose one
            prompt, speak for the full time, and compare the result with the target you set here.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link className="button button-primary" href="/app/practice">
              {page.actionLabel ?? "Use tool"}
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
            <Link className="button button-primary" href="/app/practice">
              {page.actionLabel ?? "Start practice"}
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
      </main>
    </>
  );
}
