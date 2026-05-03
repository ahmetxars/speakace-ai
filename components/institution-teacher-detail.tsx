"use client";

import { useEffect, useMemo, useState } from "react";
import { ScoreLineChart } from "@/components/score-line-chart";
import { useAppState } from "@/components/providers";

type DetailPayload = {
  teacher: { id: string; name: string; email: string };
  summary: {
    classCount: number;
    studentCount: number;
    activeStudents: number;
    averageScore: number;
    pendingApprovalCount: number;
    atRiskStudentCount: number;
    homeworkCompletionRate: number;
    homeworkAssignedCount: number;
    overdueHomeworkCount: number;
    recentActivityAt: string | null;
  };
  classes: Array<{
    id: string;
    name: string;
    studentCount: number;
    activeStudents: number;
    averageScore: number;
    pendingApprovals: number;
    homeworkAssignedCount: number;
    overdueHomeworkCount: number;
    lastActivityAt: string | null;
  }>;
  recentAnnouncements: Array<{ id: string; title: string; createdAt: string }>;
  recentNotes: Array<{ id: string; note: string; createdAt: string }>;
};

export function InstitutionTeacherDetail({ teacherId }: { teacherId: string }) {
  const { language } = useAppState();
  const tr = language === "tr";
  const [detail, setDetail] = useState<DetailPayload | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/institution-admin/teachers/${teacherId}`)
      .then((r) => r.json())
      .then((data: DetailPayload & { error?: string }) => {
        if (data.error) throw new Error(data.error);
        setDetail(data);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : tr ? "Öğretmen detayı yüklenemedi." : "Could not load teacher detail."));
  }, [teacherId, tr]);

  const activityPoints = useMemo(
    () =>
      (detail?.classes ?? []).map((item) => ({
        label: item.name.length > 10 ? `${item.name.slice(0, 10)}…` : item.name,
        value: item.averageScore || item.activeStudents || 0,
        meta: `${item.studentCount} students`,
      })),
    [detail?.classes]
  );

  if (!detail) {
    return (
      <main className="page-shell section">
        <div className="card" style={{ padding: "2rem", color: error ? "var(--destructive)" : "var(--muted)" }}>
          {error || (tr ? "Öğretmen detayı yükleniyor…" : "Loading teacher detail…")}
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell section" style={{ display: "grid", gap: "1rem" }}>
      <section className="card" style={{ padding: "1.4rem", display: "grid", gap: "0.7rem" }}>
        <span className="eyebrow">{tr ? "Öğretmen inceleme" : "Teacher inspection"}</span>
        <h1 style={{ margin: 0, fontSize: "2rem" }}>{detail.teacher.name}</h1>
        <p style={{ margin: 0, color: "var(--muted)" }}>{detail.teacher.email}</p>
      </section>

      <section className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.8rem" }}>
        <Metric label={tr ? "Sınıf" : "Classes"} value={String(detail.summary.classCount)} />
        <Metric label={tr ? "Öğrenci" : "Students"} value={String(detail.summary.studentCount)} />
        <Metric label={tr ? "Aktif öğrenci" : "Active students"} value={String(detail.summary.activeStudents)} />
        <Metric label={tr ? "Ort. skor" : "Average score"} value={detail.summary.averageScore ? detail.summary.averageScore.toFixed(1) : "—"} />
        <Metric label={tr ? "Atanan ödev" : "Homework assigned"} value={String(detail.summary.homeworkAssignedCount)} />
        <Metric label={tr ? "Geciken ödev" : "Overdue homework"} value={String(detail.summary.overdueHomeworkCount)} />
      </section>

      <section className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem" }}>
        <div>
          <span className="eyebrow">{tr ? "Öğretmen aktivitesi" : "Teacher activity"}</span>
          <h2 style={{ margin: "0.25rem 0 0", fontSize: "1.4rem" }}>{tr ? "Sınıf performans sinyali" : "Class performance signal"}</h2>
        </div>
        <ScoreLineChart points={activityPoints} />
      </section>

      <section className="grid" style={{ gridTemplateColumns: "minmax(340px, 1fr) minmax(300px, 0.9fr)", gap: "1rem", alignItems: "start" }}>
        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
          <strong>{tr ? "Sınıflar" : "Classes"}</strong>
          {detail.classes.map((item) => (
            <div key={item.id} className="card" style={{ padding: "0.9rem", background: "var(--surface-strong)", display: "grid", gap: "0.4rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.6rem", flexWrap: "wrap" }}>
                <strong>{item.name}</strong>
                <span className="pill">{item.studentCount} {tr ? "öğrenci" : "students"}</span>
              </div>
              <div className="grid" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "0.45rem" }}>
                <Metric label={tr ? "Aktif" : "Active"} value={String(item.activeStudents)} />
                <Metric label={tr ? "Ort." : "Avg"} value={item.averageScore ? item.averageScore.toFixed(1) : "—"} />
                <Metric label={tr ? "Bekleyen" : "Pending"} value={String(item.pendingApprovals)} />
                <Metric label={tr ? "Ödev" : "HW"} value={String(item.homeworkAssignedCount)} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gap: "1rem" }}>
          <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.7rem" }}>
            <strong>{tr ? "Son duyurular" : "Recent announcements"}</strong>
            {detail.recentAnnouncements.length ? detail.recentAnnouncements.map((item) => (
              <div key={item.id} className="card" style={{ padding: "0.8rem", background: "var(--surface-strong)" }}>
                <strong>{item.title}</strong>
                <div className="practice-meta">{new Date(item.createdAt).toLocaleDateString(tr ? "tr-TR" : "en-US")}</div>
              </div>
            )) : <p style={{ margin: 0, color: "var(--muted)" }}>{tr ? "Henüz duyuru yok." : "No announcements yet."}</p>}
          </div>

          <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.7rem" }}>
            <strong>{tr ? "Son değerlendirme notları" : "Recent review notes"}</strong>
            {detail.recentNotes.length ? detail.recentNotes.map((item) => (
              <div key={item.id} className="card" style={{ padding: "0.8rem", background: "var(--surface-strong)" }}>
                <div className="practice-meta">{new Date(item.createdAt).toLocaleDateString(tr ? "tr-TR" : "en-US")}</div>
                <div>{item.note}</div>
              </div>
            )) : <p style={{ margin: 0, color: "var(--muted)" }}>{tr ? "Henüz not yok." : "No notes yet."}</p>}
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="card teacher-stat-card" style={{ padding: "0.8rem" }}>
      <div style={{ color: "var(--muted)", fontSize: "0.8rem", marginBottom: "0.2rem" }}>{label}</div>
      <strong>{value}</strong>
    </div>
  );
}
