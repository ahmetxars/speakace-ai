"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/components/providers";
import type { StudentProfile as StudentProfileType } from "@/lib/types";

export function OnboardingWizard({ profile }: { profile: StudentProfileType }) {
  const router = useRouter();
  const { language } = useAppState();
  const tr = language === "tr";
  const [form, setForm] = useState<StudentProfileType>({
    ...profile,
    studyDays: Array.isArray(profile.studyDays) ? profile.studyDays.map(String) : []
  });
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const stepContent = {
    1: {
      title: tr ? "Sinav hedefini belirle" : "Define your exam goal",
      prompt: tr
        ? "Hangi sinava hazirlaniyorsun, hangi skoru istiyorsun ve bu hedef senin icin neden onemli?"
        : "Which exam are you preparing for, what score do you want, and why does that goal matter to you?"
    },
    2: {
      title: tr ? "Calisma ritmini kur" : "Set your study rhythm",
      prompt: tr
        ? "Haftada kac oturum yapacaksin, gunde kac dakika ayiracaksin ve su anda en cok hangi skill'e odaklanmak istiyorsun?"
        : "How many sessions will you do each week, how many minutes can you give per day, and which skill needs the most attention right now?"
    },
    3: {
      title: tr ? "Kisisel baglamini ekle" : "Add your personal context",
      prompt: tr
        ? "SpeakAce'i nereden buldun ve speaking tarafinda en cok neyi gelistirmek istiyorsun? Bu cevaplar dashboard onerilerini daha isabetli yapar."
        : "How did you find SpeakAce and what do you most want to improve in speaking? These answers help the dashboard personalize your recommendations."
    }
  } as const;

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

  const studyDays = Array.isArray(form.studyDays) ? form.studyDays : [];
  const studyDaysLabel = studyDays.length ? studyDays.join(", ") : tr ? "Henuz secilmedi" : "Not selected yet";
  const focusSkillLabel = form.focusSkill || (tr ? "Henuz secilmedi" : "Not selected yet");
  const currentLevelLabel = form.currentLevel || (tr ? "Henuz yazilmadi" : "Not added yet");
  const discoverySourceLabel = form.discoverySource || (tr ? "Henuz yazilmadi" : "Not added yet");
  const bioLabel = form.bio || (tr ? "Henuz yazilmadi" : "Not added yet");

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
              <div style={{ marginTop: "0.25rem", color: "var(--muted)", fontSize: "0.92rem", lineHeight: 1.45 }}>
                {stepContent[item as 1 | 2 | 3].title}
              </div>
              {item === 2 ? (
                <div style={{ marginTop: "0.45rem", color: "var(--muted)", fontSize: "0.82rem", lineHeight: 1.55 }}>
                  {tr
                    ? `Haftalik ${form.weeklyGoal} oturum • Gunluk ${form.dailyMinutesGoal ?? 15} dk • Odak: ${focusSkillLabel}`
                    : `${form.weeklyGoal} sessions/week • ${form.dailyMinutesGoal ?? 15} mins/day • Focus: ${focusSkillLabel}`}
                </div>
              ) : null}
              {item === 3 ? (
                <div style={{ marginTop: "0.45rem", color: "var(--muted)", fontSize: "0.82rem", lineHeight: 1.55 }}>
                  {tr
                    ? `Kaynak: ${discoverySourceLabel} • Not: ${bioLabel.slice(0, 48)}${bioLabel.length > 48 ? "..." : ""}`
                    : `Source: ${discoverySourceLabel} • Note: ${bioLabel.slice(0, 48)}${bioLabel.length > 48 ? "..." : ""}`}
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: "1rem", background: "rgba(255,255,255,0.58)", display: "grid", gap: "0.45rem" }}>
          <strong>{stepContent[step as 1 | 2 | 3].title}</strong>
          <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>{stepContent[step as 1 | 2 | 3].prompt}</p>
        </div>

        {step === 1 ? (
          <>
            <label style={{ display: "grid", gap: "0.35rem" }}>
              <span>{tr ? "Hangi sinava hazirlaniyorsun?" : "Which exam are you preparing for?"}</span>
              <select value={form.preferredExamType} onChange={(event) => setForm((current) => ({ ...current, preferredExamType: event.target.value as "IELTS" | "TOEFL" }))} className="practice-select">
                <option value="IELTS">IELTS</option>
                <option value="TOEFL">TOEFL</option>
              </select>
            </label>
            <label style={{ display: "grid", gap: "0.35rem" }}>
              <span>{tr ? "Hedef skorun ne?" : "What is your target score?"}</span>
              <input value={form.targetScore ?? ""} onChange={(event) => setForm((current) => ({ ...current, targetScore: event.target.value ? Number(event.target.value) : null }))} type="number" min="1" max={form.preferredExamType === "IELTS" ? "9" : "30"} step="0.1" placeholder={tr ? "Hedef skor" : "Target score"} style={inputStyle} />
            </label>
            <label style={{ display: "grid", gap: "0.35rem" }}>
              <span>{tr ? "Sinav tarihi var mi?" : "Do you already have an exam date?"}</span>
              <input value={form.examDate ?? ""} onChange={(event) => setForm((current) => ({ ...current, examDate: event.target.value }))} placeholder={tr ? "Sinav tarihi (istege bagli)" : "Exam date (optional)"} style={inputStyle} />
            </label>
            <label style={{ display: "grid", gap: "0.35rem" }}>
              <span>{tr ? "Bu skoru neden istiyorsun?" : "Why do you want this score?"}</span>
              <input value={form.targetReason ?? ""} onChange={(event) => setForm((current) => ({ ...current, targetReason: event.target.value }))} placeholder={tr ? "Universite, is, vize veya kisisel hedef" : "University, job, visa, or personal goal"} style={inputStyle} />
            </label>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <label style={{ display: "grid", gap: "0.35rem" }}>
              <span>{tr ? "Haftada kac speaking oturumu hedefliyorsun?" : "How many speaking sessions do you want each week?"}</span>
              <input value={form.weeklyGoal} onChange={(event) => setForm((current) => ({ ...current, weeklyGoal: Number(event.target.value) || 4 }))} type="number" min="1" max="14" placeholder={tr ? "Haftalik hedef" : "Weekly goal"} style={inputStyle} />
            </label>
            <label style={{ display: "grid", gap: "0.35rem" }}>
              <span>{tr ? "Gunde kac dakika ayirabilirsin?" : "How many minutes can you study per day?"}</span>
              <input value={form.dailyMinutesGoal ?? 15} onChange={(event) => setForm((current) => ({ ...current, dailyMinutesGoal: Number(event.target.value) || 15 }))} type="number" min="5" max="60" placeholder={tr ? "Gunluk speaking dakikasi" : "Daily speaking minutes"} style={inputStyle} />
            </label>
            <label style={{ display: "grid", gap: "0.35rem" }}>
              <span>{tr ? "Mevcut seviyeni nasil tarif edersin?" : "How would you describe your current level?"}</span>
              <input value={form.currentLevel} onChange={(event) => setForm((current) => ({ ...current, currentLevel: event.target.value }))} placeholder={tr ? "Orn. Band 5.5 civari / B1" : "Ex: Around Band 5.5 / B1"} style={inputStyle} />
            </label>
            <label style={{ display: "grid", gap: "0.35rem" }}>
              <span>{tr ? "Su an en cok hangi skill'i gelistirmek istiyorsun?" : "Which skill do you want to improve the most right now?"}</span>
              <input value={form.focusSkill} onChange={(event) => setForm((current) => ({ ...current, focusSkill: event.target.value }))} placeholder={tr ? "Akicilik, telaffuz, kelime, yapi..." : "Fluency, pronunciation, vocabulary, structure..."} style={inputStyle} />
            </label>
            <div style={{ display: "grid", gap: "0.45rem" }}>
              <span className="practice-meta">{tr ? "Hangi gunler calismayi planliyorsun?" : "Which days do you plan to study?"}</span>
              <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                  const active = studyDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      className="button button-secondary"
                      style={{ background: active ? "rgba(29, 111, 117, 0.12)" : undefined }}
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          studyDays: active ? studyDays.filter((item) => item !== day) : [...studyDays, day]
                        }))
                      }
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="card" style={{ padding: "0.95rem", background: "var(--surface-strong)" }}>
              <strong>{tr ? "Su an secilen plan" : "Current study plan"}</strong>
              <p style={{ margin: "0.45rem 0 0", color: "var(--muted)", lineHeight: 1.7 }}>
                {tr
                  ? `Haftada ${form.weeklyGoal} speaking oturumu, gunde ${form.dailyMinutesGoal ?? 15} dakika, seviye: ${currentLevelLabel}, odak skill: ${focusSkillLabel}, calisma gunleri: ${studyDaysLabel}.`
                  : `${form.weeklyGoal} speaking sessions per week, ${form.dailyMinutesGoal ?? 15} minutes per day, current level: ${currentLevelLabel}, focus skill: ${focusSkillLabel}, study days: ${studyDaysLabel}.`}
              </p>
            </div>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <label style={{ display: "grid", gap: "0.35rem" }}>
              <span>{tr ? "SpeakAce'i nereden buldun?" : "How did you find SpeakAce?"}</span>
              <input value={form.discoverySource ?? ""} onChange={(event) => setForm((current) => ({ ...current, discoverySource: event.target.value }))} placeholder={tr ? "Google, arkadas, sosyal medya, ogretmen..." : "Google, friend, social media, teacher..."} style={inputStyle} />
            </label>
            <label style={{ display: "grid", gap: "0.35rem" }}>
              <span>{tr ? "Speaking tarafinda en cok neyi gelistirmek istiyorsun?" : "What do you want to improve most in your speaking?"}</span>
              <textarea value={form.bio ?? ""} onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))} rows={4} placeholder={tr ? "Kisa not: akicilik, telaffuz, dogal cevap verme, sinav ozguveni..." : "Short note: fluency, pronunciation, natural answers, exam confidence..."} style={{ ...inputStyle, resize: "vertical" }} />
            </label>
            <div className="card" style={{ padding: "0.95rem", background: "var(--surface-strong)" }}>
              <strong>{tr ? "Ozet" : "Summary"}</strong>
              <p style={{ margin: "0.45rem 0 0", color: "var(--muted)", lineHeight: 1.7 }}>
                {tr
                  ? `${form.preferredExamType} icin ${form.targetScore ?? "-"} hedefi, haftalik ${form.weeklyGoal} oturum ve gunluk ${form.dailyMinutesGoal ?? 15} dakika speaking ritmi belirledin.`
                  : `You set a ${form.preferredExamType} goal of ${form.targetScore ?? "-"}, a ${form.weeklyGoal}-session week, and ${form.dailyMinutesGoal ?? 15} daily speaking minutes.`}
              </p>
              <p style={{ margin: "0.55rem 0 0", color: "var(--muted)", lineHeight: 1.7 }}>
                {tr
                  ? `Bizi bulma kaynagin: ${discoverySourceLabel}. Gelistirmek istedigin alan: ${bioLabel}`
                  : `You found SpeakAce via: ${discoverySourceLabel}. Your main improvement note: ${bioLabel}`}
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
