"use client";

import { useMemo, useState } from "react";

type DemoScenario = {
  id: string;
  label: string;
  prompt: string;
  transcript: string;
  score: string;
  focus: string;
  improvement: string;
};

const scenarios: DemoScenario[] = [
  {
    id: "part2",
    label: "IELTS Part 2",
    prompt: "Describe a useful object you use every day.",
    transcript:
      "I want to talk about my phone because I use it every day for communication, study, and planning. It is useful because it saves time and helps me stay organized.",
    score: "6.5",
    focus: "Good structure, but the answer needs a more personal example and stronger vocabulary.",
    improvement: "Add one short story about a real moment when the object helped you."
  },
  {
    id: "part3",
    label: "IELTS Part 3",
    prompt: "Do you think technology improves communication?",
    transcript:
      "Yes, I think technology improves communication because people can contact each other quickly. However, it can also reduce face-to-face interaction in daily life.",
    score: "7.0",
    focus: "Balanced answer with a clear opinion, but one supporting example would make it stronger.",
    improvement: "Give one example from work, study, or family communication."
  },
  {
    id: "toefl",
    label: "TOEFL Task",
    prompt: "Explain whether students should study alone or with a group.",
    transcript:
      "I prefer group study because students can compare ideas and motivate each other. It is also useful when they need help understanding difficult concepts.",
    score: "24/30",
    focus: "Clear position and useful logic, but transitions and delivery could sound more natural.",
    improvement: "Use one contrast phrase and one concrete academic example."
  }
];

export function MarketingDemoShowcase({ tr }: { tr: boolean }) {
  const [activeId, setActiveId] = useState(scenarios[0].id);

  const activeScenario = useMemo(
    () => scenarios.find((item) => item.id === activeId) ?? scenarios[0],
    [activeId]
  );

  return (
    <section className="page-shell section">
      <div className="section-head">
        <span className="eyebrow">{tr ? "Canli demo hissi" : "Interactive preview"}</span>
        <h2>{tr ? "SpeakAce geri bildirimi nasil hissettiriyor?" : "See what the SpeakAce feedback loop feels like"}</h2>
        <p>
          {tr
            ? "Uye olmadan once bile transcript, tahmini skor ve sonraki en iyi adim mantigini gosteren canli bir onizleme."
            : "A live preview that shows transcript logic, estimated score, and the best next step before a visitor even signs up."}
        </p>
      </div>

      <div className="marketing-demo-tabs" role="tablist" aria-label="Demo scenarios">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            type="button"
            className={scenario.id === activeScenario.id ? "marketing-demo-tab active" : "marketing-demo-tab"}
            onClick={() => setActiveId(scenario.id)}
          >
            {scenario.label}
          </button>
        ))}
      </div>

      <div className="marketing-demo-grid">
        <article className="card marketing-demo-card">
          <span className="demo-label">{tr ? "Soru" : "Prompt"}</span>
          <h3>{activeScenario.prompt}</h3>
          <p>{activeScenario.transcript}</p>
        </article>

        <article className="card marketing-demo-card">
          <div className="marketing-demo-score">
            <span className="demo-label">{tr ? "Tahmini sonuc" : "Estimated result"}</span>
            <strong>{activeScenario.score}</strong>
          </div>
          <div className="marketing-demo-points">
            <div>
              <span className="demo-label">{tr ? "Ana geri bildirim" : "Main feedback"}</span>
              <p>{activeScenario.focus}</p>
            </div>
            <div>
              <span className="demo-label">{tr ? "Sonraki en iyi adim" : "Best next step"}</span>
              <p>{activeScenario.improvement}</p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
