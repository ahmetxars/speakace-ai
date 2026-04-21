"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAppState } from "@/components/providers";
import { GrowthProofBoard } from "@/components/growth-proof-board";
import { buildBandProgress, buildReactivationSignals, buildRetrySuggestions } from "@/lib/improvement-center";
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

export function ImprovementHub() {
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

  const progress = useMemo(() => buildBandProgress(profile, summary, tr), [profile, summary, tr]);
  const retrySuggestions = useMemo(() => buildRetrySuggestions(summary, tr), [summary, tr]);
  const reactivation = useMemo(() => buildReactivationSignals(profile, summary, tr), [profile, summary, tr]);
  const teacherHref: Route = currentUser?.memberType === "school" ? "/app/institution-admin" : "/app/teacher";
  const hubCards: Array<{ title: string; href: Route; body: string }> = [
    { title: tr ? "Placement" : "Placement", href: "/app/placement", body: profile?.currentLevel ?? (tr ? "Seviyeni netleştir" : "Lock your level") },
    { title: tr ? "Study plan" : "Study plan", href: "/app/plan", body: tr ? `${profile?.weeklyGoal ?? 4} oturumluk haftalık ritim` : `${profile?.weeklyGoal ?? 4}-session weekly rhythm` },
    { title: tr ? "Band progress" : "Band progress", href: "/app/analytics", body: progress.currentEstimate ? `${progress.currentEstimate.toFixed(1)} ${tr ? "ortalama" : "current estimate"}` : (tr ? "Henüz skor yok" : "No score yet") },
    { title: tr ? "Mistake notebook" : "Mistake notebook", href: "/app/review", body: progress.weakestSkill },
    { title: tr ? "Retry mode" : "Retry mode", href: (retrySuggestions[0]?.href ?? "/app/review") as Route, body: retrySuggestions[0]?.title ?? (tr ? "Tekrar önerileri hazır" : "Retry suggestions ready") },
    { title: tr ? "Mock exam" : "Mock exam", href: "/app/mock-exam", body: tr ? "Tam simülasyon + rapor" : "Full simulation + report" },
    { title: tr ? "Teacher / school" : "Teacher / school", href: teacherHref, body: tr ? "Sınıf, homework ve analytics" : "Classes, homework, and analytics" },
    { title: tr ? "Referral" : "Referral", href: "/app/referrals", body: tr ? "Davet linki ve signup takibi" : "Invite link and signup tracking" }
  ];

  return (
    <main className="page-shell section" style={{ display: "grid", gap: "1rem" }}>
      <section className="card" style={{ padding: "1.5rem", display: "grid", gap: "0.85rem" }}>
        <span className="eyebrow">Improvement hub</span>
        <h1 style={{ margin: 0 }}>{tr ? "SpeakAce growth OS" : "SpeakAce growth OS"}</h1>
        <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
          {tr
            ? "Placement, kişisel plan, band ilerlemesi, hata defteri, retry döngüsü, mock exam, teacher mode, reminder sistemi, referral ve proof katmanı burada birleşir."
            : "Placement, personal planning, band progress, mistakes, retry mode, mock exam, teacher mode, reminders, referral, and proof all connect here."}
        </p>
      </section>

      <section className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
        {hubCards.map((item) => (
          <Link key={item.title} href={item.href} className="card" style={{ padding: "1rem", display: "grid", gap: "0.35rem", background: "var(--surface-strong)" }}>
            <strong>{item.title}</strong>
            <span style={{ color: "var(--muted)", lineHeight: 1.65 }}>{item.body}</span>
          </Link>
        ))}
      </section>

      <section className="grid" style={{ gridTemplateColumns: "minmax(320px, 1fr) minmax(320px, 1fr)", gap: "1rem", alignItems: "start" }}>
        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.75rem" }}>
          <strong>{tr ? "Band progress snapshot" : "Band progress snapshot"}</strong>
          <div className="grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "0.75rem" }}>
            <Metric label={tr ? "Current" : "Current"} value={progress.currentEstimate ? progress.currentEstimate.toFixed(1) : "-"} />
            <Metric label={tr ? "Best" : "Best"} value={progress.bestScore ? progress.bestScore.toFixed(1) : "-"} />
            <Metric label={tr ? "Gap" : "Gap"} value={progress.gap === null ? "-" : progress.gap <= 0 ? "0" : progress.gap.toFixed(1)} />
            <Metric label={tr ? "Weakest" : "Weakest"} value={progress.weakestSkill} />
          </div>
          <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>{progress.recentMomentum}</p>
        </div>

        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.75rem" }}>
          <strong>{tr ? "Reactivation system" : "Reactivation system"}</strong>
          {reactivation.map((item) => (
            <Link key={item.title} href={item.href} className="card" style={{ padding: "0.9rem", background: item.level === "urgent" ? "rgba(217, 93, 57, 0.08)" : item.level === "good" ? "rgba(47, 125, 75, 0.08)" : "var(--surface-strong)", display: "grid", gap: "0.3rem" }}>
              <strong>{item.title}</strong>
              <span style={{ color: "var(--muted)", lineHeight: 1.65 }}>{item.body}</span>
            </Link>
          ))}
        </div>
      </section>

      <GrowthProofBoard />
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="card" style={{ padding: "0.9rem", background: "var(--surface-strong)", display: "grid", gap: "0.2rem" }}>
      <span className="practice-meta">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
