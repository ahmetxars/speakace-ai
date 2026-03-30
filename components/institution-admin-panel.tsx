"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppState } from "@/components/providers";
import { trackClientEvent } from "@/lib/analytics-client";
import type { InstitutionUserSummary } from "@/lib/types";

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
};

const emptySummary: InstitutionAdminSummary = {
  totalTeachers: 0,
  totalClasses: 0,
  totalStudents: 0,
  activeStudents: 0,
  pendingApprovals: 0,
  atRiskStudents: 0,
  averageScore: 0,
  teacherSummaries: [],
  alerts: []
};

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

  const updateAccess = async (userId: string, patch: { teacherAccess?: boolean; adminAccess?: boolean }) => {
    setError("");
    setNotice("");
    const response = await fetch("/api/institution-admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...patch })
    });
    const data = (await response.json()) as { user?: InstitutionUserSummary; error?: string };
    if (!response.ok || !data.user) {
      setError(data.error ?? (tr ? "Rol guncellenemedi." : "Could not update role."));
      return;
    }
    setUsers((current) => current.map((item) => (item.id === userId ? data.user! : item)));
    setNotice(tr ? "Kullanici yetkisi guncellendi." : "User access updated.");
  };

  const sendAnnouncement = async () => {
    setError("");
    setNotice("");
    const response = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        audienceType: "global",
        title: announcementTitle,
        body: announcementBody
      })
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(data.error ?? (tr ? "Duyuru gonderilemedi." : "Could not send announcement."));
      return;
    }
    setAnnouncementTitle("");
    setAnnouncementBody("");
    setNotice(tr ? "Duyuru gonderildi." : "Announcement sent.");
  };

  return (
    <div className="page-shell section" style={{ display: "grid", gap: "1rem" }}>
      <section className="card" style={{ padding: "1.4rem", display: "grid", gap: "0.8rem" }}>
        <span className="eyebrow">{tr ? "Kurum admin" : "Institution admin"}</span>
        <h1 style={{ margin: 0 }}>{tr ? "Üst seviye kurum kontrol paneli" : "High-level institution control panel"}</h1>
        <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
          {tr ? "Öğretmen yükü, sınıf hacmi, riskli öğrenciler ve bekleyen onaylar tek ekranda." : "Teacher load, class volume, at-risk students, and pending approvals in one place."}
        </p>
      </section>

      <section className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
        <AdminStat title={tr ? "Öğretmen" : "Teachers"} value={String(summary.totalTeachers)} />
        <AdminStat title={tr ? "Sınıf" : "Classes"} value={String(summary.totalClasses)} />
        <AdminStat title={tr ? "Öğrenci" : "Students"} value={String(summary.totalStudents)} />
        <AdminStat title={tr ? "Aktif öğrenci" : "Active students"} value={String(summary.activeStudents)} />
        <AdminStat title={tr ? "Bekleyen onay" : "Pending approvals"} value={String(summary.pendingApprovals)} />
        <AdminStat title={tr ? "Riskli öğrenci" : "At-risk students"} value={String(summary.atRiskStudents)} />
        <AdminStat title={tr ? "Ortalama skor" : "Average score"} value={summary.averageScore ? summary.averageScore.toFixed(1) : "-"} />
      </section>

      <section className="grid" style={{ gridTemplateColumns: "minmax(320px, 1.1fr) minmax(320px, 0.9fr)", gap: "1rem", alignItems: "start" }}>
        <div className="card" style={{ padding: "1rem", display: "grid", gap: "0.8rem" }}>
          <strong>{tr ? "Öğretmen rosterı" : "Teacher roster"}</strong>
          {rankedTeachers.map((item) => (
            <div key={item.teacher.id} className="card" style={{ padding: "0.9rem", background: "var(--surface-strong)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", alignItems: "center", flexWrap: "wrap" }}>
                <div>
                  <strong>{item.teacher.name}</strong>
                  <div className="practice-meta">{item.teacher.email}</div>
                </div>
                <span className="pill">{item.averageScore ? item.averageScore.toFixed(1) : "-"}</span>
              </div>
              <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "0.55rem", marginTop: "0.75rem" }}>
                <MiniStat label={tr ? "Sınıf" : "Classes"} value={String(item.classCount)} />
                <MiniStat label={tr ? "Öğrenci" : "Students"} value={String(item.studentCount)} />
                <MiniStat label={tr ? "Aktif" : "Active"} value={String(item.activeStudents)} />
                <MiniStat label={tr ? "Risk" : "Risk"} value={String(item.atRiskStudentCount ?? 0)} />
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: "1rem", display: "grid", gap: "0.8rem" }}>
          <strong>{tr ? "Kurum uyarı akışı" : "Institution alert feed"}</strong>
          {summary.alerts.length ? (
            summary.alerts.map((item) => (
              <div key={item} className="card" style={{ padding: "0.85rem", background: "rgba(217, 93, 57, 0.08)" }}>
                {item}
              </div>
            ))
          ) : (
            <div style={{ color: "var(--muted)" }}>{tr ? "Şu an kritik bir uyarı yok." : "No critical alerts right now."}</div>
          )}
        </div>
      </section>

      <section className="grid" style={{ gridTemplateColumns: "minmax(340px, 1.1fr) minmax(320px, 0.9fr)", gap: "1rem", alignItems: "start" }}>
        <div className="card" style={{ padding: "1rem", display: "grid", gap: "0.8rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", alignItems: "center", flexWrap: "wrap" }}>
            <strong>{tr ? "Kullanici ve rol yonetimi" : "User and role management"}</strong>
            <a className="button button-secondary" href="/api/institution-admin/export">
              {tr ? "CSV disa aktar" : "Export CSV"}
            </a>
          </div>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={tr ? "Isim veya email ara" : "Search by name or email"}
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
                  </div>
                  <span className="pill">{user.plan.toUpperCase()}</span>
                </div>
                <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                  <button type="button" className="button button-secondary" onClick={() => updateAccess(user.id, { teacherAccess: !user.teacherAccess })}>
                    {user.teacherAccess ? (tr ? "Teacher kaldir" : "Remove teacher") : tr ? "Teacher yap" : "Make teacher"}
                  </button>
                  <button type="button" className="button button-secondary" onClick={() => updateAccess(user.id, { adminAccess: !user.adminAccess })}>
                    {user.adminAccess ? (tr ? "Admin kaldir" : "Remove admin") : tr ? "Admin yap" : "Make admin"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: "1rem", display: "grid", gap: "0.8rem" }}>
          <strong>{tr ? "Toplu duyuru" : "Broadcast announcement"}</strong>
          <input value={announcementTitle} onChange={(event) => setAnnouncementTitle(event.target.value)} placeholder={tr ? "Duyuru basligi" : "Announcement title"} style={{ padding: "0.85rem", borderRadius: 14, border: "1px solid var(--line)" }} />
          <textarea value={announcementBody} onChange={(event) => setAnnouncementBody(event.target.value)} rows={5} placeholder={tr ? "Tum platform kullanicilarina gidecek duyuru..." : "Announcement that will be shown to platform users..."} style={{ padding: "0.85rem", borderRadius: 14, border: "1px solid var(--line)", resize: "vertical" }} />
          <button type="button" className="button button-primary" onClick={sendAnnouncement}>
            {tr ? "Duyuruyu gonder" : "Send announcement"}
          </button>
        </div>
      </section>
    </div>
  );
}

function AdminStat({ title, value }: { title: string; value: string }) {
  return (
    <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)" }}>
      <div style={{ color: "var(--muted)", marginBottom: "0.35rem" }}>{title}</div>
      <div style={{ fontSize: "1.7rem", fontWeight: 800 }}>{value}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card" style={{ padding: "0.7rem" }}>
      <div className="practice-meta">{label}</div>
      <strong>{value}</strong>
    </div>
  );
}
