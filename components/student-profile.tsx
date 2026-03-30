"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppState } from "@/components/providers";
import { ProgressSummary, StudentProfile as StudentProfileType } from "@/lib/types";

const emptySummary: ProgressSummary = {
  totalSessions: 0,
  averageScore: 0,
  streakDays: 0,
  freeSessionsRemaining: 4,
  remainingMinutesToday: 8,
  currentPlan: "free",
  recentSessions: []
};

const studyDayOptions = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function StudentProfile() {
  const { currentUser, language } = useAppState();
  const tr = language === "tr";
  const [profile, setProfile] = useState<StudentProfileType | null>(null);
  const [summary, setSummary] = useState<ProgressSummary>(emptySummary);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/profile")
      .then((response) => response.json())
      .then((data: { profile?: StudentProfileType }) => setProfile(data.profile ?? null))
      .catch(() => setProfile(null));
  }, []);

  useEffect(() => {
    if (!currentUser?.id) return;
    fetch(`/api/progress/summary?userId=${encodeURIComponent(currentUser.id)}`)
      .then((response) => response.json())
      .then((data: ProgressSummary) => setSummary(data))
      .catch(() => setSummary(emptySummary));
  }, [currentUser?.id]);

  const profileReadiness = useMemo(() => {
    if (!profile?.targetScore || !summary.averageScore) {
      return tr ? "Bir hedef belirlediğinde sistem sana daha net bir yol haritası çıkarır." : "Set a target to unlock a clearer roadmap.";
    }
    const gap = Number((profile.targetScore - summary.averageScore).toFixed(1));
    if (gap <= 0) {
      return tr ? "Hedef skoruna oldukça yakınsın. Bundan sonra asıl odak istikrar olmalı." : "You are close to your target score. Consistency is now the priority.";
    }
    return tr ? `Hedefine ulaşmak için yaklaşık ${gap} puanlık bir mesafe var. Haftalık planını koruyarak ilerle.` : `You are ${gap} points away from your target. Stay consistent with your weekly plan.`;
  }, [profile?.targetScore, summary.averageScore, tr]);

  const saveProfile = async () => {
    if (!profile) return;
    setError("");
    setNotice("");
    const response = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile)
    });
    const data = (await response.json()) as { profile?: StudentProfileType; error?: string };
    if (!response.ok || !data.profile) {
      setError(data.error ?? (tr ? "Profil kaydedilemedi." : "Could not save profile."));
      return;
    }
    setProfile(data.profile);
    setNotice(tr ? "Profilin güncellendi." : "Profile updated.");
  };

  if (!currentUser || !profile) {
    return (
      <main className="page-shell section">
        <div className="card" style={{ padding: "1.5rem" }}>{tr ? "Profil yükleniyor..." : "Loading profile..."}</div>
      </main>
    );
  }

  return (
    <main className="page-shell section" style={{ display: "grid", gap: "1rem" }}>
      <section className="card" style={{ padding: "1.5rem", display: "grid", gap: "0.9rem" }}>
        <span className="eyebrow">{tr ? "Öğrenci profili" : "Student profile"}</span>
        <h1 style={{ margin: 0 }}>{currentUser.name}</h1>
        <p style={{ color: "var(--muted)", margin: 0 }}>{currentUser.email}</p>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "0.75rem" }}>
          <ProfileStat label={tr ? "Ortalama skor" : "Average score"} value={summary.averageScore ? summary.averageScore.toFixed(1) : "-"} />
          <ProfileStat label={tr ? "Streak" : "Streak"} value={`${summary.streakDays}`} />
          <ProfileStat label={tr ? "Toplam deneme" : "Total sessions"} value={`${summary.totalSessions}`} />
          <ProfileStat label={tr ? "Plan" : "Plan"} value={currentUser.plan.toUpperCase()} />
        </div>
      </section>

      <section className="grid" style={{ gridTemplateColumns: "minmax(320px, 1fr) minmax(320px, 1fr)", gap: "1rem", alignItems: "start" }}>
        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
          <strong>{tr ? "Hedeflerin ve tercihlerin" : "Goals and preferences"}</strong>
          <select value={profile.preferredExamType} onChange={(event) => setProfile((current) => current ? { ...current, preferredExamType: event.target.value as "IELTS" | "TOEFL" } : current)} className="practice-select">
            <option value="IELTS">IELTS</option>
            <option value="TOEFL">TOEFL</option>
          </select>
          <input value={profile.targetScore ?? ""} type="number" min="1" max={profile.preferredExamType === "IELTS" ? "9" : "30"} step="0.1" onChange={(event) => setProfile((current) => current ? { ...current, targetScore: event.target.value ? Number(event.target.value) : null } : current)} placeholder={tr ? "Hedef skorun" : "Target score"} style={inputStyle} />
          <input value={profile.weeklyGoal} type="number" min="1" max="14" onChange={(event) => setProfile((current) => current ? { ...current, weeklyGoal: Number(event.target.value) || 4 } : current)} placeholder={tr ? "Haftalık hedef" : "Weekly goal"} style={inputStyle} />
          <input value={profile.currentLevel} onChange={(event) => setProfile((current) => current ? { ...current, currentLevel: event.target.value } : current)} placeholder={tr ? "Mevcut seviyen" : "Current level"} style={inputStyle} />
          <input value={profile.focusSkill} onChange={(event) => setProfile((current) => current ? { ...current, focusSkill: event.target.value } : current)} placeholder={tr ? "Ana çalışma odağın" : "Main focus skill"} style={inputStyle} />
          <textarea value={profile.bio ?? ""} onChange={(event) => setProfile((current) => current ? { ...current, bio: event.target.value } : current)} rows={4} placeholder={tr ? "Kısa bir çalışma notu ekle..." : "Short study note..."} style={{ ...inputStyle, resize: "vertical" }} />
          <div style={{ display: "grid", gap: "0.45rem" }}>
            <span className="practice-meta">{tr ? "Çalışma günleri" : "Study days"}</span>
            <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
              {studyDayOptions.map((day) => {
                const active = profile.studyDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    className="button button-secondary"
                    style={{ background: active ? "rgba(29, 111, 117, 0.12)" : undefined }}
                    onClick={() =>
                      setProfile((current) =>
                        current
                          ? {
                              ...current,
                              studyDays: active ? current.studyDays.filter((item) => item !== day) : [...current.studyDays, day]
                            }
                          : current
                      )
                    }
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
          <button type="button" className="button button-primary" onClick={saveProfile}>{tr ? "Profili kaydet" : "Save profile"}</button>
          {notice ? <p style={{ color: "var(--success)", margin: 0 }}>{notice}</p> : null}
          {error ? <p style={{ color: "var(--accent-deep)", margin: 0 }}>{error}</p> : null}
        </div>

        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
          <strong>{tr ? "Profil yorumu" : "Profile insight"}</strong>
          <p style={{ margin: 0, lineHeight: 1.7 }}>{profileReadiness}</p>
          <div className="card" style={{ padding: "0.95rem", background: "var(--surface-strong)", display: "grid", gap: "0.45rem" }}>
            <strong>{tr ? "Bu haftaki odak" : "This week’s focus"}</strong>
            <div className="practice-meta">{profile.focusSkill}</div>
            <div style={{ color: "var(--muted)", lineHeight: 1.7 }}>
              {tr
                ? `Bu hafta için ${profile.weeklyGoal} speaking hedefi belirledin. ${profile.studyDays.join(", ")} günlerinde kısa ama düzenli denemeler yapman iyi olur.`
                : `You set a ${profile.weeklyGoal}-session weekly goal. Use ${profile.studyDays.join(", ")} for short but consistent practice blocks.`}
            </div>
          </div>
          <div className="card" style={{ padding: "0.95rem", background: "var(--surface-strong)", display: "grid", gap: "0.45rem" }}>
            <strong>{tr ? "Sınav tercihi" : "Preferred exam"}</strong>
            <div>{profile.preferredExamType}</div>
            <div className="practice-meta">{profile.currentLevel}</div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)" }}>
      <div style={{ color: "var(--muted)", marginBottom: "0.35rem" }}>{label}</div>
      <strong style={{ fontSize: "1.8rem" }}>{value}</strong>
    </div>
  );
}

const inputStyle = {
  padding: "0.9rem",
  borderRadius: 14,
  border: "1px solid var(--line)"
} as const;
