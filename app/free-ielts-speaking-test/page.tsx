import type { Metadata } from "next";
import Link from "next/link";
import { AdSenseUnit } from "@/components/adsense-unit";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Free IELTS Speaking Test Online | SpeakAce",
  description:
    "Take a free IELTS speaking test online, get an AI IELTS band score, transcript, and instant feedback. Practice free ->",
  alternates: { canonical: "/free-ielts-speaking-test" },
  openGraph: {
    title: "Free IELTS Speaking Test Online | SpeakAce",
    description:
      "Try a free IELTS speaking test online with transcript review, AI scoring, and instant speaking feedback.",
    url: `${siteConfig.domain}/free-ielts-speaking-test`,
    siteName: siteConfig.name,
    type: "website"
  }
};

const faqs = [
  {
    q: "Is this a real free IELTS speaking test?",
    a: "It is a free IELTS speaking test online built for practice, not an official IELTS exam. You answer realistic prompts, get an estimated AI IELTS speaking score, and see what to improve before your next attempt."
  },
  {
    q: "Does SpeakAce give an official band score?",
    a: "No. SpeakAce gives an estimated IELTS-style band score for practice. The value is in seeing likely score direction, weak patterns, and the next improvement step before you sit the real test."
  },
  {
    q: "What do I get after I finish the free test?",
    a: "You get a transcript, an estimated score, and a feedback breakdown focused on fluency, pronunciation, and structure. This helps you see whether your answer was too short, too generic, or missing a clear example."
  },
  {
    q: "Can I use this for daily IELTS speaking practice online free?",
    a: "Yes. Many learners use the free IELTS speaking test as a low-friction way to practice online before moving into longer daily speaking sessions, topic drills, and deeper review with Plus."
  },
  {
    q: "Is this useful for teachers and language schools too?",
    a: "Yes. Even though the free test is student-friendly, teachers and schools can also use it as a demo entry point to show how transcript review, estimated scoring, and retry-based speaking practice work."
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

const testimonialPlaceholders = [
  {
    name: "IELTS learner placeholder",
    text: "I finally understood why my answers sounded weak. The transcript and score estimate made my mistakes visible instead of vague."
  },
  {
    name: "Repeat-practice learner placeholder",
    text: "The free test gave me a much clearer idea of how to practice. I could see the difference between a short answer and a stronger retry."
  },
  {
    name: "Teacher demo placeholder",
    text: "This is a useful first step for students who need a simple speaking task before moving into deeper IELTS coaching."
  }
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a
    }
  }))
};

export default function FreeIeltsSpeakingTestPage() {
  return (
    <>
      <SiteHeader />
      <main className="page-shell section" style={{ display: "grid", gap: "1.2rem" }}>
        <div className="section-head">
          <span className="eyebrow">Free test</span>
          <h1 style={{ fontSize: "clamp(2.8rem, 6vw, 4.8rem)", lineHeight: 0.96 }}>
            Free IELTS Speaking Test Online — Instant AI Band Score
          </h1>
          <p>
            Try a free IELTS speaking test online, see your estimated AI IELTS band score, and understand what
            needs work before you pay for anything.
          </p>
        </div>

        <section className="card" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
          <h2>What is this test?</h2>
          <p className="practice-copy">
            This page is built for learners who want a real free IELTS speaking test instead of a vague speaking tool.
            SpeakAce gives you a structured way to do IELTS speaking practice online: open a prompt, record an answer,
            view the transcript, and get an estimated AI IELTS speaking score. That matters because most students do not
            need more random speaking advice. They need to know how their answer actually sounds, where it becomes too
            short or too general, and what would move it closer to a stronger band.
          </p>
          <p className="practice-copy">
            A free IELTS speaking test online is most useful when it is close enough to real exam pressure to teach you
            something. SpeakAce does that by focusing on the practical loop that helps people improve: speak, see the
            transcript, understand the score direction, and retry with one better example. If you want IELTS speaking
            practice online free, this page is meant to be that first low-friction step before you move into deeper
            daily practice.
          </p>
        </section>

        <AdSenseUnit />

        <section className="card" style={{ padding: "1.5rem" }}>
          <span className="eyebrow">How it works</span>
          <h2 style={{ margin: "0.8rem 0 1rem" }}>A simple 3-step free speaking workflow</h2>
          <div className="marketing-grid">
            <article className="card feature-card">
              <h3>1. Open one realistic IELTS prompt</h3>
              <p>
                Start with a question that feels closer to a real IELTS speaking task than a random classroom exercise.
                This matters because clear improvement starts when practice looks enough like the exam.
              </p>
            </article>
            <article className="card feature-card">
              <h3>2. Record your answer and read the transcript</h3>
              <p>
                Speak naturally, then check the transcript to see what you actually said. Many learners think their
                answer sounded detailed, but the transcript often reveals weak structure, repeated language, or missing examples.
              </p>
            </article>
            <article className="card feature-card">
              <h3>3. Get your AI IELTS speaking score and next step</h3>
              <p>
                SpeakAce shows an estimated band direction and a clear feedback breakdown so you know whether fluency,
                pronunciation, or answer structure is limiting you most right now.
              </p>
            </article>
          </div>
        </section>

        <section className="marketing-grid">
          <article className="card feature-card">
            <h2 style={{ fontSize: "1.4rem" }}>What you get after the test</h2>
            <p>
              The first value is not hidden. After your attempt, you can review the transcript, see an estimated band
              score, and look at the speaking feedback breakdown by fluency, pronunciation, and structure.
            </p>
          </article>
          <article className="card feature-card">
            <h2 style={{ fontSize: "1.4rem" }}>Why this helps more than random practice</h2>
            <p>
              Most students repeat more questions than they need. The real gain often comes from seeing why one answer
              underperformed and retrying the same task with a stronger example and cleaner organization.
            </p>
          </article>
          <article className="card feature-card">
            <h2 style={{ fontSize: "1.4rem" }}>What Plus unlocks later</h2>
            <p>
              The free IELTS speaking test lets you see basic value first. If you want deeper feedback, more daily
              speaking volume, and a stronger retry workflow, you can unlock the full experience after you try it.
            </p>
          </article>
        </section>

        <section className="card" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
          <span className="eyebrow">Sample questions</span>
          <h2 style={{ margin: 0 }}>Questions you can expect in a free IELTS speaking test</h2>
          <div className="marketing-grid">
            <article className="card feature-card">
              <h3>Part 1 questions</h3>
              <ul style={{ margin: 0, paddingLeft: "1.2rem", lineHeight: 1.8, color: "var(--muted)" }}>
                {sampleQuestions.part1.map((question) => <li key={question}>{question}</li>)}
              </ul>
            </article>
            <article className="card feature-card">
              <h3>Part 2 cue card prompts</h3>
              <ul style={{ margin: 0, paddingLeft: "1.2rem", lineHeight: 1.8, color: "var(--muted)" }}>
                {sampleQuestions.part2.map((question) => <li key={question}>{question}</li>)}
              </ul>
            </article>
            <article className="card feature-card">
              <h3>Part 3 discussion questions</h3>
              <ul style={{ margin: 0, paddingLeft: "1.2rem", lineHeight: 1.8, color: "var(--muted)" }}>
                {sampleQuestions.part3.map((question) => <li key={question}>{question}</li>)}
              </ul>
            </article>
          </div>
        </section>

        <section className="card" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
          <h2>Why an AI IELTS band score is useful at the start</h2>
          <p className="practice-copy">
            Students often wait too long before testing themselves because they think they need to become better first.
            In reality, a fast free IELTS speaking test online gives you direction. If your answer is too short, too
            repetitive, or too weak in idea development, the transcript and estimated score will usually show that
            faster than passive study ever could. Even when the score is only an estimate, it helps you understand the
            likely quality of your current answer pattern.
          </p>
          <p className="practice-copy">
            This is also why IELTS speaking practice online free should lead into action, not just information. After
            one attempt, you should know what to fix next: add a more specific example, slow down the ending, make your
            opening clearer, or develop one idea a little further. SpeakAce is built around that improvement loop.
          </p>
        </section>

        <section className="card" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
          <span className="eyebrow">Testimonials</span>
          <h2 style={{ margin: 0 }}>Early learner feedback placeholders</h2>
          <div className="marketing-grid">
            {testimonialPlaceholders.map((item) => (
              <article key={item.name} className="card feature-card">
                <h3>{item.name}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="card" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
          <span className="eyebrow">FAQ</span>
          <h2 style={{ margin: 0 }}>Common questions about this free IELTS speaking test</h2>
          <div className="marketing-grid">
            {faqs.map((item) => (
              <article key={item.q} className="card feature-card">
                <h3>{item.q}</h3>
                <p>{item.a}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="card institution-cta">
          <div>
            <span className="eyebrow">Start now</span>
            <h2 style={{ margin: "0.8rem 0 0.5rem" }}>Try a free IELTS speaking test before you upgrade</h2>
            <p className="practice-copy">
              Start with one speaking attempt, then continue into <Link href="/ielts-speaking-topics">IELTS speaking topics</Link>,
              the <Link href="/blog">blog</Link>, or a deeper <Link href="/pricing">full-feedback plan</Link> if you want more.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <Link className="button button-primary" href="/app/practice?quickStart=1">
              Start free test
            </Link>
            <Link className="button button-secondary" href="/ielts-speaking-topics">
              Browse topic practice
            </Link>
          </div>
        </div>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      </main>
    </>
  );
}
