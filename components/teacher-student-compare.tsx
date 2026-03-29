"use client";

import { useEffect, useState } from "react";
import { useAppState } from "@/components/providers";
import { StudentComparison, TeacherStudentOverview } from "@/lib/types";

export function TeacherStudentCompare() {
  const { currentUser, language } = useAppState();
  const tr = language === "tr";
  const [students, setStudents] = useState<TeacherStudentOverview[]>([]);
  const [leftId, setLeftId] = useState("");
  const [rightId, setRightId] = useState("");
  const [comparison, setComparison] = useState<StudentComparison | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/teacher/classes")
      .then((response) => response.json())
      .then(async (data: { classes?: Array<{ id: string }> }) => {
        const classId = data.classes?.[0]?.id;
        if (!classId) return;
        const response = await fetch(`/api/teacher/classes/${classId}/students`);
        const payload = (await response.json()) as { students?: TeacherStudentOverview[] };
        setStudents(payload.students ?? []);
        setLeftId(payload.students?.[0]?.student.id ?? "");
        setRightId(payload.students?.[1]?.student.id ?? payload.students?.[0]?.student.id ?? "");
      })
      .catch(() => setStudents([]));
  }, []);

  const runCompare = async () => {
    if (!leftId || !rightId) return;
    setError("");
    const response = await fetch(`/api/teacher/compare?leftId=${encodeURIComponent(leftId)}&rightId=${encodeURIComponent(rightId)}`);
    const data = (await response.json()) as { comparison?: StudentComparison; error?: string };
    if (!response.ok || !data.comparison) {
      setError(data.error ?? (tr ? "Karsilastirma olusturulamadi." : "Could not compare students."));
      return;
    }
    setComparison(data.comparison);
  };

  if (!currentUser?.isTeacher && !currentUser?.isAdmin) {
    return <main className="page-shell section"><div className="card" style={{ padding: "1.5rem" }}>{tr ? "Teacher erisimi gerekli." : "Teacher access required."}</div></main>;
  }

  return (
    <main className="page-shell section" style={{ display: "grid", gap: "1rem" }}>
      <section className="card" style={{ padding: "1.5rem", display: "grid", gap: "0.8rem" }}>
        <span className="eyebrow">{tr ? "Ogrenci karsilastirma" : "Student comparison"}</span>
        <h1 style={{ margin: 0 }}>{tr ? "Iki ogrenciyi yan yana gor" : "Compare two students side by side"}</h1>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.7rem" }}>
          <select value={leftId} onChange={(event) => setLeftId(event.target.value)} className="practice-select">
            {students.map((student) => <option key={student.student.id} value={student.student.id}>{student.student.name}</option>)}
          </select>
          <select value={rightId} onChange={(event) => setRightId(event.target.value)} className="practice-select">
            {students.map((student) => <option key={student.student.id} value={student.student.id}>{student.student.name}</option>)}
          </select>
          <button type="button" className="button button-primary" onClick={runCompare}>{tr ? "Karsilastir" : "Compare"}</button>
        </div>
        {error ? <p style={{ margin: 0, color: "var(--accent-deep)" }}>{error}</p> : null}
      </section>

      {comparison ? (
        <section className="grid" style={{ gridTemplateColumns: "minmax(320px, 1fr) minmax(320px, 1fr)", gap: "1rem" }}>
          {[comparison.left, comparison.right].map((student) => (
            <div key={student.student.id} className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.6rem" }}>
              <strong>{student.student.name}</strong>
              <div className="practice-meta">{student.student.email}</div>
              <div className="grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "0.65rem" }}>
                <Metric label={tr ? "Ortalama" : "Average"} value={student.averageScore ? student.averageScore.toFixed(1) : "-"} />
                <Metric label={tr ? "Best" : "Best"} value={student.bestScore?.toFixed(1) ?? "-"} />
                <Metric label={tr ? "Deneme" : "Attempts"} value={String(student.totalSessions)} />
                <Metric label={tr ? "Weakest" : "Weakest"} value={student.weakestSkill ?? "-"} />
              </div>
            </div>
          ))}
          <div className="card" style={{ padding: "1.2rem", gridColumn: "1 / -1", display: "grid", gap: "0.6rem" }}>
            <strong>{tr ? "Hizli fark ozeti" : "Quick gap summary"}</strong>
            <div className="practice-meta">{tr ? "Skor farki" : "Score gap"}: {comparison.scoreGap.toFixed(1)}</div>
            <div className="practice-meta">{tr ? "Deneme farki" : "Session gap"}: {comparison.sessionGap}</div>
          </div>
        </section>
      ) : null}
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="card" style={{ padding: "0.85rem", background: "var(--surface-strong)" }}>
      <div style={{ color: "var(--muted)", marginBottom: "0.25rem" }}>{label}</div>
      <strong>{value}</strong>
    </div>
  );
}
