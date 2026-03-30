"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAppState } from "@/components/providers";
import { TeacherNoteTemplates } from "@/components/teacher-note-templates";
import { trackClientEvent } from "@/lib/analytics-client";
import { HomeworkAssignment, ProgressSummary, TeacherNote, TeacherStudentOverview } from "@/lib/types";

type StudentDetailPayload = {
  student: {
    id: string;
    name: string;
    email: string;
  };
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

  useEffect(() => {
    fetch(`/api/teacher/students/${studentId}`)
      .then((response) => response.json())
      .then((data: StudentDetailPayload & { error?: string }) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        setDetail(data);
      })
      .catch(() => setError(tr ? "Ogrenci detayi yuklenemedi." : "Could not load student detail."));
  }, [studentId, tr]);

  useEffect(() => {
    fetch(`/api/teacher/homework?studentId=${encodeURIComponent(studentId)}`)
      .then((response) => response.json())
      .then((data: { suggestions?: HomeworkSuggestion[] }) => setHomeworkSuggestions(data.suggestions ?? []))
      .catch(() => setHomeworkSuggestions([]));

    fetch("/api/teacher/homework")
      .then((response) => response.json())
      .then((data: { assignments?: Array<{ assignment: HomeworkAssignment; studentName: string; studentEmail: string }> }) => {
        setAssignedHomework((data.assignments ?? []).map((item) => item.assignment).filter((item) => item.studentId === studentId));
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
    setError("");
    setNotice("");
    const response = await fetch("/api/teacher/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, note, tags: noteTags })
    });
    const data = (await response.json()) as { error?: string; note?: TeacherNote };
    if (!response.ok || !data.note) {
      setError(data.error ?? (tr ? "Ogretmen notu kaydedilemedi." : "Could not save teacher note."));
      return;
    }
    setNote("");
    setNoteTags([]);
    setNotice(tr ? "Ogretmen notu kaydedildi." : "Teacher note saved.");
    setDetail((current) => (current ? { ...current, notes: [data.note!, ...current.notes] } : current));
    if (currentUser?.id) {
      void trackClientEvent({ userId: currentUser.id, event: "teacher_note_saved", path: `/app/teacher/student/${studentId}` });
    }
  };

  const saveSessionNote = async (sessionId: string) => {
    const text = sessionDrafts[sessionId]?.trim();
    if (!text) return;
    setError("");
    setNotice("");
    const response = await fetch("/api/teacher/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, note: text, sessionId, tags: sessionTags[sessionId] ?? [] })
    });
    const data = (await response.json()) as { error?: string; note?: TeacherNote };
    if (!response.ok || !data.note) {
      setError(data.error ?? (tr ? "Session notu kaydedilemedi." : "Could not save session note."));
      return;
    }
    setSessionDrafts((current) => ({ ...current, [sessionId]: "" }));
    setSessionTags((current) => ({ ...current, [sessionId]: [] }));
    setNotice(tr ? "Session notu kaydedildi." : "Session note saved.");
    setDetail((current) => (current ? { ...current, notes: [data.note!, ...current.notes] } : current));
    if (currentUser?.id) {
      void trackClientEvent({ userId: currentUser.id, event: "teacher_note_saved", path: `/app/teacher/student/${studentId}` });
    }
  };

  const assignHomework = async (suggestion: HomeworkSuggestion) => {
    setError("");
    setNotice("");
    const response = await fetch("/api/teacher/homework", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId,
        title: suggestion.title,
        instructions: suggestion.instructions,
        focusSkill: suggestion.focusSkill,
        recommendedTaskType: suggestion.recommendedTaskType,
        dueAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * dueDays).toISOString()
      })
    });
    const data = (await response.json()) as { error?: string; assignment?: HomeworkAssignment };
    if (!response.ok || !data.assignment) {
      setError(data.error ?? (tr ? "Homework atanamadi." : "Could not assign homework."));
      return;
    }
    setAssignedHomework((current) => [data.assignment!, ...current]);
    setNotice(tr ? "Homework atandi." : "Homework assigned.");
  };

  if (!currentUser?.isTeacher && !currentUser?.isAdmin) {
    return (
      <div className="page-shell section">
        <section className="card" style={{ padding: "1.4rem" }}>
          {tr ? "Teacher access gerekli." : "Teacher access is required."}
        </section>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="page-shell section">
        <section className="card" style={{ padding: "1.4rem" }}>
          {error || (tr ? "Ogrenci detayi yukleniyor..." : "Loading student detail...")}
        </section>
      </div>
    );
  }

  return (
    <div className="page-shell section" style={{ display: "grid", gap: "1.2rem" }}>
      <section className="card" style={{ padding: "1.5rem", display: "grid", gap: "0.9rem" }}>
        <span className="eyebrow">{tr ? "Ogrenci detayi" : "Student detail"}</span>
        <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", margin: 0 }}>{detail.student.name}</h1>
        <p style={{ color: "var(--muted)", margin: 0 }}>{detail.student.email}</p>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
          <Stat label={tr ? "Toplam deneme" : "Total attempts"} value={String(detail.overview.totalSessions)} />
          <Stat label={tr ? "Ortalama" : "Average"} value={String(detail.overview.averageScore || 0)} />
          <Stat label={tr ? "Best score" : "Best score"} value={detail.overview.bestScore?.toFixed(1) ?? "-"} />
          <Stat label={tr ? "Weakest skill" : "Weakest skill"} value={detail.overview.weakestSkill ? translateCategoryLabel(detail.overview.weakestSkill, tr) : "-"} />
        </div>
      </section>

      <section className="grid" style={{ gridTemplateColumns: "minmax(320px, 1.1fr) minmax(320px, 0.9fr)", gap: "1rem", alignItems: "start" }}>
        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem" }}>
          <div>
            <span className="eyebrow">{tr ? "Sonuclar" : "Results"}</span>
            <h2 style={{ fontSize: "2rem", margin: "0.6rem 0 0.2rem" }}>{tr ? "Son speaking denemeleri" : "Recent speaking attempts"}</h2>
          </div>
          <div className="grid" style={{ gap: "0.75rem" }}>
            {detail.summary.recentSessions.map((session) => (
              <div key={session.id} className="card" style={{ padding: "1rem", display: "grid", gap: "0.7rem", background: "var(--surface-strong)" }}>
                <Link href={`/app/results/${session.id}`} style={{ display: "grid", gap: "0.55rem", color: "inherit", textDecoration: "none" }}>
                  <strong>{session.prompt.title}</strong>
                  <div className="practice-meta">{session.examType} · {session.taskType}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", alignItems: "center" }}>
                    <span style={{ color: "var(--muted)" }}>{session.report?.scaleLabel ?? (tr ? "Degerlendiriliyor" : "Awaiting evaluation")}</span>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                      {sessionNotesMap.get(session.id)?.length ? <span className="pill">{tr ? "Reviewed" : "Reviewed"}</span> : null}
                      <strong>{session.report?.overall ?? "-"}</strong>
                    </div>
                  </div>
                </Link>
                <Link href={`/app/replay/${session.id}`} className="button button-secondary" style={{ width: "fit-content" }}>
                  {tr ? "Replay ac" : "Open replay"}
                </Link>
                <div className="card" style={{ padding: "0.85rem", background: "rgba(255,255,255,0.55)", display: "grid", gap: "0.55rem" }}>
                  <strong style={{ fontSize: "0.95rem" }}>{tr ? "Bu denemeye yorum birak" : "Comment on this attempt"}</strong>
                  <TeacherNoteTemplates
                    tr={tr}
                    onSelect={(value) =>
                      setSessionDrafts((current) => ({
                        ...current,
                        [session.id]: current[session.id] ? `${current[session.id]}\n${value}` : value
                      }))
                    }
                  />
                  <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
                    {["fluency", "pronunciation", "structure", "example", "vocabulary"].map((tag) => {
                      const active = (sessionTags[session.id] ?? []).includes(tag);
                      return (
                        <button
                          key={`${session.id}-${tag}`}
                          type="button"
                          className="button button-secondary"
                          style={{ background: active ? "rgba(29, 111, 117, 0.12)" : undefined }}
                          onClick={() =>
                            setSessionTags((current) => {
                              const currentTags = current[session.id] ?? [];
                              return {
                                ...current,
                                [session.id]: active ? currentTags.filter((item) => item !== tag) : [...currentTags, tag]
                              };
                            })
                          }
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                  <textarea
                    value={sessionDrafts[session.id] ?? ""}
                    onChange={(event) => setSessionDrafts((current) => ({ ...current, [session.id]: event.target.value }))}
                    rows={3}
                    placeholder={tr ? "Bu denemede ogrenciye neyi duzeltmesini onerirsin?" : "What should the student improve in this attempt?"}
                    style={{ padding: "0.85rem", borderRadius: 14, border: "1px solid var(--line)", resize: "vertical" }}
                  />
                  <button type="button" className="button button-secondary" onClick={() => saveSessionNote(session.id)}>
                    {tr ? "Yorumu kaydet" : "Save comment"}
                  </button>
                  {sessionNotesMap.get(session.id)?.length ? (
                    <div style={{ display: "grid", gap: "0.45rem" }}>
                      {sessionNotesMap.get(session.id)!.slice(0, 2).map((item) => (
                        <div key={item.id} className="practice-meta" style={{ lineHeight: 1.6 }}>
                          {item.tags?.length ? <div style={{ marginBottom: "0.25rem" }}>{item.tags.map((tag) => `#${tag}`).join(" ")}</div> : null}
                          {item.note}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem" }}>
          <div>
            <span className="eyebrow">{tr ? "Adaptive homework" : "Adaptive homework"}</span>
            <h2 style={{ fontSize: "2rem", margin: "0.6rem 0 0.2rem" }}>{tr ? "Skora gore otomatik odev" : "Score-based assignment"}</h2>
          </div>
          <div className="grid" style={{ gap: "0.75rem" }}>
            <div className="card" style={{ padding: "0.85rem", background: "rgba(255,255,255,0.55)", display: "grid", gap: "0.55rem" }}>
              <strong style={{ fontSize: "0.95rem" }}>{tr ? "Teslim suresi" : "Due date preset"}</strong>
              <div style={{ display: "flex", gap: "0.55rem", flexWrap: "wrap" }}>
                {[3, 7, 14].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className="button button-secondary"
                    onClick={() => setDueDays(value)}
                    style={{ background: dueDays === value ? "rgba(29, 111, 117, 0.12)" : undefined }}
                  >
                    {tr ? `${value} gun` : `${value} days`}
                  </button>
                ))}
              </div>
            </div>
            {homeworkSuggestions.map((item, index) => (
              <div key={`${item.title}-${index}`} className="card" style={{ padding: "0.95rem", background: "rgba(29, 111, 117, 0.08)", display: "grid", gap: "0.55rem" }}>
                <strong>{item.title}</strong>
                <div className="practice-meta">{item.focusSkill}</div>
                <p style={{ margin: 0, lineHeight: 1.7 }}>{item.instructions}</p>
                <button type="button" className="button button-secondary" onClick={() => assignHomework(item)}>
                  {tr ? "Bu odevi ata" : "Assign this homework"}
                </button>
              </div>
            ))}
          </div>
          <div className="card" style={{ padding: "0.95rem", background: "var(--surface-strong)" }}>
            <strong>{tr ? "Atanmis homework" : "Assigned homework"}</strong>
            <div style={{ display: "grid", gap: "0.55rem", marginTop: "0.7rem" }}>
              {assignedHomework.length ? assignedHomework.slice(0, 4).map((item) => (
                <div key={item.id} className="practice-meta" style={{ lineHeight: 1.7 }}>
                  {item.completedAt ? "✓ " : item.dueAt && new Date(item.dueAt).getTime() < Date.now() ? "⚠ " : "• "}
                  {item.title}
                  {item.dueAt ? ` · ${tr ? "teslim" : "due"} ${new Date(item.dueAt).toLocaleDateString(tr ? "tr-TR" : "en-US")}` : ""}
                </div>
              )) : (
                <div className="practice-meta">{tr ? "Henuz homework atanmadi." : "No homework assigned yet."}</div>
              )}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem" }}>
          <div>
            <span className="eyebrow">{tr ? "Aktivite" : "Activity"}</span>
            <h2 style={{ fontSize: "2rem", margin: "0.6rem 0 0.2rem" }}>{tr ? "Son 28 gun heatmap" : "Last 28 days heatmap"}</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: "0.5rem" }}>
            {buildActivityHeatmap(detail.summary.recentSessions, tr).map((day) => (
              <div
                key={day.key}
                className="card"
                style={{
                  padding: "0.7rem 0.45rem",
                  textAlign: "center",
                  background:
                    day.count >= 3
                      ? "rgba(47, 125, 75, 0.18)"
                      : day.count === 2
                        ? "rgba(29, 111, 117, 0.14)"
                        : day.count === 1
                          ? "rgba(29, 111, 117, 0.08)"
                          : "var(--surface-strong)"
                }}
              >
                <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginBottom: "0.3rem" }}>{day.label}</div>
                <strong>{day.count}</strong>
              </div>
            ))}
          </div>
          <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
            {tr ? "Koyu kutular ogrencinin ayni gun icinde daha fazla speaking denemesi yaptigini gosterir." : "Darker cells show heavier speaking activity on the same day."}
          </p>
        </div>

        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem" }}>
          <div>
            <span className="eyebrow">{tr ? "Ogretmen notlari" : "Teacher notes"}</span>
            <h2 style={{ fontSize: "2rem", margin: "0.6rem 0 0.2rem" }}>{tr ? "Not birak" : "Leave a note"}</h2>
          </div>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={5}
            placeholder={tr ? "Ogrencinin bir sonraki derste neye odaklanmasi gerektigini yaz..." : "Write what this student should focus on in the next lesson..."}
            style={{ padding: "0.95rem", borderRadius: 16, border: "1px solid var(--line)", resize: "vertical" }}
          />
          <TeacherNoteTemplates tr={tr} onSelect={(value) => setNote((current) => (current ? `${current}\n${value}` : value))} />
          <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
            {["fluency", "pronunciation", "structure", "example", "vocabulary"].map((tag) => {
              const active = noteTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  className="button button-secondary"
                  style={{ background: active ? "rgba(29, 111, 117, 0.12)" : undefined }}
                  onClick={() => setNoteTags((current) => (active ? current.filter((item) => item !== tag) : [...current, tag]))}
                >
                  {tag}
                </button>
              );
            })}
          </div>
          <button type="button" className="button button-primary" onClick={saveNote}>
            {tr ? "Ogretmen notunu kaydet" : "Save teacher note"}
          </button>
          {notice ? <p style={{ color: "var(--success)", margin: 0 }}>{notice}</p> : null}
          {error ? <p style={{ color: "var(--accent-deep)", margin: 0 }}>{error}</p> : null}
          <div className="grid" style={{ gap: "0.75rem" }}>
            {detail.notes.length ? detail.notes.map((item) => (
              <div key={item.id} className="card" style={{ padding: "0.95rem", background: "rgba(255,255,255,0.58)" }}>
                <div className="practice-meta" style={{ marginBottom: "0.45rem" }}>{new Date(item.createdAt).toLocaleString(tr ? "tr-TR" : "en-US")}</div>
                {item.tags?.length ? <div className="practice-meta" style={{ marginBottom: "0.45rem" }}>{item.tags.map((tag) => `#${tag}`).join(" ")}</div> : null}
                <p style={{ margin: 0, lineHeight: 1.7 }}>{item.note}</p>
              </div>
            )) : (
              <div className="card" style={{ padding: "0.95rem" }}>
                {tr ? "Henuz ogretmen notu yok." : "No teacher notes yet."}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)" }}>
      <div style={{ color: "var(--muted)", marginBottom: "0.35rem" }}>{label}</div>
      <strong style={{ fontSize: "1.4rem" }}>{value}</strong>
    </div>
  );
}

function translateCategoryLabel(label: string, tr: boolean) {
  if (!tr) return label;
  const labels: Record<string, string> = {
    "Fluency and Coherence": "Akicilik ve Tutarlilik",
    "Lexical Resource": "Kelime Kullanimi",
    "Grammatical Range and Accuracy": "Dilbilgisi ve Dogruluk",
    Pronunciation: "Telaffuz",
    Delivery: "Delivery",
    "Language Use": "Dil kullanimi",
    "Topic Development": "Icerik gelisimi"
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
      count: counts.get(key) ?? 0
    };
  });
}
