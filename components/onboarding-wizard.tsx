"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/components/providers";
import type { StudentProfile as StudentProfileType } from "@/lib/types";

export function OnboardingWizard({ profile }: { profile: StudentProfileType }) {
  const router = useRouter();
  const { language } = useAppState();
  const tr = language === "tr";
  const [form, setForm] = useState<StudentProfileType>(profile);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const save = async () => {
    setError("");
    setNotice("");
    const response = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, onboardingComplete: true })
    });
    const data = (await response.json()) as { profile?: StudentProfileType; error?: string };
    if (!response.ok || !data.profile) {
      setError(data.error ?? (tr ? "Onboarding kaydedilemedi." : "Could not save onboarding."));
      return;
    }
    setNotice(tr ? "Onboarding tamamlandi." : "Onboarding completed.");
    setTimeout(() => router.push("/app"), 500);
  };

  return (
    <main className="page-shell section" style={{ display: "grid", gap: "1rem" }}>
      <section className="card" style={{ padding: "1.4rem", display: "grid", gap: "0.8rem" }}>
        <span className="eyebrow">{tr ? "Ilk kurulum" : "First-time setup"}</span>
        <h1 style={{ margin: 0 }}>{tr ? "Calisma profilini hazirla" : "Set up your study profile"}</h1>
        <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
          {tr ? "Hedef skoru, sinav tipini ve haftalik ritmini belirle. Sistem buna gore practice ve dashboard onerilerini netlestirecek." : "Set your exam, target score, and weekly rhythm. The app will use this to personalize practice and dashboards."}
        </p>
      </section>

      <section className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
        <div className="grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "0.5rem" }}>
          {[1, 2, 3].map((item) => (
            <div key={item} className="card" style={{ padding: "0.7rem", background: item === step ? "rgba(29, 111, 117, 0.12)" : "var(--surface-strong)" }}>
              <strong>{tr ? `Adim ${item}` : `Step ${item}`}</strong>
            </div>
          ))}
        </div>

        {step === 1 ? (
          <>
            <select value={form.preferredExamType} onChange={(event) => setForm((current) => ({ ...current, preferredExamType: event.target.value as "IELTS" | "TOEFL" }))} className="practice-select">
              <option value="IELTS">IELTS</option>
              <option value="TOEFL">TOEFL</option>
            </select>
            <input value={form.targetScore ?? ""} onChange={(event) => setForm((current) => ({ ...current, targetScore: event.target.value ? Number(event.target.value) : null }))} type="number" min="1" max={form.preferredExamType === "IELTS" ? "9" : "30"} step="0.1" placeholder={tr ? "Hedef skor" : "Target score"} style={inputStyle} />
            <input value={form.examDate ?? ""} onChange={(event) => setForm((current) => ({ ...current, examDate: event.target.value }))} placeholder={tr ? "Sinav tarihi (istege bagli)" : "Exam date (optional)"} style={inputStyle} />
            <input value={form.targetReason ?? ""} onChange={(event) => setForm((current) => ({ ...current, targetReason: event.target.value }))} placeholder={tr ? "Bu skoru neden istiyorsun?" : "Why do you want this score?"} style={inputStyle} />
          </>
        ) : null}

        {step === 2 ? (
          <>
            <input value={form.weeklyGoal} onChange={(event) => setForm((current) => ({ ...current, weeklyGoal: Number(event.target.value) || 4 }))} type="number" min="1" max="14" placeholder={tr ? "Haftalik hedef" : "Weekly goal"} style={inputStyle} />
            <input value={form.dailyMinutesGoal ?? 15} onChange={(event) => setForm((current) => ({ ...current, dailyMinutesGoal: Number(event.target.value) || 15 }))} type="number" min="5" max="60" placeholder={tr ? "Gunluk speaking dakikasi" : "Daily speaking minutes"} style={inputStyle} />
            <input value={form.currentLevel} onChange={(event) => setForm((current) => ({ ...current, currentLevel: event.target.value }))} placeholder={tr ? "Seviye / not" : "Level / note"} style={inputStyle} />
            <input value={form.focusSkill} onChange={(event) => setForm((current) => ({ ...current, focusSkill: event.target.value }))} placeholder={tr ? "Su anki ana odak" : "Current main focus"} style={inputStyle} />
            <div style={{ display: "grid", gap: "0.45rem" }}>
              <span className="practice-meta">{tr ? "Calisma gunleri" : "Study days"}</span>
              <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                  const active = form.studyDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      className="button button-secondary"
                      style={{ background: active ? "rgba(29, 111, 117, 0.12)" : undefined }}
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          studyDays: active ? current.studyDays.filter((item) => item !== day) : [...current.studyDays, day]
                        }))
                      }
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <input value={form.discoverySource ?? ""} onChange={(event) => setForm((current) => ({ ...current, discoverySource: event.target.value }))} placeholder={tr ? "SpeakAce'i nereden buldun?" : "How did you find SpeakAce?"} style={inputStyle} />
            <textarea value={form.bio ?? ""} onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))} rows={4} placeholder={tr ? "Kisa not: neyi gelistirmek istiyorsun?" : "Short note: what do you want to improve?"} style={{ ...inputStyle, resize: "vertical" }} />
            <div className="card" style={{ padding: "0.95rem", background: "var(--surface-strong)" }}>
              <strong>{tr ? "Ozet" : "Summary"}</strong>
              <p style={{ margin: "0.45rem 0 0", color: "var(--muted)", lineHeight: 1.7 }}>
                {tr
                  ? `${form.preferredExamType} icin ${form.targetScore ?? "-"} hedefi, haftalik ${form.weeklyGoal} oturum ve gunluk ${form.dailyMinutesGoal ?? 15} dakika speaking ritmi belirledin.`
                  : `You set a ${form.preferredExamType} goal of ${form.targetScore ?? "-"}, a ${form.weeklyGoal}-session week, and ${form.dailyMinutesGoal ?? 15} daily speaking minutes.`}
              </p>
            </div>
          </>
        ) : null}

        <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
          {step > 1 ? (
            <button type="button" className="button button-secondary" onClick={() => setStep((current) => current - 1)}>
              {tr ? "Geri" : "Back"}
            </button>
          ) : null}
          {step < 3 ? (
            <button type="button" className="button button-primary" onClick={() => setStep((current) => current + 1)}>
              {tr ? "Devam et" : "Continue"}
            </button>
          ) : (
            <button type="button" className="button button-primary" onClick={save}>{tr ? "Onboardingi tamamla" : "Complete onboarding"}</button>
          )}
        </div>
        {notice ? <p style={{ margin: 0, color: "var(--success)" }}>{notice}</p> : null}
        {error ? <p style={{ margin: 0, color: "var(--accent-deep)" }}>{error}</p> : null}
      </section>
    </main>
  );
}

const inputStyle = {
  padding: "0.9rem",
  borderRadius: 14,
  border: "1px solid var(--line)"
} as const;
