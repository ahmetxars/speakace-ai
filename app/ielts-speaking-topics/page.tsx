import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/lib/site";
import { seoTopicPages } from "@/lib/seo-topics";

const part1Topics = [
  { topic: "Home", questions: ["Do you live in a house or an apartment?", "What do you like about your home?", "Would you like to change anything about it?"] },
  { topic: "Hometown", questions: ["What is your hometown like?", "What do you like most about it?", "Has it changed in recent years?"] },
  { topic: "Work", questions: ["What kind of work do you do?", "What do you enjoy about your job?", "Would you like to change your job in the future?"] },
  { topic: "Study", questions: ["What do you study?", "Why did you choose that subject?", "What part of your studies do you enjoy most?"] },
  { topic: "Travel", questions: ["Do you enjoy traveling?", "What type of places do you like to visit?", "Do you prefer traveling alone or with others?"] },
  { topic: "Technology", questions: ["What technology do you use every day?", "Do you enjoy learning new apps?", "Has technology improved your life?"] },
  { topic: "Food", questions: ["What food do you enjoy eating?", "Do you cook often?", "Is food culture important in your country?"] },
  { topic: "Sports", questions: ["Do you play any sports?", "What sports are popular in your area?", "Did you enjoy sports as a child?"] },
  { topic: "Weather", questions: ["What kind of weather do you like?", "Does the weather affect your mood?", "What season do you prefer?"] },
  { topic: "Music", questions: ["Do you like listening to music?", "When do you usually listen to it?", "Has your taste in music changed?"] },
  { topic: "Reading", questions: ["Do you enjoy reading books?", "What kind of books do you prefer?", "Did you read more when you were younger?"] },
  { topic: "Daily routine", questions: ["What is your usual morning routine?", "Do you prefer busy days or calm days?", "Has your routine changed recently?"] },
  { topic: "Friends", questions: ["How often do you spend time with friends?", "What do you usually do together?", "Is friendship important to you?"] },
  { topic: "Shopping", questions: ["Do you enjoy shopping?", "What do you usually buy online?", "Do you prefer big malls or small shops?"] },
  { topic: "Education", questions: ["Do you think education is important?", "What makes a good teacher?", "Should learning be more practical?"] }
];

const cueCards = [
  "Describe a useful object you use often.",
  "Describe a person who helped you achieve something.",
  "Describe a place you enjoy visiting.",
  "Describe a skill you want to improve.",
  "Describe a memorable journey you took.",
  "Describe a piece of advice that helped you.",
  "Describe a book or article that taught you something.",
  "Describe a time when you solved a problem.",
  "Describe an interesting conversation you had.",
  "Describe a goal you want to achieve in the future."
];

const part3Topics = [
  { topic: "Education", questions: ["Why do some students learn faster than others?", "Should schools focus more on practical skills?", "How can technology improve education?"] },
  { topic: "Technology", questions: ["How has technology changed communication?", "Do smartphones improve productivity?", "Should children have limits on technology use?"] },
  { topic: "Travel", questions: ["Why do people travel more today?", "How can tourism affect local communities?", "Will virtual travel become more common?"] },
  { topic: "Food habits", questions: ["Why do food habits change over time?", "Should schools teach healthy eating?", "Do people eat more convenience food now?"] },
  { topic: "Work life", questions: ["Why do people change jobs more often now?", "Is remote work good for productivity?", "What makes a job satisfying?"] },
  { topic: "Environment", questions: ["Why is environmental awareness growing?", "Should governments restrict car use more strongly?", "How can cities become greener?"] },
  { topic: "Media", questions: ["How does social media influence opinions?", "Do people trust online information too easily?", "Should media companies be regulated more strictly?"] },
  { topic: "Health and lifestyle", questions: ["Why do people care more about fitness today?", "Should employers support healthy habits?", "How can stress affect daily life?"] }
];

export const metadata: Metadata = {
  title: "IELTS Speaking Topics 2025 | SpeakAce",
  description:
    "Explore IELTS speaking topics 2025, Part 1 questions, cue card topics, and Part 3 discussion prompts. Practice free ->",
  alternates: { canonical: "/ielts-speaking-topics" },
  openGraph: {
    title: "IELTS Speaking Topics 2025 | SpeakAce",
    description:
      "Browse IELTS speaking topics, Part 2 cue cards, and discussion questions with direct practice links and sample prompts.",
    url: `${siteConfig.domain}/ielts-speaking-topics`,
    siteName: siteConfig.name,
    type: "website"
  }
};

export default function IeltsSpeakingTopicsPage() {
  return (
    <>
      <SiteHeader />
      <main className="page-shell section" style={{ display: "grid", gap: "1.2rem" }}>
        <div className="section-head">
          <span className="eyebrow">IELTS topics</span>
          <h1 style={{ fontSize: "clamp(2.8rem, 6vw, 4.6rem)", lineHeight: 0.96 }}>
            IELTS Speaking Topics 2025 — Part 1, 2 & 3 Full List
          </h1>
          <p>
            Use this page as a full list of IELTS speaking topics 2025, including Part 1 question
            themes, Part 2 cue card topics, and Part 3 discussion prompts. Every section below is
            built to move you from browsing topics into real speaking practice.
          </p>
        </div>

        <section className="card" style={{ padding: "1.5rem" }}>
          <span className="eyebrow">Part 1</span>
          <h2 style={{ margin: "0.8rem 0 1rem" }}>IELTS Speaking Part 1 topic categories</h2>
          <p className="practice-copy" style={{ marginBottom: "1rem" }}>
            Part 1 questions look simple, but they often reveal weak fluency, vague examples, and
            rushed structure. Use these topic categories to practice more deliberately, then move
            into a <Link href="/free-ielts-speaking-test">free IELTS speaking test</Link> or a full
            <Link href="/app/practice"> AI speaking session</Link>.
          </p>
          <div className="marketing-grid">
            {part1Topics.map((item) => (
              <article key={item.topic} className="card feature-card">
                <h3>{item.topic}</h3>
                <ul style={{ margin: "0.5rem 0 0", paddingLeft: "1.2rem", lineHeight: 1.8, color: "var(--muted)" }}>
                  {item.questions.map((question) => <li key={question}>{question}</li>)}
                </ul>
                <div style={{ marginTop: "0.9rem" }}>
                  <Link className="button button-secondary" href="/app/practice?quickStart=1">
                    Practice this topic
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="card" style={{ padding: "1.5rem" }}>
          <span className="eyebrow">Part 2</span>
          <h2 style={{ margin: "0.8rem 0 1rem" }}>IELTS Speaking Part 2 cue card topics</h2>
          <p className="practice-copy" style={{ marginBottom: "1rem" }}>
            These IELTS cue card topics are useful because they show the kinds of prompts that test
            story flow, detail choice, and time control. If you want topic-specific help, open a related
            topic page or <Link href="/app/practice">practice directly with AI</Link>.
          </p>
          <div className="marketing-grid">
            {cueCards.map((topic, index) => (
              <article key={topic} className="card feature-card">
                <div className="pill" style={{ marginBottom: "0.8rem" }}>Cue card {index + 1}</div>
                <h3>{topic}</h3>
                <p>Use one clear opening, one real example, and one closing thought so the answer feels complete rather than rushed.</p>
                <div style={{ marginTop: "0.9rem" }}>
                  <Link className="button button-secondary" href="/free-ielts-speaking-test">
                    Try a free IELTS speaking test
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="card" style={{ padding: "1.5rem" }}>
          <span className="eyebrow">Part 3</span>
          <h2 style={{ margin: "0.8rem 0 1rem" }}>IELTS Speaking Part 3 discussion topics</h2>
          <p className="practice-copy" style={{ marginBottom: "1rem" }}>
            Part 3 usually becomes difficult when answers stay too short or abstract. Use the topic
            areas below to rehearse opinion, comparison, and cause-effect answers before you take another
            <Link href="/free-ielts-speaking-test"> free IELTS speaking test</Link>.
          </p>
          <div className="marketing-grid">
            {part3Topics.map((item) => (
              <article key={item.topic} className="card feature-card">
                <h3>{item.topic}</h3>
                <ul style={{ margin: "0.5rem 0 0", paddingLeft: "1.2rem", lineHeight: 1.8, color: "var(--muted)" }}>
                  {item.questions.map((question) => <li key={question}>{question}</li>)}
                </ul>
                <div style={{ marginTop: "0.9rem" }}>
                  <Link className="button button-secondary" href="/app/practice?quickStart=1">
                    Practice discussion questions
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="card" style={{ padding: "1.5rem" }}>
          <span className="eyebrow">Topic pages</span>
          <h2 style={{ margin: "0.8rem 0 1rem" }}>Go deeper with focused topic practice</h2>
          <div className="marketing-grid">
            {seoTopicPages.map((topic) => (
              <article key={topic.slug} className="card feature-card interactive-link-card">
                <div className="tool-card-visual" aria-hidden="true">
                  <span className="tool-card-icon">🎯</span>
                  <span className="pill tool-card-badge">Score-focused</span>
                </div>
                <h3>{topic.title}</h3>
                <p>{topic.tip}</p>
                <div className="interactive-link-card-footer">
                  <span className="interactive-link-card-tag">IELTS topic practice</span>
                  <Link className="button button-secondary" href={`/ielts-speaking-topics/${topic.slug}` as Route}>
                    Open topic page
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="card institution-cta">
          <div>
            <span className="eyebrow">Practice next</span>
            <h2 style={{ margin: "0.8rem 0 0.55rem" }}>Turn topic reading into real speaking practice</h2>
            <p className="practice-copy">
              Reading topic lists is useful only if it leads into speaking. Open a free test, practice one
              prompt with AI, or use pricing to unlock full feedback when you want deeper score analysis.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <Link className="button button-primary" href="/app/practice?quickStart=1">
              Start speaking practice
            </Link>
            <Link className="button button-secondary" href="/free-ielts-speaking-test">
              Try a free IELTS speaking test
            </Link>
            <Link className="button button-secondary" href="/pricing">
              View full feedback plan
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
