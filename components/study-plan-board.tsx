"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, CalendarRange, RotateCcw, SlidersHorizontal, Sparkles } from "lucide-react";
import { useAppState } from "@/components/providers";
import { buildBandProgress, buildReactivationSignals, buildRetrySuggestions, buildStudyPlan } from "@/lib/improvement-center";
import type { ProgressSummary, StudentProfile } from "@/lib/types";

const emptySummary: ProgressSummary = {
  totalSessions: 0,
  averageScore: 0,
  streakDays: 0,
  freeSessionsRemaining: 4,
  remainingMinutesToday: 8,
  currentPlan: "free",
  recentSessions: []
};

export function StudyPlanBoard() {
  const { currentUser, language, signedIn } = useAppState();
  const tr = language === "tr";
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [summary, setSummary] = useState<ProgressSummary>(emptySummary);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!signedIn || !currentUser || currentUser.role === "guest") {
      setLoading(false);
      return;
    }
    let active = true;
    Promise.all([
      fetch("/api/profile").then((response) => response.json()) as Promise<{ profile?: StudentProfile }>,
      fetch("/api/progress/summary").then((response) => response.json()) as Promise<ProgressSummary>
    ])
      .then(([profileData, summaryData]) => {
        if (!active) return;
        setProfile(profileData.profile ?? null);
        setSummary(summaryData);
      })
      .catch(() => {
        if (!active) return;
        setProfile(null);
        setSummary(emptySummary);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [currentUser, signedIn]);

  const plan = useMemo(() => buildStudyPlan(profile, summary, tr), [profile, summary, tr]);
  const progress = useMemo(() => buildBandProgress(profile, summary, tr), [profile, summary, tr]);
  const retry = useMemo(() => buildRetrySuggestions(summary, tr), [summary, tr]);
  const reactivation = useMemo(() => buildReactivationSignals(profile, summary, tr), [profile, summary, tr]);
  const safeRetryCards = retry.map((item) => ({ ...item, href: item.href as Route }));
  const safeReactivationCards = reactivation.map((item) => ({ ...item, href: item.href as Route }));
  const safePlan = plan.map((item) => ({ ...item, href: item.href as Route }));
  const today = safePlan[0];

  if (loading) {
    return (
      <main className="page-shell section inside-page">
        <div className="inside-loading">{tr ? "Kişisel planın hazırlanıyor…" : "Preparing your personal plan…"}</div>
      </main>
    );
  }

  return (
    <main className="page-shell section inside-page">
      <header className="inside-header">
        <div className="inside-header-main">
          <span className="inside-kicker">{tr ? "Bugünün odağı" : "Today’s focus"}</span>
          <h1 className="inside-title">{today?.title ?? (tr ? "İlk skorunu oluştur." : "Establish your first score.")}</h1>
          <p className="inside-lede">
            {today?.body ?? (tr ? "Kişisel haftalık planın ilk skorlu denemenden sonra otomatik olarak netleşir." : "Your weekly plan becomes more precise after your first scored attempt.")}
          </p>
        </div>
        <div className="inside-actions">
          <Link href="/app/profile" className="button button-secondary">
            <SlidersHorizontal size={16} />
            {tr ? "Plan ayarları" : "Plan settings"}
          </Link>
          <Link href={today?.href ?? "/app/practice"} className="button button-primary">
            {tr ? "Bugünkü görevi aç" : "Open today’s task"}
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </header>

      <section className="inside-metric-strip" style={{ "--metric-count": 4 } as React.CSSProperties}>
        <PlanMetric label={tr ? "Güncel tahmin" : "Current estimate"} value={progress.currentEstimate ? progress.currentEstimate.toFixed(1) : "—"} note={tr ? "Son sonuç ortalaması" : "Recent result average"} />
        <PlanMetric label={tr ? "En iyi skor" : "Best score"} value={progress.bestScore ? progress.bestScore.toFixed(1) : "—"} note={tr ? "Kayıtlı en yüksek sonuç" : "Highest recorded result"} />
        <PlanMetric label={tr ? "Hedef mesafesi" : "Target gap"} value={progress.gap === null ? "—" : progress.gap <= 0 ? (tr ? "Kapandı" : "Closed") : progress.gap.toFixed(1)} note={tr ? "Hedefe kalan fark" : "Distance remaining"} />
        <PlanMetric label={tr ? "Ana odak" : "Primary focus"} value={progress.weakestSkill} note={progress.recentMomentum} />
      </section>

      <div className="inside-layout">
        <section className="inside-section">
          <div className="inside-section-head">
            <div>
              <span className="inside-kicker">{tr ? "Haftalık akış" : "Weekly flow"}</span>
              <h2>{tr ? "Bugünden sonraki küçük adımlar" : "Small steps from today onward"}</h2>
              <p className="inside-section-copy">
                {tr ? "Her satır tek oturumluk bir görevdir; bitirdiğinde plan yeni sonuçlarına göre yeniden sıralanır." : "Each row is one session. The order adapts as new results arrive."}
              </p>
            </div>
            <CalendarRange size={20} aria-hidden="true" />
          </div>
          {safePlan.length ? (
            <div className="inside-timeline">
              {safePlan.map((item, index) => (
                <Link key={`${item.day}-${item.title}`} href={item.href} className="inside-timeline-item">
                  <span className="inside-timeline-day">{item.day}</span>
                  <div className="inside-row-main">
                    <strong className="inside-row-title">{item.title}</strong>
                    <span className="inside-row-meta">{item.body}</span>
                  </div>
                  <span className={`inside-status${index === 0 ? " is-good" : ""}`}>
                    {index === 0 ? (tr ? "Bugün" : "Today") : (tr ? "Sırada" : "Queued")}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="inside-empty">
              <strong>{tr ? "Planın için bir başlangıç sonucu gerekiyor." : "Your plan needs a baseline result."}</strong>
              <span>{tr ? "Bir speaking denemesi tamamla; görevler zayıf alanına göre oluşsun." : "Complete one speaking attempt so tasks can adapt to your weak area."}</span>
              <Link href="/app/practice" className="button button-primary">{tr ? "İlk denemeyi başlat" : "Start first attempt"}</Link>
            </div>
          )}
        </section>

        <aside className="inside-rail">
          <section className="inside-section is-accent">
            <div className="inside-section-head">
              <div>
                <span className="inside-kicker">{tr ? "Retry modu" : "Retry mode"}</span>
                <h3>{tr ? "En hızlı düzeltmeler" : "Fastest corrections"}</h3>
              </div>
              <RotateCcw size={19} aria-hidden="true" />
            </div>
            {safeRetryCards.length ? (
              <div className="inside-row-list">
                {safeRetryCards.map((item) => (
                  <Link key={item.sessionId} href={item.href} className="inside-row">
                    <div className="inside-row-main">
                      <strong className="inside-row-title">{item.title}</strong>
                      <div className="inside-row-meta">
                        <span>{item.taskType}</span>
                        <span>{item.reason}</span>
                      </div>
                    </div>
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="inside-empty">
                <strong>{tr ? "Henüz retry önerisi yok." : "No retry suggestion yet."}</strong>
                <span>{tr ? "İlk skorlu denemenden sonra burada görünür." : "It appears after your first scored attempt."}</span>
              </div>
            )}
          </section>

          <section className="inside-section">
            <div className="inside-section-head">
              <div>
                <span className="inside-kicker">{tr ? "Momentum" : "Momentum"}</span>
                <h3>{tr ? "Ritmi koru veya geri dön" : "Keep rhythm or come back"}</h3>
              </div>
              <Sparkles size={19} aria-hidden="true" />
            </div>
            <div className="inside-row-list">
              {safeReactivationCards.map((item) => (
                <Link key={item.title} href={item.href} className="inside-row">
                  <div className="inside-row-main">
                    <strong className="inside-row-title">{item.title}</strong>
                    <span className="inside-row-meta">{item.body}</span>
                  </div>
                  <span className={`inside-status${item.level === "urgent" ? " is-alert" : item.level === "good" ? " is-good" : ""}`}>
                    {item.level === "urgent" ? (tr ? "Şimdi" : "Now") : item.level === "good" ? (tr ? "İyi" : "Good") : (tr ? "Plan" : "Plan")}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}

function PlanMetric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="inside-metric">
      <span className="inside-metric-label">{label}</span>
      <strong className="inside-metric-value">{value}</strong>
      <span className="inside-metric-note">{note}</span>
    </div>
  );
}
