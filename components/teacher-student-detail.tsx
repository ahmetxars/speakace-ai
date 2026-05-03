"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAppState } from "@/components/providers";
import { ScoreLineChart } from "@/components/score-line-chart";
import { TeacherNoteTemplates } from "@/components/teacher-note-templates";
import { trackClientEvent } from "@/lib/analytics-client";
import { HomeworkAssignment, ProgressSummary, TeacherNote, TeacherStudentOverview } from "@/lib/types";
import { AlertTriangle, BookOpen, CheckCircle, FileText, Printer, TrendingDown, TrendingUp } from "lucide-react";

type StudentDetailPayload = {
  student: { id: string; name: string; email: string };
  summary: ProgressSummary;
  overview: TeacherStudentOverview;
  notes: TeacherNote[];
};

type HomeworkSuggestion = {
  title: string;
  instructions: string;
  focusSkill: string;
  recommendedTaskType: string;
};

function translateCategoryLabel(label: string, tr: boolean) {
  if (!tr) return label;
  const labels: Record<string, string> = {
    "Fluency and Coherence": "Akıcılık ve Tutarlılık",
    "Lexical Resource": "Kelime Kullanımı",
    "Grammatical Range and Accuracy": "Dilbilgisi ve Doğruluk",
    Pronunciation: "Telaffuz",
    Delivery: "Delivery",
    "Language Use": "Dil kullanımı",
    "Topic Development": "İçerik gelişimi",
  };
  return labels[label] ?? label;
}

function buildActivityHeatmap(sessions: ProgressSummary["recentSessions"], tr: boolean) {
  const counts = new Map<string, number>();
  sessions.forEach((session) => {
    const key = new Date(session.createdAt).toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  return Array.from({ length: 28 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (27 - index));
    const key = date.toISOString().slice(0, 10);
    return {
      key,
      label: date.toLocaleDateString(tr ? "tr-TR" : "en-US", { month: "numeric", day: "numeric" }),
      count: counts.get(key) ?? 0,
    };
  });
}

function formatDelta(value: number | null | undefined) {
  if (typeof value !== "number") return null;
  return value > 0 ? `+${value.toFixed(1)}` : value.toFixed(1);
}

export function TeacherStudentDetail({ studentId }: { studentId: string }) {
  const { currentUser, language } = useAppState();
  const tr = language === "tr";
  const [detail, setDetail] = useState<StudentDetailPayload | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [sessionDrafts, setSessionDrafts] = useState<Record<string, string>>({});
  const [noteTags, setNoteTags] = useState<string[]>([]);
  const [sessionTags, setSessionTags] = useState<Record<string, string[]>>({});
  const [homeworkSuggestions, setHomeworkSuggestions] = useState<HomeworkSuggestion[]>([]);
  const [assignedHomework, setAssignedHomework] = useState<HomeworkAssignment[]>([]);
  const [dueDays, setDueDays] = useState(7);
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    fetch(`/api/teacher/students/${studentId}`)
      .then((r) => r.json())
      .then((data: StudentDetailPayload & { error?: string }) => {
        if (data.error) { setError(data.error); return; }
        setDetail(data);
      })
      .catch(() => setError(tr ? "Öğrenci detayı yüklenemedi." : "Could not load student detail."));
  }, [studentId, tr]);

  useEffect(() => {
    fetch(`/api/teacher/homework?studentId=${encodeURIComponent(studentId)}`)
      .then((r) => r.json())
      .then((data: { suggestions?: HomeworkSuggestion[] }) => setHomeworkSuggestions(data.suggestions ?? []))
      .catch(() => setHomeworkSuggestions([]));

    fetch("/api/teacher/homework")
      .then((r) => r.json())
      .then((data: { assignments?: Array<{ assignment: HomeworkAssignment; studentName: string; studentEmail: string }> }) => {
        setAssignedHomework((data.assignments ?? []).map((i) => i.assignment).filter((i) => i.studentId === studentId));
      })
      .catch(() => setAssignedHomework([]));
  }, [studentId]);

  const sessionNotesMap = useMemo(() => {
    const grouped = new Map<string, TeacherNote[]>();
    detail?.notes.forEach((item) => {
      if (!item.sessionId) return;
      grouped.set(item.sessionId, [...(grouped.get(item.sessionId) ?? []), item]);
    });
    return grouped;
  }, [detail?.notes]);

  const saveNote = async () => {
    setError(""); setNotice("");
    const response = await fetch("/api/teacher/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, note, tags: noteTags }),
    });
    const data = (await response.json()) as { error?: string; note?: TeacherNote };
    if (!response.ok || !data.note) {
      setError(data.error ?? (tr ? "Öğretmen notu kaydedilemedi." : "Could not save teacher note."));
      return;
    }
    setNote(""); setNoteTags([]);
    setNotice(tr ? "Öğretmen notu kaydedildi." : "Teacher note saved.");
    setDetail((cur) => (cur ? { ...cur, notes: [data.note!, ...cur.notes] } : cur));
    if (currentUser?.id) void trackClientEvent({ userId: currentUser.id, event: "teacher_note_saved", path: `/app/teacher/student/${studentId}` });
  };

  const saveSessionNote = async (sessionId: string) => {
    const text = sessionDrafts[sessionId]?.trim();
    if (!text) return;
    setError(""); setNotice("");
    const response = await fetch("/api/teacher/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, note: text, sessionId, tags: sessionTags[sessionId] ?? [] }),
    });
    const data = (await response.json()) as { error?: string; note?: TeacherNote };
    if (!response.ok || !data.note) {
      setError(data.error ?? (tr ? "Seans notu kaydedilemedi." : "Could not save session note."));
      return;
    }
    setSessionDrafts((cur) => ({ ...cur, [sessionId]: "" }));
    setSessionTags((cur) => ({ ...cur, [sessionId]: [] }));
    setNotice(tr ? "Seans notu kaydedildi." : "Session note saved.");
    setDetail((cur) => (cur ? { ...cur, notes: [data.note!, ...cur.notes] } : cur));
    if (currentUser?.id) void trackClientEvent({ userId: currentUser.id, event: "teacher_note_saved", path: `/app/teacher/student/${studentId}` });
  };

  const assignHomework = async (suggestion: HomeworkSuggestion) => {
    setError(""); setNotice("");
    const response = await fetch("/api/teacher/homework", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId,
        title: suggestion.title,
        instructions: suggestion.instructions,
        focusSkill: suggestion.focusSkill,
        recommendedTaskType: suggestion.recommendedTaskType,
        dueAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * dueDays).toISOString(),
      }),
    });
    const data = (await response.json()) as { error?: string; assignment?: HomeworkAssignment };
    if (!response.ok || !data.assignment) {
      setError(data.error ?? (tr ? "Ödev atanamadı." : "Could not assign homework."));
      return;
    }
    setAssignedHomework((cur) => [data.assignment!, ...cur]);
    setNotice(tr ? "Ödev atandı." : "Homework assigned.");
  };

  const printReport = () => {
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 100);
  };

  if (!currentUser?.isTeacher) {
    return (
      <div className="page-shell section">
        <div className="card" style={{ padding: "2rem", display: "grid", gap: "0.6rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "var(--destructive)" }}>
            <AlertTriangle size={20} />
            <strong style={{ fontSize: "1.1rem" }}>{tr ? "Erişim kısıtlı" : "Access restricted"}</strong>
          </div>
          <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
            {tr ? "Bu sayfayı görüntülemek için öğretmen yetkisi gerekiyor." : "Teacher access is required to view this page."}
          </p>
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="page-shell section">
        <div className="card" style={{ padding: "2rem 1.5rem", display: "flex", alignItems: "center", gap: "1rem", color: "var(--muted)" }}>
          {error ? (
            <>
              <AlertTriangle size={18} style={{ color: "var(--destructive)", flexShrink: 0 }} />
              <span style={{ color: "var(--destructive)" }}>{error}</span>
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 1s linear infinite", flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.2" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <span style={{ fontSize: "0.92rem" }}>{tr ? "Öğrenci detayı yükleniyor…" : "Loading student profile…"}</span>
            </>
          )}
        </div>
      </div>
    );
  }

  const delta = detail.overview.scoreDelta;
  const riskFlags = detail.overview.riskFlags ?? [];
  const last3Notes = detail.notes.filter((n) => !n.sessionId).slice(0, 3);
  const nextAction = homeworkSuggestions[0]?.title ?? (tr ? "Pratik yapmaya devam et" : "Continue practicing");
  const timelinePoints = [...detail.summary.recentSessions]
    .reverse()
    .filter((session) => session.report?.overall != null)
    .map((session) => ({
      label: new Date(session.createdAt).toLocaleDateString(tr ? "tr-TR" : "en-US", { month: "short", day: "numeric" }),
      value: session.report?.overall ?? 0,
      meta: `${session.examType} • ${session.taskType}`,
    }));

  return (
    <div className="page-shell section" style={{ display: "grid", gap: "1.2rem" }}>

      {/* ── Print Report Card (hidden on screen, visible only when printing) ── */}
      <div
        id="student-report-card"
        className="print-report-card"
        style={{
          display: printing ? "block" : "none",
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "white",
          padding: "40px",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
          <div>
            <div style={{ fontSize: "22pt", fontWeight: 800, color: "#111" }}>{detail.student.name}</div>
            <div style={{ fontSize: "10pt", color: "#666", marginTop: "4px" }}>{detail.student.email}</div>
          </div>
          <div>
            <div style={{ fontSize: "8pt", color: "#999", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {tr ? "Öğrenci Gelişim Karnesi" : "Student Progress Report"}
            </div>
            <div style={{ fontSize: "8pt", color: "#999", marginTop: "2px" }}>
              {new Date().toLocaleDateString(tr ? "tr-TR" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>
        </div>

        <hr className="print-divider" />

        <div className="print-metric-grid">
          <div className="print-metric">
            <div className="print-metric-label">{tr ? "Toplam Deneme" : "Total Attempts"}</div>
            <div className="print-metric-value">{detail.overview.totalSessions}</div>
          </div>
          <div className="print-metric">
            <div className="print-metric-label">{tr ? "Ortalama Skor" : "Average Score"}</div>
            <div className="print-metric-value">{detail.overview.averageScore?.toFixed(1) ?? "-"}</div>
          </div>
          <div className="print-metric">
            <div className="print-metric-label">{tr ? "En İyi Skor" : "Best Score"}</div>
            <div className="print-metric-value">{detail.overview.bestScore?.toFixed(1) ?? "-"}</div>
          </div>
          <div className="print-metric">
            <div className="print-metric-label">{tr ? "Skor Trendi" : "Score Trend"}</div>
            <div className="print-metric-value" style={{ color: (delta ?? 0) >= 0 ? "#16a34a" : "#dc2626" }}>
              {formatDelta(delta) ?? "—"}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "9pt", fontWeight: 700, textTransform: "uppercase", color: "#666", letterSpacing: "0.05em", marginBottom: "8px" }}>
            {tr ? "Zayıf Alan" : "Weakest Skill"}
          </div>
          <div style={{ fontSize: "12pt", fontWeight: 600 }}>
            {detail.overview.weakestSkill ? translateCategoryLabel(detail.overview.weakestSkill, tr) : "—"}
          </div>
        </div>

        {riskFlags.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "9pt", fontWeight: 700, textTransform: "uppercase", color: "#666", letterSpacing: "0.05em", marginBottom: "8px" }}>
              {tr ? "Risk Göstergeleri" : "Risk Flags"}
            </div>
            <div>
              {riskFlags.map((flag, i) => <span key={i} className="print-flag">{flag}</span>)}
            </div>
          </div>
        )}

        <hr className="print-divider" />

        {last3Notes.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "9pt", fontWeight: 700, textTransform: "uppercase", color: "#666", letterSpacing: "0.05em", marginBottom: "8px" }}>
              {tr ? "Son Öğretmen Notları" : "Recent Teacher Notes"}
            </div>
            {last3Notes.map((n) => (
              <div key={n.id} className="print-note">
                <div style={{ fontSize: "8pt", color: "#999", marginBottom: "4px" }}>
                  {new Date(n.createdAt).toLocaleDateString(tr ? "tr-TR" : "en-US")}
                  {n.tags?.length ? ` · ${n.tags.map((t) => `#${t}`).join(" ")}` : ""}
                </div>
                {n.note}
              </div>
            ))}
          </div>
        )}

        <hr className="print-divider" />

        <div>
          <div style={{ fontSize: "9pt", fontWeight: 700, textTransform: "uppercase", color: "#666", letterSpacing: "0.05em", marginBottom: "8px" }}>
            {tr ? "Önerilen Sonraki Adım" : "Recommended Next Action"}
          </div>
          <div style={{ fontSize: "11pt", lineHeight: 1.6 }}>{nextAction}</div>
        </div>

        <div style={{ marginTop: "40px", fontSize: "8pt", color: "#bbb", textAlign: "center" }}>
          Speakace.org · {tr ? "Yapay zeka destekli konuşma koçu" : "AI-powered speaking coach"}
        </div>
      </div>

      {/* ── Student header ── */}
      <section className="card no-print" style={{ padding: "1.5rem", display: "grid", gap: "0.9rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.8rem" }}>
          <div>
            <span className="eyebrow">{tr ? "Öğrenci detayı" : "Student detail"}</span>
            <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", margin: "0.3rem 0 0" }}>{detail.student.name}</h1>
            <p style={{ color: "var(--muted)", margin: "0.2rem 0 0" }}>{detail.student.email}</p>
          </div>
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
            <Link href={`/app/teacher/compare?left=${studentId}`} className="button button-secondary" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <FileText size={14} />
              {tr ? "Karşılaştır" : "Compare"}
            </Link>
            <button
              type="button"
              className="button button-secondary"
              style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
              onClick={printReport}
            >
              <Printer size={14} />
              {tr ? "Karneyi yazdır" : "Print report"}
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(165px, 1fr))" }}>
          <Stat label={tr ? "Toplam deneme" : "Total attempts"} value={String(detail.overview.totalSessions)} />
          <Stat label={tr ? "Ortalama skor" : "Average score"} value={detail.overview.averageScore?.toFixed(1) ?? "-"} />
          <Stat label={tr ? "En iyi skor" : "Best score"} value={detail.overview.bestScore?.toFixed(1) ?? "-"} />
          <Stat
            label={tr ? "Skor trendi" : "Score trend"}
            value={formatDelta(delta) ?? "—"}
            valueColor={(delta ?? 0) > 0 ? "var(--success)" : (delta ?? 0) < 0 ? "var(--destructive)" : undefined}
            icon={(delta ?? 0) > 0 ? <TrendingUp size={16} /> : (delta ?? 0) < 0 ? <TrendingDown size={16} /> : undefined}
          />
          <Stat
            label={tr ? "Zayıf alan" : "Weakest skill"}
            value={detail.overview.weakestSkill ? translateCategoryLabel(detail.overview.weakestSkill, tr) : "-"}
          />
        </div>

        {/* Risk flags */}
        {riskFlags.length > 0 && (
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
            <AlertTriangle size={14} style={{ color: "var(--destructive)", flexShrink: 0 }} />
            {riskFlags.map((flag, i) => (
              <span key={i} className="risk-pill">{flag}</span>
            ))}
          </div>
        )}

        {/* Feedback */}
        {notice ? <p style={{ color: "var(--success)", margin: 0 }}>{notice}</p> : null}
        {error ? <p style={{ color: "var(--destructive)", margin: 0 }}>{error}</p> : null}
      </section>

      <section className="grid no-print" style={{ gridTemplateColumns: "minmax(320px, 1.1fr) minmax(320px, 0.9fr)", gap: "1rem", alignItems: "start" }}>

        {/* ── Analytics + timeline ── */}
        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "1rem", gridColumn: "1 / -1" }}>
          <div>
            <span className="eyebrow">{tr ? "Performans analizi" : "Performance analysis"}</span>
            <h2 style={{ fontSize: "1.6rem", margin: "0.3rem 0 0" }}>{tr ? "Session skor trendi" : "Session score trend"}</h2>
          </div>
          <ScoreLineChart points={timelinePoints} />
          <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--muted)" }}>
                  <th style={{ paddingBottom: "0.65rem" }}>{tr ? "Tarih" : "Date"}</th>
                  <th style={{ paddingBottom: "0.65rem" }}>{tr ? "Görev" : "Task"}</th>
                  <th style={{ paddingBottom: "0.65rem" }}>{tr ? "Skor" : "Score"}</th>
                  <th style={{ paddingBottom: "0.65rem" }}>{tr ? "Zayıf alan" : "Weak area"}</th>
                  <th style={{ paddingBottom: "0.65rem" }}>{tr ? "İncele" : "Review"}</th>
                </tr>
              </thead>
              <tbody>
                {detail.summary.recentSessions.map((session) => {
                  const weakest = session.report?.categories?.slice().sort((a, b) => a.score - b.score)[0]?.label ?? null;
                  return (
                    <tr key={session.id} style={{ borderTop: "1px solid var(--line)" }}>
                      <td style={{ padding: "0.7rem 0" }}>{new Date(session.createdAt).toLocaleDateString(tr ? "tr-TR" : "en-US")}</td>
                      <td style={{ padding: "0.7rem 0" }}>{session.examType} · {session.taskType}</td>
                      <td style={{ padding: "0.7rem 0", fontWeight: 700 }}>{session.report?.overall?.toFixed(1) ?? "—"}</td>
                      <td style={{ padding: "0.7rem 0" }}>{weakest ? translateCategoryLabel(weakest, tr) : "—"}</td>
                      <td style={{ padding: "0.7rem 0" }}>
                        <Link href={`/app/results/${session.id}`} className="button button-secondary" style={{ fontSize: "0.78rem", padding: "0.25rem 0.6rem" }}>
                          {tr ? "Aç" : "Open"}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Recent speaking attempts ── */}
        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem" }}>
          <div>
            <span className="eyebrow">{tr ? "Sonuçlar" : "Results"}</span>
            <h2 style={{ fontSize: "1.8rem", margin: "0.4rem 0 0" }}>{tr ? "Son speaking denemeleri" : "Recent speaking attempts"}</h2>
          </div>
          <div className="grid" style={{ gap: "0.75rem" }}>
            {detail.summary.recentSessions.length ? detail.summary.recentSessions.map((session) => (
              <div key={session.id} className="card" style={{ padding: "1rem", display: "grid", gap: "0.7rem", background: "var(--surface-strong)" }}>
                <Link href={`/app/results/${session.id}`} style={{ display: "grid", gap: "0.45rem", color: "inherit", textDecoration: "none" }}>
                  <strong>{session.prompt.title}</strong>
                  <div className="practice-meta">{session.examType} · {session.taskType}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", alignItems: "center" }}>
                    <span style={{ color: "var(--muted)", fontSize: "0.88rem" }}>
                      {session.report?.scaleLabel ?? (tr ? "Değerlendiriliyor" : "Awaiting evaluation")}
                    </span>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      {sessionNotesMap.get(session.id)?.length ? (
                        <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.78rem", color: "var(--accent)" }}>
                          <CheckCircle size={12} />
                          {tr ? "İncelendi" : "Reviewed"}
                        </span>
                      ) : null}
                      <strong style={{ fontSize: "1.05rem" }}>{session.report?.overall ?? "—"}</strong>
                    </div>
                  </div>
                </Link>
                <Link href={`/app/replay/${session.id}`} className="button button-secondary" style={{ width: "fit-content", fontSize: "0.85rem" }}>
                  {tr ? "Replay aç" : "Open replay"}
                </Link>

                {/* Session comment area */}
                <div className="card" style={{ padding: "0.85rem", background: "var(--surface)", border: "1px solid var(--line)", display: "grid", gap: "0.55rem" }}>
                  <strong style={{ fontSize: "0.88rem" }}>{tr ? "Bu denemeye yorum bırak" : "Comment on this attempt"}</strong>
                  <TeacherNoteTemplates
                    tr={tr}
                    onSelect={(value) =>
                      setSessionDrafts((cur) => ({ ...cur, [session.id]: cur[session.id] ? `${cur[session.id]}\n${value}` : value }))
                    }
                  />
                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                    {["fluency", "pronunciation", "structure", "example", "vocabulary"].map((tag) => {
                      const active = (sessionTags[session.id] ?? []).includes(tag);
                      return (
                        <button
                          key={`${session.id}-${tag}`}
                          type="button"
                          className="button button-secondary"
                          style={{ background: active ? "color-mix(in srgb, var(--accent) 14%, var(--surface) 86%)" : undefined, fontSize: "0.8rem" }}
                          onClick={() =>
                            setSessionTags((cur) => {
                              const tags = cur[session.id] ?? [];
                              return { ...cur, [session.id]: active ? tags.filter((t) => t !== tag) : [...tags, tag] };
                            })
                          }
                        >
                          #{tag}
                        </button>
                      );
                    })}
                  </div>
                  <textarea
                    value={sessionDrafts[session.id] ?? ""}
                    onChange={(e) => setSessionDrafts((cur) => ({ ...cur, [session.id]: e.target.value }))}
                    rows={3}
                    placeholder={tr ? "Bu denemede öğrenciye neyi düzeltmesini önerirsin?" : "What should the student improve in this attempt?"}
                    style={{ padding: "0.85rem", borderRadius: 14, border: "1px solid var(--line)", resize: "vertical", background: "var(--surface)", color: "var(--text)", font: "inherit" }}
                  />
                  <button type="button" className="button button-secondary" onClick={() => saveSessionNote(session.id)}>
                    {tr ? "Yorumu kaydet" : "Save comment"}
                  </button>
                  {sessionNotesMap.get(session.id)?.length ? (
                    <div style={{ display: "grid", gap: "0.4rem", paddingTop: "0.3rem", borderTop: "1px solid var(--line)" }}>
                      {(sessionNotesMap.get(session.id) ?? []).slice(0, 2).map((item) => (
                        <div key={item.id} style={{ fontSize: "0.83rem", color: "var(--muted)", lineHeight: 1.6 }}>
                          {item.tags?.length ? <div style={{ marginBottom: "0.2rem", fontWeight: 600 }}>{item.tags.map((t) => `#${t}`).join(" ")}</div> : null}
                          {item.note}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            )) : (
              <div style={{ padding: "1rem", color: "var(--muted)" }}>{tr ? "Henüz speaking denemesi yok." : "No speaking attempts yet."}</div>
            )}
          </div>
        </div>

        {/* ── Right column ── */}
        <div style={{ display: "grid", gap: "1rem" }}>

          {/* Adaptive homework */}
          <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <BookOpen size={17} style={{ color: "var(--accent)" }} />
              <div>
                <span className="eyebrow">{tr ? "Adaptive ödev" : "Adaptive homework"}</span>
                <h2 style={{ fontSize: "1.4rem", margin: "0.2rem 0 0" }}>{tr ? "Skora göre otomatik ödev" : "Score-based assignment"}</h2>
              </div>
            </div>

            {/* Due date presets */}
            <div className="card" style={{ padding: "0.85rem", background: "var(--surface-strong)", display: "grid", gap: "0.5rem" }}>
              <strong style={{ fontSize: "0.88rem" }}>{tr ? "Teslim süresi" : "Due date preset"}</strong>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {[3, 7, 14].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className="button button-secondary"
                    onClick={() => setDueDays(value)}
                    style={{ background: dueDays === value ? "color-mix(in srgb, var(--accent) 14%, var(--surface) 86%)" : undefined }}
                  >
                    {tr ? `${value} gün` : `${value} days`}
                  </button>
                ))}
              </div>
            </div>

            {/* Suggestions */}
            {homeworkSuggestions.map((item, index) => (
              <div key={`${item.title}-${index}`} className="card" style={{ padding: "0.95rem", background: "color-mix(in srgb, var(--accent) 8%, var(--surface) 92%)", display: "grid", gap: "0.5rem" }}>
                <strong style={{ fontSize: "0.9rem" }}>{item.title}</strong>
                <div className="practice-meta">{item.focusSkill}</div>
                <p style={{ margin: 0, lineHeight: 1.7, fontSize: "0.88rem" }}>{item.instructions}</p>
                <button type="button" className="button button-secondary" onClick={() => assignHomework(item)}>
                  {tr ? "Bu ödevi ata" : "Assign this homework"}
                </button>
              </div>
            ))}

            {/* Assigned homework list */}
            <div className="card" style={{ padding: "0.95rem", background: "var(--surface-strong)" }}>
              <strong style={{ fontSize: "0.88rem" }}>{tr ? "Atanmış ödevler" : "Assigned homework"}</strong>
              <div style={{ display: "grid", gap: "0.45rem", marginTop: "0.65rem" }}>
                {assignedHomework.length ? assignedHomework.slice(0, 5).map((item) => {
                  const overdue = !item.completedAt && item.dueAt && new Date(item.dueAt).getTime() < Date.now();
                  return (
                    <div key={item.id} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start", fontSize: "0.85rem", lineHeight: 1.5 }}>
                      <span style={{ color: item.completedAt ? "var(--success)" : overdue ? "var(--destructive)" : "var(--muted)", flexShrink: 0 }}>
                        {item.completedAt ? "✓" : overdue ? "⚠" : "·"}
                      </span>
                      <span style={{ color: overdue ? "var(--destructive)" : "var(--text)" }}>
                        {item.title}
                        {item.dueAt && <span style={{ color: "var(--muted)" }}> · {tr ? "teslim" : "due"} {new Date(item.dueAt).toLocaleDateString(tr ? "tr-TR" : "en-US")}</span>}
                      </span>
                    </div>
                  );
                }) : (
                  <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{tr ? "Henüz ödev atanmadı." : "No homework assigned yet."}</div>
                )}
              </div>
            </div>
          </div>

          {/* Activity heatmap */}
          <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem" }}>
            <div>
              <span className="eyebrow">{tr ? "Aktivite" : "Activity"}</span>
              <h2 style={{ fontSize: "1.4rem", margin: "0.3rem 0 0" }}>{tr ? "Son 28 gün" : "Last 28 days"}</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: "0.4rem" }}>
              {buildActivityHeatmap(detail.summary.recentSessions, tr).map((day) => (
                <div
                  key={day.key}
                  className={`card heatmap-${Math.min(day.count, 3)}`}
                  style={{ padding: "0.6rem 0.3rem", textAlign: "center" }}
                >
                  <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginBottom: "0.2rem" }}>{day.label}</div>
                  <strong style={{ fontSize: "0.85rem" }}>{day.count}</strong>
                </div>
              ))}
            </div>
            <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.82rem", lineHeight: 1.6 }}>
              {tr ? "Koyu kutular aynı gün içinde daha fazla speaking denemesi yapıldığını gösterir." : "Darker cells indicate more speaking activity on that day."}
            </p>
          </div>

          {/* Teacher notes */}
          <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem" }}>
            <div>
              <span className="eyebrow">{tr ? "Öğretmen notları" : "Teacher notes"}</span>
              <h2 style={{ fontSize: "1.4rem", margin: "0.3rem 0 0" }}>{tr ? "Not bırak" : "Leave a note"}</h2>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              placeholder={tr ? "Öğrencinin bir sonraki derste neye odaklanması gerektiğini yaz…" : "What should this student focus on in the next lesson?"}
              style={{ padding: "0.95rem", borderRadius: 14, border: "1px solid var(--line)", resize: "vertical", background: "var(--surface)", color: "var(--text)", font: "inherit" }}
            />
            <TeacherNoteTemplates tr={tr} onSelect={(v) => setNote((cur) => (cur ? `${cur}\n${v}` : v))} />
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              {["fluency", "pronunciation", "structure", "example", "vocabulary"].map((tag) => {
                const active = noteTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    className="button button-secondary"
                    style={{ background: active ? "color-mix(in srgb, var(--accent) 14%, var(--surface) 86%)" : undefined, fontSize: "0.8rem" }}
                    onClick={() => setNoteTags((cur) => (active ? cur.filter((t) => t !== tag) : [...cur, tag]))}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
            <button type="button" className="button button-primary" onClick={saveNote}>
              {tr ? "Öğretmen notunu kaydet" : "Save teacher note"}
            </button>

            {/* Saved notes list */}
            {detail.notes.filter((n) => !n.sessionId).length > 0 && (
              <div className="grid" style={{ gap: "0.65rem" }}>
                {detail.notes.filter((n) => !n.sessionId).map((item) => (
                  <div key={item.id} className="card" style={{ padding: "0.9rem", background: "var(--surface-strong)", display: "grid", gap: "0.35rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", alignItems: "flex-start" }}>
                      <div style={{ fontSize: "0.77rem", color: "var(--muted)" }}>
                        {new Date(item.createdAt).toLocaleString(tr ? "tr-TR" : "en-US", { dateStyle: "medium", timeStyle: "short" })}
                      </div>
                      {item.tags?.length ? (
                        <div style={{ fontSize: "0.75rem", color: "var(--accent)", fontWeight: 600 }}>
                          {item.tags.map((t) => `#${t}`).join(" ")}
                        </div>
                      ) : null}
                    </div>
                    <p style={{ margin: 0, lineHeight: 1.7, fontSize: "0.88rem" }}>{item.note}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  valueColor,
  icon,
}: {
  label: string;
  value: string;
  valueColor?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)" }}>
      <div style={{ color: "var(--muted)", marginBottom: "0.35rem", fontSize: "0.82rem" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: valueColor ?? "var(--text)" }}>
        {icon}
        <strong style={{ fontSize: "1.4rem" }}>{value}</strong>
      </div>
    </div>
  );
}
