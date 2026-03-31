import Link from "next/link";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

const prompts = [
  {
    title: "Describe a skill you want to improve",
    tips: ["State what the skill is.", "Explain why it matters to you.", "Give one real example."],
    followUp: "What is the best way to improve this skill?"
  },
  {
    title: "Describe a place you enjoy visiting",
    tips: ["Say where it is.", "Explain how often you go there.", "Describe why it feels special."],
    followUp: "Do people prefer quiet places or busy places today?"
  },
  {
    title: "Describe a useful app on your phone",
    tips: ["Say what the app does.", "Explain when you use it.", "Give one practical benefit."],
    followUp: "Do apps make daily life easier or more distracting?"
  }
];

export const metadata: Metadata = {
  title: "Daily IELTS Speaking Prompt | SpeakAce",
  description:
    "Get a fresh IELTS speaking prompt, quick structure tips, and a direct path into AI speaking practice with SpeakAce.",
  alternates: {
    canonical: `${siteConfig.domain}/daily-ielts-speaking-prompt`
  }
};

export default function DailyIeltsSpeakingPromptPage() {
  return (
    <main className="page-shell seo-page">
      <section className="card seo-hero">
        <span className="eyebrow">Daily practice</span>
        <h1>Daily IELTS speaking prompt for faster fluency practice</h1>
        <p>
          Use one focused IELTS-style prompt every day, build a cleaner structure, and then move into timed AI
          feedback inside SpeakAce.
        </p>
        <div className="hero-actions">
          <Link href="/app/practice" className="button button-primary">
            Start today&apos;s prompt
          </Link>
          <Link href="/free-ielts-speaking-test" className="button button-secondary">
            Try the free test
          </Link>
        </div>
      </section>

      <section className="seo-section">
        <div className="section-heading">
          <span className="eyebrow">Prompt set</span>
          <h2>Three prompts you can practice right now</h2>
          <p>Each one is designed to help you answer more clearly, more naturally, and with a better IELTS flow.</p>
        </div>
        <div className="seo-grid">
          {prompts.map((prompt) => (
            <article key={prompt.title} className="card seo-card">
              <h3>{prompt.title}</h3>
              <ul>
                {prompt.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
              <p>
                <strong>Follow-up:</strong> {prompt.followUp}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
