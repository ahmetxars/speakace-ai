"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ScoreLineChart } from "@/components/score-line-chart";
import { useAppState } from "@/components/providers";

type DetailPayload = {
  student: { id: string; name: string; email: string };
  summary: {
    totalSessions: number;
    averageScore: number;
    recentSessions: Array<{
      id: string;
      createdAt: string;
      examType: string;
      taskType: string;
      prompt: { title: string };
      report?: {
        overall: number;
        categories: Array<{ label: string; score: number }>;
      };
    }>;
  };
  overview: {
    totalSessions: number;
    averageScore: number;
    bestScore: number | null;
    weakestSkill: string | null;
    scoreDelta?: number | null;
    riskFlags?: string[];
    lastActiveAt?: string | null;
  };
  classes: Array<{ classId: string; className: string; teacherId: string; teacherName: string; joinedAt: string | null }>;
  homework: { total: number; completed: number; overdue: number };
  notes: Array<{ id: string; note: string; tags?: string[]; createdAt: string; teacherId: string }>;
};

export function InstitutionStudentDetail({ studentId }: { studentId: string }) {
  const { language } = useAppState();
  const tr = language === "tr";
  const [detail, setDetail] = useState<DetailPayload | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/institution-admin/students/${studentId}`)
      .then((r) => r.json())
      .then((data: DetailPayload & { error?: string }) => {
        if (data.error) throw new Error(data.error);
        setDetail(data);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : tr ? "Öğrenci detayı yüklenemedi." : "Could not load student detail."));
  }, [studentId, tr]);

  const points = useMemo(
    () =>
      [...(detail?.summary.recentSessions ?? [])]
        .reverse()
        .filter((session) => session.report?.overall != null)
        .map((session) => ({
          label: new Date(session.createdAt).toLocaleDateString(tr ? "tr-TR" : "en-US", { month: "short", day: "numeric" }),
          value: session.report?.overall ?? 0,
          meta: `${session.examType} • ${session.taskType}`,
        })),
    [detail?.summary.recentSessions, tr]
  );

  if (!detail) {
    return (
      <main className="page-shell section">
        <div className="card" style={{ padding: "2rem", color: error ? "var(--destructive)" : "var(--muted)" }}>
          {error || (tr ? "Öğrenci detayı yükleniyor…" : "Loading student detail…")}
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell section" style={{ display: "grid", gap: "1rem" }}>
      <section className="card" style={{ padding: "1.4rem", display: "grid", gap: "0.8rem" }}>
        <span className="eyebrow">{tr ? "Öğrenci inceleme" : "Student inspection"}</span>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "2rem" }}>{detail.student.name}</h1>
            <p style={{ margin: "0.25rem 0 0", color: "var(--muted)" }}>{detail.student.email}</p>
          </div>
          <div style={{ display: "grid", gap: "0.35rem", justifyItems: "end" }}>
            <span className="pill">{detail.overview.averageScore?.toFixed(1) ?? "—"}</span>
            <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
              {tr ? "Son aktivite" : "Last active"}: {detail.overview.lastActiveAt ? new Date(detail.overview.lastActiveAt).toLocaleDateString(tr ? "tr-TR" : "en-US") : "—"}
            </span>
          </div>
        </div>
        {(detail.overview.riskFlags ?? []).length > 0 && (
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            {detail.overview.riskFlags?.map((flag) => <span key={flag} className="risk-pill">{flag}</span>)}
          </div>
        )}
      </section>

      <section className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.8rem" }}>
        <Metric label={tr ? "Toplam session" : "Total sessions"} value={String(detail.overview.totalSessions)} />
        <Metric label={tr ? "Ort. skor" : "Average score"} value={detail.overview.averageScore?.toFixed(1) ?? "—"} />
        <Metric label={tr ? "En iyi skor" : "Best score"} value={detail.overview.bestScore?.toFixed(1) ?? "—"} />
        <Metric label={tr ? "Skor değişimi" : "Score delta"} value={typeof detail.overview.scoreDelta === "number" ? detail.overview.scoreDelta.toFixed(1) : "—"} />
        <Metric label={tr ? "Ödev tamamlama" : "Homework done"} value={detail.homework.total ? `${Math.round((detail.homework.completed / detail.homework.total) * 100)}%` : "—"} />
      </section>

      <section className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem" }}>
        <div>
          <span className="eyebrow">{tr ? "Skor grafiği" : "Score chart"}</span>
          <h2 style={{ margin: "0.25rem 0 0", fontSize: "1.4rem" }}>{tr ? "Tüm session skorları" : "Full session score history"}</h2>
        </div>
        <ScoreLineChart points={points} />
      </section>

      <section className="grid" style={{ gridTemplateColumns: "minmax(280px, 0.9fr) minmax(360px, 1.1fr)", gap: "1rem", alignItems: "start" }}>
        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
          <strong>{tr ? "Bağlı sınıflar ve öğretmenler" : "Connected classes and teachers"}</strong>
          {detail.classes.map((item) => (
            <div key={item.classId} className="card" style={{ padding: "0.85rem", background: "var(--surface-strong)", display: "grid", gap: "0.25rem" }}>
              <strong>{item.className}</strong>
              <div className="practice-meta">{item.teacherName}</div>
              <div className="practice-meta">{tr ? "Katılım" : "Joined"}: {item.joinedAt ? new Date(item.joinedAt).toLocaleDateString(tr ? "tr-TR" : "en-US") : "—"}</div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
          <strong>{tr ? "Session tablosu" : "Session table"}</strong>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--muted)" }}>
                  <th style={{ paddingBottom: "0.6rem" }}>{tr ? "Tarih" : "Date"}</th>
                  <th style={{ paddingBottom: "0.6rem" }}>{tr ? "Görev" : "Task"}</th>
                  <th style={{ paddingBottom: "0.6rem" }}>{tr ? "Skor" : "Score"}</th>
                  <th style={{ paddingBottom: "0.6rem" }}>{tr ? "İncele" : "Review"}</th>
                </tr>
              </thead>
              <tbody>
                {detail.summary.recentSessions.map((session) => (
                  <tr key={session.id} style={{ borderTop: "1px solid var(--line)" }}>
                    <td style={{ padding: "0.65rem 0" }}>{new Date(session.createdAt).toLocaleDateString(tr ? "tr-TR" : "en-US")}</td>
                    <td style={{ padding: "0.65rem 0" }}>{session.examType} · {session.taskType}</td>
                    <td style={{ padding: "0.65rem 0", fontWeight: 700 }}>{session.report?.overall?.toFixed(1) ?? "—"}</td>
                    <td style={{ padding: "0.65rem 0" }}>
                      <Link href={`/app/results/${session.id}`} className="button button-secondary" style={{ fontSize: "0.78rem", padding: "0.25rem 0.6rem" }}>
                        {tr ? "Aç" : "Open"}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
        <strong>{tr ? "Öğretmen notları" : "Teacher notes"}</strong>
        {detail.notes.length ? detail.notes.map((note) => (
          <div key={note.id} className="card" style={{ padding: "0.85rem", background: "var(--surface-strong)", display: "grid", gap: "0.25rem" }}>
            <div className="practice-meta">{new Date(note.createdAt).toLocaleDateString(tr ? "tr-TR" : "en-US")}</div>
            {note.tags?.length ? <div className="practice-meta">{note.tags.map((tag) => `#${tag}`).join(" ")}</div> : null}
            <div>{note.note}</div>
          </div>
        )) : <p style={{ margin: 0, color: "var(--muted)" }}>{tr ? "Henüz not yok." : "No notes yet."}</p>}
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="card teacher-stat-card" style={{ padding: "0.85rem" }}>
      <div style={{ color: "var(--muted)", fontSize: "0.82rem", marginBottom: "0.2rem" }}>{label}</div>
      <strong>{value}</strong>
    </div>
  );
}
