import type { Metadata } from "next";
import Link from "next/link";
import { AdSenseUnit } from "@/components/adsense-unit";
import { siteConfig } from "@/lib/site";

const pagePath = "/free-ielts-speaking-test";
const pageUrl = `${siteConfig.domain}${pagePath}`;
const pageTitle = "Free Speaking Test Online for IELTS";
const pageDescription =
  "Take a free speaking test online for IELTS. Record an answer, review your transcript, and get an estimated band with feedback across four scoring criteria.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: { canonical: pageUrl },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  openGraph: {
    title: `${pageTitle} | ${siteConfig.name}`,
    description: pageDescription,
    url: pageUrl,
    siteName: siteConfig.name,
    type: "website",
    images: [
      {
        url: `${siteConfig.domain}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "SpeakAce free IELTS speaking test feedback"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: `${pageTitle} | ${siteConfig.name}`,
    description: pageDescription,
    images: [`${siteConfig.domain}/og-image.png`]
  }
};

const faqs = [
  {
    q: "Is the online IELTS speaking test really free?",
    a: "SpeakAce includes a free speaking attempt so you can try the record, transcript, feedback, and retry workflow before choosing a paid plan. It is a practice diagnostic, not an official IELTS exam."
  },
  {
    q: "Does SpeakAce give an official IELTS band score?",
    a: "No. SpeakAce gives an AI-estimated IELTS-style score for practice. Only an authorized IELTS test can issue an official band score, and a human examiner may judge an answer differently."
  },
  {
    q: "What feedback do I get after the free speaking test?",
    a: "After evaluation, you can review your transcript, an estimated overall band, category scores for fluency and coherence, lexical resource, grammatical range and accuracy, and pronunciation, plus strengths, improvements, and a next exercise."
  },
  {
    q: "How should I use the result to improve?",
    a: "Choose one issue from the feedback, such as a vague example or repeated wording, then answer the same prompt again with that single change. Comparing the transcript and improved-answer view makes the retry more useful than jumping straight to a new topic."
  },
  {
    q: "Does this page cover IELTS Speaking Parts 1, 2, and 3?",
    a: "The free start is a focused speaking attempt rather than an official live interview. You can prepare all three IELTS speaking parts through the linked question hubs and use the simulator for a longer exam-style flow."
  }
];

const sampleQuestions = {
  part1: [
    "Do you work or are you a student?",
    "What do you like about your hometown?",
    "Do you enjoy using technology every day?"
  ],
  part2: [
    "Describe a useful object you use often.",
    "Describe a person who helped you learn something important."
  ],
  part3: [
    "Why do some people communicate more easily than others?",
    "Do you think technology improves speaking skills or weakens them?"
  ]
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: pageTitle,
      description: pageDescription,
      inLanguage: "en",
      isPartOf: {
        "@type": "WebSite",
        "@id": `${siteConfig.domain}#website`,
        name: siteConfig.name,
        url: siteConfig.domain
      },
      breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
      mainEntity: { "@id": `${pageUrl}#practice-test` }
    },
    {
      "@type": "WebApplication",
      "@id": `${pageUrl}#practice-test`,
      name: "SpeakAce Free IELTS Speaking Test",
      description: pageDescription,
      url: pageUrl,
      applicationCategory: "EducationalApplication",
      applicationSubCategory: "IELTS speaking practice",
      operatingSystem: "Web",
      isAccessibleForFree: true,
      featureList: [
        "IELTS-style speaking prompts",
        "Recorded-answer transcript",
        "Estimated overall band and IELTS criterion scores",
        "Strengths, improvements, next exercise, and retry comparison"
      ],
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Free speaking practice attempt"
      },
      provider: {
        "@type": "Organization",
        name: siteConfig.name,
        url: siteConfig.domain
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}#breadcrumb`,
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
          name: "Free IELTS Speaking Test",
          item: pageUrl
        }
      ]
    },
    {
      "@type": "FAQPage",
      "@id": `${pageUrl}#faq`,
      mainEntity: faqs.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a
        }
      }))
    }
  ]
};

export default function FreeIeltsSpeakingTestPage() {
  return (
    <main className="page-shell section" style={{ display: "grid", gap: "1.2rem" }}>
      <nav aria-label="Breadcrumb" style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
        <Link href="/">Home</Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">Free IELTS speaking test</span>
      </nav>

      <header className="section-head">
        <span className="eyebrow">Free IELTS diagnostic</span>
        <h1 style={{ fontSize: "clamp(2.8rem, 6vw, 4.8rem)", lineHeight: 0.96 }}>
          Free Speaking Test Online for IELTS
        </h1>
        <p>
          Record one IELTS-style answer, review the transcript, see an estimated band and four criterion scores,
          then retry with a clearer response.
        </p>
        <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
          <Link className="button button-primary" href="/app/practice?quickStart=1">
            Start the free speaking test
          </Link>
          <Link className="button button-secondary" href="#feedback-example">
            See a transcript retry example
          </Link>
        </div>
        <p style={{ fontSize: "0.92rem", margin: 0 }}>
          Free practice attempt · AI estimate, not an official IELTS score · Looking for another exam? Try the{" "}
          <Link href="/toefl-speaking-practice">TOEFL speaking practice</Link> flow.
        </p>
      </header>

      <section className="card" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
        <h2>A focused speaking diagnostic, not a generic conversation bot</h2>
        <p className="practice-copy">
          This free online speaking test is designed for IELTS learners who want to hear what their current answer
          actually sounds like. You open a realistic prompt, record your response, and use the transcript and feedback
          to decide what to change on the next attempt.
        </p>
        <p className="practice-copy">
          The goal is a useful first diagnosis: is the answer easy to follow, specific enough, varied in language, and
          controlled in delivery? The estimated score provides direction, while the strengths, improvements, and next
          exercise turn that direction into a practical retry.
        </p>
      </section>

      <AdSenseUnit />

      <section className="card" style={{ padding: "1.5rem" }}>
        <span className="eyebrow">How it works</span>
        <h2 style={{ margin: "0.8rem 0 1rem" }}>Complete one useful test loop in three steps</h2>
        <div className="marketing-grid">
          <article className="card feature-card">
            <h3>1. Choose an IELTS-style prompt</h3>
            <p>
              Start with a Part 1, Part 2, or Part 3 task instead of inventing a topic. The prompt and timer make the
              attempt feel closer to exam practice.
            </p>
          </article>
          <article className="card feature-card">
            <h3>2. Record your answer and read the transcript</h3>
            <p>
              Speak naturally, then check what you actually said. The transcript makes repeated language, weak examples,
              filler words, and incomplete ideas easier to notice.
            </p>
          </article>
          <article className="card feature-card">
            <h3>3. Review the estimate and retry one issue</h3>
            <p>
              See an estimated overall band, the four IELTS speaking criteria, strengths, improvements, and a next
              exercise. Then compare your answer with the improved-answer view before trying again.
            </p>
          </article>
        </div>
      </section>

      <section className="marketing-grid" aria-label="Free speaking test results">
        <article className="card feature-card">
          <h2 style={{ fontSize: "1.4rem" }}>Estimated band and criterion scores</h2>
          <p>
            Review the overall estimate alongside fluency and coherence, lexical resource, grammatical range and
            accuracy, and pronunciation.
          </p>
        </article>
        <article className="card feature-card">
          <h2 style={{ fontSize: "1.4rem" }}>Transcript and answer comparison</h2>
          <p>
            Read the recorded-answer transcript, listen back when audio is available, and compare your wording with a
            clearer improved-answer example.
          </p>
        </article>
        <article className="card feature-card">
          <h2 style={{ fontSize: "1.4rem" }}>One concrete next exercise</h2>
          <p>
            Use the strengths and improvement notes to choose one change for your retry instead of collecting advice
            without putting it into practice.
          </p>
        </article>
      </section>

      <section className="card" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
        <span className="eyebrow">Sample questions</span>
        <h2 style={{ margin: 0 }}>What can appear in an IELTS speaking test?</h2>
        <div className="marketing-grid">
          <article className="card feature-card">
            <h3>
              <Link href="/ielts-speaking-part-1-questions">Part 1 questions</Link>
            </h3>
            <ul style={{ margin: 0, paddingLeft: "1.2rem", lineHeight: 1.8, color: "var(--muted)" }}>
              {sampleQuestions.part1.map((question) => <li key={question}>{question}</li>)}
            </ul>
          </article>
          <article className="card feature-card">
            <h3>
              <Link href="/ielts-speaking-part-2-topics">Part 2 cue card prompts</Link>
            </h3>
            <ul style={{ margin: 0, paddingLeft: "1.2rem", lineHeight: 1.8, color: "var(--muted)" }}>
              {sampleQuestions.part2.map((question) => <li key={question}>{question}</li>)}
            </ul>
          </article>
          <article className="card feature-card">
            <h3>
              <Link href="/ielts-speaking-part-3-questions">Part 3 discussion questions</Link>
            </h3>
            <ul style={{ margin: 0, paddingLeft: "1.2rem", lineHeight: 1.8, color: "var(--muted)" }}>
              {sampleQuestions.part3.map((question) => <li key={question}>{question}</li>)}
            </ul>
          </article>
        </div>
        <p className="practice-copy" style={{ margin: 0 }}>
          Want to connect the three parts in a longer flow? Open the{" "}
          <Link href="/speaking-test-simulator-ielts">IELTS speaking test simulator</Link>.
        </p>
      </section>

      <section
        id="feedback-example"
        className="card"
        style={{ padding: "1.5rem", display: "grid", gap: "1rem", scrollMarginTop: "6rem" }}
      >
        <span className="eyebrow">Illustrative transcript retry</span>
        <h2 style={{ margin: 0 }}>What a more specific second answer can sound like</h2>
        <p className="practice-copy" style={{ margin: 0 }}>
          This is a made-for-explanation example, not a learner testimonial or a scored result. It shows the type of
          change you can test after reading your feedback.
        </p>
        <div className="marketing-grid">
          <article className="card feature-card">
            <h3>First attempt excerpt</h3>
            <blockquote style={{ margin: 0, lineHeight: 1.75 }}>
              “I like technology because it is useful. I use my phone every day, and it helps me with many things.”
            </blockquote>
          </article>
          <article className="card feature-card">
            <h3>Focused retry excerpt</h3>
            <blockquote style={{ margin: 0, lineHeight: 1.75 }}>
              “Yes, especially for English practice. I record short answers on my phone, listen back for repeated
              words, and try the same question again. That makes my practice more focused because I can hear exactly
              what needs to change.”
            </blockquote>
          </article>
          <article className="card feature-card">
            <h3>What changed</h3>
            <ul style={{ margin: 0, paddingLeft: "1.2rem", lineHeight: 1.8, color: "var(--muted)" }}>
              <li>The broad claim became one specific use case.</li>
              <li>The answer added a clear action-and-result chain.</li>
              <li>The retry developed one idea instead of listing several vague ones.</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="card" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
        <h2>How to read an estimated IELTS speaking band</h2>
        <p className="practice-copy">
          Treat the estimate as a diagnostic signal, not a prediction of your official result. The most useful part is
          the pattern across the four scoring criteria. A weaker fluency and coherence result may point to pauses or an
          unclear idea path, while lexical resource and grammar feedback can show where repeated or unstable language is
          holding the answer back.
        </p>
        <p className="practice-copy">
          Choose one pattern, retry the same prompt, and compare the transcripts. For more preparation between attempts,
          use the <Link href="/ielts-speaking-sample-answers">IELTS speaking sample answers</Link> as structure references
          and the <Link href="/improve-ielts-speaking-score">score improvement guide</Link> to plan your next drills.
        </p>
      </section>

      <section className="card" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
        <span className="eyebrow">Clear limits</span>
        <h2 style={{ margin: 0 }}>What the free test does and does not claim</h2>
        <div className="marketing-grid">
          <article className="card feature-card">
            <h3>Practice estimate, not an official result</h3>
            <p>Only an authorized IELTS test can issue an official band score.</p>
          </article>
          <article className="card feature-card">
            <h3>Feedback depends on the recorded answer</h3>
            <p>Audio quality, answer length, and the language you produce affect what the transcript and AI can assess.</p>
          </article>
          <article className="card feature-card">
            <h3>No guaranteed band increase</h3>
            <p>SpeakAce helps you practise and notice patterns; improvement depends on repeated work and individual performance.</p>
          </article>
        </div>
      </section>

      <section className="card" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
        <span className="eyebrow">FAQ</span>
        <h2 style={{ margin: 0 }}>Questions about the free IELTS speaking test</h2>
        <div className="marketing-grid">
          {faqs.map((item) => (
            <article key={item.q} className="card feature-card">
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card institution-cta" aria-labelledby="free-test-cta-title">
        <div>
          <span className="eyebrow">Start now</span>
          <h2 id="free-test-cta-title" style={{ margin: "0.8rem 0 0.5rem" }}>
            Turn one answer into a focused IELTS speaking diagnostic
          </h2>
          <p className="practice-copy">
            Start with the free attempt. Then explore more{" "}
            <Link href="/ielts-speaking-topics">IELTS speaking topics</Link>, review the full{" "}
            <Link href="/ielts-speaking-practice">speaking practice guide</Link>, or compare{" "}
            <Link href="/pricing">feedback plans</Link> when you need more practice volume.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
          <Link className="button button-primary" href="/app/practice?quickStart=1">
            Start free speaking test
          </Link>
          <Link className="button button-secondary" href="/ielts-speaking-topics">
            Browse IELTS topics
          </Link>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </main>
  );
}
