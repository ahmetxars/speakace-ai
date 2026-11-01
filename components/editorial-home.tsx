"use client";
import Link from "next/link";
import { useState, type KeyboardEvent } from "react";
import { useAppState } from "@/components/providers";
import type { Language } from "@/lib/copy";
import { homeTurkish } from "@/lib/home-translations";
import {
  homeExamples,
  homeRoles,
  homeRolesTurkish,
  homeFeedbackTurkish,
} from "@/lib/home-demo-data";

export function EditorialHome() {
  const { language, setLanguage } = useAppState();
  const tr = language === "tr";
  const t = (text: string) => (tr ? (homeTurkish[text] ?? text) : text);
  const [topic, setTopic] = useState(0);
  const [retry, setRetry] = useState(false);
  const [role, setRole] = useState<keyof typeof homeRoles>("students");
  const [menuOpen, setMenuOpen] = useState(false);
  const sample = {
    ...homeExamples[topic],
    ...(tr ? homeFeedbackTurkish[topic] : {}),
  };
  const audience = (tr ? homeRolesTurkish : homeRoles)[role];
  const changeTopic = (direction: number) => {
    setTopic((topic + direction + homeExamples.length) % homeExamples.length);
    setRetry(false);
  };
  const handleTabKeys = (event: KeyboardEvent<HTMLElement>) => {
    const keys = [
      "ArrowRight",
      "ArrowDown",
      "ArrowLeft",
      "ArrowUp",
      "Home",
      "End",
    ];
    if (!keys.includes(event.key)) return;
    const tabs = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    );
    const index = tabs.indexOf(event.target as HTMLButtonElement);
    if (index < 0) return;
    event.preventDefault();
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? tabs.length - 1
          : (index +
              (["ArrowLeft", "ArrowUp"].includes(event.key) ? -1 : 1) +
              tabs.length) %
            tabs.length;
    tabs[next].click();
    tabs[next].focus();
  };
  return (
    <div
      className="editorial-site"
      onKeyDown={(event) => {
        if (event.key === "Escape") setMenuOpen(false);
      }}
    >
      <a className="skip" href="#main">
        {" "}
        {t("Skip to content")}{" "}
      </a>
      <header className="site-header wrap">
        <Link className="brand" href="/" aria-label="SpeakAce home">
          <span className="brand-mark" aria-hidden="true">
            <i></i>
            <i></i>
            <i></i>
            <i></i>
          </span>
          SpeakAce<span className="brand-dot">.</span>
        </Link>
        <nav aria-label="Main navigation">
          <a href="#practice">{t("The practice")}</a>
          <a href="#for-you">{t("For you")}</a>
          <a href="#plans">{t("Plans")}</a>
          <a href="/resources">
            {" "}
            {t("Resources")} <span aria-hidden="true">↗</span>
          </a>
        </nav>
        <div className="header-actions">
          <select
            className="editorial-locale"
            aria-label="Language"
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
          >
            <option value="en">EN</option>
            <option value="tr">TR</option>
          </select>
          <a className="sign-in" href="/auth?mode=signin">
            {" "}
            {t("Sign in")}{" "}
          </a>
          <a className="button small" href="/app/practice">
            {" "}
            {t("Start free")} <span aria-hidden="true">↗</span>
          </a>
        </div>
        <button
          className="menu-button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
        </button>
      </header>
      <nav
        onClick={() => setMenuOpen(false)}
        id="mobile-nav"
        className="mobile-nav"
        aria-label="Mobile navigation"
        hidden={!menuOpen}
      >
        <a href="#practice">{t("The practice")}</a>
        <a href="#for-you">{t("For you")}</a>
        <a href="#plans">{t("Plans")}</a>
        <a href="/resources">{t("Resources")}</a>
        <a href="/auth?mode=signin">{t("Sign in")}</a>
        <label className="mobile-locale">
          {tr ? "Dil" : "Language"}
          <select
            className="editorial-locale"
            aria-label="Mobile language"
            value={language}
            onChange={(event) => setLanguage(event.target.value as Language)}
          >
            <option value="en">English</option>
            <option value="tr">Türkçe</option>
          </select>
        </label>
      </nav>
      <main id="main">
        <section className="hero wrap">
          <div className="hero-main">
            <h1>
              {tr ? (
                <>
                  IELTS speaking.
                  <br /> Bir sonraki denemen
                  <br /> <em>daha iyi olsun.</em>
                </>
              ) : (
                <>
                  IELTS speaking.
                  <br /> A <em>clearer</em> next attempt.
                </>
              )}
            </h1>
            <div className="hero-aside">
              <p>
                {tr ? (
                  <>
                    Konuş. Neyi geliştireceğini gör.
                    <br /> Biraz daha güvenle tekrar dene.
                  </>
                ) : (
                  <>
                    Say it. See what to improve.
                    <br /> Try again with a little more confidence.
                  </>
                )}
              </p>
              <p className="hero-explain">
                {" "}
                {t(
                  "AI speaking practice for IELTS and TOEFL, with feedback you can actually use.",
                )}{" "}
              </p>
              <a className="button" href="/app/practice">
                {tr ? "Ücretsiz konuşma pratiği" : "Try a free speaking task"}{" "}
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
          <div className="hero-bottom">
            <span>{t("ONE QUESTION. ONE ANSWER. ONE STEP FORWARD.")}</span>
            <a href="#practice">
              {" "}
              {t("Take a look inside")} <span aria-hidden="true">↓</span>
            </a>
          </div>
        </section>
        <section
          className="practice-section wrap"
          id="practice"
          aria-labelledby="demo-title"
        >
          <div className="workbench">
            <div className="workbench-header">
              <div className="workspace-brand">
                <span className="tiny-mark" aria-hidden="true">
                  ✳
                </span>{" "}
                {t("The practice room")}{" "}
                <span className="demo-label">{t("INTERACTIVE EXAMPLE")}</span>
              </div>
              <span className="room-note">
                {" "}
                {t("A little practice goes a long way.")}{" "}
              </span>
            </div>
            <div className="workbench-body">
              <aside className="prompt-panel">
                <div className="prompt-top">
                  <span id="exam-tag">{sample.tag}</span>
                  <span className="topic-count">0{topic + 1} / 03</span>
                </div>
                <div>
                  <span className="prompt-caption">
                    {t("LET’S TALK ABOUT")}
                  </span>
                  <h2
                    id="demo-title"
                    dangerouslySetInnerHTML={{ __html: sample.title }}
                  />
                  <p id="question">{sample.question}</p>
                </div>
                <div className="prompt-bottom">
                  <div className="waveform" aria-hidden="true">
                    <i></i>
                    <i></i>
                    <i></i>
                    <i></i>
                    <i></i>
                    <i></i>
                    <i></i>
                    <i></i>
                    <i></i>
                    <i></i>
                    <i></i>
                    <i></i>
                    <i></i>
                    <i></i>
                    <i></i>
                    <i></i>
                    <i></i>
                    <i></i>
                    <i></i>
                    <i></i>
                    <i></i>
                    <i></i>
                    <i></i>
                    <i></i>
                    <i></i>
                    <i></i>
                    <i></i>
                    <i></i>
                    <i></i>
                    <i></i>
                    <i></i>
                    <i></i>
                    <i></i>
                    <i></i>
                    <i></i>
                  </div>
                  <p>{t("Small steps. Spoken out loud.")}</p>
                  <div className="topic-controls">
                    <span>{t("Explore a question")}</span>
                    <button
                      onClick={() => changeTopic(-1)}
                      id="previous-topic"
                      aria-label="Previous example question"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => changeTopic(1)}
                      id="next-topic"
                      aria-label="Next example question"
                    >
                      →
                    </button>
                  </div>
                </div>
              </aside>
              <div className="feedback-panel">
                <div className="feedback-heading">
                  <span className="eyebrow">
                    {t("FROM AN ANSWER TO AN AHA.")}
                  </span>
                  <span className="sample-badge">{t("Sample feedback")}</span>
                </div>
                <div
                  className="answer-tabs"
                  role="tablist"
                  onKeyDown={handleTabKeys}
                  aria-label="Example answer"
                >
                  <button
                    id="tab-first"
                    onClick={() => setRetry(false)}
                    role="tab"
                    aria-selected={!retry}
                    aria-controls="answer-panel"
                    tabIndex={retry ? -1 : 0}
                    data-attempt="first"
                  >
                    {" "}
                    {t("First attempt")}{" "}
                  </button>
                  <button
                    id="tab-retry"
                    onClick={() => setRetry(true)}
                    role="tab"
                    aria-selected={retry}
                    aria-controls="answer-panel"
                    tabIndex={retry ? 0 : -1}
                    data-attempt="retry"
                  >
                    {" "}
                    {t("After one small change")}{" "}
                    <span aria-hidden="true">↗</span>
                  </button>
                </div>
                <div
                  id="answer-panel"
                  role="tabpanel"
                  aria-labelledby={retry ? "tab-retry" : "tab-first"}
                  tabIndex={0}
                >
                  <div className="transcript-label">
                    <span>{t("YOUR TRANSCRIPT")}</span>
                    <span id="answer-duration">
                      {t("EXAMPLE 0")}
                      {topic + 1}
                    </span>
                  </div>
                  <blockquote
                    id="transcript"
                    dangerouslySetInnerHTML={{
                      __html: retry ? sample.retry : sample.first,
                    }}
                  />
                  <div className="coach-note">
                    <span className="note-icon" aria-hidden="true">
                      ↳
                    </span>
                    <div>
                      <h3 id="feedback-title">
                        {retry ? sample.retryHeading : sample.heading}
                      </h3>
                      <p id="feedback-text">
                        {retry ? sample.retryFeedback : sample.feedback}
                      </p>
                    </div>
                  </div>
                  <div className="next-step">
                    <span className="step-star" aria-hidden="true">
                      ✳
                    </span>
                    <p id="next-instruction">
                      <strong>
                        {retry
                          ? tr
                            ? "Devam et"
                            : "Keep going"
                          : tr
                            ? "Sonraki denemen"
                            : "Your next attempt"}
                      </strong>
                      {retry ? sample.retryNext : sample.next}
                    </p>
                    <button id="show-retry" onClick={() => setRetry(!retry)}>
                      {retry
                        ? tr
                          ? "İlk cevaba dön ↶"
                          : "Back to first answer ↶"
                        : tr
                          ? "Yeni denemeyi gör →"
                          : "See the retry →"}
                    </button>
                  </div>
                </div>
                <p className="demo-footnote">
                  {" "}
                  {t(
                    "An illustrative example, not a live assessment. Your own feedback comes from your recording.",
                  )}{" "}
                </p>
              </div>
            </div>
            <div className="workbench-footer">
              <span>
                <span className="check" aria-hidden="true">
                  ✓
                </span>{" "}
                {t("Exam-shaped questions")}{" "}
              </span>
              <span>
                <span className="check" aria-hidden="true">
                  ✓
                </span>{" "}
                {t("A transcript of your answer")}{" "}
              </span>
              <span>
                <span className="check" aria-hidden="true">
                  ✓
                </span>{" "}
                {t("A specific next step")}{" "}
              </span>
              <a href="/app/practice">
                {" "}
                {t("Now try your own")} <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </section>
        <section className="loop-section wrap" aria-labelledby="loop-title">
          <div className="section-intro">
            <div>
              <h2 id="loop-title">
                {" "}
                {t("Make practice")} <br /> <em>{t("go somewhere.")}</em>
              </h2>
            </div>
            <p>
              {" "}
              {t("You don’t need another list of tips.")} <br />{" "}
              {t("You need to know what to do with")} <br />{" "}
              {t("the answer you just gave.")}{" "}
            </p>
          </div>
          <div className="loop-rows">
            <article>
              <span className="row-number">01</span>
              <h3>
                {" "}
                {t("Pick a question.")} <br /> {t("Make it yours.")}{" "}
              </h3>
              <p>
                {" "}
                {t(
                  "Choose an IELTS or TOEFL speaking task. Take a breath and answer in your own words.",
                )}{" "}
              </p>
              <span className="row-symbol" aria-hidden="true">
                ↗
              </span>
            </article>
            <article>
              <span className="row-number">02</span>
              <h3>
                {" "}
                {t("Hear yourself.")} <br /> {t("See the details.")}{" "}
              </h3>
              <p>
                {" "}
                {t(
                  "Read your transcript alongside AI feedback on fluency, vocabulary, grammar, and pronunciation.",
                )}{" "}
              </p>
              <span className="row-symbol" aria-hidden="true">
                ≋
              </span>
            </article>
            <article>
              <span className="row-number">03</span>
              <h3>
                {" "}
                {t("Change one thing.")} <br /> {t("Say it again.")}{" "}
              </h3>
              <p>
                {" "}
                {t(
                  "Put the feedback into your next attempt while the question is still fresh. Keep building from there.",
                )}{" "}
              </p>
              <span className="row-symbol" aria-hidden="true">
                ↻
              </span>
            </article>
          </div>
          <p className="honesty">
            <span aria-hidden="true">ⓘ</span>{" "}
            {t(
              "AI scores are practice estimates. Official IELTS and TOEFL results come from their authorised exam providers.",
            )}{" "}
          </p>
        </section>
        <section
          className="audience-section"
          id="for-you"
          aria-labelledby="audience-title"
        >
          <div className="wrap audience-grid">
            <div className="audience-left">
              <span className="eyebrow">{t("A PLACE FOR YOUR PRACTICE")}</span>
              <h2 id="audience-title">
                {" "}
                {t("On your own.")} <br /> {t("In a class.")} <br />{" "}
                <em>{t("Moving forward.")}</em>
              </h2>
              <div
                className="audience-tabs"
                role="tablist"
                onKeyDown={handleTabKeys}
                aria-label="Choose your role"
                aria-orientation="vertical"
              >
                <button
                  id="role-students"
                  onClick={() => setRole("students")}
                  role="tab"
                  aria-selected={role === "students"}
                  aria-controls="role-panel"
                  tabIndex={role === "students" ? 0 : -1}
                  data-role="students"
                >
                  {" "}
                  {t("For students")} <span aria-hidden="true">↗</span>
                </button>
                <button
                  id="role-teachers"
                  onClick={() => setRole("teachers")}
                  role="tab"
                  aria-selected={role === "teachers"}
                  aria-controls="role-panel"
                  tabIndex={role === "teachers" ? 0 : -1}
                  data-role="teachers"
                >
                  {" "}
                  {t("For teachers")} <span aria-hidden="true">↗</span>
                </button>
                <button
                  id="role-schools"
                  onClick={() => setRole("schools")}
                  role="tab"
                  aria-selected={role === "schools"}
                  aria-controls="role-panel"
                  tabIndex={role === "schools" ? 0 : -1}
                  data-role="schools"
                >
                  {" "}
                  {t("For schools")} <span aria-hidden="true">↗</span>
                </button>
              </div>
            </div>
            <div
              className="audience-right"
              id="role-panel"
              role="tabpanel"
              aria-labelledby={`role-${role}`}
              tabIndex={0}
            >
              <div className="notebook">
                <div className="notebook-top">
                  <span>{audience.label}</span>
                  <span aria-hidden="true">↗</span>
                </div>
                <div className="notebook-line">
                  <span className="hand-check" aria-hidden="true">
                    ✓
                  </span>
                  <span id="note-one">{audience.notes[0]}</span>
                </div>
                <div className="notebook-line">
                  <span className="hand-check" aria-hidden="true">
                    ✓
                  </span>
                  <span id="note-two">{audience.notes[1]}</span>
                </div>
                <div className="notebook-line">
                  <span className="hand-check" aria-hidden="true">
                    ✓
                  </span>
                  <span id="note-three">{audience.notes[2]}</span>
                </div>
                <div className="notebook-bottom">
                  <span id="note-caption">{audience.caption}</span>
                  <span className="notebook-flower" aria-hidden="true">
                    ✳
                  </span>
                </div>
              </div>
              <h3 id="role-title">{audience.title}</h3>
              <p id="role-description">{audience.description}</p>
              <a
                id="role-link"
                href={audience.url.replace("https://speakace.org", "")}
              >
                {audience.link} <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </section>
        <section
          className="plans-section wrap"
          id="plans"
          aria-labelledby="plans-title"
        >
          <div className="section-intro">
            <div>
              <span className="eyebrow">
                {t("START WITH YOUR OWN EXPERIENCE")}
              </span>
              <h2 id="plans-title">
                {" "}
                {t("Try it first.")} <br /> <em>{t("Find your rhythm.")}</em>
              </h2>
            </div>
            <p>
              {" "}
              {t("Start free and see how the feedback feels.")} <br />{" "}
              {t("Plus is there when you want more")} <br />{" "}
              {t("room to practise.")}{" "}
            </p>
          </div>
          <div className="plan-comparison">
            <article className="free-plan">
              <span className="eyebrow">{t("A PLACE TO START")}</span>
              <div className="plan-title">
                <h3>{t("Free")}</h3>
                <span>$0</span>
              </div>
              <p>{t("Get to know your voice.")}</p>
              <ul>
                <li>{t("4 speaking sessions per day")}</li>
                <li>{t("8 minutes of daily speaking practice")}</li>
                <li>{t("Starter score view and transcript preview")}</li>
              </ul>
              <a className="button outline" href="/app/practice">
                {" "}
                {t("Start practising free")} <span aria-hidden="true">↗</span>
              </a>
            </article>
            <article className="plus-plan">
              <span className="eyebrow">{t("MORE ROOM TO GROW")}</span>
              <div className="plan-title">
                <h3>SpeakAce Plus</h3>
                <span className="plus-symbol" aria-hidden="true">
                  +
                </span>
              </div>
              <p>{t("Keep a good practice going.")}</p>
              <ul>
                <li>{t("18 sessions and 35 speaking minutes daily")}</li>
                <li>{t("Expanded feedback and progress tracking")}</li>
                <li>{t("Writing Task 2 scoring and corrections")}</li>
              </ul>
              <a className="button" href="/pricing">
                {" "}
                {t("Explore Plus plans")} <span aria-hidden="true">↗</span>
              </a>
            </article>
          </div>
          <p className="plan-note">
            {" "}
            {t(
              "See current prices, billing periods, and any trial terms on the SpeakAce plans page.",
            )}{" "}
          </p>
        </section>
        <section className="faq-section wrap" aria-labelledby="faq-title">
          <div>
            <span className="eyebrow">{t("A FEW THINGS TO KNOW")}</span>
            <h2 id="faq-title">
              {" "}
              {t("Before you")} <br /> <em>{t("press record.")}</em>
            </h2>
          </div>
          <div className="questions">
            <details>
              <summary>
                {" "}
                {t("Is the AI score an official IELTS band?")}{" "}
                <span aria-hidden="true">+</span>
              </summary>
              <p>
                {" "}
                {t(
                  "No. It is a practice estimate that helps you review your answer and track your practice. It does not replace an official exam or an examiner’s judgement.",
                )}{" "}
              </p>
            </details>
            <details>
              <summary>
                {" "}
                {t("Can I try it without creating an account?")}{" "}
                <span aria-hidden="true">+</span>
              </summary>
              <p>
                {" "}
                {t(
                  "You can explore the interactive example without an account. Create a free account to record your answer, get personalised feedback and save your progress.",
                )}{" "}
              </p>
            </details>
            <details>
              <summary>
                {" "}
                {t("Does SpeakAce also support TOEFL?")}{" "}
                <span aria-hidden="true">+</span>
              </summary>
              <p>
                {" "}
                {t(
                  "Yes. You can practise TOEFL-style speaking tasks as well as IELTS tasks, with transcript review and focused feedback.",
                )}{" "}
              </p>
            </details>
            <details>
              <summary>
                {" "}
                {t("Can I use it with my students?")}
                <span aria-hidden="true">+</span>
              </summary>
              <p>
                {" "}
                {t(
                  "Teachers can create classes, assign speaking homework, and review student attempts.",
                )}{" "}
                <a href="/for-teachers">
                  {t("Explore the teacher workflow ↗")}
                </a>
              </p>
            </details>
          </div>
        </section>
        <section className="final-section wrap">
          <div className="final-top">
            <span className="eyebrow">
              {t("YOUR NEXT ATTEMPT IS WAITING.")}
            </span>
            <span aria-hidden="true">↗</span>
          </div>
          <div className="final-main">
            <h2>
              {" "}
              {t("A little less hesitation.")} <br />{" "}
              <em>{t("A little more you.")}</em>
            </h2>
            <div>
              <a className="button light" href="/app/practice">
                {" "}
                {t("Let’s get speaking")} <span aria-hidden="true">↗</span>
              </a>
              <p>{t("Start free. See where one answer takes you.")}</p>
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer wrap">
        <div className="footer-top">
          <Link className="brand" href="/">
            <span className="brand-mark" aria-hidden="true">
              <i></i>
              <i></i>
              <i></i>
              <i></i>
            </span>
            SpeakAce<span className="brand-dot">.</span>
          </Link>
          <p>{t("A clearer next attempt.")}</p>
          <div>
            <a href="/about">{t("About")}</a>
            <a href="/contact">{t("Contact")}</a>
            <a href="/resources">{t("Resources")}</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 SpeakAce</span>
          <span>{t("Independent IELTS & TOEFL practice.")}</span>
          <div>
            <a href="/cookie-policy">{t("Cookies")}</a>
            <a href="/privacy-policy">{t("Privacy")}</a>
            <a href="/terms">{t("Terms")}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
