"use client";
import Link from "next/link";
import { PreviewScenes } from "@/components/motion/preview-scenes";
import { MotionDisclosure } from "@/components/motion/motion-disclosure";
import { useLayoutEffect, useRef, useState } from "react";
import { handleTabKeys } from "@/lib/tab-navigation";
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
  const [instantMotion, setInstantMotion] = useState(false);
  const retryControl = useRef<HTMLButtonElement>(null);
  const restoreRetryFocus = useRef(false);
  useLayoutEffect(() => {
    if (!restoreRetryFocus.current) return;
    retryControl.current?.focus({ preventScroll: true });
    restoreRetryFocus.current = false;
  }, [retry]);
  const samples = homeExamples.map((example, index) => ({
    ...example,
    ...(tr ? homeFeedbackTurkish[index] : {}),
  }));
  const roles = tr ? homeRolesTurkish : homeRoles;
  const roleKeys = Object.keys(homeRoles) as Array<keyof typeof homeRoles>;
  const changeTopic = (direction: number) => {
    setTopic((current) => (current + direction + homeExamples.length) % homeExamples.length);
    setRetry(false);
  };
  return (
    <div
      className="editorial-site"
      data-instant-motion={instantMotion || undefined}
      onKeyDownCapture={() => setInstantMotion(true)}
      onPointerDownCapture={() => setInstantMotion(false)}
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
          aria-label={tr ? (menuOpen ? "Menüyü kapat" : "Menüyü aç") : (menuOpen ? "Close navigation" : "Open navigation")}
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
          <svg className="hero-frequency" viewBox="0 0 600 180" fill="none" aria-hidden="true">
            <path d="M0 90H120C145 90 148 55 163 55S180 135 195 135S210 20 226 20S241 160 257 160S273 45 289 45S305 125 322 125S340 70 357 70S375 90 405 90H600" />
            <path d="M0 104H110C145 104 148 83 163 83S180 122 195 122S210 56 226 56S241 143 257 143S273 70 289 70S305 118 322 118S340 91 357 91S375 104 405 104H600" />
          </svg>
          <div className="hero-main">
            <h1>
              {tr ? (
                <>
                  <span className="hero-title-lead">IELTS speaking.</span>
                  <span className="hero-title-follow">Bir sonraki denemen<br /><em>daha iyi olsun.</em></span>
                </>
              ) : (
                <>
                  <span className="hero-title-lead">IELTS speaking.</span>
                  <span className="hero-title-follow">A <em>clearer</em> next attempt.</span>
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
          <div className="workbench" data-reveal>
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
                  <span id="exam-tag">{samples[topic].tag}</span>
                  <span className="topic-count" aria-live="polite" aria-atomic="true">0{topic + 1} / 03</span>
                </div>
                <PreviewScenes active={topic} mode="question">
                  {samples.map((sample, index) => (
                    <div key={index}>
                      <span className="prompt-caption">{t("LET’S TALK ABOUT")}</span>
                      <h2 id={index === topic ? "demo-title" : undefined} dangerouslySetInnerHTML={{ __html: sample.title }} />
                      <p className="example-question" id={index === topic ? "question" : undefined}>{sample.question}</p>
                    </div>
                  ))}
                </PreviewScenes>
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
                  <div className="question-progress" aria-hidden="true">
                    {samples.map((_, index) => <i key={index} data-active={topic === index} />)}
                  </div>
                  <div className="topic-controls">
                    <span>{t("Explore a question")}</span>
                    <button
                      onClick={() => changeTopic(-1)}
                      id="previous-topic"
                      aria-label={tr ? "Önceki örnek soru" : "Previous example question"}
                    >
                      ←
                    </button>
                    <button
                      onClick={() => changeTopic(1)}
                      id="next-topic"
                      aria-label={tr ? "Sonraki örnek soru" : "Next example question"}
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
                  <PreviewScenes active={topic * 2 + Number(retry)}>
                    {samples.flatMap((sample, sampleIndex) => [false, true].map((isRetry) => {
                      const selected = sampleIndex === topic && isRetry === retry;
                      return (
                        <div key={`${sampleIndex}-${isRetry}`}>
                          <div className="transcript-label">
                            <span>{t("YOUR TRANSCRIPT")}</span>
                            <span id={selected ? "answer-duration" : undefined}>{t("EXAMPLE 0")}{sampleIndex + 1}</span>
                          </div>
                          <blockquote id={selected ? "transcript" : undefined} dangerouslySetInnerHTML={{ __html: isRetry ? sample.retry : sample.first }} />
                          <div className="coach-note">
                            <span className="note-icon" aria-hidden="true">↳</span>
                            <div>
                              <h3 id={selected ? "feedback-title" : undefined}>{isRetry ? sample.retryHeading : sample.heading}</h3>
                              <p id={selected ? "feedback-text" : undefined}>{isRetry ? sample.retryFeedback : sample.feedback}</p>
                            </div>
                          </div>
                          <div className="next-step">
                            <span className="step-star" aria-hidden="true">✳</span>
                            <p id={selected ? "next-instruction" : undefined}>
                              <strong>{isRetry ? (tr ? "Devam et" : "Keep going") : (tr ? "Sonraki denemen" : "Your next attempt")}</strong>
                              {isRetry ? sample.retryNext : sample.next}
                            </p>
                            <button ref={selected ? retryControl : undefined} id={selected ? "show-retry" : undefined} onClick={() => { restoreRetryFocus.current = true; setRetry((current) => !current); }}>
                              {isRetry ? (tr ? "İlk cevaba dön ↶" : "Back to first answer ↶") : (tr ? "Yeni denemeyi gör →" : "See the retry →")}
                            </button>
                          </div>
                        </div>
                      );
                    }))}
                  </PreviewScenes>
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
          <div className="section-intro" data-reveal>
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
            <article data-reveal>
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
            <article data-reveal data-reveal-delay="90">
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
            <article data-reveal data-reveal-delay="180">
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
            <div className="audience-left" data-reveal>
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
              <PreviewScenes active={roleKeys.indexOf(role)}>
                {roleKeys.map((roleKey) => {
                  const audience = roles[roleKey];
                  const selected = roleKey === role;
                  return <div key={roleKey} className="audience-scene">
              <div className="notebook">
                <div className="notebook-top">
                  <span>{audience.label}</span>
                  <span aria-hidden="true">↗</span>
                </div>
                <div className="notebook-line">
                  <span className="hand-check" aria-hidden="true">
                    ✓
                  </span>
                  <span id={selected ? "note-one" : undefined}>{audience.notes[0]}</span>
                </div>
                <div className="notebook-line">
                  <span className="hand-check" aria-hidden="true">
                    ✓
                  </span>
                  <span id={selected ? "note-two" : undefined}>{audience.notes[1]}</span>
                </div>
                <div className="notebook-line">
                  <span className="hand-check" aria-hidden="true">
                    ✓
                  </span>
                  <span id={selected ? "note-three" : undefined}>{audience.notes[2]}</span>
                </div>
                <div className="notebook-bottom">
                  <span id={selected ? "note-caption" : undefined}>{audience.caption}</span>
                  <span className="notebook-flower" aria-hidden="true">
                    ✳
                  </span>
                </div>
              </div>
              <h3 id={selected ? "role-title" : undefined}>{audience.title}</h3>
              <p id={selected ? "role-description" : undefined}>{audience.description}</p>
              <a
                id={selected ? "role-link" : undefined}
                href={audience.url.replace("https://speakace.org", "")}
              >
                {audience.link} <span aria-hidden="true">↗</span>
              </a>
                  </div>;
                })}
              </PreviewScenes>
            </div>
          </div>
        </section>
        <section
          className="plans-section wrap"
          id="plans"
          aria-labelledby="plans-title"
        >
          <div className="section-intro" data-reveal>
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
            <article className="free-plan" data-reveal>
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
            <article className="plus-plan" data-reveal data-reveal-delay="90">
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
            <MotionDisclosure title={<>
                {" "}
                {t("Is the AI score an official IELTS band?")}{" "}
                </>}>
              <p>
                {" "}
                {t(
                  "No. It is a practice estimate that helps you review your answer and track your practice. It does not replace an official exam or an examiner’s judgement.",
                )}{" "}
              </p>
            </MotionDisclosure>
            <MotionDisclosure title={<>
                {" "}
                {t("Can I try it without creating an account?")}{" "}
                </>}>
              <p>
                {" "}
                {t(
                  "You can explore the interactive example without an account. Create a free account to record your answer, get personalised feedback and save your progress.",
                )}{" "}
              </p>
            </MotionDisclosure>
            <MotionDisclosure title={<>
                {" "}
                {t("Does SpeakAce also support TOEFL?")}{" "}
                </>}>
              <p>
                {" "}
                {t(
                  "Yes. You can practise TOEFL-style speaking tasks as well as IELTS tasks, with transcript review and focused feedback.",
                )}{" "}
              </p>
            </MotionDisclosure>
            <MotionDisclosure title={<>
                {" "}
                {t("Can I use it with my students?")}
                </>}>
              <p>
                {" "}
                {t(
                  "Teachers can create classes, assign speaking homework, and review student attempts.",
                )}{" "}
                <a href="/for-teachers">
                  {t("Explore the teacher workflow ↗")}
                </a>
              </p>
            </MotionDisclosure>
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
            <h2 data-reveal>
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
