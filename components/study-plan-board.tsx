"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

  useEffect(() => {
    fetch("/api/profile")
      .then((response) => response.json())
      .then((data: { profile?: StudentProfile }) => setProfile(data.profile ?? null))
      .catch(() => setProfile(null));
  }, []);

  useEffect(() => {
    if (!signedIn || !currentUser || currentUser.role === "guest") return;
    fetch("/api/progress/summary")
      .then((response) => response.json())
      .then((data: ProgressSummary) => setSummary(data))
      .catch(() => setSummary(emptySummary));
  }, [currentUser, signedIn]);

  const plan = useMemo(() => buildStudyPlan(profile, summary, tr), [profile, summary, tr]);
  const progress = useMemo(() => buildBandProgress(profile, summary, tr), [profile, summary, tr]);
  const retry = useMemo(() => buildRetrySuggestions(summary, tr), [summary, tr]);
  const reactivation = useMemo(() => buildReactivationSignals(profile, summary, tr), [profile, summary, tr]);
  const safeRetryCards = retry.map((item) => ({ ...item, href: item.href as Route }));
  const safeReactivationCards = reactivation.map((item) => ({ ...item, href: item.href as Route }));
  const safePlan = plan.map((item) => ({ ...item, href: item.href as Route }));

  return (
    <main className="page-shell section" style={{ display: "grid", gap: "1rem" }}>
      <section className="card" style={{ padding: "1.5rem", display: "grid", gap: "0.8rem" }}>
        <span className="eyebrow">Study plan</span>
        <h1 style={{ margin: 0 }}>{tr ? "Kişisel çalışma planın" : "Your personal study plan"}</h1>
        <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
          {tr
            ? "Placement, hedef skor, son speaking denemeleri ve zayıf alanlarına göre oluşturulan günlük çalışma akışın burada."
            : "This daily plan is built from your placement result, target score, recent speaking attempts, and weakest skill signals."}
        </p>
      </section>

      <section className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
        <Metric label={tr ? "Current estimate" : "Current estimate"} value={progress.currentEstimate ? progress.currentEstimate.toFixed(1) : "-"} note={tr ? "Son denemelerin ortalaması" : "Average across recent attempts"} />
        <Metric label={tr ? "Best score" : "Best score"} value={progress.bestScore ? progress.bestScore.toFixed(1) : "-"} note={tr ? "En iyi yakın skorun" : "Best recent score"} />
        <Metric label={tr ? "Target gap" : "Target gap"} value={progress.gap === null ? "-" : progress.gap <= 0 ? (tr ? "Kapatıldı" : "Closed") : progress.gap.toFixed(1)} note={tr ? "Hedefe kalan fark" : "Distance to your target"} />
        <Metric label={tr ? "Weakest skill" : "Weakest skill"} value={progress.weakestSkill} note={progress.recentMomentum} />
      </section>

      <section className="grid" style={{ gridTemplateColumns: "minmax(320px, 1.1fr) minmax(320px, 0.9fr)", gap: "1rem", alignItems: "start" }}>
        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
          <strong>{tr ? "Bugünden haftaya plan" : "Plan from today into the week"}</strong>
          <div style={{ display: "grid", gap: "0.8rem" }}>
            {safePlan.map((item) => (
              <Link key={`${item.day}-${item.title}`} href={item.href} className="card" style={{ padding: "1rem", background: "var(--surface-strong)", display: "grid", gap: "0.35rem" }}>
                <span className="pill" style={{ width: "fit-content" }}>{item.day}</span>
                <strong>{item.title}</strong>
                <span style={{ color: "var(--muted)", lineHeight: 1.7 }}>{item.body}</span>
              </Link>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gap: "1rem" }}>
          <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
            <strong>{tr ? "Retry mode" : "Retry mode"}</strong>
            {safeRetryCards.length ? safeRetryCards.map((item) => (
              <Link key={item.sessionId} href={item.href} className="card" style={{ padding: "0.95rem", background: "var(--surface-strong)", display: "grid", gap: "0.3rem" }}>
                <strong>{item.title}</strong>
                <span className="practice-meta">{item.taskType}</span>
                <span style={{ color: "var(--muted)", lineHeight: 1.65 }}>{item.reason}</span>
              </Link>
            )) : <p style={{ margin: 0, color: "var(--muted)" }}>{tr ? "Retry önerileri ilk skorlu denemelerden sonra görünür." : "Retry suggestions appear after your first scored attempts."}</p>}
          </div>

          <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
            <strong>{tr ? "Reactivation and comeback" : "Reactivation and comeback"}</strong>
            {safeReactivationCards.map((item) => (
              <Link key={item.title} href={item.href} className="card" style={{ padding: "0.95rem", background: item.level === "urgent" ? "rgba(217, 93, 57, 0.08)" : item.level === "good" ? "rgba(47, 125, 75, 0.08)" : "var(--surface-strong)", display: "grid", gap: "0.3rem" }}>
                <strong>{item.title}</strong>
                <span style={{ color: "var(--muted)", lineHeight: 1.65 }}>{item.body}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)", display: "grid", gap: "0.25rem" }}>
      <span className="practice-meta">{label}</span>
      <strong style={{ fontSize: "1.6rem" }}>{value}</strong>
      <span style={{ color: "var(--muted)", lineHeight: 1.6 }}>{note}</span>
    </div>
  );
}
