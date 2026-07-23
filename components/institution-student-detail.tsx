"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowUpRight, BookOpenCheck, GraduationCap, TriangleAlert } from "lucide-react";
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
    let active = true;
    fetch(`/api/institution-admin/students/${studentId}`)
      .then((response) => response.json())
      .then((data: DetailPayload & { error?: string }) => {
        if (data.error) throw new Error(data.error);
        if (active) setDetail(data);
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setError(reason instanceof Error ? reason.message : tr ? "Öğrenci detayı yüklenemedi." : "Could not load student detail.");
      });
    return () => {
      active = false;
    };
  }, [studentId, tr]);

  const points = useMemo(
    () =>
      [...(detail?.summary.recentSessions ?? [])]
        .reverse()
        .filter((session) => session.report?.overall != null)
        .map((session) => ({
          label: new Date(session.createdAt).toLocaleDateString(tr ? "tr-TR" : "en-US", { month: "short", day: "numeric" }),
          value: session.report?.overall ?? 0,
          meta: `${session.examType} · ${session.taskType}`
        })),
    [detail?.summary.recentSessions, tr]
  );

  if (!detail) {
    return (
      <main className="page-shell section inside-page">
        <div className="inside-loading">{error || (tr ? "Öğrenci profili hazırlanıyor…" : "Preparing student profile…")}</div>
      </main>
    );
  }

  const initials = detail.student.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const homeworkRate = detail.homework.total ? Math.round((detail.homework.completed / detail.homework.total) * 100) : 0;
  const delta = detail.overview.scoreDelta;
  const risks = detail.overview.riskFlags ?? [];

  return (
    <main className="page-shell section inside-page">
      <header className="inside-header">
        <div className="inside-header-main">
          <Link href="/app/institution-admin" className="inside-breadcrumb">
            <ArrowLeft size={14} style={{ verticalAlign: "middle", marginRight: "0.3rem" }} />
            {tr ? "Okul paneline dön" : "Back to school panel"}
          </Link>
          <div className="inside-person">
            <div className="inside-avatar" aria-hidden="true">{initials}</div>
            <div>
              <span className="inside-kicker">{tr ? "Öğrenci görünümü" : "Student overview"}</span>
              <h1 className="inside-title is-person">{detail.student.name}</h1>
              <p className="inside-lede">{detail.student.email}</p>
            </div>
          </div>
        </div>
        <div className="inside-actions">
          <span className={`inside-status${risks.length ? " is-alert" : " is-good"}`}>
            {risks.length ? (tr ? "İlgilenilmeli" : "Needs attention") : (tr ? "Normal ilerliyor" : "On track")}
          </span>
        </div>
      </header>

      <section className="inside-metric-strip" style={{ "--metric-count": 5 } as React.CSSProperties}>
        <StudentMetric label={tr ? "Toplam deneme" : "Total attempts"} value={`${detail.overview.totalSessions}`} note={tr ? "Speaking oturumu" : "Speaking sessions"} />
        <StudentMetric label={tr ? "Ortalama" : "Average"} value={detail.overview.averageScore ? detail.overview.averageScore.toFixed(1) : "—"} note={tr ? "Son sonuçlar" : "Recent results"} />
        <StudentMetric label={tr ? "En iyi skor" : "Best score"} value={detail.overview.bestScore?.toFixed(1) ?? "—"} note={tr ? "Kayıtlı zirve" : "Recorded peak"} />
        <StudentMetric label={tr ? "Skor hareketi" : "Score movement"} value={typeof delta === "number" ? `${delta > 0 ? "+" : ""}${delta.toFixed(1)}` : "—"} note={tr ? "Önceki döneme göre" : "Versus prior period"} />
        <StudentMetric label={tr ? "Ödev tamamlama" : "Homework completion"} value={detail.homework.total ? `${homeworkRate}%` : "—"} note={`${detail.homework.completed}/${detail.homework.total}`} />
      </section>

      <div className="inside-layout">
        <div className="inside-main">
          <section className="inside-section">
            <div className="inside-section-head">
              <div>
                <span className="inside-kicker">{tr ? "Performans" : "Performance"}</span>
                <h2>{tr ? "Skor yönü" : "Score direction"}</h2>
                <p className="inside-section-copy">
                  {detail.overview.weakestSkill
                    ? `${tr ? "Mevcut gelişim odağı" : "Current improvement focus"}: ${translateCategory(detail.overview.weakestSkill, tr)}`
                    : (tr ? "İlk skorlu sonuçtan sonra gelişim odağı görünür." : "The improvement focus appears after the first scored result.")}
                </p>
              </div>
            </div>
            {points.length ? <ScoreLineChart points={points} /> : (
              <div className="inside-empty">
                <strong>{tr ? "Henüz çizilecek skor yok." : "No scores to chart yet."}</strong>
                <span>{tr ? "Öğrenci ilk değerlendirmeyi tamamladığında trend burada başlar." : "The trend starts after the student completes a first evaluation."}</span>
              </div>
            )}
          </section>

          <section className="inside-section">
            <div className="inside-section-head">
              <div>
                <span className="inside-kicker">{tr ? "Sonuç kaydı" : "Result ledger"}</span>
                <h2>{tr ? "Son speaking denemeleri" : "Recent speaking attempts"}</h2>
              </div>
              <GraduationCap size={20} aria-hidden="true" />
            </div>
            {detail.summary.recentSessions.length ? (
              <div className="inside-row-list">
                {detail.summary.recentSessions.map((session) => {
                  const weakest = session.report?.categories.slice().sort((a, b) => a.score - b.score)[0];
                  return (
                    <Link key={session.id} href={`/app/results/${session.id}`} className="inside-row">
                      <div className="inside-row-main">
                        <strong className="inside-row-title">{session.prompt.title}</strong>
                        <div className="inside-row-meta">
                          <span>{new Date(session.createdAt).toLocaleDateString(tr ? "tr-TR" : "en-US", { day: "numeric", month: "short", year: "numeric" })}</span>
                          <span>{session.examType} · {session.taskType}</span>
                          {weakest ? <span>{tr ? "Odak" : "Focus"}: {translateCategory(weakest.label, tr)}</span> : null}
                        </div>
                      </div>
                      <div className="inside-row-side">
                        <strong className="inside-row-score">{session.report?.overall?.toFixed(1) ?? "—"}</strong>
                        <ArrowUpRight size={16} aria-hidden="true" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="inside-empty">
                <strong>{tr ? "Henüz speaking sonucu yok." : "No speaking results yet."}</strong>
                <span>{tr ? "Öğrencinin ilk tamamlanan oturumu burada görünür." : "The student’s first completed session will appear here."}</span>
              </div>
            )}
          </section>
        </div>

        <aside className="inside-rail">
          <section className="inside-section is-accent">
            <div className="inside-section-head">
              <div>
                <span className="inside-kicker">{tr ? "Operasyon özeti" : "Operational summary"}</span>
                <h3>{tr ? "Ödev ve aktivite" : "Homework and activity"}</h3>
              </div>
              <BookOpenCheck size={19} aria-hidden="true" />
            </div>
            <div className="inside-progress">
              <div className="inside-progress-labels">
                <span>{tr ? "Tamamlanan ödev" : "Homework completed"}</span>
                <span>{homeworkRate}%</span>
              </div>
              <div className="inside-progress-track"><span style={{ width: `${homeworkRate}%` }} /></div>
            </div>
            <div className="inside-row-list" style={{ marginTop: "0.8rem" }}>
              <div className="inside-row">
                <span className="inside-row-title">{tr ? "Geciken ödev" : "Overdue homework"}</span>
                <strong>{detail.homework.overdue}</strong>
              </div>
              <div className="inside-row">
                <span className="inside-row-title">{tr ? "Son aktivite" : "Last active"}</span>
                <strong style={{ fontSize: "0.82rem" }}>
                  {detail.overview.lastActiveAt ? new Date(detail.overview.lastActiveAt).toLocaleDateString(tr ? "tr-TR" : "en-US") : "—"}
                </strong>
              </div>
            </div>
          </section>

          <section className="inside-section">
            <div className="inside-section-head">
              <div>
                <span className="inside-kicker">{tr ? "Bağlantılar" : "Connections"}</span>
                <h3>{tr ? "Sınıf ve öğretmen" : "Classes and teachers"}</h3>
              </div>
            </div>
            {detail.classes.length ? (
              <div className="inside-row-list">
                {detail.classes.map((item) => (
                  <div key={item.classId} className="inside-row">
                    <div className="inside-row-main">
                      <strong className="inside-row-title">{item.className}</strong>
                      <div className="inside-row-meta">
                        <span>{item.teacherName}</span>
                        <span>{tr ? "Katılım" : "Joined"}: {item.joinedAt ? new Date(item.joinedAt).toLocaleDateString(tr ? "tr-TR" : "en-US") : "—"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="inside-empty"><span>{tr ? "Bağlı sınıf bulunmuyor." : "No connected class."}</span></div>
            )}
          </section>

          {risks.length ? (
            <section className="inside-section is-warm">
              <div className="inside-section-head">
                <div>
                  <span className="inside-kicker">{tr ? "Risk sinyalleri" : "Risk signals"}</span>
                  <h3>{tr ? "Takip edilmesi gerekenler" : "Items to follow up"}</h3>
                </div>
                <TriangleAlert size={19} aria-hidden="true" />
              </div>
              <div className="inside-tag-list">
                {risks.map((flag) => <span key={flag} className="inside-status is-alert">{flag}</span>)}
              </div>
            </section>
          ) : null}
        </aside>
      </div>

      <section className="inside-section">
        <div className="inside-section-head">
          <div>
            <span className="inside-kicker">{tr ? "Öğretmen bağlamı" : "Teacher context"}</span>
            <h2>{tr ? "Son değerlendirme notları" : "Recent review notes"}</h2>
          </div>
        </div>
        {detail.notes.length ? (
          <div className="inside-row-list">
            {detail.notes.map((note) => (
              <div key={note.id} className="inside-row">
                <div className="inside-row-main">
                  <strong className="inside-row-title" style={{ whiteSpace: "normal" }}>{note.note}</strong>
                  <div className="inside-row-meta">
                    <span>{new Date(note.createdAt).toLocaleDateString(tr ? "tr-TR" : "en-US")}</span>
                    {note.tags?.length ? <span>{note.tags.map((tag) => `#${tag}`).join(" ")}</span> : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="inside-empty"><span>{tr ? "Henüz değerlendirme notu yok." : "No review notes yet."}</span></div>
        )}
      </section>
    </main>
  );
}

function StudentMetric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="inside-metric">
      <span className="inside-metric-label">{label}</span>
      <strong className="inside-metric-value">{value}</strong>
      <span className="inside-metric-note">{note}</span>
    </div>
  );
}

function translateCategory(label: string, tr: boolean) {
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
