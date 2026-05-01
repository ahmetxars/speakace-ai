"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppState } from "@/components/providers";
import { trackClientEvent } from "@/lib/analytics-client";
import type { InstitutionUserSummary } from "@/lib/types";
import { Activity, AlertTriangle, Clock, TrendingDown, TrendingUp, Users } from "lucide-react";

type TeacherSummary = {
  teacher: { id: string; name: string; email: string };
  classCount: number;
  studentCount: number;
  activeStudents: number;
  averageScore: number;
  pendingApprovalCount?: number;
  atRiskStudentCount?: number;
  homeworkCompletionRate?: number;
  mostCommonWeakestSkill?: string | null;
  lastLoginAt?: string | null;
  totalHomeworkCreated?: number;
  scoreDelta?: number | null;
};

type ActivityLogEntry = {
  id: string;
  teacherName: string;
  action: string;
  detail: string;
  occurredAt: string;
};

type MonthlyTrend = {
  month: string;
  averageScore: number;
  activeStudents: number;
};

type AtRiskDetail = {
  studentId: string;
  studentName: string;
  teacherName: string;
  className: string;
  reasons: string[];
};

type InstitutionAdminSummary = {
  totalTeachers: number;
  totalClasses: number;
  totalStudents: number;
  activeStudents: number;
  pendingApprovals: number;
  atRiskStudents: number;
  averageScore: number;
  teacherSummaries: TeacherSummary[];
  alerts: string[];
  monthlyTrend?: MonthlyTrend[];
  recentActivity?: ActivityLogEntry[];
  atRiskDetails?: AtRiskDetail[];
};

const DEMO_MONTHLY_TREND: MonthlyTrend[] = [
  { month: "Ara", averageScore: 5.8, activeStudents: 42 },
  { month: "Oca", averageScore: 6.0, activeStudents: 58 },
  { month: "Şub", averageScore: 6.1, activeStudents: 63 },
  { month: "Mar", averageScore: 6.3, activeStudents: 71 },
  { month: "Nis", averageScore: 6.5, activeStudents: 68 },
  { month: "May", averageScore: 6.7, activeStudents: 75 },
];

const DEMO_ACTIVITY: ActivityLogEntry[] = [
  { id: "1", teacherName: "Ayşe Kaya", action: "3 ödev tanımladı / Defined 3 assignments", detail: "IELTS Evening Group", occurredAt: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: "2", teacherName: "Mehmet Yılmaz", action: "Yeni sınıf açtı / Created new class", detail: "TOEFL Weekend Prep", occurredAt: new Date(Date.now() - 3600000 * 5).toISOString() },
  { id: "3", teacherName: "Zeynep Arslan", action: "5 öğrenciyi onayladı / Approved 5 students", detail: "Business English B2", occurredAt: new Date(Date.now() - 3600000 * 24).toISOString() },
];

const emptySummary: InstitutionAdminSummary = {
  totalTeachers: 0,
  totalClasses: 0,
  totalStudents: 0,
  activeStudents: 0,
  pendingApprovals: 0,
  atRiskStudents: 0,
  averageScore: 0,
  teacherSummaries: [],
  alerts: [],
};

function relativeTime(dateStr: string | null | undefined, tr: boolean): string {
  if (!dateStr) return tr ? "Hiç giriş yapılmadı" : "Never logged in";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 5) return tr ? "Az önce" : "Just now";
  if (mins < 60) return tr ? `${mins} dk önce` : `${mins}m ago`;
  if (hours < 24) return tr ? `${hours} sa önce` : `${hours}h ago`;
  if (days < 7) return tr ? `${days} gün önce` : `${days}d ago`;
  return new Date(dateStr).toLocaleDateString(tr ? "tr-TR" : "en-US");
}

export function InstitutionAdminPanel() {
  const { currentUser, language } = useAppState();
  const tr = language === "tr";
  const [summary, setSummary] = useState<InstitutionAdminSummary>(emptySummary);
  const [users, setUsers] = useState<InstitutionUserSummary[]>([]);
  const [search, setSearch] = useState("");
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementBody, setAnnouncementBody] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/institution-admin/summary")
      .then((response) => response.json())
      .then((data: InstitutionAdminSummary) => setSummary(data))
      .catch(() => setSummary(emptySummary));
  }, []);

  useEffect(() => {
    fetch(`/api/institution-admin/users?search=${encodeURIComponent(search)}`)
      .then((response) => response.json())
      .then((data: { users?: InstitutionUserSummary[] }) => setUsers(data.users ?? []))
      .catch(() => setUsers([]));
  }, [search]);

  useEffect(() => {
    if (!currentUser?.id) return;
    void trackClientEvent({ userId: currentUser.id, event: "institution_admin_view", path: "/app/institution-admin" });
  }, [currentUser?.id]);

  const rankedTeachers = useMemo(
    () => [...summary.teacherSummaries].sort((a, b) => (b.studentCount - a.studentCount) || (b.averageScore - a.averageScore)),
    [summary.teacherSummaries]
  );

  const monthlyTrend = (summary.monthlyTrend?.length ?? 0) > 0 ? summary.monthlyTrend! : DEMO_MONTHLY_TREND;
  const maxTrendScore = Math.max(...monthlyTrend.map((m) => m.averageScore), 0.1);
  const trendDelta = monthlyTrend.length >= 2
    ? (monthlyTrend[monthlyTrend.length - 1].averageScore - monthlyTrend[0].averageScore).toFixed(1)
    : null;

  const activityLog = (summary.recentActivity?.length ?? 0) > 0 ? summary.recentActivity! : DEMO_ACTIVITY;

  const overallHwRate = rankedTeachers.length > 0
    ? Math.round(rankedTeachers.reduce((sum, t) => sum + (t.homeworkCompletionRate ?? 0), 0) / rankedTeachers.length)
    : 0;

  const updateAccess = async (userId: string, patch: { teacherAccess?: boolean; adminAccess?: boolean }) => {
    setError("");
    setNotice("");
    const response = await fetch("/api/institution-admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...patch }),
    });
    const data = (await response.json()) as { user?: InstitutionUserSummary; error?: string };
    if (!response.ok || !data.user) {
      setError(data.error ?? (tr ? "Rol güncellenemedi." : "Could not update role."));
      return;
    }
    setUsers((current) => current.map((item) => (item.id === userId ? data.user! : item)));
    setNotice(tr ? "Kullanıcı yetkisi güncellendi." : "User access updated.");
  };

  const sendAnnouncement = async () => {
    setError("");
    setNotice("");
    const response = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audienceType: "global", title: announcementTitle, body: announcementBody }),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(data.error ?? (tr ? "Duyuru gönderilemedi." : "Could not send announcement."));
      return;
    }
    setAnnouncementTitle("");
    setAnnouncementBody("");
    setNotice(tr ? "Duyuru gönderildi." : "Announcement sent.");
  };

  return (
    <div className="page-shell section" style={{ display: "grid", gap: "1rem" }}>

      {/* Header */}
      <section className="card" style={{ padding: "1.4rem", display: "grid", gap: "0.8rem" }}>
        <span className="eyebrow">{tr ? "Kurum admin" : "Institution admin"}</span>
        <h1 style={{ margin: 0 }}>{tr ? "Üst seviye kurum kontrol paneli" : "High-level institution control panel"}</h1>
        <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
          {tr
            ? "Öğretmen yükü, sınıf hacmi, riskli öğrenciler ve bekleyen onaylar tek ekranda."
            : "Teacher load, class volume, at-risk students, and pending approvals in one place."}
        </p>
      </section>

      {/* KPI Stats */}
      <section className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.75rem" }}>
        <AdminStat icon="👩‍🏫" title={tr ? "Öğretmen" : "Teachers"} value={String(summary.totalTeachers)} />
        <AdminStat icon="🏫" title={tr ? "Sınıf" : "Classes"} value={String(summary.totalClasses)} />
        <AdminStat icon="🎓" title={tr ? "Öğrenci" : "Students"} value={String(summary.totalStudents)} />
        <AdminStat icon="⚡" title={tr ? "Aktif öğrenci" : "Active students"} value={String(summary.activeStudents)} />
        <AdminStat icon="⏳" title={tr ? "Bekleyen onay" : "Pending approvals"} value={String(summary.pendingApprovals)} highlight={summary.pendingApprovals > 0} />
        <AdminStat icon="⚠️" title={tr ? "Riskli öğrenci" : "At-risk students"} value={String(summary.atRiskStudents)} highlight={summary.atRiskStudents > 0} />
        <AdminStat icon="📊" title={tr ? "Ort. skor" : "Avg score"} value={summary.averageScore ? summary.averageScore.toFixed(1) : "-"} />
        <AdminStat icon="📚" title={tr ? "Ödev tamamlama" : "HW completion"} value={`${overallHwRate}%`} />
      </section>

      {/* Monthly trend + Activity log */}
      <section className="grid" style={{ gridTemplateColumns: "minmax(300px, 1.2fr) minmax(280px, 0.8fr)", gap: "1rem", alignItems: "start" }}>

        {/* Monthly band trend chart */}
        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <TrendingUp size={17} style={{ color: "var(--accent)" }} />
            <strong>{tr ? "Aylık band ortalaması trendi" : "Monthly band average trend"}</strong>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem", height: 90, paddingBottom: "0.3rem", borderBottom: "1px solid var(--line)" }}>
            {monthlyTrend.map((m, i) => (
              <div key={m.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem" }}>
                <span style={{ fontSize: "0.7rem", color: "var(--muted)", fontWeight: 600 }}>{m.averageScore.toFixed(1)}</span>
                <div style={{
                  width: "100%",
                  height: `${Math.round((m.averageScore / (maxTrendScore * 1.08)) * 70)}px`,
                  minHeight: 6,
                  borderRadius: "5px 5px 0 0",
                  background: i === monthlyTrend.length - 1
                    ? "var(--accent)"
                    : "color-mix(in srgb, var(--accent) 38%, var(--surface-strong) 62%)",
                  transition: "height 0.4s ease",
                }} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "0.4rem" }}>
            {monthlyTrend.map((m) => (
              <div key={m.month} style={{ flex: 1, textAlign: "center", fontSize: "0.7rem", color: "var(--muted)" }}>{m.month}</div>
            ))}
          </div>
          {trendDelta !== null && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem" }}>
              {Number(trendDelta) >= 0 ? (
                <>
                  <TrendingUp size={14} style={{ color: "var(--success)" }} />
                  <span style={{ color: "var(--success)", fontWeight: 600 }}>
                    {tr ? "6 ayda" : "Over 6 months"} +{trendDelta} band
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown size={14} style={{ color: "var(--destructive)" }} />
                  <span style={{ color: "var(--destructive)", fontWeight: 600 }}>{trendDelta} band</span>
                </>
              )}
              <span style={{ color: "var(--muted)" }}>·</span>
              <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>
                {tr ? `${monthlyTrend[monthlyTrend.length - 1].activeStudents} aktif öğrenci` : `${monthlyTrend[monthlyTrend.length - 1].activeStudents} active students`}
              </span>
            </div>
          )}
        </div>

        {/* Activity log */}
        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Activity size={17} style={{ color: "var(--accent)" }} />
            <strong>{tr ? "Kurum aktivite günlüğü" : "Institution activity log"}</strong>
          </div>
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {activityLog.map((log) => (
              <div key={log.id} style={{ padding: "0.7rem 0.8rem", borderRadius: 12, background: "var(--surface-strong)", display: "grid", gap: "0.2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>{log.teacherName}</span>
                  <span style={{ fontSize: "0.72rem", color: "var(--muted)", whiteSpace: "nowrap", flexShrink: 0 }}>
                    {relativeTime(log.occurredAt, tr)}
                  </span>
                </div>
                <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>{log.action}</span>
                {log.detail && <span style={{ fontSize: "0.77rem", color: "var(--muted)" }}>→ {log.detail}</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Teacher performance cards + At-risk details */}
      <section className="grid" style={{ gridTemplateColumns: "minmax(320px, 1.1fr) minmax(300px, 0.9fr)", gap: "1rem", alignItems: "start" }}>

        {/* Teacher performance cards */}
        <div className="card" style={{ padding: "1rem", display: "grid", gap: "0.8rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Users size={17} style={{ color: "var(--accent)" }} />
            <strong>{tr ? "Öğretmen performans kartları" : "Teacher performance cards"}</strong>
          </div>
          {rankedTeachers.length ? rankedTeachers.map((item, index) => (
            <div key={item.teacher.id} className="card" style={{ padding: "1rem", background: "var(--surface-strong)", display: "grid", gap: "0.7rem" }}>

              {/* Header row */}
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
                  <span className="pill" style={{ fontSize: "0.78rem", minWidth: 26, textAlign: "center" }}>#{index + 1}</span>
                  <div>
                    <strong>{item.teacher.name}</strong>
                    <div className="practice-meta">{item.teacher.email}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                  {typeof item.scoreDelta === "number" && item.scoreDelta > 0 && (
                    <TrendingUp size={14} style={{ color: "var(--success)" }} />
                  )}
                  {typeof item.scoreDelta === "number" && item.scoreDelta < 0 && (
                    <TrendingDown size={14} style={{ color: "var(--destructive)" }} />
                  )}
                  <span className="pill" style={{ fontSize: "1rem" }}>{item.averageScore ? item.averageScore.toFixed(1) : "-"}</span>
                </div>
              </div>

              {/* Stats mini grid */}
              <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))", gap: "0.45rem" }}>
                <MiniStat label={tr ? "Sınıf" : "Classes"} value={String(item.classCount)} />
                <MiniStat label={tr ? "Öğrenci" : "Students"} value={String(item.studentCount)} />
                <MiniStat label={tr ? "Aktif" : "Active"} value={String(item.activeStudents)} />
                <MiniStat label={tr ? "Risk" : "At-risk"} value={String(item.atRiskStudentCount ?? 0)} />
                {typeof item.totalHomeworkCreated === "number" && (
                  <MiniStat label={tr ? "Ödev" : "HW created"} value={String(item.totalHomeworkCreated)} />
                )}
              </div>

              {/* Homework completion progress bar */}
              {typeof item.homeworkCompletionRate === "number" && (
                <div style={{ display: "grid", gap: "0.3rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.77rem", color: "var(--muted)" }}>
                    <span>{tr ? "Ödev tamamlama oranı" : "HW completion rate"}</span>
                    <strong style={{
                      color: item.homeworkCompletionRate >= 70 ? "var(--success)"
                        : item.homeworkCompletionRate >= 40 ? "var(--accent)"
                        : "var(--destructive)"
                    }}>
                      {item.homeworkCompletionRate}%
                    </strong>
                  </div>
                  <div style={{ height: 6, borderRadius: 99, background: "var(--line)", overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${item.homeworkCompletionRate}%`,
                      borderRadius: 99,
                      background: item.homeworkCompletionRate >= 70 ? "var(--success)"
                        : item.homeworkCompletionRate >= 40 ? "var(--accent)"
                        : "var(--destructive)",
                      transition: "width 0.5s ease",
                    }} />
                  </div>
                </div>
              )}

              {/* Last login + weak area */}
              <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", fontSize: "0.77rem", color: "var(--muted)", flexWrap: "wrap" }}>
                <Clock size={11} />
                <span>{tr ? "Son giriş:" : "Last login:"} <strong style={{ color: "var(--text)" }}>{relativeTime(item.lastLoginAt, tr)}</strong></span>
                {item.mostCommonWeakestSkill && (
                  <>
                    <span>·</span>
                    <span>{tr ? "Ortak zayıf:" : "Common weak:"} <strong style={{ color: "var(--text)" }}>{item.mostCommonWeakestSkill}</strong></span>
                  </>
                )}
              </div>
            </div>
          )) : (
            <div style={{ color: "var(--muted)", padding: "0.5rem 0" }}>{tr ? "Henüz öğretmen yok." : "No teachers yet."}</div>
          )}
        </div>

        {/* At-risk student details */}
        <div className="card" style={{ padding: "1rem", display: "grid", gap: "0.8rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <AlertTriangle size={17} style={{ color: "#d97706" }} />
            <strong>{tr ? "Riskli öğrenci detayları" : "At-risk student details"}</strong>
          </div>

          {(summary.atRiskDetails?.length ?? 0) > 0 ? (
            <div style={{ display: "grid", gap: "0.55rem" }}>
              {summary.atRiskDetails!.map((detail) => (
                <div key={detail.studentId} className="card" style={{ padding: "0.85rem", background: "rgba(217, 93, 57, 0.06)", display: "grid", gap: "0.4rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                    <strong style={{ fontSize: "0.9rem" }}>{detail.studentName}</strong>
                    <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{detail.className}</span>
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{detail.teacherName}</div>
                  <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginTop: "0.15rem" }}>
                    {detail.reasons.map((reason, i) => (
                      <span key={i} style={{
                        padding: "0.2rem 0.6rem",
                        borderRadius: 99,
                        background: "rgba(217, 93, 57, 0.12)",
                        fontSize: "0.74rem",
                        color: "var(--destructive)",
                        fontWeight: 600,
                      }}>
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : summary.alerts.length ? (
            <div style={{ display: "grid", gap: "0.5rem" }}>
              {summary.alerts.map((alert) => (
                <div key={alert} className="card" style={{ padding: "0.85rem", background: "rgba(217, 93, 57, 0.08)", fontSize: "0.88rem" }}>
                  {alert}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
              {tr ? "Şu an kritik bir uyarı yok." : "No critical alerts right now."}
            </div>
          )}
        </div>
      </section>

      {/* User management + Announcement */}
      <section className="grid" style={{ gridTemplateColumns: "minmax(340px, 1.1fr) minmax(320px, 0.9fr)", gap: "1rem", alignItems: "start" }}>

        <div className="card" style={{ padding: "1rem", display: "grid", gap: "0.8rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", alignItems: "center", flexWrap: "wrap" }}>
            <strong>{tr ? "Kullanıcı ve rol yönetimi" : "User and role management"}</strong>
            <a className="button button-secondary" href="/api/institution-admin/export">
              {tr ? "CSV dışa aktar" : "Export CSV"}
            </a>
          </div>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={tr ? "İsim veya email ara" : "Search by name or email"}
            style={{ padding: "0.85rem", borderRadius: 14, border: "1px solid var(--line)" }}
          />
          {notice ? <p style={{ color: "var(--success)", margin: 0 }}>{notice}</p> : null}
          {error ? <p style={{ color: "var(--accent-deep)", margin: 0 }}>{error}</p> : null}
          <div className="grid" style={{ gap: "0.7rem" }}>
            {users.slice(0, 20).map((user) => (
              <div key={user.id} className="card" style={{ padding: "0.9rem", background: "var(--surface-strong)", display: "grid", gap: "0.55rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", alignItems: "center", flexWrap: "wrap" }}>
                  <div>
                    <strong>{user.name}</strong>
                    <div className="practice-meta">{user.email}</div>
                    <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap", marginTop: "0.45rem" }}>
                      <span className="pill">
                        {user.memberType === "teacher"
                          ? tr ? "Öğretmen" : "Teacher"
                          : user.memberType === "school"
                          ? tr ? "Kurum" : "School"
                          : tr ? "Öğrenci" : "Student"}
                      </span>
                      {user.organizationName ? <span className="pill">{user.organizationName}</span> : null}
                    </div>
                  </div>
                  <span className="pill">{user.plan.toUpperCase()}</span>
                </div>
                <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                  <button type="button" className="button button-secondary" onClick={() => updateAccess(user.id, { teacherAccess: !user.teacherAccess })}>
                    {user.teacherAccess ? (tr ? "Öğretmen yetkisini kaldır" : "Remove teacher") : tr ? "Öğretmen yap" : "Make teacher"}
                  </button>
                  <button type="button" className="button button-secondary" onClick={() => updateAccess(user.id, { adminAccess: !user.adminAccess })}>
                    {user.adminAccess ? (tr ? "Admin yetkisini kaldır" : "Remove admin") : tr ? "Admin yap" : "Make admin"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: "1rem", display: "grid", gap: "0.8rem" }}>
          <strong>{tr ? "Toplu duyuru" : "Broadcast announcement"}</strong>
          <input
            value={announcementTitle}
            onChange={(event) => setAnnouncementTitle(event.target.value)}
            placeholder={tr ? "Duyuru başlığı" : "Announcement title"}
            style={{ padding: "0.85rem", borderRadius: 14, border: "1px solid var(--line)" }}
          />
          <textarea
            value={announcementBody}
            onChange={(event) => setAnnouncementBody(event.target.value)}
            rows={5}
            placeholder={tr ? "Tüm platform kullanıcılarına gidecek duyuru..." : "Announcement that will be shown to platform users..."}
            style={{ padding: "0.85rem", borderRadius: 14, border: "1px solid var(--line)", resize: "vertical" }}
          />
          <button type="button" className="button button-primary" onClick={sendAnnouncement}>
            {tr ? "Duyuruyu gönder" : "Send announcement"}
          </button>
        </div>
      </section>
    </div>
  );
}

function AdminStat({ icon, title, value, highlight }: { icon: string; title: string; value: string; highlight?: boolean }) {
  return (
    <div className="card" style={{
      padding: "1rem",
      background: highlight ? "rgba(217, 93, 57, 0.06)" : "var(--surface-strong)",
      borderLeft: highlight ? "3px solid var(--destructive)" : undefined,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--muted)", marginBottom: "0.4rem", fontSize: "0.82rem" }}>
        <span>{icon}</span>
        <span>{title}</span>
      </div>
      <div style={{ fontSize: "1.75rem", fontWeight: 800, lineHeight: 1 }}>{value}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card" style={{ padding: "0.65rem" }}>
      <div className="practice-meta">{label}</div>
      <strong>{value}</strong>
    </div>
  );
}
