"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CheckCircle,
  FileText,
  MessageSquare,
  Printer
} from "lucide-react";
import { useAppState } from "@/components/providers";
import { ScoreLineChart } from "@/components/score-line-chart";
import { TeacherNoteTemplates } from "@/components/teacher-note-templates";
import { trackClientEvent } from "@/lib/analytics-client";
import { HomeworkAssignment, ProgressSummary, TeacherNote, TeacherStudentOverview } from "@/lib/types";

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

const noteTagOptions = ["fluency", "pronunciation", "structure", "example", "vocabulary"];

function translateCategoryLabel(label: string, tr: boolean) {
  if (!tr) return label;
  const labels: Record<string, string> = {
    "Fluency and Coherence": "Akıcılık ve tutarlılık",
    "Lexical Resource": "Kelime kullanımı",
    "Grammatical Range and Accuracy": "Dilbilgisi ve doğruluk",
    Pronunciation: "Telaffuz",
    Delivery: "Aktarım",
    "Language Use": "Dil kullanımı",
    "Topic Development": "İçerik gelişimi"
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
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/teacher/students/${studentId}`)
      .then((response) => response.json())
      .then((data: StudentDetailPayload & { error?: string }) => {
        if (data.error) {
          if (active) setError(data.error);
          return;
        }
        if (active) setDetail(data);
      })
      .catch(() => {
        if (active) setError(tr ? "Öğrenci detayı yüklenemedi." : "Could not load student detail.");
      });
    return () => {
      active = false;
    };
  }, [studentId, tr]);

  useEffect(() => {
    let active = true;
    fetch(`/api/teacher/homework?studentId=${encodeURIComponent(studentId)}`)
      .then((response) => response.json())
      .then((data: { suggestions?: HomeworkSuggestion[] }) => {
        if (active) setHomeworkSuggestions(data.suggestions ?? []);
      })
      .catch(() => {
        if (active) setHomeworkSuggestions([]);
      });

    fetch("/api/teacher/homework")
      .then((response) => response.json())
      .then((data: { assignments?: Array<{ assignment: HomeworkAssignment; studentName: string; studentEmail: string }> }) => {
        if (!active) return;
        setAssignedHomework((data.assignments ?? []).map((item) => item.assignment).filter((item) => item.studentId === studentId));
      })
      .catch(() => {
        if (active) setAssignedHomework([]);
      });
    return () => {
      active = false;
    };
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
    const text = note.trim();
    if (!text) {
      setError(tr ? "Kaydetmeden önce bir not yaz." : "Write a note before saving.");
      return;
    }
    setError("");
    setNotice("");
    const response = await fetch("/api/teacher/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, note: text, tags: noteTags })
    });
    const data = (await response.json()) as { error?: string; note?: TeacherNote };
    if (!response.ok || !data.note) {
      setError(data.error ?? (tr ? "Öğretmen notu kaydedilemedi." : "Could not save teacher note."));
      return;
    }
    setNote("");
    setNoteTags([]);
    setNotice(tr ? "Öğretmen notu kaydedildi." : "Teacher note saved.");
    setDetail((current) => current ? { ...current, notes: [data.note!, ...current.notes] } : current);
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
      setError(data.error ?? (tr ? "Deneme yorumu kaydedilemedi." : "Could not save attempt comment."));
      return;
    }
    setSessionDrafts((current) => ({ ...current, [sessionId]: "" }));
    setSessionTags((current) => ({ ...current, [sessionId]: [] }));
    setNotice(tr ? "Deneme yorumu kaydedildi." : "Attempt comment saved.");
    setDetail((current) => current ? { ...current, notes: [data.note!, ...current.notes] } : current);
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
      setError(data.error ?? (tr ? "Ödev atanamadı." : "Could not assign homework."));
      return;
    }
    setAssignedHomework((current) => [data.assignment!, ...current]);
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
      <main className="page-shell section inside-page">
        <div className="inside-loading">
          <span style={{ color: "var(--destructive)" }}>{tr ? "Bu görünüm için öğretmen yetkisi gerekiyor." : "Teacher access is required for this view."}</span>
        </div>
      </main>
    );
  }

  if (!detail) {
    return (
      <main className="page-shell section inside-page">
        <div className="inside-loading">
          <span style={{ color: error ? "var(--destructive)" : undefined }}>
            {error || (tr ? "Öğrenci görünümü hazırlanıyor…" : "Preparing student overview…")}
          </span>
        </div>
      </main>
    );
  }

  const delta = detail.overview.scoreDelta;
  const riskFlags = detail.overview.riskFlags ?? [];
  const generalNotes = detail.notes.filter((item) => !item.sessionId);
  const last3Notes = generalNotes.slice(0, 3);
  const nextAction = homeworkSuggestions[0]?.title ?? (tr ? "Kısa bir speaking tekrarı planla" : "Plan a short speaking retry");
  const timelinePoints = [...detail.summary.recentSessions]
    .reverse()
    .filter((session) => session.report?.overall != null)
    .map((session) => ({
      label: new Date(session.createdAt).toLocaleDateString(tr ? "tr-TR" : "en-US", { month: "short", day: "numeric" }),
      value: session.report?.overall ?? 0,
      meta: `${session.examType} · ${session.taskType}`
    }));
  const initials = detail.student.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="page-shell section inside-page">
      <div
        id="student-report-card"
        className="print-report-card"
        style={{
          display: printing ? "block" : "none",
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          overflowY: "auto",
          padding: "40px",
          background: "white"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
          <div>
            <div style={{ color: "#111", fontSize: "22pt", fontWeight: 800 }}>{detail.student.name}</div>
            <div style={{ marginTop: "4px", color: "#666", fontSize: "10pt" }}>{detail.student.email}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#999", fontSize: "8pt", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              {tr ? "Öğrenci gelişim karnesi" : "Student progress report"}
            </div>
            <div style={{ marginTop: "2px", color: "#999", fontSize: "8pt" }}>
              {new Date().toLocaleDateString(tr ? "tr-TR" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>
        </div>

        <hr className="print-divider" />
        <div className="print-metric-grid">
          <PrintMetric label={tr ? "Toplam deneme" : "Total attempts"} value={`${detail.overview.totalSessions}`} />
          <PrintMetric label={tr ? "Ortalama skor" : "Average score"} value={detail.overview.averageScore?.toFixed(1) ?? "—"} />
          <PrintMetric label={tr ? "En iyi skor" : "Best score"} value={detail.overview.bestScore?.toFixed(1) ?? "—"} />
          <PrintMetric label={tr ? "Skor trendi" : "Score movement"} value={formatDelta(delta) ?? "—"} />
        </div>

        <div style={{ marginBottom: "18px" }}>
          <div className="print-metric-label">{tr ? "Ana gelişim alanı" : "Primary improvement area"}</div>
          <strong>{detail.overview.weakestSkill ? translateCategoryLabel(detail.overview.weakestSkill, tr) : "—"}</strong>
        </div>

        {riskFlags.length ? (
          <div style={{ marginBottom: "18px" }}>
            <div className="print-metric-label">{tr ? "Risk sinyalleri" : "Risk signals"}</div>
            <div>{riskFlags.map((flag) => <span key={flag} className="print-flag">{flag}</span>)}</div>
          </div>
        ) : null}

        {last3Notes.length ? (
          <>
            <hr className="print-divider" />
            <div style={{ marginBottom: "18px" }}>
              <div className="print-metric-label">{tr ? "Son öğretmen notları" : "Recent teacher notes"}</div>
              {last3Notes.map((item) => (
                <div key={item.id} className="print-note">
                  <div style={{ marginBottom: "4px", color: "#999", fontSize: "8pt" }}>
                    {new Date(item.createdAt).toLocaleDateString(tr ? "tr-TR" : "en-US")}
                  </div>
                  {item.note}
                </div>
              ))}
            </div>
          </>
        ) : null}

        <hr className="print-divider" />
        <div>
          <div className="print-metric-label">{tr ? "Önerilen sonraki adım" : "Recommended next action"}</div>
          <div style={{ fontSize: "11pt", lineHeight: 1.6 }}>{nextAction}</div>
        </div>
        <div style={{ marginTop: "40px", color: "#bbb", fontSize: "8pt", textAlign: "center" }}>speakace.org</div>
      </div>

      <header className="inside-header no-print">
        <div className="inside-header-main">
          <Link href="/app/teacher" className="inside-breadcrumb">
            <ArrowLeft size={14} style={{ verticalAlign: "middle", marginRight: "0.3rem" }} />
            {tr ? "Öğretmen merkezine dön" : "Back to teacher hub"}
          </Link>
          <div className="inside-person">
            <div className="inside-avatar" aria-hidden="true">{initials}</div>
            <div>
              <span className="inside-kicker">{tr ? "Öğrenci çalışma alanı" : "Student workspace"}</span>
              <h1 className="inside-title is-person">{detail.student.name}</h1>
              <p className="inside-lede">{detail.student.email}</p>
            </div>
          </div>
        </div>
        <div className="inside-actions">
          <Link href={`/app/teacher/compare?left=${studentId}`} className="button button-secondary">
            <FileText size={15} />
            {tr ? "Karşılaştır" : "Compare"}
          </Link>
          <button type="button" className="button button-primary" onClick={printReport}>
            <Printer size={15} />
            {tr ? "Karne oluştur" : "Create report"}
          </button>
        </div>
      </header>

      <section className="inside-metric-strip no-print" style={{ "--metric-count": 5 } as React.CSSProperties}>
        <DetailMetric label={tr ? "Toplam deneme" : "Total attempts"} value={`${detail.overview.totalSessions}`} note={tr ? "Speaking oturumu" : "Speaking sessions"} />
        <DetailMetric label={tr ? "Ortalama" : "Average"} value={detail.overview.averageScore?.toFixed(1) ?? "—"} note={tr ? "Son sonuçlar" : "Recent results"} />
        <DetailMetric label={tr ? "En iyi skor" : "Best score"} value={detail.overview.bestScore?.toFixed(1) ?? "—"} note={tr ? "Kayıtlı zirve" : "Recorded peak"} />
        <DetailMetric label={tr ? "Skor hareketi" : "Score movement"} value={formatDelta(delta) ?? "—"} note={tr ? "Önceki döneme göre" : "Versus prior period"} />
        <DetailMetric label={tr ? "Ana odak" : "Primary focus"} value={detail.overview.weakestSkill ? translateCategoryLabel(detail.overview.weakestSkill, tr) : "—"} note={tr ? "En düşük kategori" : "Lowest category"} />
      </section>

      {(notice || error || riskFlags.length) ? (
        <section className="inside-section no-print" style={{ paddingBlock: "0.85rem" }}>
          {riskFlags.length ? (
            <div className="inside-tag-list">
              <AlertTriangle size={17} style={{ color: "var(--destructive)" }} aria-hidden="true" />
              {riskFlags.map((flag) => <span key={flag} className="inside-status is-alert">{flag}</span>)}
            </div>
          ) : null}
          {notice ? <p className="inside-feedback is-success" style={{ marginTop: riskFlags.length ? "0.65rem" : 0 }}>{notice}</p> : null}
          {error ? <p className="inside-feedback is-error" style={{ marginTop: riskFlags.length ? "0.65rem" : 0 }}>{error}</p> : null}
        </section>
      ) : null}

      <div className="inside-layout no-print">
        <div className="inside-main">
          <section className="inside-section">
            <div className="inside-section-head">
              <div>
                <span className="inside-kicker">{tr ? "Performans" : "Performance"}</span>
                <h2>{tr ? "Skor yönü" : "Score direction"}</h2>
                <p className="inside-section-copy">
                  {tr ? "Tüm skorlu denemeler kronolojik sırada gösterilir." : "All scored attempts are shown in chronological order."}
                </p>
              </div>
            </div>
            {timelinePoints.length ? <ScoreLineChart points={timelinePoints} /> : (
              <div className="inside-empty">
                <strong>{tr ? "Henüz çizilecek skor yok." : "No scores to chart yet."}</strong>
                <span>{tr ? "İlk değerlendirme tamamlandığında trend burada başlar." : "The trend starts after the first evaluation."}</span>
              </div>
            )}
          </section>

          <section className="inside-section">
            <div className="inside-section-head">
              <div>
                <span className="inside-kicker">{tr ? "Sonuç ve yorum" : "Results and comments"}</span>
                <h2>{tr ? "Speaking denemeleri" : "Speaking attempts"}</h2>
                <p className="inside-section-copy">
                  {tr ? "Bir denemeyi seçerek yalnızca o sonuca yorum bırak." : "Select one attempt to leave feedback on that specific result."}
                </p>
              </div>
              <MessageSquare size={20} aria-hidden="true" />
            </div>

            {detail.summary.recentSessions.length ? (
              <div className="inside-row-list">
                {detail.summary.recentSessions.map((session) => {
                  const weakest = session.report?.categories.slice().sort((a, b) => a.score - b.score)[0];
                  const reviewed = Boolean(sessionNotesMap.get(session.id)?.length);
                  const editorOpen = activeSessionId === session.id;
                  return (
                    <div key={session.id}>
                      <div className="inside-row" style={{ paddingBlock: "0.9rem" }}>
                        <div className="inside-row-main">
                          <strong className="inside-row-title">{session.prompt.title}</strong>
                          <div className="inside-row-meta">
                            <span>{new Date(session.createdAt).toLocaleDateString(tr ? "tr-TR" : "en-US", { day: "numeric", month: "short", year: "numeric" })}</span>
                            <span>{session.examType} · {session.taskType}</span>
                            {weakest ? <span>{tr ? "Odak" : "Focus"}: {translateCategoryLabel(weakest.label, tr)}</span> : null}
                            {reviewed ? <span className="inside-status is-good"><CheckCircle size={12} /> {tr ? "Yorumlandı" : "Reviewed"}</span> : null}
                          </div>
                        </div>
                        <div className="inside-row-side">
                          <strong className="inside-row-score">{session.report?.overall?.toFixed(1) ?? "—"}</strong>
                          <Link href={`/app/results/${session.id}`} className="inside-row-action" aria-label={tr ? "Sonucu aç" : "Open result"}>
                            <ArrowUpRight size={16} />
                          </Link>
                          <button type="button" className="button button-secondary" onClick={() => setActiveSessionId(editorOpen ? null : session.id)}>
                            {editorOpen ? (tr ? "Kapat" : "Close") : (tr ? "Yorum" : "Comment")}
                          </button>
                        </div>
                      </div>

                      {editorOpen ? (
                        <div className="inside-note-editor">
                          <TeacherNoteTemplates
                            tr={tr}
                            onSelect={(value) =>
                              setSessionDrafts((current) => ({
                                ...current,
                                [session.id]: current[session.id] ? `${current[session.id]}\n${value}` : value
                              }))
                            }
                          />
                          <div className="inside-tag-list">
                            {noteTagOptions.map((tag) => {
                              const active = (sessionTags[session.id] ?? []).includes(tag);
                              return (
                                <button
                                  key={`${session.id}-${tag}`}
                                  type="button"
                                  className={`inside-status${active ? " is-good" : ""}`}
                                  aria-pressed={active}
                                  onClick={() =>
                                    setSessionTags((current) => {
                                      const tags = current[session.id] ?? [];
                                      return { ...current, [session.id]: active ? tags.filter((item) => item !== tag) : [...tags, tag] };
                                    })
                                  }
                                >
                                  #{tag}
                                </button>
                              );
                            })}
                          </div>
                          <textarea
                            className="inside-input"
                            value={sessionDrafts[session.id] ?? ""}
                            onChange={(event) => setSessionDrafts((current) => ({ ...current, [session.id]: event.target.value }))}
                            rows={3}
                            placeholder={tr ? "Bu denemede öğrencinin bir sonraki adımı ne olmalı?" : "What should the student do next after this attempt?"}
                            style={{ resize: "vertical" }}
                          />
                          <div className="inside-inline-actions">
                            <button type="button" className="button button-primary" onClick={() => saveSessionNote(session.id)}>
                              {tr ? "Yorumu kaydet" : "Save comment"}
                            </button>
                            <Link href={`/app/replay/${session.id}`} className="button button-secondary">
                              {tr ? "Kaydı aç" : "Open replay"}
                            </Link>
                          </div>
                          {(sessionNotesMap.get(session.id) ?? []).slice(0, 2).map((item) => (
                            <div key={item.id} className="inside-callout">
                              {item.tags?.length ? <strong>{item.tags.map((tag) => `#${tag}`).join(" ")}</strong> : null}
                              <p>{item.note}</p>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="inside-empty">
                <strong>{tr ? "Henüz speaking denemesi yok." : "No speaking attempts yet."}</strong>
                <span>{tr ? "Öğrencinin ilk tamamlanan denemesi burada görünür." : "The student’s first completed attempt will appear here."}</span>
              </div>
            )}
          </section>
        </div>

        <aside className="inside-rail" style={{ position: "static" }}>
          <section className="inside-section is-accent">
            <div className="inside-section-head">
              <div>
                <span className="inside-kicker">{tr ? "Adaptif ödev" : "Adaptive homework"}</span>
                <h3>{tr ? "Skora göre sonraki görev" : "Next task from the score"}</h3>
              </div>
              <BookOpen size={19} aria-hidden="true" />
            </div>
            <div className="inside-filter" aria-label={tr ? "Teslim süresi" : "Due date"}>
              {[3, 7, 14].map((value) => (
                <button key={value} type="button" className={dueDays === value ? "is-active" : ""} onClick={() => setDueDays(value)}>
                  {tr ? `${value} gün` : `${value} days`}
                </button>
              ))}
            </div>
            {homeworkSuggestions.length ? (
              <div className="inside-row-list" style={{ marginTop: "0.8rem" }}>
                {homeworkSuggestions.map((item, index) => (
                  <div key={`${item.title}-${index}`} className="inside-row" style={{ gridTemplateColumns: "1fr", alignItems: "start" }}>
                    <div className="inside-row-main">
                      <span className="inside-tag">{item.focusSkill}</span>
                      <strong className="inside-row-title" style={{ whiteSpace: "normal" }}>{item.title}</strong>
                      <span className="inside-row-meta">{item.instructions}</span>
                    </div>
                    <button type="button" className="button button-primary" onClick={() => assignHomework(item)}>
                      {tr ? "Bu ödevi ata" : "Assign homework"}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="inside-empty"><span>{tr ? "Skora uygun otomatik öneri henüz yok." : "No score-based suggestion yet."}</span></div>
            )}

            <div style={{ marginTop: "0.9rem" }}>
              <strong style={{ fontSize: "0.82rem" }}>{tr ? "Atanmış ödevler" : "Assigned homework"}</strong>
              {assignedHomework.length ? (
                <div className="inside-row-list" style={{ marginTop: "0.35rem" }}>
                  {assignedHomework.slice(0, 5).map((item) => {
                    const overdue = !item.completedAt && item.dueAt && new Date(item.dueAt).getTime() < Date.now();
                    return (
                      <div key={item.id} className="inside-row">
                        <div className="inside-row-main">
                          <strong className="inside-row-title" style={{ whiteSpace: "normal" }}>{item.title}</strong>
                          <span className="inside-row-meta">
                            {item.dueAt ? `${tr ? "Teslim" : "Due"} ${new Date(item.dueAt).toLocaleDateString(tr ? "tr-TR" : "en-US")}` : (tr ? "Tarih yok" : "No due date")}
                          </span>
                        </div>
                        <span className={`inside-status${item.completedAt ? " is-good" : overdue ? " is-alert" : ""}`}>
                          {item.completedAt ? (tr ? "Bitti" : "Done") : overdue ? (tr ? "Gecikti" : "Overdue") : (tr ? "Açık" : "Open")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="inside-section-copy">{tr ? "Henüz atanmış ödev yok." : "No homework assigned yet."}</p>
              )}
            </div>
          </section>

          <section className="inside-section">
            <div className="inside-section-head">
              <div>
                <span className="inside-kicker">{tr ? "Aktivite" : "Activity"}</span>
                <h3>{tr ? "Son 28 gün" : "Last 28 days"}</h3>
              </div>
            </div>
            <div className="inside-heatmap">
              {buildActivityHeatmap(detail.summary.recentSessions, tr).map((day) => (
                <div key={day.key} className="inside-heatmap-cell" data-level={Math.min(day.count, 3)}>
                  <small>{day.label}</small>
                  <strong>{day.count}</strong>
                </div>
              ))}
            </div>
            <p className="inside-section-copy">{tr ? "Daha koyu hücreler aynı gün içindeki ek denemeleri gösterir." : "Darker cells indicate additional attempts on the same day."}</p>
          </section>

          <section className="inside-section">
            <div className="inside-section-head">
              <div>
                <span className="inside-kicker">{tr ? "Genel öğretmen notu" : "General teacher note"}</span>
                <h3>{tr ? "Bir sonraki derse bağlam bırak" : "Leave context for the next lesson"}</h3>
              </div>
            </div>
            <div className="inside-form-stack">
              <textarea
                className="inside-input"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={4}
                placeholder={tr ? "Öğrencinin bir sonraki derste neye odaklanması gerekiyor?" : "What should this student focus on in the next lesson?"}
                style={{ resize: "vertical" }}
              />
              <TeacherNoteTemplates tr={tr} onSelect={(value) => setNote((current) => current ? `${current}\n${value}` : value)} />
              <div className="inside-tag-list">
                {noteTagOptions.map((tag) => {
                  const active = noteTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      className={`inside-status${active ? " is-good" : ""}`}
                      aria-pressed={active}
                      onClick={() => setNoteTags((current) => active ? current.filter((item) => item !== tag) : [...current, tag])}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
              <button type="button" className="button button-primary" onClick={saveNote}>
                {tr ? "Notu kaydet" : "Save note"}
              </button>
            </div>

            {generalNotes.length ? (
              <div className="inside-row-list" style={{ marginTop: "1rem" }}>
                {generalNotes.map((item) => (
                  <div key={item.id} className="inside-row">
                    <div className="inside-row-main">
                      <strong className="inside-row-title" style={{ whiteSpace: "normal" }}>{item.note}</strong>
                      <div className="inside-row-meta">
                        <span>{new Date(item.createdAt).toLocaleDateString(tr ? "tr-TR" : "en-US")}</span>
                        {item.tags?.length ? <span>{item.tags.map((tag) => `#${tag}`).join(" ")}</span> : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        </aside>
      </div>
    </div>
  );
}

function DetailMetric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="inside-metric">
      <span className="inside-metric-label">{label}</span>
      <strong className="inside-metric-value">{value}</strong>
      <span className="inside-metric-note">{note}</span>
    </div>
  );
}

function PrintMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="print-metric">
      <div className="print-metric-label">{label}</div>
      <div className="print-metric-value">{value}</div>
    </div>
  );
}
