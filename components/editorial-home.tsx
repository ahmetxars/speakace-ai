"use client";
import { PreviewScenes } from "@/components/motion/preview-scenes";
import { MotionDisclosure } from "@/components/motion/motion-disclosure";
import { useState } from "react";
import { EditorialPublicHeader } from "@/components/editorial-public-header";
import { PublicFooter } from "@/components/public/footer";
import { HeroProductShowcase, PracticeSignal, AudienceProductScene, FinalCTAVisual } from "@/components/voice-in-motion/product-scenes";
import { FeedbackTransformation } from "@/components/voice-in-motion/feedback-transformation";
import { ScrollPracticeJourney } from "@/components/voice-in-motion/scroll-practice-journey";
import { handleTabKeys } from "@/lib/tab-navigation";
import { useAppState } from "@/components/providers";
import { homeTurkish } from "@/lib/home-translations";
import {
  homeExamples,
  homeRoles,
  homeRolesTurkish,
  homeFeedbackTurkish,
} from "@/lib/home-demo-data";

export function EditorialHome() {
  const { language } = useAppState();
  const tr = language === "tr";
  const t = (text: string) => (tr ? (homeTurkish[text] ?? text) : text);
  const [topic, setTopic] = useState(0);
  const [retry, setRetry] = useState(false);
  const [role, setRole] = useState<keyof typeof homeRoles>("students");
  const [instantMotion, setInstantMotion] = useState(false);
  const [autoplayPaused, setAutoplayPaused] = useState(false);
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
      className="editorial-site voice-in-motion-site"
      data-instant-motion={instantMotion || undefined}
      data-autoplay-paused={autoplayPaused || undefined}
      onKeyDownCapture={() => setInstantMotion(true)}
      onPointerDownCapture={() => setInstantMotion(false)}
    >
      <a className="skip" href="#main">
        {" "}
        {t("Skip to content")}{" "}
      </a>
      <EditorialPublicHeader home />
      <main id="main">
        <section className="hero wrap">
          <div className="voice-hero-layout">
            <div className="voice-hero-copy">
            <span className="voice-hero-kicker"><span aria-hidden="true">✳</span>{tr ? "BİR SES. DAHA NET BİR FİKİR." : "ONE VOICE. A CLEARER PICTURE."}</span>
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
            <HeroProductShowcase tr={tr} paused={autoplayPaused} onPause={() => setAutoplayPaused((current) => !current)} />
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
          <div className="workbench voice-workbench">
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
                      <p lang="en" className="example-question" id={index === topic ? "question" : undefined}>{sample.question}</p>
                    </div>
                  ))}
                </PreviewScenes>
                <div className="prompt-bottom">
                  <PracticeSignal tr={tr} topic={topic} key={topic} />
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
                  <FeedbackTransformation sample={samples[topic]} topic={topic} retry={retry} tr={tr} instant={instantMotion} onToggle={() => setRetry((current) => !current)} />
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
          <ScrollPracticeJourney tr={tr} />
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
              <AudienceProductScene role={roleKey} tr={tr} notes={audience.notes} label={audience.label} caption={audience.caption} />
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
          <FinalCTAVisual />
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
      <PublicFooter compact home />
    </div>
  );
}
