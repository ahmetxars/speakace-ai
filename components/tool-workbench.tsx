"use client";

import { useMemo, useState } from "react";
import { useAppState } from "@/components/providers";

const cueCards = [
  "Describe a useful object you use every day.",
  "Describe a person who helped you during a difficult time.",
  "Describe a place where you feel relaxed.",
  "Describe a skill you want to learn in the future."
];

const part1Questions = [
  "Do you enjoy your daily routine?",
  "What do you usually do in the evening?",
  "Do you prefer studying alone or with friends?",
  "How often do you use your phone for study?"
];

const followUpQuestions = [
  "Why do some people find it hard to change their habits?",
  "How can technology improve daily life in your country?",
  "Do you think public places should be quieter than they are now?",
  "Why do younger people often learn new skills faster?"
];

const topics = [
  "A place you want to visit again",
  "A book that changed your opinion",
  "A teacher who made learning easier",
  "A piece of technology that saves time"
];

const openings = [
  "One object I use almost every day is...",
  "A person who had a real impact on me is...",
  "One place that helps me relax is...",
  "A skill I would really like to build is..."
];

const transitions = [
  "What stands out most is that...",
  "Another reason is that...",
  "A simple example of this is...",
  "That is why I would say..."
];

export function ToolWorkbench({ slug, title }: { slug: string; title: string }) {
  const { language } = useAppState();
  const tr = language === "tr";
  const [fluency, setFluency] = useState(6);
  const [pronunciation, setPronunciation] = useState(6);
  const [grammar, setGrammar] = useState(6);
  const [vocabulary, setVocabulary] = useState(6);
  const [minutesPerDay, setMinutesPerDay] = useState(15);
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [promptIndex, setPromptIndex] = useState(0);

  const estimatedBand = useMemo(() => {
    const avg = (fluency + pronunciation + grammar + vocabulary) / 4;
    return avg.toFixed(1);
  }, [fluency, pronunciation, grammar, vocabulary]);

  const generatorOutput = useMemo(() => {
    if (slug.includes("cue-card")) return cueCards[promptIndex % cueCards.length];
    if (slug.includes("part-1-question")) return part1Questions[promptIndex % part1Questions.length];
    if (slug.includes("follow-up-question")) return followUpQuestions[promptIndex % followUpQuestions.length];
    if (slug.includes("topic")) return topics[promptIndex % topics.length];
    if (slug.includes("opening")) return openings[promptIndex % openings.length];
    if (slug.includes("idea")) return `${topics[promptIndex % topics.length]} - use one reason and one personal example.`;
    if (slug.includes("transition")) return transitions[promptIndex % transitions.length];
    if (slug.includes("checklist")) {
      return tr
        ? "1) Direkt cevap ver 2) Bir neden ekle 3) Bir örnek ver 4) Kısa ama temiz kapat"
        : "1) Answer directly 2) Add one reason 3) Give one example 4) Finish cleanly";
    }
    if (slug.includes("follow-up-answer-builder")) {
      return tr
        ? "Fikir: kısa görüş + bir neden + küçük gerçek örnek"
        : "Shape: short opinion + one reason + one real example";
    }
    if (slug.includes("toefl-speaking-note-template")) {
      return tr
        ? "Ana konu | Nokta 1 | Nokta 2 | Kısa sonuç"
        : "Main topic | Point 1 | Point 2 | Short conclusion";
    }
    return "";
  }, [promptIndex, slug, tr]);

  const studyPlan = useMemo(() => {
    const focus = minutesPerDay >= 20 ? (tr ? "1 tam deneme + 1 tekrar" : "1 full attempt + 1 retry") : tr ? "1 kısa drill + 1 transcript review" : "1 short drill + 1 transcript review";
    return tr
      ? `${daysPerWeek} gunluk plana gore her oturumda ${focus}. Haftada 1 gun sadece review ve weak skill icin ayir.`
      : `With ${daysPerWeek} practice days, use ${focus} in each session. Keep one day for review and weak-skill cleanup.`;
  }, [daysPerWeek, minutesPerDay, tr]);

  const nextGenerator = () => setPromptIndex((value) => value + 1);

  const isCalculator = slug.includes("calculator");
  const isStudyPlan = slug.includes("study-plan") || slug.includes("schedule");
  const isGenerator =
    slug.includes("generator") ||
    slug.includes("builder") ||
    slug.includes("template") ||
    slug.includes("opening") ||
    slug.includes("transition") ||
    slug.includes("checklist");

  return (
    <section className="card tool-workbench">
      <div>
        <span className="eyebrow">{tr ? "Canli arac" : "Live tool"}</span>
        <h2 style={{ margin: "0.8rem 0 0.35rem" }}>{title}</h2>
        <p className="practice-copy" style={{ margin: 0 }}>
          {tr
            ? "Bu sayfayi sadece okumak yerine burada hizli bir cikti alip sonra practice'e tasiyabilirsin."
            : "Instead of only reading this page, use the mini tool below and carry the result into a real speaking attempt."}
        </p>
      </div>

      {isCalculator ? (
        <div className="tool-form-grid">
          {[
            { label: tr ? "Akicilik" : "Fluency", value: fluency, set: setFluency },
            { label: tr ? "Telaffuz" : "Pronunciation", value: pronunciation, set: setPronunciation },
            { label: tr ? "Grammar" : "Grammar", value: grammar, set: setGrammar },
            { label: tr ? "Kelime" : "Vocabulary", value: vocabulary, set: setVocabulary }
          ].map((item) => (
            <label key={item.label} className="card" style={{ padding: "0.95rem", background: "var(--surface-strong)", display: "grid", gap: "0.5rem" }}>
              <strong>{item.label}</strong>
              <input type="range" min="4" max="9" step="0.5" value={item.value} onChange={(event) => item.set(Number(event.target.value))} />
              <span className="practice-meta">{item.value.toFixed(1)}</span>
            </label>
          ))}
          <div className="card tool-output">
            <span className="pill">{tr ? "Tahmini band" : "Estimated band"}</span>
            <strong>{estimatedBand}</strong>
            <p>
              {tr
                ? "Skoru daha hizli yukari tasiyan sey genelde tek bir alani muthis yapmak degil, dort alani da daha dengeli hale getirmektir."
                : "The fastest score lift usually comes from balancing all four categories, not from over-fixing only one."}
            </p>
          </div>
        </div>
      ) : null}

      {isStudyPlan ? (
        <div className="tool-form-grid">
          <label className="card" style={{ padding: "0.95rem", background: "var(--surface-strong)", display: "grid", gap: "0.5rem" }}>
            <strong>{tr ? "Gunluk dakika" : "Daily minutes"}</strong>
            <input type="range" min="10" max="45" step="5" value={minutesPerDay} onChange={(event) => setMinutesPerDay(Number(event.target.value))} />
            <span className="practice-meta">{minutesPerDay} {tr ? "dk" : "min"}</span>
          </label>
          <label className="card" style={{ padding: "0.95rem", background: "var(--surface-strong)", display: "grid", gap: "0.5rem" }}>
            <strong>{tr ? "Haftalik gun" : "Days per week"}</strong>
            <input type="range" min="3" max="7" step="1" value={daysPerWeek} onChange={(event) => setDaysPerWeek(Number(event.target.value))} />
            <span className="practice-meta">{daysPerWeek}</span>
          </label>
          <div className="card tool-output">
            <span className="pill">{tr ? "Hazir plan" : "Ready plan"}</span>
            <strong>{tr ? "Konusma ritmi" : "Speaking rhythm"}</strong>
            <p>{studyPlan}</p>
          </div>
        </div>
      ) : null}

      {isGenerator ? (
        <div className="tool-form-grid">
          <div className="card tool-output">
            <span className="pill">{tr ? "Anlik cikti" : "Instant output"}</span>
            <strong>{generatorOutput}</strong>
            <p>
              {tr
                ? "Bunu direkt kopyalayip practice ekraninda speaking denemesi olarak kullanabilirsin."
                : "You can copy this directly and turn it into a practice attempt in the speaking console."}
            </p>
            <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
              <button className="button button-primary" type="button" onClick={nextGenerator}>
                {tr ? "Yeni cikti uret" : "Generate another"}
              </button>
            </div>
          </div>
          <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)" }}>
            <strong>{tr ? "Bu araci nasil kullan" : "How to use it"}</strong>
            <div className="tool-chip-list">
              {(tr
                ? ["Tek bir prompt sec", "30-60 saniye not al", "Kayda gir", "Transcript ile kontrol et"]
                : ["Pick one output", "Take 30-60 seconds of notes", "Record your answer", "Review the transcript"]).map((item) => (
                <span key={item} className="tool-chip">{item}</span>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
