"use client";

import { useEffect, useState } from "react";
import { useAppState } from "@/components/providers";
import { InstitutionAnalyticsSummary } from "@/lib/types";

const emptyAnalytics: InstitutionAnalyticsSummary = {
  totalClasses: 0,
  totalStudents: 0,
  activeStudents: 0,
  totalAttempts: 0,
  averageScore: 0,
  homeworkCompletionRate: 0,
  overdueHomeworkCount: 0,
  dueSoonHomeworkCount: 0,
  pendingApprovalCount: 0,
  atRiskStudentCount: 0,
  mostCommonWeakestSkill: null,
  teacherNoteCoverage: 0,
  improvementAverage: 0,
  classes: []
};

export function InstitutionAnalytics() {
  const { currentUser, language } = useAppState();
  const tr = language === "tr";
  const [analytics, setAnalytics] = useState<InstitutionAnalyticsSummary>(emptyAnalytics);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/teacher/institution")
      .then((response) => response.json())
      .then((data: { analytics?: InstitutionAnalyticsSummary; error?: string }) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        setAnalytics(data.analytics ?? emptyAnalytics);
      })
      .catch(() => setError(tr ? "Kurum analitigi yuklenemedi." : "Could not load institution analytics."));
  }, [tr]);

  if (!currentUser?.isTeacher && !currentUser?.isAdmin) {
    return <main className="page-shell section"><div className="card" style={{ padding: "1.5rem" }}>{tr ? "Teacher erisimi gerekli." : "Teacher access required."}</div></main>;
  }

  return (
    <main className="page-shell section" style={{ display: "grid", gap: "1rem" }}>
      <section className="card" style={{ padding: "1.5rem", display: "grid", gap: "0.8rem" }}>
        <span className="eyebrow">{tr ? "Kurum analitigi" : "Institution analytics"}</span>
        <h1 style={{ margin: 0 }}>{tr ? "Kurs genel gorunumu" : "Institution overview"}</h1>
        <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
          {tr ? "Siniflar, riskli ogrenciler, yorum kapsami ve homework durumunu tek ekranda gor." : "Track classes, at-risk learners, note coverage, and homework health from one place."}
        </p>
      </section>

      {error ? <div className="card" style={{ padding: "1rem", color: "var(--accent-deep)" }}>{error}</div> : null}

      <section className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.8rem" }}>
        <Metric label={tr ? "Toplam sinif" : "Total classes"} value={String(analytics.totalClasses)} />
        <Metric label={tr ? "Toplam ogrenci" : "Total students"} value={String(analytics.totalStudents)} />
        <Metric label={tr ? "Aktif ogrenci" : "Active students"} value={String(analytics.activeStudents)} />
        <Metric label={tr ? "Kurum ortalamasi" : "Institution average"} value={analytics.averageScore ? analytics.averageScore.toFixed(1) : "-"} />
        <Metric label={tr ? "Homework tamamlama" : "Homework completion"} value={`${analytics.homeworkCompletionRate}%`} />
        <Metric label={tr ? "Yorum kapsami" : "Comment coverage"} value={`${analytics.teacherNoteCoverage}%`} />
        <Metric label={tr ? "Bekleyen onay" : "Pending approvals"} value={String(analytics.pendingApprovalCount)} />
        <Metric label={tr ? "Riskli ogrenci" : "At-risk students"} value={String(analytics.atRiskStudentCount)} />
      </section>

      <section className="grid" style={{ gridTemplateColumns: "minmax(320px, 1fr) minmax(320px, 1fr)", gap: "1rem" }}>
        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.7rem" }}>
          <strong>{tr ? "Kurumsal uyarilar" : "Institution alerts"}</strong>
          <AlertLine label={tr ? "Geciken homework" : "Overdue homework"} value={analytics.overdueHomeworkCount} />
          <AlertLine label={tr ? "Yaklasan teslim" : "Due soon"} value={analytics.dueSoonHomeworkCount} />
          <AlertLine label={tr ? "Ortak zayif alan" : "Common weak area"} value={analytics.mostCommonWeakestSkill ?? "-"} />
          <AlertLine label={tr ? "Ortalama gelisim" : "Average improvement"} value={analytics.improvementAverage.toFixed(1)} />
        </div>

        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.7rem" }}>
          <strong>{tr ? "Sinif bazli dagilim" : "Class breakdown"}</strong>
          {analytics.classes.length ? analytics.classes.map((item) => (
            <div key={item.classId} className="card" style={{ padding: "0.85rem", background: "var(--surface-strong)", display: "grid", gap: "0.3rem" }}>
              <strong>{item.className}</strong>
              <div className="practice-meta">
                {(tr ? "Ortalama" : "Average")}: {item.classAverageScore ? item.classAverageScore.toFixed(1) : "-"} · {(tr ? "Risk" : "Risk")}: {item.atRiskStudentCount ?? 0} · {(tr ? "Onay" : "Pending")}: {item.pendingApprovalCount ?? 0}
              </div>
            </div>
          )) : <div className="practice-meta">{tr ? "Henuz sinif verisi yok." : "No class data yet."}</div>}
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)" }}>
      <div style={{ color: "var(--muted)", marginBottom: "0.35rem" }}>{label}</div>
      <strong style={{ fontSize: "1.8rem" }}>{value}</strong>
    </div>
  );
}

function AlertLine({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem" }}>
      <span style={{ color: "var(--muted)" }}>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
