"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAppState } from "@/components/providers";

type TeacherSummary = {
  teacher: { id: string; name: string; email: string };
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
  mostCommonWeakestSkill: string | null;
};

type ClassSummary = {
  id: string;
  name: string;
  teacherId: string;
  teacherName: string;
  joinCode: string;
  studentCount: number;
  activeStudents: number;
  averageScore: number;
  pendingApprovals: number;
  homeworkAssignedCount: number;
  overdueHomeworkCount: number;
  lastActivityAt: string | null;
};

type StudentSummary = {
  id: string;
  name: string;
  email: string;
  plan: string;
  classCount: number;
  sessionCount: number;
  averageScore: number | null;
  lastSessionAt: string | null;
  teacherNames: string[];
  homeworkCompletionRate: number;
  riskFlag: string | null;
};

type InstitutionSummary = {
  orgId?: string;
  orgName?: string;
  totalTeachers: number;
  totalClasses: number;
  totalStudents: number;
  activeStudents: number;
  pendingApprovals: number;
  atRiskStudents: number;
  averageScore: number;
  teacherSummaries: TeacherSummary[];
  classSummaries: ClassSummary[];
  students: StudentSummary[];
  alerts: string[];
};

type InviteItem = {
  id: string;
  orgId: string;
  email?: string | null;
  role: "teacher" | "admin" | "student";
  inviteCode: string;
  createdBy: string;
  expiresAt: string;
  createdAt: string;
};

type UserSummary = {
  id: string;
  email: string;
  name: string;
  memberType: string;
  plan: string;
  adminAccess?: boolean;
  teacherAccess?: boolean;
};

type AnnouncementItem = {
  id: string;
  audienceType: "global" | "teacher" | "class";
  title: string;
  body: string;
  createdAt: string;
};

const empty: InstitutionSummary = {
  totalTeachers: 0,
  totalClasses: 0,
  totalStudents: 0,
  activeStudents: 0,
  pendingApprovals: 0,
  atRiskStudents: 0,
  averageScore: 0,
  teacherSummaries: [],
  classSummaries: [],
  students: [],
  alerts: [],
};

type Tab = "overview" | "teachers" | "classes" | "students" | "access" | "announcements";

export function InstitutionAdminPanel() {
  const { language } = useAppState();
  const tr = language === "tr";
  const [summary, setSummary] = useState<InstitutionSummary>(empty);
  const [tab, setTab] = useState<Tab>("overview");
  const [teacherSearch, setTeacherSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [classSearch, setClassSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [invites, setInvites] = useState<InviteItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<InviteItem["role"]>("teacher");
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementBody, setAnnouncementBody] = useState("");

  const loadSummary = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/institution-admin/summary");
      const data = (await response.json()) as InstitutionSummary & { error?: string };
      if (!response.ok || data.error) {
        throw new Error(data.error ?? (tr ? "Kurum verisi yüklenemedi." : "Could not load institution data."));
      }
      setSummary({ ...empty, ...data });
    } catch (err) {
      setError(err instanceof Error ? err.message : tr ? "Kurum verisi yüklenemedi." : "Could not load institution data.");
    } finally {
      setLoading(false);
    }
  };

  const loadAccessData = async () => {
    try {
      const [usersResponse, invitesResponse] = await Promise.all([
        fetch("/api/institution-admin/users"),
        fetch("/api/institution-admin/invites"),
      ]);
      const usersData = (await usersResponse.json()) as { users?: UserSummary[] };
      const invitesData = (await invitesResponse.json()) as { invites?: InviteItem[] };
      setUsers(usersData.users ?? []);
      setInvites(invitesData.invites ?? []);
    } catch {
      setUsers([]);
      setInvites([]);
    }
  };

  const loadAnnouncements = async () => {
    try {
      const response = await fetch("/api/announcements");
      const data = (await response.json()) as { announcements?: AnnouncementItem[] };
      setAnnouncements((data.announcements ?? []).filter((item) => item.audienceType === "teacher"));
    } catch {
      setAnnouncements([]);
    }
  };

  useEffect(() => {
    void loadSummary();
  }, [tr]);

  useEffect(() => {
    if (tab === "access") void loadAccessData();
    if (tab === "announcements") void loadAnnouncements();
  }, [tab]);

  const filteredTeachers = useMemo(
    () => teacherSearch
      ? summary.teacherSummaries.filter((item) => `${item.teacher.name} ${item.teacher.email}`.toLowerCase().includes(teacherSearch.toLowerCase()))
      : summary.teacherSummaries,
    [summary.teacherSummaries, teacherSearch]
  );

  const filteredStudents = useMemo(
    () => studentSearch
      ? summary.students.filter((item) => `${item.name} ${item.email}`.toLowerCase().includes(studentSearch.toLowerCase()))
      : summary.students,
    [studentSearch, summary.students]
  );

  const filteredClasses = useMemo(
    () => classSearch
      ? summary.classSummaries.filter((item) => `${item.name} ${item.teacherName}`.toLowerCase().includes(classSearch.toLowerCase()))
      : summary.classSummaries,
    [classSearch, summary.classSummaries]
  );

  const createInvite = async () => {
    setNotice("");
    setError("");
    const response = await fetch("/api/institution-admin/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail || undefined, role: inviteRole }),
    });
    const data = (await response.json()) as { invite?: InviteItem; error?: string };
    if (!response.ok || !data.invite) {
      setError(data.error ?? (tr ? "Davet oluşturulamadı." : "Could not create invite."));
      return;
    }
    setInvites((cur) => [data.invite!, ...cur]);
    setInviteEmail("");
    setNotice(tr ? "Davet oluşturuldu." : "Invite created.");
  };

  const updateAccess = async (userId: string, patch: Partial<Pick<UserSummary, "adminAccess" | "teacherAccess">>) => {
    setNotice("");
    setError("");
    const response = await fetch("/api/institution-admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...patch }),
    });
    const data = (await response.json()) as { user?: UserSummary; error?: string };
    if (!response.ok || !data.user) {
      setError(data.error ?? (tr ? "Yetki güncellenemedi." : "Could not update access."));
      return;
    }
    setUsers((cur) => cur.map((item) => (item.id === userId ? { ...item, ...data.user } : item)));
    setNotice(tr ? "Yetki güncellendi." : "Access updated.");
  };

  const sendAnnouncement = async () => {
    setNotice("");
    setError("");
    const response = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audienceType: "teacher", title: announcementTitle, body: announcementBody }),
    });
    const data = (await response.json()) as { announcement?: AnnouncementItem; error?: string };
    if (!response.ok || !data.announcement) {
      setError(data.error ?? (tr ? "Duyuru gönderilemedi." : "Could not send announcement."));
      return;
    }
    setAnnouncementTitle("");
    setAnnouncementBody("");
    setAnnouncements((cur) => [data.announcement!, ...cur]);
    setNotice(tr ? "Duyuru gönderildi." : "Announcement sent.");
  };

  if (loading) {
    return (
      <main className="page-shell section">
        <div className="card" style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}>
          {tr ? "Kurum paneli yükleniyor…" : "Loading institution control…"}
        </div>
      </main>
    );
  }

  const setupCard = !summary.totalTeachers
    ? (tr ? "İlk öğretmeni davet ederek kurum yapısını başlatın." : "Start by inviting your first teacher.")
    : !summary.totalClasses
      ? (tr ? "Öğretmenler sınıf oluşturduğunda class görünümü burada dolacak." : "Class visibility will fill in once teachers create classes.")
      : !summary.totalStudents
        ? (tr ? "Öğrenciler sınıflara bağlandığında öğrenci analitiği burada açılacak." : "Student analytics will appear once learners join classes.")
        : "";

  return (
    <main className="page-shell section" style={{ display: "grid", gap: "1rem" }}>
      <section className="card" style={{ padding: "1.4rem", display: "grid", gap: "0.65rem" }}>
        <span className="eyebrow">{tr ? "Institution control" : "Institution control"}</span>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.8rem" }}>{summary.orgName ?? (tr ? "Kurum paneli" : "Institution control")}</h1>
            <p style={{ margin: "0.25rem 0 0", color: "var(--muted)" }}>
              {tr ? "Öğretmenleri, sınıfları, öğrencileri ve kurum aksiyonlarını tek merkezden yönetin." : "Manage teachers, classes, students, and institution actions from one control center."}
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            <a className="button button-secondary" href="/api/institution-admin/export">{tr ? "CSV dışa aktar" : "Export CSV"}</a>
            <button type="button" className="button button-secondary" onClick={() => setTab("access")}>{tr ? "Davet ve erişim" : "Invites & access"}</button>
          </div>
        </div>
      </section>

      {(notice || error) && (
        <section className="card" style={{ padding: "0.9rem", color: error ? "var(--destructive)" : "var(--success)" }}>
          {error || notice}
        </section>
      )}

      {setupCard && (
        <section className="card" style={{ padding: "1rem", borderLeft: "3px solid var(--accent)" }}>
          <strong>{tr ? "Sonraki adım" : "Next step"}</strong>
          <p style={{ margin: "0.35rem 0 0", color: "var(--muted)" }}>{setupCard}</p>
        </section>
      )}

      {summary.alerts.length > 0 && (
        <section className="card" style={{ padding: "1rem", display: "grid", gap: "0.35rem" }}>
          <strong>{tr ? "Kurumsal uyarılar" : "Institution alerts"}</strong>
          {summary.alerts.map((item, index) => <div key={index} style={{ color: "var(--muted)" }}>• {item}</div>)}
        </section>
      )}

      <section className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.8rem" }}>
        <Metric label={tr ? "Öğretmen" : "Teachers"} value={String(summary.totalTeachers)} />
        <Metric label={tr ? "Sınıf" : "Classes"} value={String(summary.totalClasses)} />
        <Metric label={tr ? "Öğrenci" : "Students"} value={String(summary.totalStudents)} />
        <Metric label={tr ? "Aktif öğrenci" : "Active students"} value={String(summary.activeStudents)} />
        <Metric label={tr ? "Bekleyen onay" : "Pending approvals"} value={String(summary.pendingApprovals)} />
        <Metric label={tr ? "Riskli öğrenci" : "At-risk students"} value={String(summary.atRiskStudents)} />
        <Metric label={tr ? "Ort. skor" : "Average score"} value={summary.averageScore ? summary.averageScore.toFixed(1) : "—"} />
      </section>

      <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--line)", paddingBottom: "0.45rem", flexWrap: "wrap" }}>
        {([
          ["overview", tr ? "Genel bakış" : "Overview"],
          ["teachers", tr ? "Öğretmenler" : "Teachers"],
          ["classes", tr ? "Sınıflar" : "Classes"],
          ["students", tr ? "Öğrenciler" : "Students"],
          ["access", tr ? "Davet & erişim" : "Invites & access"],
          ["announcements", tr ? "Duyurular" : "Announcements"],
        ] as Array<[Tab, string]>).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className="button button-secondary"
            style={{
              background: tab === id ? "var(--accent)" : "transparent",
              color: tab === id ? "#fff" : "var(--text)",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <section className="grid" style={{ gridTemplateColumns: "minmax(320px, 1fr) minmax(320px, 1fr)", gap: "1rem", alignItems: "start" }}>
          <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
            <strong>{tr ? "En aktif öğretmenler" : "Most active teachers"}</strong>
            {summary.teacherSummaries.length ? summary.teacherSummaries.slice(0, 5).map((item) => (
              <Link key={item.teacher.id} href={`/app/institution-admin/teachers/${item.teacher.id}` as Route} className="card" style={{ padding: "0.9rem", background: "var(--surface-strong)", display: "grid", gap: "0.3rem", color: "inherit", textDecoration: "none" }}>
                <strong>{item.teacher.name}</strong>
                <div className="practice-meta">{item.classCount} {tr ? "sınıf" : "classes"} · {item.studentCount} {tr ? "öğrenci" : "students"}</div>
                <div className="practice-meta">{tr ? "Atanan ödev" : "Homework"}: {item.homeworkAssignedCount} · {tr ? "Geciken" : "Overdue"}: {item.overdueHomeworkCount}</div>
              </Link>
            )) : <Empty text={tr ? "Henüz öğretmen yok." : "No teachers yet."} />}
          </div>

          <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
            <strong>{tr ? "Son aktif öğrenciler" : "Recently active students"}</strong>
            {summary.students.length ? summary.students.slice(0, 8).map((item) => (
              <Link key={item.id} href={`/app/institution-admin/students/${item.id}` as Route} className="card" style={{ padding: "0.9rem", background: "var(--surface-strong)", display: "grid", gap: "0.3rem", color: "inherit", textDecoration: "none" }}>
                <strong>{item.name}</strong>
                <div className="practice-meta">{item.teacherNames.join(", ") || "—"}</div>
                <div className="practice-meta">{tr ? "Son session" : "Last session"}: {item.lastSessionAt ? new Date(item.lastSessionAt).toLocaleDateString(tr ? "tr-TR" : "en-US") : "—"}</div>
              </Link>
            )) : <Empty text={tr ? "Henüz öğrenci yok." : "No students yet."} />}
          </div>
        </section>
      )}

      {tab === "teachers" && (
        <section className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", flexWrap: "wrap" }}>
            <strong>{tr ? "Öğretmen gözetimi" : "Teacher oversight"}</strong>
            <input value={teacherSearch} onChange={(e) => setTeacherSearch(e.target.value)} placeholder={tr ? "İsim veya e-posta ara…" : "Search by name or email…"} style={inputStyle} />
          </div>
          {filteredTeachers.length ? filteredTeachers.map((item) => (
            <Link key={item.teacher.id} href={`/app/institution-admin/teachers/${item.teacher.id}` as Route} className="card" style={{ padding: "1rem", background: "var(--surface-strong)", display: "grid", gap: "0.5rem", color: "inherit", textDecoration: "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", flexWrap: "wrap" }}>
                <div>
                  <strong>{item.teacher.name}</strong>
                  <div className="practice-meta">{item.teacher.email}</div>
                </div>
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                  {item.atRiskStudentCount > 0 ? <span className="risk-pill">{item.atRiskStudentCount} {tr ? "risk" : "at risk"}</span> : null}
                  {item.pendingApprovalCount > 0 ? <span className="pill">{item.pendingApprovalCount} {tr ? "bekliyor" : "pending"}</span> : null}
                </div>
              </div>
              <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "0.45rem" }}>
                <Metric label={tr ? "Sınıf" : "Classes"} value={String(item.classCount)} />
                <Metric label={tr ? "Öğrenci" : "Students"} value={String(item.studentCount)} />
                <Metric label={tr ? "Aktif" : "Active"} value={String(item.activeStudents)} />
                <Metric label={tr ? "Ort." : "Avg"} value={item.averageScore ? item.averageScore.toFixed(1) : "—"} />
                <Metric label={tr ? "Atanan ödev" : "HW assigned"} value={String(item.homeworkAssignedCount)} />
                <Metric label={tr ? "Tamamlama" : "Completion"} value={`${Math.round(item.homeworkCompletionRate)}%`} />
              </div>
            </Link>
          )) : <Empty text={tr ? "Öğretmen bulunamadı." : "No teachers found."} />}
        </section>
      )}

      {tab === "classes" && (
        <section className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", flexWrap: "wrap" }}>
            <strong>{tr ? "Sınıf görünümü" : "Class oversight"}</strong>
            <input value={classSearch} onChange={(e) => setClassSearch(e.target.value)} placeholder={tr ? "Sınıf veya öğretmen ara…" : "Search class or teacher…"} style={inputStyle} />
          </div>
          {filteredClasses.length ? filteredClasses.map((item) => (
            <div key={item.id} className="card" style={{ padding: "1rem", background: "var(--surface-strong)", display: "grid", gap: "0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", flexWrap: "wrap" }}>
                <div>
                  <strong>{item.name}</strong>
                  <div className="practice-meta">{item.teacherName}</div>
                </div>
                <span className="pill">{item.joinCode}</span>
              </div>
              <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "0.45rem" }}>
                <Metric label={tr ? "Öğrenci" : "Students"} value={String(item.studentCount)} />
                <Metric label={tr ? "Aktif" : "Active"} value={String(item.activeStudents)} />
                <Metric label={tr ? "Ort." : "Avg"} value={item.averageScore ? item.averageScore.toFixed(1) : "—"} />
                <Metric label={tr ? "Bekleyen" : "Pending"} value={String(item.pendingApprovals)} />
                <Metric label={tr ? "Ödev" : "Homework"} value={String(item.homeworkAssignedCount)} />
                <Metric label={tr ? "Geciken" : "Overdue"} value={String(item.overdueHomeworkCount)} />
              </div>
            </div>
          )) : <Empty text={tr ? "Sınıf bulunamadı." : "No classes found."} />}
        </section>
      )}

      {tab === "students" && (
        <section className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", flexWrap: "wrap" }}>
            <strong>{tr ? "Öğrenci görünümü" : "Student oversight"}</strong>
            <input value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} placeholder={tr ? "İsim veya e-posta ara…" : "Search by name or email…"} style={inputStyle} />
          </div>
          {filteredStudents.length ? filteredStudents.map((item) => (
            <Link key={item.id} href={`/app/institution-admin/students/${item.id}` as Route} className="card" style={{ padding: "1rem", background: "var(--surface-strong)", display: "grid", gap: "0.45rem", color: "inherit", textDecoration: "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", flexWrap: "wrap" }}>
                <div>
                  <strong>{item.name}</strong>
                  <div className="practice-meta">{item.email}</div>
                </div>
                {item.riskFlag ? <span className="risk-pill">{item.riskFlag}</span> : null}
              </div>
              <div className="practice-meta">{item.teacherNames.join(", ") || "—"}</div>
              <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "0.45rem" }}>
                <Metric label={tr ? "Session" : "Sessions"} value={String(item.sessionCount)} />
                <Metric label={tr ? "Sınıf" : "Classes"} value={String(item.classCount)} />
                <Metric label={tr ? "Ort." : "Avg"} value={item.averageScore ? item.averageScore.toFixed(1) : "—"} />
                <Metric label={tr ? "Ödev" : "HW done"} value={`${item.homeworkCompletionRate}%`} />
              </div>
            </Link>
          )) : <Empty text={tr ? "Öğrenci bulunamadı." : "No students found."} />}
        </section>
      )}

      {tab === "access" && (
        <section className="grid" style={{ gridTemplateColumns: "minmax(320px, 0.8fr) minmax(360px, 1.2fr)", gap: "1rem", alignItems: "start" }}>
          <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
            <strong>{tr ? "Yeni davet oluştur" : "Create a new invite"}</strong>
            <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as InviteItem["role"])} style={inputStyle}>
              <option value="teacher">{tr ? "Öğretmen" : "Teacher"}</option>
              <option value="admin">{tr ? "Kurum admini" : "School admin"}</option>
              <option value="student">{tr ? "Öğrenci" : "Student"}</option>
            </select>
            <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder={tr ? "E-posta (opsiyonel)" : "Email (optional)"} style={inputStyle} />
            <button type="button" className="button button-primary" onClick={createInvite}>{tr ? "Davet oluştur" : "Create invite"}</button>
            <div style={{ display: "grid", gap: "0.5rem" }}>
              <strong style={{ fontSize: "0.95rem" }}>{tr ? "Bekleyen davetler" : "Pending invites"}</strong>
              {invites.length ? invites.map((item) => (
                <div key={item.id} className="card" style={{ padding: "0.8rem", background: "var(--surface-strong)", display: "grid", gap: "0.25rem" }}>
                  <div><strong>{item.role}</strong> · {item.email || (tr ? "Genel kullanım" : "General use")}</div>
                  <div className="practice-meta">{item.inviteCode}</div>
                </div>
              )) : <Empty text={tr ? "Bekleyen davet yok." : "No pending invites."} />}
            </div>
          </div>

          <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
            <strong>{tr ? "Üyeler ve erişim" : "Members and access"}</strong>
            {users.length ? users.map((item) => (
              <div key={item.id} className="card" style={{ padding: "0.9rem", background: "var(--surface-strong)", display: "grid", gap: "0.5rem" }}>
                <div>
                  <strong>{item.name}</strong>
                  <div className="practice-meta">{item.email}</div>
                </div>
                <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
                  <button type="button" className="button button-secondary" onClick={() => updateAccess(item.id, { teacherAccess: !item.teacherAccess })}>
                    {item.teacherAccess ? (tr ? "Teacher kapat" : "Disable teacher") : (tr ? "Teacher aç" : "Enable teacher")}
                  </button>
                  <button type="button" className="button button-secondary" onClick={() => updateAccess(item.id, { adminAccess: !item.adminAccess, teacherAccess: !item.adminAccess ? true : item.teacherAccess })}>
                    {item.adminAccess ? (tr ? "Admin kapat" : "Disable admin") : (tr ? "Admin aç" : "Enable admin")}
                  </button>
                </div>
              </div>
            )) : <Empty text={tr ? "Üye bulunamadı." : "No members found."} />}
          </div>
        </section>
      )}

      {tab === "announcements" && (
        <section className="grid" style={{ gridTemplateColumns: "minmax(320px, 0.9fr) minmax(360px, 1.1fr)", gap: "1rem", alignItems: "start" }}>
          <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
            <strong>{tr ? "Kurum duyurusu" : "Institution announcement"}</strong>
            <input value={announcementTitle} onChange={(e) => setAnnouncementTitle(e.target.value)} placeholder={tr ? "Başlık" : "Title"} style={inputStyle} />
            <textarea value={announcementBody} onChange={(e) => setAnnouncementBody(e.target.value)} rows={5} placeholder={tr ? "Öğretmenlere gidecek duyuru…" : "Announcement for teachers…"} style={textareaStyle} />
            <button type="button" className="button button-primary" onClick={sendAnnouncement}>{tr ? "Gönder" : "Send"}</button>
          </div>

          <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
            <strong>{tr ? "Son duyurular" : "Recent announcements"}</strong>
            {announcements.length ? announcements.map((item) => (
              <div key={item.id} className="card" style={{ padding: "0.9rem", background: "var(--surface-strong)", display: "grid", gap: "0.3rem" }}>
                <strong>{item.title}</strong>
                <div className="practice-meta">{new Date(item.createdAt).toLocaleDateString(tr ? "tr-TR" : "en-US")}</div>
                <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.6 }}>{item.body}</p>
              </div>
            )) : <Empty text={tr ? "Henüz duyuru yok." : "No announcements yet."} />}
          </div>
        </section>
      )}
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="card teacher-stat-card" style={{ padding: "0.85rem" }}>
      <div style={{ color: "var(--muted)", fontSize: "0.8rem", marginBottom: "0.2rem" }}>{label}</div>
      <strong>{value}</strong>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p style={{ margin: 0, color: "var(--muted)" }}>{text}</p>;
}

const inputStyle = {
  padding: "0.8rem",
  borderRadius: 14,
  border: "1px solid var(--line)",
  background: "var(--surface)",
  color: "var(--text)",
  font: "inherit",
} as const;

const textareaStyle = {
  ...inputStyle,
  resize: "vertical" as const,
};
