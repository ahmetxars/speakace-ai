"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Bell, BookOpenCheck, School, TriangleAlert, Users } from "lucide-react";
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
    let active = true;
    fetch(`/api/institution-admin/teachers/${teacherId}`)
      .then((response) => response.json())
      .then((data: DetailPayload & { error?: string }) => {
        if (data.error) throw new Error(data.error);
        if (active) setDetail(data);
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setError(reason instanceof Error ? reason.message : tr ? "Öğretmen detayı yüklenemedi." : "Could not load teacher detail.");
      });
    return () => {
      active = false;
    };
  }, [teacherId, tr]);

  const activityPoints = useMemo(
    () =>
      (detail?.classes ?? []).map((item) => ({
        label: item.name.length > 12 ? `${item.name.slice(0, 12)}…` : item.name,
        value: item.averageScore || item.activeStudents || 0,
        meta: `${item.studentCount} ${tr ? "öğrenci" : "students"}`
      })),
    [detail?.classes, tr]
  );

  if (!detail) {
    return (
      <main className="page-shell section inside-page">
        <div className="inside-loading">{error || (tr ? "Öğretmen görünümü hazırlanıyor…" : "Preparing teacher overview…")}</div>
      </main>
    );
  }

  const initials = detail.teacher.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const attentionCount = detail.summary.atRiskStudentCount + detail.summary.pendingApprovalCount + detail.summary.overdueHomeworkCount;

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
              <span className="inside-kicker">{tr ? "Öğretmen görünümü" : "Teacher overview"}</span>
              <h1 className="inside-title is-person">{detail.teacher.name}</h1>
              <p className="inside-lede">{detail.teacher.email}</p>
            </div>
          </div>
        </div>
        <div className="inside-actions">
          <span className={`inside-status${attentionCount ? " is-alert" : " is-good"}`}>
            {attentionCount ? `${attentionCount} ${tr ? "açık konu" : "open items"}` : (tr ? "Her şey yolunda" : "All clear")}
          </span>
        </div>
      </header>

      <section className="inside-metric-strip" style={{ "--metric-count": 6 } as React.CSSProperties}>
        <TeacherMetric label={tr ? "Sınıf" : "Classes"} value={`${detail.summary.classCount}`} note={tr ? "Aktif sorumluluk" : "Active responsibility"} />
        <TeacherMetric label={tr ? "Öğrenci" : "Students"} value={`${detail.summary.studentCount}`} note={`${detail.summary.activeStudents} ${tr ? "aktif" : "active"}`} />
        <TeacherMetric label={tr ? "Ortalama skor" : "Average score"} value={detail.summary.averageScore ? detail.summary.averageScore.toFixed(1) : "—"} note={tr ? "Tüm sınıflar" : "Across classes"} />
        <TeacherMetric label={tr ? "Ödev tamamlama" : "Homework completion"} value={`${Math.round(detail.summary.homeworkCompletionRate || 0)}%`} note={`${detail.summary.homeworkAssignedCount} ${tr ? "atanan" : "assigned"}`} />
        <TeacherMetric label={tr ? "Riskte öğrenci" : "At-risk students"} value={`${detail.summary.atRiskStudentCount}`} note={tr ? "Takip gerektiriyor" : "Need follow-up"} />
        <TeacherMetric label={tr ? "Geciken ödev" : "Overdue homework"} value={`${detail.summary.overdueHomeworkCount}`} note={tr ? "Açık teslim" : "Open deadlines"} />
      </section>

      <div className="inside-layout">
        <div className="inside-main">
          <section className="inside-section">
            <div className="inside-section-head">
              <div>
                <span className="inside-kicker">{tr ? "Portföy görünümü" : "Portfolio view"}</span>
                <h2>{tr ? "Sınıflar arası performans sinyali" : "Performance signal across classes"}</h2>
                <p className="inside-section-copy">
                  {tr ? "Grafik, skoru olan sınıflarda ortalamayı; skor yoksa aktif öğrenci sayısını kullanır." : "The chart uses average score where available and active students otherwise."}
                </p>
              </div>
              <School size={20} aria-hidden="true" />
            </div>
            {activityPoints.length ? <ScoreLineChart points={activityPoints} /> : (
              <div className="inside-empty">
                <strong>{tr ? "Henüz sınıf verisi yok." : "No class data yet."}</strong>
                <span>{tr ? "Öğretmenin ilk sınıfı oluştuğunda karşılaştırma burada başlar." : "The comparison starts after the teacher creates a first class."}</span>
              </div>
            )}
          </section>

          <section className="inside-section">
            <div className="inside-section-head">
              <div>
                <span className="inside-kicker">{tr ? "Sınıf kaydı" : "Class ledger"}</span>
                <h2>{tr ? "Sorumlu olduğu sınıflar" : "Classes under management"}</h2>
              </div>
              <Users size={20} aria-hidden="true" />
            </div>
            {detail.classes.length ? (
              <div className="inside-table-wrap">
                <table className="inside-table">
                  <thead>
                    <tr>
                      <th>{tr ? "Sınıf" : "Class"}</th>
                      <th>{tr ? "Öğrenci" : "Students"}</th>
                      <th>{tr ? "Aktif" : "Active"}</th>
                      <th>{tr ? "Ort. skor" : "Avg. score"}</th>
                      <th>{tr ? "Bekleyen" : "Pending"}</th>
                      <th>{tr ? "Geciken" : "Overdue"}</th>
                      <th>{tr ? "Son aktivite" : "Last active"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.classes.map((item) => (
                      <tr key={item.id}>
                        <td><strong>{item.name}</strong></td>
                        <td>{item.studentCount}</td>
                        <td>{item.activeStudents}</td>
                        <td><strong>{item.averageScore ? item.averageScore.toFixed(1) : "—"}</strong></td>
                        <td>{item.pendingApprovals}</td>
                        <td><span className={item.overdueHomeworkCount ? "inside-status is-alert" : "inside-status"}>{item.overdueHomeworkCount}</span></td>
                        <td>{item.lastActivityAt ? new Date(item.lastActivityAt).toLocaleDateString(tr ? "tr-TR" : "en-US") : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="inside-empty"><span>{tr ? "Bu öğretmene bağlı sınıf bulunmuyor." : "No class is assigned to this teacher."}</span></div>
            )}
          </section>
        </div>

        <aside className="inside-rail">
          <section className={`inside-section${attentionCount ? " is-warm" : " is-accent"}`}>
            <div className="inside-section-head">
              <div>
                <span className="inside-kicker">{tr ? "Operasyon nabzı" : "Operational pulse"}</span>
                <h3>{attentionCount ? (tr ? "Bugün takip edilecekler" : "Follow up today") : (tr ? "Açık konu görünmüyor" : "No open issue")}</h3>
              </div>
              {attentionCount ? <TriangleAlert size={19} aria-hidden="true" /> : <BookOpenCheck size={19} aria-hidden="true" />}
            </div>
            <div className="inside-row-list">
              <div className="inside-row">
                <span className="inside-row-title">{tr ? "Bekleyen onay" : "Pending approvals"}</span>
                <strong>{detail.summary.pendingApprovalCount}</strong>
              </div>
              <div className="inside-row">
                <span className="inside-row-title">{tr ? "Riskte öğrenci" : "At-risk students"}</span>
                <strong>{detail.summary.atRiskStudentCount}</strong>
              </div>
              <div className="inside-row">
                <span className="inside-row-title">{tr ? "Son aktivite" : "Last activity"}</span>
                <strong style={{ fontSize: "0.8rem" }}>
                  {detail.summary.recentActivityAt ? new Date(detail.summary.recentActivityAt).toLocaleDateString(tr ? "tr-TR" : "en-US") : "—"}
                </strong>
              </div>
            </div>
          </section>

          <section className="inside-section">
            <div className="inside-section-head">
              <div>
                <span className="inside-kicker">{tr ? "İletişim" : "Communication"}</span>
                <h3>{tr ? "Son duyurular" : "Recent announcements"}</h3>
              </div>
              <Bell size={18} aria-hidden="true" />
            </div>
            {detail.recentAnnouncements.length ? (
              <div className="inside-row-list">
                {detail.recentAnnouncements.map((item) => (
                  <div key={item.id} className="inside-row">
                    <div className="inside-row-main">
                      <strong className="inside-row-title" style={{ whiteSpace: "normal" }}>{item.title}</strong>
                      <span className="inside-row-meta">{new Date(item.createdAt).toLocaleDateString(tr ? "tr-TR" : "en-US")}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="inside-empty"><span>{tr ? "Henüz duyuru yok." : "No announcements yet."}</span></div>
            )}
          </section>

          <section className="inside-section">
            <div className="inside-section-head">
              <div>
                <span className="inside-kicker">{tr ? "Değerlendirme" : "Review context"}</span>
                <h3>{tr ? "Son öğretmen notları" : "Recent teacher notes"}</h3>
              </div>
            </div>
            {detail.recentNotes.length ? (
              <div className="inside-row-list">
                {detail.recentNotes.map((item) => (
                  <div key={item.id} className="inside-row">
                    <div className="inside-row-main">
                      <strong className="inside-row-title" style={{ whiteSpace: "normal" }}>{item.note}</strong>
                      <span className="inside-row-meta">{new Date(item.createdAt).toLocaleDateString(tr ? "tr-TR" : "en-US")}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="inside-empty"><span>{tr ? "Henüz değerlendirme notu yok." : "No review notes yet."}</span></div>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}

function TeacherMetric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="inside-metric">
      <span className="inside-metric-label">{label}</span>
      <strong className="inside-metric-value">{value}</strong>
      <span className="inside-metric-note">{note}</span>
    </div>
  );
}
