"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, LineChart, Save, Sparkles, Target, UserRound } from "lucide-react";
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

const studyDayOptions = [
  { key: "Mon", en: "Mon", tr: "Pzt" },
  { key: "Tue", en: "Tue", tr: "Sal" },
  { key: "Wed", en: "Wed", tr: "Çar" },
  { key: "Thu", en: "Thu", tr: "Per" },
  { key: "Fri", en: "Fri", tr: "Cum" },
  { key: "Sat", en: "Sat", tr: "Cmt" },
  { key: "Sun", en: "Sun", tr: "Paz" }
];

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/profile")
      .then((response) => {
        if (!response.ok) throw new Error("profile");
        return response.json();
      })
      .then((data: { profile?: StudentProfileType }) => {
        if (active) setProfile(normalizeProfile(data.profile ?? null));
      })
      .catch(() => {
        if (active) setError(tr ? "Profil yüklenemedi." : "Could not load your profile.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [tr]);

  useEffect(() => {
    if (!signedIn || !currentUser || currentUser.role === "guest") return;
    fetch("/api/progress/summary")
      .then((response) => response.json())
      .then((data: ProgressSummary) => setSummary(data))
      .catch(() => setSummary(emptySummary));
  }, [currentUser, signedIn]);

  const profileReadiness = useMemo(() => {
    if (!profile?.targetScore || !summary.averageScore) {
      return tr ? "İlk skorlu denemenden sonra hedef mesafeni ve haftalık önceliğini burada göreceksin." : "After your first scored attempt, this space will show your target gap and weekly priority.";
    }
    const gap = Number((profile.targetScore - summary.averageScore).toFixed(1));
    if (gap <= 0) {
      return tr ? "Hedef skoruna ulaştın. Şimdi odağın sınav gününe kadar bu seviyeyi istikrarlı tutmak." : "You have reached your target. The priority now is holding this level consistently until exam day.";
    }
    return tr ? `Hedefinle son ortalaman arasında ${gap} puan var. Kısa tekrarlar ve aynı soruyu ikinci kez cevaplamak en hızlı kaldıraç.` : `There is a ${gap}-point gap between your recent average and target. Short retries on the same prompt are your fastest lever.`;
  }, [profile?.targetScore, summary.averageScore, tr]);

  const completion = useMemo(() => {
    if (!profile) return 0;
    const fields = [
      profile.targetScore,
      profile.currentLevel,
      profile.focusSkill,
      profile.examDate,
      profile.targetReason,
      profile.bio,
      profile.studyDays.length,
      profile.weeklyGoal
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  }, [profile]);

  const saveProfile = async () => {
    if (!profile || saving) return;
    setError("");
    setNotice("");
    setSaving(true);
    try {
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
      setNotice(tr ? "Değişikliklerin kaydedildi." : "Your changes have been saved.");
    } catch {
      setError(tr ? "Profil kaydedilirken bağlantı hatası oluştu." : "A connection error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !currentUser || !profile) {
    return (
      <main className="page-shell section inside-page">
        <div className="inside-loading">
          {error || (tr ? "Profilin hazırlanıyor…" : "Preparing your profile…")}
        </div>
      </main>
    );
  }

  const initials = currentUser.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="page-shell section inside-page">
      <header className="inside-header">
        <div className="inside-header-main">
          <div className="inside-person">
            <div className="inside-avatar" aria-hidden="true">
              {profile.avatarDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatarDataUrl} alt="" />
              ) : (
                initials
              )}
            </div>
            <div>
              <span className="inside-kicker">{tr ? "Öğrenci profili" : "Learner profile"}</span>
              <h1 className="inside-title is-person">{currentUser.name}</h1>
              <p className="inside-lede">{currentUser.email}</p>
            </div>
          </div>
        </div>
        <div className="inside-actions">
          <Link href="/app/review" className="button button-secondary">
            <LineChart size={16} />
            {tr ? "Sonuçları aç" : "Open results"}
          </Link>
          <Link href="/app/plan" className="button button-primary">
            <Sparkles size={16} />
            {tr ? "Planımı gör" : "View my plan"}
          </Link>
        </div>
      </header>

      <section className="inside-metric-strip" style={{ "--metric-count": 4 } as React.CSSProperties}>
        <ProfileMetric label={tr ? "Ortalama skor" : "Average score"} value={summary.averageScore ? summary.averageScore.toFixed(1) : "—"} note={tr ? "Son skorlu denemeler" : "Recent scored attempts"} />
        <ProfileMetric label={tr ? "Pratik serisi" : "Practice streak"} value={`${summary.streakDays}`} note={tr ? "Gün" : "Days"} />
        <ProfileMetric label={tr ? "Toplam deneme" : "Total attempts"} value={`${summary.totalSessions}`} note={tr ? "Speaking oturumu" : "Speaking sessions"} />
        <ProfileMetric label={tr ? "Üyelik" : "Membership"} value={currentUser.plan.toUpperCase()} note={tr ? "Mevcut plan" : "Current plan"} />
      </section>

      <div className="inside-layout">
        <div className="inside-main">
          <section className="inside-section">
            <div className="inside-section-head">
              <div>
                <span className="inside-kicker">{tr ? "01 · Sonuç" : "01 · Outcome"}</span>
                <h2>{tr ? "Sınav hedefin" : "Your exam target"}</h2>
                <p className="inside-section-copy">
                  {tr ? "Öneriler, skor aralığı ve geri sayım bu bilgilere göre şekillenir." : "Recommendations, score ranges, and your countdown adapt to these details."}
                </p>
              </div>
              <Target size={20} aria-hidden="true" />
            </div>
            <div className="inside-form-grid">
              <label className="inside-field">
                <span className="inside-field-label">{tr ? "Hazırlandığın sınav" : "Preferred exam"}</span>
                <span className="inside-field-help">{tr ? "Dashboard görevlerini belirler." : "Sets the task mix on your dashboard."}</span>
                <select value={profile.preferredExamType} onChange={(event) => setProfile((current) => current ? { ...current, preferredExamType: event.target.value as "IELTS" | "TOEFL" } : current)}>
                  <option value="IELTS">IELTS</option>
                  <option value="TOEFL">TOEFL</option>
                </select>
              </label>
              <label className="inside-field">
                <span className="inside-field-label">{tr ? "Hedef skor" : "Target score"}</span>
                <span className="inside-field-help">{tr ? "Ulaşmak istediğin band veya task skoru." : "The band or task score you want to reach."}</span>
                <input value={profile.targetScore ?? ""} type="number" min="1" max={profile.preferredExamType === "IELTS" ? "9" : "30"} step="0.1" onChange={(event) => setProfile((current) => current ? { ...current, targetScore: event.target.value ? Number(event.target.value) : null } : current)} placeholder={profile.preferredExamType === "IELTS" ? "6.5" : "24"} />
              </label>
              <label className="inside-field">
                <span className="inside-field-label">{tr ? "Sınav tarihi" : "Exam date"}</span>
                <span className="inside-field-help">{tr ? "Net değilse yaklaşık tarihi yazabilirsin." : "An approximate date is fine if it is not fixed."}</span>
                <input value={profile.examDate ?? ""} onChange={(event) => setProfile((current) => current ? { ...current, examDate: event.target.value } : current)} placeholder={tr ? "Örn. 15 Haziran 2026" : "Example: June 15, 2026"} />
              </label>
              <label className="inside-field">
                <span className="inside-field-label">{tr ? "Bu hedef neden önemli?" : "Why does this target matter?"}</span>
                <span className="inside-field-help">{tr ? "Üniversite, iş, vize veya kişisel hedef." : "University, work, visa, or a personal goal."}</span>
                <input value={profile.targetReason ?? ""} onChange={(event) => setProfile((current) => current ? { ...current, targetReason: event.target.value } : current)} placeholder={tr ? "Üniversite başvurusu…" : "University application…"} />
              </label>
            </div>
          </section>

          <section className="inside-section">
            <div className="inside-section-head">
              <div>
                <span className="inside-kicker">{tr ? "02 · Ritim" : "02 · Rhythm"}</span>
                <h2>{tr ? "Gerçekçi çalışma düzenin" : "A realistic study rhythm"}</h2>
                <p className="inside-section-copy">
                  {tr ? "Planın yalnızca gerçekten ayırabileceğin zamana göre çalışmalı." : "Your plan should only use time you can genuinely protect."}
                </p>
              </div>
              <CalendarDays size={20} aria-hidden="true" />
            </div>
            <div className="inside-form-grid">
              <label className="inside-field">
                <span className="inside-field-label">{tr ? "Haftalık deneme hedefi" : "Weekly attempt goal"}</span>
                <span className="inside-field-help">{tr ? "Haftada kaç speaking denemesi?" : "How many speaking attempts per week?"}</span>
                <input value={profile.weeklyGoal} type="number" min="1" max="14" onChange={(event) => setProfile((current) => current ? { ...current, weeklyGoal: Number(event.target.value) || 4 } : current)} />
              </label>
              <label className="inside-field">
                <span className="inside-field-label">{tr ? "Günlük süre" : "Daily time"}</span>
                <span className="inside-field-help">{tr ? "Kısa ama sürdürülebilir bir süre seç." : "Choose a short, sustainable practice block."}</span>
                <input value={profile.dailyMinutesGoal ?? 15} type="number" min="5" max="60" onChange={(event) => setProfile((current) => current ? { ...current, dailyMinutesGoal: Number(event.target.value) || 15 } : current)} />
              </label>
              <label className="inside-field">
                <span className="inside-field-label">{tr ? "Mevcut seviyen" : "Current level"}</span>
                <span className="inside-field-help">{tr ? "Örn. B1 veya IELTS 5.5 civarı." : "Example: B1 or around IELTS 5.5."}</span>
                <input value={profile.currentLevel} onChange={(event) => setProfile((current) => current ? { ...current, currentLevel: event.target.value } : current)} placeholder={tr ? "B1 / Band 5.5" : "B1 / Band 5.5"} />
              </label>
              <label className="inside-field">
                <span className="inside-field-label">{tr ? "Ana odak" : "Primary focus"}</span>
                <span className="inside-field-help">{tr ? "Bu hafta en çok geliştirmek istediğin alan." : "The skill you most want to improve this week."}</span>
                <input value={profile.focusSkill} onChange={(event) => setProfile((current) => current ? { ...current, focusSkill: event.target.value } : current)} placeholder={tr ? "Akıcılık, telaffuz, yapı…" : "Fluency, pronunciation, structure…"} />
              </label>
              <div className="inside-field is-wide">
                <span className="inside-field-label">{tr ? "Çalışma günleri" : "Study days"}</span>
                <span className="inside-field-help">{tr ? "Hatırlatmalar ve haftalık plan bu günleri kullanır." : "Reminders and your weekly plan use these days."}</span>
                <div className="inside-day-picker">
                  {studyDayOptions.map((day) => {
                    const active = profile.studyDays.includes(day.key);
                    return (
                      <button
                        key={day.key}
                        type="button"
                        className={`inside-day${active ? " is-active" : ""}`}
                        aria-pressed={active}
                        onClick={() =>
                          setProfile((current) =>
                            current
                              ? {
                                  ...current,
                                  studyDays: active ? current.studyDays.filter((item) => item !== day.key) : [...current.studyDays, day.key]
                                }
                              : current
                          )
                        }
                      >
                        {tr ? day.tr : day.en}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className="inside-section">
            <div className="inside-section-head">
              <div>
                <span className="inside-kicker">{tr ? "03 · Koçluk bağlamı" : "03 · Coaching context"}</span>
                <h2>{tr ? "Seni daha iyi tanıyalım" : "Help the coach understand you"}</h2>
                <p className="inside-section-copy">
                  {tr ? "Bu notlar önerileri daha kişisel ve uygulanabilir yapar." : "These notes make recommendations more personal and practical."}
                </p>
              </div>
              <UserRound size={20} aria-hidden="true" />
            </div>
            <div className="inside-form-grid">
              <label className="inside-field">
                <span className="inside-field-label">{tr ? "SpeakAce'i nereden buldun?" : "How did you find SpeakAce?"}</span>
                <span className="inside-field-help">{tr ? "Google, sosyal medya, arkadaş veya öğretmen." : "Google, social media, a friend, or a teacher."}</span>
                <input value={profile.discoverySource ?? ""} onChange={(event) => setProfile((current) => current ? { ...current, discoverySource: event.target.value } : current)} placeholder={tr ? "Google…" : "Google…"} />
              </label>
              <label className="inside-field is-wide">
                <span className="inside-field-label">{tr ? "Koçuna kısa not" : "A short note for your coach"}</span>
                <span className="inside-field-help">{tr ? "Konuşurken nerede takıldığını veya neyi değiştirmek istediğini yaz." : "Describe where you get stuck and what you want to change."}</span>
                <textarea value={profile.bio ?? ""} onChange={(event) => setProfile((current) => current ? { ...current, bio: event.target.value } : current)} placeholder={tr ? "Part 2'de fikirlerimi uzatırken takılıyorum…" : "I get stuck when extending ideas in Part 2…"} />
              </label>
            </div>
          </section>

          <div className="inside-savebar">
            <p className={`inside-feedback${notice ? " is-success" : error ? " is-error" : ""}`}>
              {notice || error || (tr ? "Değişiklikler yalnızca kaydettiğinde planına yansır." : "Changes update your plan after you save them.")}
            </p>
            <button type="button" className="button button-primary" onClick={saveProfile} disabled={saving}>
              <Save size={16} />
              {saving ? (tr ? "Kaydediliyor…" : "Saving…") : (tr ? "Profili kaydet" : "Save profile")}
            </button>
          </div>
        </div>

        <aside className="inside-rail">
          <section className="inside-section">
            <div className="inside-section-head">
              <div>
                <span className="inside-kicker">{tr ? "Profil durumu" : "Profile status"}</span>
                <h3>{tr ? `%${completion} tamamlandı` : `${completion}% complete`}</h3>
              </div>
            </div>
            <div className="inside-progress">
              <div className="inside-progress-labels">
                <span>{tr ? "Kişiselleştirme" : "Personalization"}</span>
                <span>{completion}%</span>
              </div>
              <div className="inside-progress-track" aria-label={`${completion}%`}>
                <span style={{ width: `${completion}%` }} />
              </div>
            </div>
            <div className="inside-callout" style={{ marginTop: "1rem" }}>
              <strong>{tr ? "Koç yorumu" : "Coach insight"}</strong>
              <p>{profileReadiness}</p>
            </div>
          </section>

          <section className="inside-section">
            <div className="inside-section-head">
              <div>
                <span className="inside-kicker">{tr ? "Kimlik" : "Identity"}</span>
                <h3>{tr ? "Profil fotoğrafın" : "Profile photo"}</h3>
              </div>
            </div>
            <div className="inside-person">
              <div className="inside-avatar">
                {profile.avatarDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatarDataUrl} alt={tr ? "Profil fotoğrafı" : "Profile photo"} />
                ) : (
                  initials
                )}
              </div>
              <div className="inside-inline-actions">
                <label className="button button-secondary" style={{ cursor: "pointer" }}>
                  {tr ? "Fotoğraf seç" : "Choose photo"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    hidden
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      if (file.size > 2_000_000) {
                        setError(tr ? "Fotoğraf 2 MB'dan küçük olmalı." : "The photo must be smaller than 2 MB.");
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () => {
                        const result = typeof reader.result === "string" ? reader.result : "";
                        setProfile((current) => current ? { ...current, avatarDataUrl: result } : current);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
                {profile.avatarDataUrl ? (
                  <button type="button" className="button button-secondary" onClick={() => setProfile((current) => current ? { ...current, avatarDataUrl: "" } : current)}>
                    {tr ? "Kaldır" : "Remove"}
                  </button>
                ) : null}
              </div>
            </div>
          </section>

          <section className="inside-section is-accent">
            <div className="inside-section-head">
              <div>
                <span className="inside-kicker">{tr ? "Bu haftaki sözün" : "This week's commitment"}</span>
                <h3>{profile.focusSkill}</h3>
              </div>
              <Clock3 size={19} aria-hidden="true" />
            </div>
            <p className="inside-section-copy">
              {tr
                ? `${profile.weeklyGoal} deneme, günde ${profile.dailyMinutesGoal ?? 15} dakika. Küçük ve düzenli bloklar yeterli.`
                : `${profile.weeklyGoal} attempts and ${profile.dailyMinutesGoal ?? 15} minutes per day. Small, consistent blocks are enough.`}
            </p>
          </section>
        </aside>
      </div>
    </main>
  );
}

function ProfileMetric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="inside-metric">
      <span className="inside-metric-label">{label}</span>
      <strong className="inside-metric-value">{value}</strong>
      <span className="inside-metric-note">{note}</span>
    </div>
  );
}
