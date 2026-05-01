"use client";

import { useEffect, useState } from "react";
import { useAppState } from "@/components/providers";
import type { InstitutionAnalyticsSummary } from "@/lib/types";
import { AlertTriangle, BookOpen, CheckCircle, Clock, NotebookPen, ShieldAlert, TrendingUp, Users } from "lucide-react";

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
  classes: [],
};

export function InstitutionAnalytics() {
  const { currentUser, language } = useAppState();
  const tr = language === "tr";
  const [analytics, setAnalytics] = useState<InstitutionAnalyticsSummary>(emptyAnalytics);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/teacher/institution")
      .then((response) => response.json())
      .then((data: { analytics?: InstitutionAnalyticsSummary; error?: string }) => {
        if (data.error) { setError(data.error); return; }
        setAnalytics(data.analytics ?? emptyAnalytics);
      })
      .catch(() => setError(tr ? "Kurum analitiği yüklenemedi." : "Could not load institution analytics."))
      .finally(() => setLoading(false));
  }, [tr]);

  if (loading) {
    return (
      <main className="page-shell section">
        <div className="card" style={{ padding: "2rem 1.5rem", display: "flex", alignItems: "center", gap: "1rem", color: "var(--muted)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 1s linear infinite", flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.2" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: "0.92rem" }}>{tr ? "Kurum analitiği yükleniyor…" : "Loading institution analytics…"}</span>
        </div>
      </main>
    );
  }

  if (!currentUser?.isTeacher && !currentUser?.isAdmin) {
    return (
      <main className="page-shell section">
        <div className="card" style={{ padding: "2rem", display: "grid", gap: "0.6rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "var(--destructive)" }}>
            <ShieldAlert size={20} />
            <strong style={{ fontSize: "1.1rem" }}>{tr ? "Erişim kısıtlı" : "Access restricted"}</strong>
          </div>
          <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
            {tr ? "Bu sayfayı görüntülemek için öğretmen yetkisi gerekiyor." : "Teacher access is required to view this page."}
          </p>
        </div>
      </main>
    );
  }

  const hwColor = analytics.homeworkCompletionRate >= 70 ? "var(--success)"
    : analytics.homeworkCompletionRate >= 40 ? "var(--accent)"
    : "var(--destructive)";

  const noteColor = analytics.teacherNoteCoverage >= 60 ? "var(--success)"
    : analytics.teacherNoteCoverage >= 30 ? "var(--accent)"
    : "var(--destructive)";

  return (
    <main className="page-shell section" style={{ display: "grid", gap: "1rem" }}>

      {/* Header */}
      <section className="card" style={{ padding: "1.5rem", display: "grid", gap: "0.8rem" }}>
        <span className="eyebrow">{tr ? "Kurum analitiği" : "Institution analytics"}</span>
        <h1 style={{ margin: 0 }}>{tr ? "Kurs genel görünümü" : "Institution overview"}</h1>
        <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
          {tr
            ? "Sınıflar, riskli öğrenciler, yorum kapsamı ve homework durumunu tek ekranda gör."
            : "Track classes, at-risk learners, note coverage, and homework health from one place."}
        </p>
      </section>

      {error ? (
        <div className="card" style={{ padding: "1rem", color: "var(--destructive)", display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <AlertTriangle size={16} />
          {error}
        </div>
      ) : null}

      {/* KPI grid */}
      <section className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))", gap: "0.8rem" }}>
        <MetricCard
          icon={<Users size={18} />}
          label={tr ? "Toplam sınıf" : "Total classes"}
          value={String(analytics.totalClasses)}
        />
        <MetricCard
          icon={<Users size={18} />}
          label={tr ? "Toplam öğrenci" : "Total students"}
          value={String(analytics.totalStudents)}
        />
        <MetricCard
          icon={<TrendingUp size={18} />}
          label={tr ? "Aktif öğrenci" : "Active students"}
          value={String(analytics.activeStudents)}
          sub={analytics.totalStudents > 0 ? `${Math.round((analytics.activeStudents / analytics.totalStudents) * 100)}% ${tr ? "oran" : "rate"}` : undefined}
        />
        <MetricCard
          icon={<TrendingUp size={18} />}
          label={tr ? "Kurum ortalaması" : "Institution avg"}
          value={analytics.averageScore ? analytics.averageScore.toFixed(1) : "-"}
          highlight={analytics.averageScore > 0}
        />
        <MetricCard
          icon={<BookOpen size={18} />}
          label={tr ? "Homework tamamlama" : "HW completion"}
          value={`${analytics.homeworkCompletionRate}%`}
          barPercent={analytics.homeworkCompletionRate}
          barColor={hwColor}
        />
        <MetricCard
          icon={<NotebookPen size={18} />}
          label={tr ? "Yorum kapsamı" : "Comment coverage"}
          value={`${analytics.teacherNoteCoverage}%`}
          barPercent={analytics.teacherNoteCoverage}
          barColor={noteColor}
        />
        <MetricCard
          icon={<Clock size={18} />}
          label={tr ? "Bekleyen onay" : "Pending approvals"}
          value={String(analytics.pendingApprovalCount)}
          alert={analytics.pendingApprovalCount > 0}
        />
        <MetricCard
          icon={<AlertTriangle size={18} />}
          label={tr ? "Riskli öğrenci" : "At-risk students"}
          value={String(analytics.atRiskStudentCount)}
          alert={analytics.atRiskStudentCount > 0}
        />
      </section>

      <section className="grid" style={{ gridTemplateColumns: "minmax(300px, 0.9fr) minmax(320px, 1.1fr)", gap: "1rem", alignItems: "start" }}>

        {/* Alerts panel */}
        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
          <div className="section-header-row">
            <AlertTriangle size={17} style={{ color: "#d97706" }} />
            <strong>{tr ? "Kurumsal uyarılar" : "Institution alerts"}</strong>
          </div>
          <AlertRow
            label={tr ? "Geciken homework" : "Overdue homework"}
            value={analytics.overdueHomeworkCount}
            level={analytics.overdueHomeworkCount > 0 ? "warn" : "ok"}
          />
          <AlertRow
            label={tr ? "Yaklaşan teslim" : "Due soon"}
            value={analytics.dueSoonHomeworkCount}
            level={analytics.dueSoonHomeworkCount > 5 ? "warn" : "neutral"}
          />
          <AlertRow
            label={tr ? "Ortalama gelişim" : "Avg improvement"}
            value={`+${analytics.improvementAverage.toFixed(2)}`}
            level={analytics.improvementAverage > 0 ? "ok" : "warn"}
          />
          {analytics.mostCommonWeakestSkill && (
            <AlertRow
              label={tr ? "Ortak zayıf alan" : "Common weak area"}
              value={analytics.mostCommonWeakestSkill}
              level="neutral"
            />
          )}
        </div>

        {/* Class breakdown */}
        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
          <div className="section-header-row">
            <Users size={17} style={{ color: "var(--accent)" }} />
            <strong>{tr ? "Sınıf bazlı dağılım" : "Class breakdown"}</strong>
          </div>
          {analytics.classes.length ? analytics.classes.map((item) => {
            const rate = item.homeworkCompletionRate ?? 0;
            const rateColor = rate >= 70 ? "var(--success)" : rate >= 40 ? "var(--accent)" : "var(--destructive)";
            return (
              <div key={item.classId} className="card" style={{ padding: "0.9rem", background: "var(--surface-strong)", display: "grid", gap: "0.55rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", flexWrap: "wrap" }}>
                  <strong style={{ fontSize: "0.95rem" }}>{item.className}</strong>
                  <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                    {(item.atRiskStudentCount ?? 0) > 0 && (
                      <span className="risk-pill">
                        <AlertTriangle size={10} />
                        {item.atRiskStudentCount} {tr ? "risk" : "at-risk"}
                      </span>
                    )}
                    {(item.pendingApprovalCount ?? 0) > 0 && (
                      <span style={{
                        padding: "2px 9px",
                        borderRadius: 99,
                        fontSize: "0.73rem",
                        fontWeight: 600,
                        background: "color-mix(in srgb, var(--accent) 12%, var(--surface) 88%)",
                        color: "var(--accent)",
                      }}>
                        {item.pendingApprovalCount} {tr ? "bekleyen" : "pending"}
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: "0.4rem" }}>
                  <div>
                    <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginBottom: "0.1rem" }}>{tr ? "Ort." : "Avg"}</div>
                    <strong>{item.classAverageScore ? item.classAverageScore.toFixed(1) : "-"}</strong>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginBottom: "0.1rem" }}>{tr ? "Öğrenci" : "Students"}</div>
                    <strong>{item.totalStudents}</strong>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginBottom: "0.1rem" }}>{tr ? "Deneme" : "Attempts"}</div>
                    <strong>{item.totalAttempts}</strong>
                  </div>
                </div>
                {rate > 0 && (
                  <div style={{ display: "grid", gap: "0.25rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.73rem", color: "var(--muted)" }}>
                      <span>{tr ? "Ödev tamamlama" : "HW completion"}</span>
                      <strong style={{ color: rateColor }}>{rate}%</strong>
                    </div>
                    <div className="progress-bar-wrap">
                      <div className="progress-bar-fill" style={{ width: `${rate}%`, background: rateColor }} />
                    </div>
                  </div>
                )}
              </div>
            );
          }) : (
            <div style={{ color: "var(--muted)", padding: "0.5rem 0" }}>
              {tr ? "Henüz sınıf verisi yok." : "No class data yet."}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function MetricCard({
  icon,
  label,
  value,
  sub,
  barPercent,
  barColor,
  highlight,
  alert,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  barPercent?: number;
  barColor?: string;
  highlight?: boolean;
  alert?: boolean;
}) {
  return (
    <div className="card" style={{
      padding: "1rem",
      background: alert ? "color-mix(in srgb, var(--destructive) 6%, var(--surface) 94%)" : "var(--surface-strong)",
      borderLeft: alert ? "3px solid var(--destructive)" : undefined,
      display: "grid",
      gap: "0.45rem",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: alert ? "var(--destructive)" : "var(--muted)", fontSize: "0.82rem" }}>
        {icon}
        <span>{label}</span>
      </div>
      <div style={{ fontSize: "1.8rem", fontWeight: 800, lineHeight: 1, color: highlight ? "var(--accent)" : "var(--text)" }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: "0.77rem", color: "var(--muted)" }}>{sub}</div>}
      {typeof barPercent === "number" && (
        <div className="progress-bar-wrap" style={{ marginTop: "0.2rem" }}>
          <div className="progress-bar-fill" style={{ width: `${barPercent}%`, background: barColor ?? "var(--accent)" }} />
        </div>
      )}
    </div>
  );
}

function AlertRow({ label, value, level }: { label: string; value: string | number; level: "ok" | "warn" | "neutral" }) {
  const color = level === "ok" ? "var(--success)" : level === "warn" ? "var(--destructive)" : "var(--muted)";
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", alignItems: "center", padding: "0.4rem 0", borderBottom: "1px solid var(--line)" }}>
      <span style={{ color: "var(--muted)", fontSize: "0.88rem" }}>{label}</span>
      <strong style={{ color }}>{value}</strong>
    </div>
  );
}
