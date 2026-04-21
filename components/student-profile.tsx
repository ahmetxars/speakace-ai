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

function normalizeStudyDays(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean);
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map(String).filter(Boolean);
      }
    } catch {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }
  return [];
}

function normalizeProfile(profile: StudentProfileType | null): StudentProfileType | null {
  if (!profile) return null;
  return {
    ...profile,
    targetScore: typeof profile.targetScore === "number" ? profile.targetScore : profile.targetScore ? Number(profile.targetScore) : null,
    weeklyGoal: Number(profile.weeklyGoal || 4),
    dailyMinutesGoal: Number(profile.dailyMinutesGoal || 15),
    studyDays: normalizeStudyDays(profile.studyDays),
    currentLevel: profile.currentLevel || "Building basics",
    focusSkill: profile.focusSkill || "Balanced practice",
    examDate: profile.examDate ?? null,
    targetReason: profile.targetReason || "Improve speaking score",
    discoverySource: profile.discoverySource || "Google search",
    bio: profile.bio || "",
    avatarDataUrl: profile.avatarDataUrl || ""
  };
}

export function StudentProfile() {
  const { currentUser, language, signedIn } = useAppState();
  const tr = language === "tr";
  const [profile, setProfile] = useState<StudentProfileType | null>(null);
  const [summary, setSummary] = useState<ProgressSummary>(emptySummary);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const fieldText = {
    preferredExamType: {
      label: tr ? "Hazırlandığın sınav" : "Preferred exam",
      help: tr ? "Dashboard ve öneriler bu sınava göre şekillenir." : "Dashboard recommendations will adapt to this exam."
    },
    targetScore: {
      label: tr ? "Hedef skor" : "Target score",
      help: tr ? "Ulaşmak istediğin yaklaşık band ya da task skoru." : "The score or band you want to reach."
    },
    weeklyGoal: {
      label: tr ? "Haftalık test hedefi" : "Weekly session goal",
      help: tr ? "Haftada kaç speaking denemesi yapmak istediğin." : "How many speaking attempts you want each week."
    },
    dailyMinutesGoal: {
      label: tr ? "Günlük speaking süresi" : "Daily speaking minutes",
      help: tr ? "Her gün ayırabileceğin gerçekçi süre." : "A realistic amount of speaking time per day."
    },
    currentLevel: {
      label: tr ? "Mevcut seviye" : "Current level",
      help: tr ? "Örn: Band 5.5 civarı, B1, başlangıç üstü." : "Example: Around Band 5.5, B1, upper beginner."
    },
    focusSkill: {
      label: tr ? "Ana gelişim odağı" : "Main focus skill",
      help: tr ? "Şu an en çok geliştirmek istediğin alan." : "The skill you want to improve most right now."
    },
    examDate: {
      label: tr ? "Sınav tarihi" : "Exam date",
      help: tr ? "Net bir tarihin varsa yaz; yoksa boş bırakabilirsin." : "Add it if you have one; otherwise leave it blank."
    },
    targetReason: {
      label: tr ? "Bu skoru neden istiyorsun?" : "Why this score matters",
      help: tr ? "Üniversite, iş, burs, vize veya kişisel hedef." : "University, work, scholarship, visa, or personal goal."
    },
    discoverySource: {
      label: tr ? "SpeakAce'i nereden buldun?" : "How you found SpeakAce",
      help: tr ? "Google, sosyal medya, arkadaş, öğretmen gibi." : "Google, social media, a friend, or a teacher."
    },
    bio: {
      label: tr ? "Kısa çalışma notu" : "Short study note",
      help: tr ? "Şu an seni en çok zorlayan speaking problemi." : "The speaking issue that feels hardest right now."
    }
  } as const;

  useEffect(() => {
    fetch("/api/profile")
      .then((response) => response.json())
      .then((data: { profile?: StudentProfileType }) => setProfile(normalizeProfile(data.profile ?? null)))
      .catch(() => setProfile(null));
  }, []);

  useEffect(() => {
    if (!signedIn || !currentUser || currentUser.role === "guest") return;
    fetch("/api/progress/summary")
      .then((response) => response.json())
      .then((data: ProgressSummary) => setSummary(data))
      .catch(() => setSummary(emptySummary));
  }, [currentUser, signedIn]);

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
    setProfile(normalizeProfile(data.profile));
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
          <label style={fieldBlockStyle}>
            <span style={fieldLabelStyle}>{fieldText.preferredExamType.label}</span>
            <span style={fieldHelpStyle}>{fieldText.preferredExamType.help}</span>
            <select value={profile.preferredExamType} onChange={(event) => setProfile((current) => current ? { ...current, preferredExamType: event.target.value as "IELTS" | "TOEFL" } : current)} className="practice-select" style={selectStyle}>
              <option value="IELTS">IELTS</option>
              <option value="TOEFL">TOEFL</option>
            </select>
          </label>
          <label style={fieldBlockStyle}>
            <span style={fieldLabelStyle}>{fieldText.targetScore.label}</span>
            <span style={fieldHelpStyle}>{fieldText.targetScore.help}</span>
            <input value={profile.targetScore ?? ""} type="number" min="1" max={profile.preferredExamType === "IELTS" ? "9" : "30"} step="0.1" onChange={(event) => setProfile((current) => current ? { ...current, targetScore: event.target.value ? Number(event.target.value) : null } : current)} placeholder={tr ? "Örn: 6.5" : "Example: 6.5"} style={inputStyle} />
          </label>
          <label style={fieldBlockStyle}>
            <span style={fieldLabelStyle}>{fieldText.weeklyGoal.label}</span>
            <span style={fieldHelpStyle}>{fieldText.weeklyGoal.help}</span>
            <input value={profile.weeklyGoal} type="number" min="1" max="14" onChange={(event) => setProfile((current) => current ? { ...current, weeklyGoal: Number(event.target.value) || 4 } : current)} placeholder={tr ? "Örn: 4" : "Example: 4"} style={inputStyle} />
          </label>
          <label style={fieldBlockStyle}>
            <span style={fieldLabelStyle}>{fieldText.dailyMinutesGoal.label}</span>
            <span style={fieldHelpStyle}>{fieldText.dailyMinutesGoal.help}</span>
            <input value={profile.dailyMinutesGoal ?? 15} type="number" min="5" max="60" onChange={(event) => setProfile((current) => current ? { ...current, dailyMinutesGoal: Number(event.target.value) || 15 } : current)} placeholder={tr ? "Örn: 15" : "Example: 15"} style={inputStyle} />
          </label>
          <label style={fieldBlockStyle}>
            <span style={fieldLabelStyle}>{fieldText.currentLevel.label}</span>
            <span style={fieldHelpStyle}>{fieldText.currentLevel.help}</span>
            <input value={profile.currentLevel} onChange={(event) => setProfile((current) => current ? { ...current, currentLevel: event.target.value } : current)} placeholder={tr ? "Örn: Band 5.5 / B1" : "Example: Band 5.5 / B1"} style={inputStyle} />
          </label>
          <label style={fieldBlockStyle}>
            <span style={fieldLabelStyle}>{fieldText.focusSkill.label}</span>
            <span style={fieldHelpStyle}>{fieldText.focusSkill.help}</span>
            <input value={profile.focusSkill} onChange={(event) => setProfile((current) => current ? { ...current, focusSkill: event.target.value } : current)} placeholder={tr ? "Akıcılık, telaffuz, yapı..." : "Fluency, pronunciation, structure..."} style={inputStyle} />
          </label>
          <label style={fieldBlockStyle}>
            <span style={fieldLabelStyle}>{fieldText.examDate.label}</span>
            <span style={fieldHelpStyle}>{fieldText.examDate.help}</span>
            <input value={profile.examDate ?? ""} onChange={(event) => setProfile((current) => current ? { ...current, examDate: event.target.value } : current)} placeholder={tr ? "Örn: 2026-06-15" : "Example: 2026-06-15"} style={inputStyle} />
          </label>
          <label style={fieldBlockStyle}>
            <span style={fieldLabelStyle}>{fieldText.targetReason.label}</span>
            <span style={fieldHelpStyle}>{fieldText.targetReason.help}</span>
            <input value={profile.targetReason ?? ""} onChange={(event) => setProfile((current) => current ? { ...current, targetReason: event.target.value } : current)} placeholder={tr ? "Üniversite başvurusu, iş, vize..." : "University, job, visa..."} style={inputStyle} />
          </label>
          <label style={fieldBlockStyle}>
            <span style={fieldLabelStyle}>{fieldText.discoverySource.label}</span>
            <span style={fieldHelpStyle}>{fieldText.discoverySource.help}</span>
            <input value={profile.discoverySource ?? ""} onChange={(event) => setProfile((current) => current ? { ...current, discoverySource: event.target.value } : current)} placeholder={tr ? "Google, Instagram, arkadaş..." : "Google, Instagram, a friend..."} style={inputStyle} />
          </label>
          <div style={{ display: "grid", gap: "0.55rem" }}>
            <span className="practice-meta">{tr ? "Profil fotoğrafı" : "Profile photo"}</span>
            <div style={{ display: "flex", gap: "0.8rem", alignItems: "center", flexWrap: "wrap" }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 999,
                  overflow: "hidden",
                  display: "grid",
                  placeItems: "center",
                  background: "var(--surface-strong)",
                  border: "1px solid var(--line)",
                  fontWeight: 800
                }}
              >
                {profile.avatarDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatarDataUrl} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  currentUser.name.slice(0, 2).toUpperCase()
                )}
              </div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                style={{ color: "var(--foreground)" }}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    const result = typeof reader.result === "string" ? reader.result : "";
                    setProfile((current) => current ? { ...current, avatarDataUrl: result } : current);
                  };
                  reader.readAsDataURL(file);
                }}
              />
              {profile.avatarDataUrl ? (
                <button type="button" className="button button-secondary" onClick={() => setProfile((current) => current ? { ...current, avatarDataUrl: "" } : current)}>
                  {tr ? "Fotoğrafı kaldır" : "Remove photo"}
                </button>
              ) : null}
            </div>
          </div>
          <label style={fieldBlockStyle}>
            <span style={fieldLabelStyle}>{fieldText.bio.label}</span>
            <span style={fieldHelpStyle}>{fieldText.bio.help}</span>
            <textarea value={profile.bio ?? ""} onChange={(event) => setProfile((current) => current ? { ...current, bio: event.target.value } : current)} rows={4} placeholder={tr ? "Örn: Part 2'de fikirleri uzatırken takılıyorum..." : "Example: I get stuck when I try to extend ideas in Part 2..."} style={{ ...inputStyle, resize: "vertical", minHeight: 120 }} />
          </label>
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
                ? `Bu hafta için ${profile.weeklyGoal} speaking hedefi ve gunde ${profile.dailyMinutesGoal ?? 15} dakika ritmi belirledin. ${profile.studyDays.join(", ")} gunlerinde kisa ama duzenli denemeler yapman iyi olur.`
                : `You set a ${profile.weeklyGoal}-session weekly goal and ${profile.dailyMinutesGoal ?? 15} daily speaking minutes. Use ${profile.studyDays.join(", ")} for short but consistent practice blocks.`}
            </div>
          </div>
          <div className="card" style={{ padding: "0.95rem", background: "var(--surface-strong)", display: "grid", gap: "0.45rem" }}>
            <strong>{tr ? "Sınav tercihi" : "Preferred exam"}</strong>
            <div>{profile.preferredExamType}</div>
            <div className="practice-meta">{profile.currentLevel}</div>
            {profile.examDate ? <div className="practice-meta">{tr ? `Sinav tarihi: ${profile.examDate}` : `Exam date: ${profile.examDate}`}</div> : null}
            {profile.targetReason ? <div className="practice-meta">{profile.targetReason}</div> : null}
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
  width: "100%",
  padding: "0.9rem",
  background: "var(--surface-strong)",
  color: "var(--foreground)",
  borderRadius: 14,
  border: "1px solid color-mix(in srgb, var(--line) 78%, transparent)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)"
} as const;

const selectStyle = {
  width: "100%",
  minHeight: 52,
  background: "var(--surface-strong)",
  color: "var(--foreground)",
  borderRadius: 14,
  border: "1px solid color-mix(in srgb, var(--line) 78%, transparent)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)"
} as const;

const fieldBlockStyle = {
  display: "grid",
  gap: "0.38rem"
} as const;

const fieldLabelStyle = {
  fontSize: "0.9rem",
  fontWeight: 700,
  color: "var(--foreground)"
} as const;

const fieldHelpStyle = {
  fontSize: "0.8rem",
  lineHeight: 1.55,
  color: "var(--muted)"
} as const;
