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
        <select value={form.preferredExamType} onChange={(event) => setForm((current) => ({ ...current, preferredExamType: event.target.value as "IELTS" | "TOEFL" }))} className="practice-select">
          <option value="IELTS">IELTS</option>
          <option value="TOEFL">TOEFL</option>
        </select>
        <input value={form.targetScore ?? ""} onChange={(event) => setForm((current) => ({ ...current, targetScore: event.target.value ? Number(event.target.value) : null }))} type="number" min="1" max={form.preferredExamType === "IELTS" ? "9" : "30"} step="0.1" placeholder={tr ? "Hedef skor" : "Target score"} style={inputStyle} />
        <input value={form.weeklyGoal} onChange={(event) => setForm((current) => ({ ...current, weeklyGoal: Number(event.target.value) || 4 }))} type="number" min="1" max="14" placeholder={tr ? "Haftalik hedef" : "Weekly goal"} style={inputStyle} />
        <input value={form.currentLevel} onChange={(event) => setForm((current) => ({ ...current, currentLevel: event.target.value }))} placeholder={tr ? "Seviye / not" : "Level / note"} style={inputStyle} />
        <input value={form.focusSkill} onChange={(event) => setForm((current) => ({ ...current, focusSkill: event.target.value }))} placeholder={tr ? "Su anki ana odak" : "Current main focus"} style={inputStyle} />
        <textarea value={form.bio ?? ""} onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))} rows={4} placeholder={tr ? "Kisa not: neyi gelistirmek istiyorsun?" : "Short note: what do you want to improve?"} style={{ ...inputStyle, resize: "vertical" }} />
        <button type="button" className="button button-primary" onClick={save}>{tr ? "Onboardingi tamamla" : "Complete onboarding"}</button>
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
