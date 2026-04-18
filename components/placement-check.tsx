"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAppState } from "@/components/providers";
import { buildPlacementResult, type PlacementAnswerSet } from "@/lib/improvement-center";
import type { StudentProfile } from "@/lib/types";

const defaultAnswers: PlacementAnswerSet = {
  confidence: "medium",
  fluency: "developing",
  grammar: "mixed",
  vocabulary: "functional",
  examDateUrgency: "planned"
};

export function PlacementCheck() {
  const { currentUser, language } = useAppState();
  const tr = language === "tr";
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [answers, setAnswers] = useState<PlacementAnswerSet>(defaultAnswers);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((response) => response.json())
      .then((data: { profile?: StudentProfile }) => {
        if (!data.profile) return;
        setProfile(data.profile);
      })
      .catch(() => setProfile(null));
  }, []);

  const result = useMemo(() => buildPlacementResult(answers), [answers]);

  const savePlacement = async () => {
    if (!profile) return;
    setBusy(true);
    setNotice("");
    const response = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...profile,
        currentLevel: result.level,
        focusSkill: result.focusSkill,
        targetScore: profile.targetScore ?? result.targetScoreSuggestion,
        weeklyGoal: result.weeklyGoal,
        dailyMinutesGoal: result.dailyMinutesGoal,
        studyDays: result.studyDays,
        onboardingComplete: true
      })
    });
    setBusy(false);
    if (response.ok) {
      setNotice(tr ? "Placement sonucu profile kaydedildi." : "Placement result saved to your profile.");
    }
  };

  return (
    <main className="page-shell section" style={{ display: "grid", gap: "1rem" }}>
      <section className="card" style={{ padding: "1.5rem", display: "grid", gap: "0.85rem" }}>
        <span className="eyebrow">Placement test</span>
        <h1 style={{ margin: 0 }}>{tr ? "Hızlı seviye yerleştirmesi" : "Fast level placement"}</h1>
        <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
          {tr
            ? "3 dakikalık bu yerleştirme, çalışma planını ilk günden kişisel hale getirir. Sonuç profilini, hedef skor önerini ve haftalık ritmini günceller."
            : "This 3-minute placement makes the study plan personal from day one. It updates your current level, target suggestion, and weekly rhythm."}
        </p>
      </section>

      <section className="grid" style={{ gridTemplateColumns: "minmax(320px, 1fr) minmax(320px, 1fr)", gap: "1rem", alignItems: "start" }}>
        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem" }}>
          <QuestionBlock
            label={tr ? "Speaking confidence" : "Speaking confidence"}
            value={answers.confidence}
            options={[
              ["low", tr ? "Kolayca donuyorum" : "I freeze easily"],
              ["medium", tr ? "Bazen akıyor bazen takılıyor" : "Sometimes smooth, sometimes stuck"],
              ["high", tr ? "Genelde rahat başlayabiliyorum" : "I can usually get started smoothly"]
            ]}
            onChange={(value) => setAnswers((current) => ({ ...current, confidence: value as PlacementAnswerSet["confidence"] }))}
          />
          <QuestionBlock
            label={tr ? "Fluency" : "Fluency"}
            value={answers.fluency}
            options={[
              ["hesitant", tr ? "Kısa ve parçalı" : "Short and broken"],
              ["developing", tr ? "Fikir var ama akış dalgalı" : "Ideas are there but the flow moves"],
              ["steady", tr ? "Daha düzenli ve sürekli" : "More stable and sustained"]
            ]}
            onChange={(value) => setAnswers((current) => ({ ...current, fluency: value as PlacementAnswerSet["fluency"] }))}
          />
          <QuestionBlock
            label={tr ? "Grammar control" : "Grammar control"}
            value={answers.grammar}
            options={[
              ["basic", tr ? "Basit kalıplarda kalıyorum" : "I stay in very basic structures"],
              ["mixed", tr ? "Bazen iyi bazen kırılıyor" : "Sometimes solid, sometimes breaking"],
              ["strong", tr ? "Genelde kontrollü" : "Mostly controlled"]
            ]}
            onChange={(value) => setAnswers((current) => ({ ...current, grammar: value as PlacementAnswerSet["grammar"] }))}
          />
          <QuestionBlock
            label={tr ? "Vocabulary range" : "Vocabulary range"}
            value={answers.vocabulary}
            options={[
              ["basic", tr ? "Çok temel kelimeler" : "Very basic words"],
              ["functional", tr ? "İş görüyor ama sınırlı" : "Functional but limited"],
              ["flexible", tr ? "Daha esnek kelime seçebiliyorum" : "I can choose words more flexibly"]
            ]}
            onChange={(value) => setAnswers((current) => ({ ...current, vocabulary: value as PlacementAnswerSet["vocabulary"] }))}
          />
          <QuestionBlock
            label={tr ? "Exam urgency" : "Exam urgency"}
            value={answers.examDateUrgency}
            options={[
              ["soon", tr ? "Yakında sınavım var" : "My exam is soon"],
              ["planned", tr ? "Tarihim belli ama çok yakın değil" : "I have a date but not immediately"],
              ["open", tr ? "Şimdilik açık hedef" : "Open-ended improvement for now"]
            ]}
            onChange={(value) => setAnswers((current) => ({ ...current, examDateUrgency: value as PlacementAnswerSet["examDateUrgency"] }))}
          />
        </div>

        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem" }}>
          <span className="eyebrow">Placement result</span>
          <h2 style={{ margin: 0 }}>{result.level}</h2>
          <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>{result.summary}</p>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem" }}>
            <Metric label={tr ? "Main focus" : "Main focus"} value={result.focusSkill} />
            <Metric label={tr ? "Suggested target" : "Suggested target"} value={String(result.targetScoreSuggestion)} />
            <Metric label={tr ? "Weekly goal" : "Weekly goal"} value={`${result.weeklyGoal} ${tr ? "oturum" : "sessions"}`} />
            <Metric label={tr ? "Daily minutes" : "Daily minutes"} value={`${result.dailyMinutesGoal} min`} />
          </div>
          <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)", display: "grid", gap: "0.45rem" }}>
            <strong>{tr ? "Study days" : "Study days"}</strong>
            <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
              {result.studyDays.map((day) => <span key={day} className="pill">{day}</span>)}
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button type="button" className="button button-primary" onClick={savePlacement} disabled={!currentUser || busy}>
              {busy ? (tr ? "Kaydediliyor..." : "Saving...") : (tr ? "Sonucu kaydet" : "Save result")}
            </button>
            <Link href="/app/plan" className="button button-secondary">{tr ? "Planı aç" : "Open plan"}</Link>
          </div>
          {notice ? <p style={{ margin: 0, color: "var(--success)" }}>{notice}</p> : null}
        </div>
      </section>
    </main>
  );
}

function QuestionBlock({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: Array<[string, string]>;
  onChange: (value: string) => void;
}) {
  return (
    <div style={{ display: "grid", gap: "0.45rem" }}>
      <strong>{label}</strong>
      <div style={{ display: "grid", gap: "0.45rem" }}>
        {options.map(([key, text]) => (
          <button
            key={key}
            type="button"
            className="button button-secondary"
            style={{ justifyContent: "flex-start", background: value === key ? "rgba(29, 111, 117, 0.12)" : undefined }}
            onClick={() => onChange(key)}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="card" style={{ padding: "0.95rem", background: "var(--surface-strong)", display: "grid", gap: "0.25rem" }}>
      <span className="practice-meta">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
