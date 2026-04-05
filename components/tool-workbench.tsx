"use client";

import { useMemo, useState } from "react";
import { useAppState } from "@/components/providers";
import { getToolVisual } from "@/lib/tool-visuals";

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
  const { language, currentUser, signedIn } = useAppState();
  const tr = language === "tr";
  const [fluency, setFluency] = useState(6);
  const [pronunciation, setPronunciation] = useState(6);
  const [grammar, setGrammar] = useState(6);
  const [vocabulary, setVocabulary] = useState(6);
  const [minutesPerDay, setMinutesPerDay] = useState(15);
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [goalType, setGoalType] = useState<"score" | "fluency" | "consistency">("score");
  const [answerDraft, setAnswerDraft] = useState("");
  const [promptIndex, setPromptIndex] = useState(0);
  const [planDeadlineDays, setPlanDeadlineDays] = useState(7);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState("");

  const estimatedBand = useMemo(() => {
    const avg = (fluency + pronunciation + grammar + vocabulary) / 4;
    return avg.toFixed(1);
  }, [fluency, pronunciation, grammar, vocabulary]);

  const visual = useMemo(() => getToolVisual(slug, tr), [slug, tr]);

  const generatorOutput = useMemo(() => {
    if (slug.includes("cue-card")) return cueCards[promptIndex % cueCards.length];
    if (slug.includes("part-1-question")) return part1Questions[promptIndex % part1Questions.length];
    if (slug.includes("follow-up-question")) return followUpQuestions[promptIndex % followUpQuestions.length];
    if (slug.includes("topic-of-the-day")) {
      return tr
        ? `Bugunun konusu: ${topics[promptIndex % topics.length]}`
        : `Topic of the day: ${topics[promptIndex % topics.length]}`;
    }
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
    if (slug.includes("common-mistakes")) {
      return tr
        ? "1) Çok genel cevap verme 2) Bir neden ekle 3) Bir gerçek örnek ver 4) Son cümleyi temiz kapat"
        : "1) Do not stay too general 2) Add one reason 3) Give one real example 4) Close your answer cleanly";
    }
    if (slug.includes("part-2-ideas")) {
      return tr
        ? "Fikir akışı: neydi -> neden seçtin -> ne hissettirdi -> neden hatırlıyorsun"
        : "Idea path: what it was -> why you chose it -> how it felt -> why you remember it";
    }
    if (slug.includes("part-3-examples")) {
      return tr
        ? "Görüş + neden + toplumdan örnek + kısa sonuç"
        : "Opinion + reason + social example + short conclusion";
    }
    return "";
  }, [promptIndex, slug, tr]);

  const generatorUseCases = useMemo(() => {
    if (slug.includes("cue-card")) {
      return tr
        ? ["1 dakika not al", "2 dakikalik cevap ver", "Transcript ile tekrar et"]
        : ["Take 1 minute of notes", "Give a 2-minute answer", "Retry after transcript review"];
    }
    if (slug.includes("part-1-question")) {
      return tr
        ? ["Direkt basla", "1 neden ekle", "20 saniyede toparla"]
        : ["Answer directly", "Add one reason", "Wrap up in 20 seconds"];
    }
    if (slug.includes("follow-up-question") || slug.includes("follow-up-answer-builder")) {
      return tr
        ? ["Gorusunu soyle", "Bir neden ver", "Bir ornekle kapat"]
        : ["State your view", "Give one reason", "Close with one example"];
    }
    if (slug.includes("template")) {
      return tr
        ? ["Ana fikri yaz", "Iki destek noktasi ekle", "Kisa sonucla bitir"]
        : ["Write the main idea", "Add two support points", "Finish with a short takeaway"];
    }
    return tr
      ? ["Bir prompt sec", "30-60 saniye not al", "Practice ekranina tası", "Transcript ile kontrol et"]
      : ["Pick one output", "Take 30-60 seconds of notes", "Move to practice", "Review with transcript"];
  }, [slug, tr]);

  const isCalculator = slug.includes("calculator");
  const isAnswerChecker = slug.includes("answer-checker");
  const isPlanBuilder =
    slug.includes("study-plan") ||
    slug.includes("schedule") ||
    slug.includes("goal-builder") ||
    slug.includes("self-study-plan") ||
    slug.includes("confidence-routine");
  const isGenerator =
    !isPlanBuilder &&
    (slug.includes("generator") ||
      slug.includes("builder") ||
      slug.includes("template") ||
      slug.includes("opening") ||
      slug.includes("transition") ||
      slug.includes("checklist") ||
      slug.includes("common-mistakes") ||
      slug.includes("part-2-ideas") ||
      slug.includes("part-3-examples") ||
      slug.includes("topic-of-the-day"));

  const toolSummary = useMemo(() => {
    if (isCalculator) {
      return tr
        ? "Skoru gormek yetmez; hangi bileşen seni aşağı çekiyor onu da anlaman gerekir."
        : "A useful score tool should show what is pulling your band down, not only the final number.";
    }
    if (isAnswerChecker) {
      return tr
        ? "Bu aracı hızlı cevap kontrolü için kullan, sonra gerçek denemeyi practice ekranında yap."
        : "Use this as a quick answer check, then move into a real speaking attempt in practice.";
    }
    if (isPlanBuilder) {
      return tr
        ? "Burada olusan plan hesabina kaydedilir, study list tarafina dusurulur ve maile gonderilir."
        : "The plan generated here can be saved to your account, added to your study list, and sent by email.";
    }
    return tr
      ? "Bu araclar boş sayfa korkusunu azaltmak icin hizli speaking baslangici uretir."
      : "These tools reduce blank-page friction and help you start speaking faster.";
  }, [isAnswerChecker, isCalculator, isPlanBuilder, tr]);

  const studyPlan = useMemo(() => {
    const focus = minutesPerDay >= 20 ? (tr ? "1 tam deneme + 1 tekrar" : "1 full attempt + 1 retry") : tr ? "1 kısa drill + 1 transcript review" : "1 short drill + 1 transcript review";
    const emphasis =
      goalType === "fluency"
        ? tr
          ? "Haftada iki gün sadece akıcılık ve doğal akış üzerine odaklan."
          : "Use two days per week just for fluency and natural flow."
        : goalType === "consistency"
          ? tr
            ? "Hedefin büyük cevaplar değil, her gün kısa ama düzenli speaking hacmi olsun."
            : "Aim for short but repeatable daily speaking volume instead of heavy sessions."
          : tr
            ? "Her hafta bir kez süreli deneme ile band sinyalini kontrol et."
            : "Check your band signal once a week with one timed attempt.";
    return tr
      ? `${daysPerWeek} günlük plana göre her oturumda ${focus}. Haftada 1 gün sadece review ve weak skill için ayır. ${emphasis}`
      : `With ${daysPerWeek} practice days, use ${focus} in each session. Keep one day for review and weak-skill cleanup. ${emphasis}`;
  }, [daysPerWeek, goalType, minutesPerDay, tr]);

  const answerCheck = useMemo(() => {
    const text = answerDraft.trim();
    if (!text) return null;
    const words = text.split(/\s+/).filter(Boolean);
    const lower = words.map((word) => word.toLowerCase().replace(/[^a-z0-9']/gi, ""));
    const uniqueCount = new Set(lower.filter(Boolean)).size;
    const hasExample = /\bfor example\b|\bfor instance\b|\bbecause\b|\bwhen i\b|\bone time\b/i.test(text);
    const sentences = text.split(/[.!?]+/).map((item) => item.trim()).filter(Boolean);
    const repeated = lower.find((word, index) => word && lower.indexOf(word) !== index);
    const clarityScore = Math.max(5.0, Math.min(8.0, 5.2 + (words.length >= 55 ? 0.5 : 0) + (hasExample ? 0.4 : 0) + (sentences.length >= 3 ? 0.4 : 0) + (uniqueCount / Math.max(words.length, 1)) * 1.4));
    const nextStep = !hasExample
      ? tr
        ? "Bir gerçek örnek ekle. Bu, cevabı daha inandırıcı ve daha net yapar."
        : "Add one real example. It makes the answer clearer and more convincing."
      : words.length < 45
        ? tr
          ? "Cevabı biraz uzat ve bir neden daha ekle."
          : "Extend the answer slightly and add one more reason."
        : repeated
          ? tr
            ? `\"${repeated}\" gibi tekrar eden kelimeleri azaltıp daha doğal varyasyon kullan.`
            : `Reduce repeated words like "${repeated}" and use slightly more natural variation.`
          : tr
            ? "Kapanış cümleni daha net yap ve son fikri toparla."
            : "Make your closing sentence clearer and tie the final idea together.";

    return {
      band: clarityScore.toFixed(1),
      words: words.length,
      hasExample,
      nextStep
    };
  }, [answerDraft, tr]);

  const nextGenerator = () => setPromptIndex((value) => value + 1);

  async function savePlan() {
    if (!signedIn || !currentUser || currentUser.role === "guest") {
      setSaveState("error");
      setSaveMessage(tr ? "Plani kaydetmek ve mail almak icin once giris yap." : "Sign in first to save the plan and receive it by email.");
      return;
    }

    setSaveState("saving");
    setSaveMessage("");
    try {
      const response = await fetch("/api/tools/study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          plan: studyPlan,
          dueDays: planDeadlineDays,
          goalType,
          minutesPerDay,
          daysPerWeek
        })
      });
      const data = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Could not save the plan.");
      }
      setSaveState("saved");
      setSaveMessage(data.message ?? (tr ? "Plan kaydedildi ve mail gonderildi." : "Plan saved and email sent."));
    } catch (error) {
      setSaveState("error");
      setSaveMessage(error instanceof Error ? error.message : tr ? "Plan kaydedilemedi." : "Could not save the plan.");
    }
  }

  return (
    <section className="card tool-workbench">
      <div className="tool-visual">
        <div className="tool-visual-icon" aria-hidden="true">{visual.emoji}</div>
        <div className="tool-visual-copy">
          <span className="pill">{visual.badge}</span>
          <strong>{visual.title}</strong>
          <p>{visual.note}</p>
        </div>
      </div>

      <div>
        <span className="eyebrow">{tr ? "Canli arac" : "Live tool"}</span>
        <h2 style={{ margin: "0.8rem 0 0.35rem" }}>{title}</h2>
        <p className="practice-copy" style={{ margin: 0 }}>{toolSummary}</p>
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

      {isPlanBuilder ? (
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
          <label className="card" style={{ padding: "0.95rem", background: "var(--surface-strong)", display: "grid", gap: "0.5rem" }}>
            <strong>{tr ? "Ana hedef" : "Main goal"}</strong>
            <select className="practice-select" value={goalType} onChange={(event) => setGoalType(event.target.value as typeof goalType)}>
              <option value="score">{tr ? "Band yükseltmek" : "Raise band score"}</option>
              <option value="fluency">{tr ? "Akıcılığı artırmak" : "Improve fluency"}</option>
              <option value="consistency">{tr ? "Düzen kurmak" : "Build consistency"}</option>
            </select>
          </label>
          <label className="card" style={{ padding: "0.95rem", background: "var(--surface-strong)", display: "grid", gap: "0.5rem" }}>
            <strong>{tr ? "Bitis tarihi" : "Plan deadline"}</strong>
            <select className="practice-select" value={planDeadlineDays} onChange={(event) => setPlanDeadlineDays(Number(event.target.value))}>
              <option value={3}>{tr ? "3 gun" : "3 days"}</option>
              <option value={7}>{tr ? "7 gun" : "7 days"}</option>
              <option value={14}>{tr ? "14 gun" : "14 days"}</option>
              <option value={21}>{tr ? "21 gun" : "21 days"}</option>
            </select>
          </label>
          <div className="card tool-output">
            <span className="pill">{tr ? "Hazir plan" : "Ready plan"}</span>
            <strong>{tr ? "Konusma ritmi" : "Speaking rhythm"}</strong>
            <p>{studyPlan}</p>
            <div className="tool-chip-list">
              <span className="tool-chip">{minutesPerDay} {tr ? "dk / gun" : "min / day"}</span>
              <span className="tool-chip">{daysPerWeek} {tr ? "gun / hafta" : "days / week"}</span>
              <span className="tool-chip">{planDeadlineDays} {tr ? "gunluk hedef sure" : "day deadline"}</span>
            </div>
            <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
              <button className="button button-primary" type="button" onClick={savePlan} disabled={saveState === "saving"}>
                {saveState === "saving" ? (tr ? "Kaydediliyor..." : "Saving...") : tr ? "Plani kaydet ve mail gonder" : "Save plan and email it"}
              </button>
            </div>
            {saveMessage ? <p className="practice-meta" style={{ marginTop: "0.2rem", color: saveState === "error" ? "var(--accent-deep)" : "var(--success)" }}>{saveMessage}</p> : null}
          </div>
        </div>
      ) : null}

      {isAnswerChecker ? (
        <div className="tool-form-grid">
          <label className="card" style={{ padding: "0.95rem", background: "var(--surface-strong)", display: "grid", gap: "0.5rem" }}>
            <strong>{tr ? "Cevabini yapistir" : "Paste your answer"}</strong>
            <textarea
              value={answerDraft}
              onChange={(event) => setAnswerDraft(event.target.value)}
              placeholder={tr ? "Ornek: I really enjoy my hometown because..." : "Example: I really enjoy my hometown because..."}
              style={{ minHeight: "180px", resize: "vertical", borderRadius: "16px", border: "1px solid var(--line)", background: "var(--background)", color: "var(--text)", padding: "0.95rem 1rem", font: "inherit", lineHeight: 1.7 }}
            />
          </label>
          <div className="card tool-output">
            <span className="pill">{tr ? "Anlik analiz" : "Instant analysis"}</span>
            <strong>{answerCheck ? `${tr ? "Tahmini band" : "Estimated band"} ${answerCheck.band}` : (tr ? "Cevap bekleniyor" : "Waiting for answer")}</strong>
            {answerCheck ? (
              <>
                <p>{answerCheck.nextStep}</p>
                <div className="tool-chip-list">
                  <span className="tool-chip">{answerCheck.words} {tr ? "kelime" : "words"}</span>
                  <span className="tool-chip">{answerCheck.hasExample ? (tr ? "Örnek var" : "Example used") : (tr ? "Örnek eksik" : "Example missing")}</span>
                </div>
              </>
            ) : (
              <p>{tr ? "Kısa bir speaking cevabı yapıştır. Sistem uzunluk, örnek kullanımı ve netlik sinyali üzerinden sana bir sonraki adımı gösterecek." : "Paste a short speaking answer. The tool will estimate clarity and tell you the next thing to improve."}</p>
            )}
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
            <div className="tool-chip-list">
              {generatorUseCases.map((item) => (
                <span key={item} className="tool-chip">{item}</span>
              ))}
            </div>
            <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
              <button className="button button-primary" type="button" onClick={nextGenerator}>
                {tr ? "Yeni cikti uret" : "Generate another"}
              </button>
            </div>
          </div>
          <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)" }}>
            <strong>{tr ? "Bu araci nasil kullan" : "How to use it"}</strong>
            <div className="tool-chip-list">
              {generatorUseCases.map((item) => (
                <span key={item} className="tool-chip">{item}</span>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
