"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppState } from "@/components/providers";

// ── Types ──────────────────────────────────────────────────────────────────

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
  students: StudentSummary[];
  alerts: string[];
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
  students: [],
  alerts: [],
};

type Tab = "overview" | "teachers" | "students";

// ── Component ──────────────────────────────────────────────────────────────

export function InstitutionAdminPanel() {
  const { language } = useAppState();
  const tr = language === "tr";

  const [summary, setSummary] = useState<InstitutionSummary>(empty);
  const [tab, setTab] = useState<Tab>("overview");
  const [studentSearch, setStudentSearch] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch("/api/institution-admin/summary")
      .then((r) => r.json())
      .then((data: InstitutionSummary & { error?: string }) => {
        if (data.error) throw new Error(data.error);
        setSummary(data);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : tr ? "Veri yüklenemedi." : "Could not load data."))
      .finally(() => setLoading(false));
  }, [tr]);

  const filteredTeachers = useMemo(() =>
    teacherSearch
      ? summary.teacherSummaries.filter((t) =>
          `${t.teacher.name} ${t.teacher.email}`.toLowerCase().includes(teacherSearch.toLowerCase()))
      : summary.teacherSummaries,
    [teacherSearch, summary.teacherSummaries]
  );

  const filteredStudents = useMemo(() =>
    studentSearch
      ? summary.students.filter((s) =>
          `${s.name} ${s.email}`.toLowerCase().includes(studentSearch.toLowerCase()))
      : summary.students,
    [studentSearch, summary.students]
  );

  if (loading) {
    return (
      <main className="page-shell section">
        <div className="card" style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}>
          {tr ? "Kurumsal veriler yükleniyor…" : "Loading institution data…"}
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell section" style={{ display: "grid", gap: "1rem" }}>

      {/* Header */}
      <section className="card" style={{ padding: "1.4rem", display: "grid", gap: "0.6rem" }}>
        <span className="eyebrow">{tr ? "Kurum yönetimi" : "Institution management"}</span>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.6rem" }}>
              {summary.orgName ?? (tr ? "Kurumunuz" : "Your Institution")}
            </h1>
            <p style={{ margin: "0.25rem 0 0", color: "var(--muted)", fontSize: "0.9rem" }}>
              {tr
                ? "Öğretmenlerinizi, sınıflarınızı ve öğrencilerinizi buradan takip edin."
                : "Monitor your teachers, classes, and students from here."}
            </p>
          </div>
          <a className="button button-secondary" href="/api/institution-admin/export" style={{ alignSelf: "center" }}>
            {tr ? "CSV dışa aktar" : "Export CSV"}
          </a>
        </div>
      </section>

      {/* Error */}
      {error && (
        <section className="card" style={{ padding: "1rem", borderLeft: "3px solid var(--accent-deep)" }}>
          <p style={{ margin: 0, color: "var(--accent-deep)" }}>{error}</p>
        </section>
      )}

      {/* Alerts */}
      {summary.alerts.length > 0 && (
        <section className="card" style={{ padding: "1rem", display: "grid", gap: "0.4rem", borderLeft: "3px solid #f59e0b" }}>
          <strong style={{ fontSize: "0.85rem" }}>{tr ? "Dikkat gerektiren durumlar" : "Needs attention"}</strong>
          {summary.alerts.map((a, i) => (
            <div key={i} style={{ fontSize: "0.875rem", color: "var(--muted)" }}>• {a}</div>
          ))}
        </section>
      )}

      {/* Stat strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "0.75rem" }}>
        <StatCard label={tr ? "Öğretmen" : "Teachers"} value={summary.totalTeachers} />
        <StatCard label={tr ? "Sınıf" : "Classes"} value={summary.totalClasses} />
        <StatCard label={tr ? "Öğrenci" : "Students"} value={summary.totalStudents} />
        <StatCard label={tr ? "Aktif öğrenci" : "Active"} value={summary.activeStudents} />
        <StatCard label={tr ? "Ort. skor" : "Avg score"} value={summary.averageScore > 0 ? summary.averageScore.toFixed(1) : "—"} />
        {summary.pendingApprovals > 0 && (
          <StatCard label={tr ? "Bekleyen onay" : "Pending"} value={summary.pendingApprovals} accent />
        )}
        {summary.atRiskStudents > 0 && (
          <StatCard label={tr ? "Risk altında" : "At risk"} value={summary.atRiskStudents} accent />
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--line)", paddingBottom: "0.5rem" }}>
        {(["overview", "teachers", "students"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: 10,
              border: "none",
              background: tab === t ? "var(--accent)" : "transparent",
              color: tab === t ? "#fff" : "var(--muted)",
              fontWeight: tab === t ? 600 : 400,
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            {t === "overview"
              ? (tr ? "Genel bakış" : "Overview")
              : t === "teachers"
              ? (tr ? `Öğretmenler (${summary.totalTeachers})` : `Teachers (${summary.totalTeachers})`)
              : (tr ? `Öğrenciler (${summary.totalStudents})` : `Students (${summary.totalStudents})`)}
          </button>
        ))}
      </div>

      {/* ── Tab: Overview ── */}
      {tab === "overview" && (
        <div style={{ display: "grid", gap: "1rem" }}>
          <section className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
            <strong>{tr ? "En aktif öğretmenler" : "Most active teachers"}</strong>
            {summary.teacherSummaries.length === 0
              ? <Empty text={tr ? "Henüz öğretmen yok." : "No teachers yet."} />
              : summary.teacherSummaries.slice(0, 5).map((t) => <TeacherRow key={t.teacher.id} t={t} tr={tr} />)
            }
            {summary.teacherSummaries.length > 5 && (
              <button type="button" className="button button-secondary" onClick={() => setTab("teachers")} style={{ justifySelf: "start" }}>
                {tr ? `Tümünü gör (${summary.teacherSummaries.length})` : `View all (${summary.teacherSummaries.length})`}
              </button>
            )}
          </section>

          <section className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
            <strong>{tr ? "Son aktif öğrenciler" : "Recently active students"}</strong>
            {summary.students.length === 0
              ? <Empty text={tr ? "Henüz öğrenci verisi yok." : "No student data yet."} />
              : [...summary.students]
                  .sort((a, b) => (b.lastSessionAt ?? "").localeCompare(a.lastSessionAt ?? ""))
                  .slice(0, 8)
                  .map((s) => <StudentRow key={s.id} s={s} tr={tr} />)
            }
            {summary.students.length > 8 && (
              <button type="button" className="button button-secondary" onClick={() => setTab("students")} style={{ justifySelf: "start" }}>
                {tr ? `Tüm öğrenciler (${summary.students.length})` : `All students (${summary.students.length})`}
              </button>
            )}
          </section>
        </div>
      )}

      {/* ── Tab: Teachers ── */}
      {tab === "teachers" && (
        <section className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
            <strong>{tr ? "Tüm öğretmenler" : "All teachers"}</strong>
            <input value={teacherSearch} onChange={(e) => setTeacherSearch(e.target.value)}
              placeholder={tr ? "İsim veya e-posta ara…" : "Search…"} style={inputStyle} />
          </div>
          {filteredTeachers.length === 0 && <Empty text={tr ? "Öğretmen bulunamadı." : "No teachers found."} />}
          {filteredTeachers.map((t) => (
            <div key={t.teacher.id} className="card" style={{ padding: "1rem", background: "var(--surface-strong)", display: "grid", gap: "0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <strong>{t.teacher.name}</strong>
                  <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{t.teacher.email}</div>
                </div>
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                  {(t.atRiskStudentCount ?? 0) > 0 && (
                    <span className="pill" style={{ background: "var(--accent-deep)", color: "#fff" }}>
                      {t.atRiskStudentCount} {tr ? "risk" : "at risk"}
                    </span>
                  )}
                  {(t.pendingApprovalCount ?? 0) > 0 && (
                    <span className="pill">{t.pendingApprovalCount} {tr ? "bekliyor" : "pending"}</span>
                  )}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "0.45rem" }}>
                <MiniStat label={tr ? "Sınıf" : "Classes"} value={String(t.classCount)} />
                <MiniStat label={tr ? "Öğrenci" : "Students"} value={String(t.studentCount)} />
                <MiniStat label={tr ? "Aktif" : "Active"} value={String(t.activeStudents)} />
                <MiniStat label={tr ? "Ort. skor" : "Avg score"} value={t.averageScore > 0 ? t.averageScore.toFixed(1) : "—"} />
                {t.homeworkCompletionRate !== undefined && (
                  <MiniStat label={tr ? "Ödev tamamlama" : "HW done"} value={`${Math.round(t.homeworkCompletionRate)}%`} />
                )}
                {t.mostCommonWeakestSkill && (
                  <MiniStat label={tr ? "Zayıf alan" : "Weak area"} value={t.mostCommonWeakestSkill} />
                )}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ── Tab: Students ── */}
      {tab === "students" && (
        <section className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
            <strong>{tr ? `Tüm öğrenciler (${filteredStudents.length})` : `All students (${filteredStudents.length})`}</strong>
            <input value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)}
              placeholder={tr ? "İsim veya e-posta ara…" : "Search…"} style={inputStyle} />
          </div>
          {filteredStudents.length === 0 && <Empty text={tr ? "Öğrenci bulunamadı." : "No students found."} />}
          {filteredStudents.map((s) => <StudentRow key={s.id} s={s} tr={tr} expanded />)}
        </section>
      )}
    </main>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function TeacherRow({ t, tr }: { t: TeacherSummary; tr: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", padding: "0.6rem 0", borderBottom: "1px solid var(--line)", flexWrap: "wrap" }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{t.teacher.name}</div>
        <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{t.teacher.email}</div>
      </div>
      <div style={{ display: "flex", gap: "1rem", fontSize: "0.8rem", color: "var(--muted)", flexWrap: "wrap" }}>
        <span>{t.classCount} {tr ? "sınıf" : "classes"}</span>
        <span>{t.studentCount} {tr ? "öğrenci" : "students"}</span>
        {t.averageScore > 0 && <span>{tr ? "ort." : "avg"} {t.averageScore.toFixed(1)}</span>}
        {(t.atRiskStudentCount ?? 0) > 0 && (
          <span style={{ color: "var(--accent-deep)", fontWeight: 600 }}>
            {t.atRiskStudentCount} {tr ? "risk" : "at risk"}
          </span>
        )}
      </div>
    </div>
  );
}

function StudentRow({ s, tr, expanded }: { s: StudentSummary; tr: boolean; expanded?: boolean }) {
  const scoreColor =
    s.averageScore == null ? "var(--muted)"
    : s.averageScore >= 7 ? "var(--success, #22c55e)"
    : s.averageScore >= 5 ? "inherit"
    : "var(--accent-deep)";

  return (
    <div className="card" style={{ padding: "0.9rem", background: "var(--surface-strong)", display: "grid", gap: "0.4rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <strong style={{ fontSize: "0.9rem" }}>{s.name}</strong>
          <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{s.email}</div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {s.averageScore != null && (
            <span style={{ fontWeight: 700, fontSize: "1.1rem", color: scoreColor }}>
              {s.averageScore.toFixed(1)}
            </span>
          )}
          <span className="pill">{s.plan.toUpperCase()}</span>
        </div>
      </div>

      {expanded ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "0.45rem", marginTop: "0.2rem" }}>
          <MiniStat label={tr ? "Oturum" : "Sessions"} value={String(s.sessionCount)} />
          <MiniStat label={tr ? "Sınıf" : "Classes"} value={String(s.classCount)} />
          <MiniStat label={tr ? "Son aktivite" : "Last active"} value={s.lastSessionAt ? relDate(s.lastSessionAt) : "—"} />
          {s.teacherNames.length > 0 && (
            <MiniStat label={tr ? "Öğretmenler" : "Teachers"} value={s.teacherNames.slice(0, 2).join(", ")} />
          )}
        </div>
      ) : (
        <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.78rem", color: "var(--muted)", flexWrap: "wrap" }}>
          <span>{s.sessionCount} {tr ? "oturum" : "sessions"}</span>
          <span>{s.classCount} {tr ? "sınıf" : "classes"}</span>
          {s.lastSessionAt && <span>{tr ? "son:" : "last:"} {relDate(s.lastSessionAt)}</span>}
          {s.teacherNames.length > 0 && <span>· {s.teacherNames[0]}</span>}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)" }}>
      <div style={{ fontSize: "0.75rem", color: accent ? "var(--accent-deep)" : "var(--muted)", marginBottom: "0.3rem" }}>{label}</div>
      <strong style={{ fontSize: "1.6rem", color: accent ? "var(--accent-deep)" : undefined }}>{value}</strong>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card" style={{ padding: "0.5rem 0.65rem" }}>
      <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginBottom: "0.15rem" }}>{label}</div>
      <strong style={{ fontSize: "0.85rem" }}>{value}</strong>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div style={{ color: "var(--muted)", fontSize: "0.875rem", padding: "0.5rem 0" }}>{text}</div>;
}

function relDate(iso: string): string {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d === 0) return "today";
  if (d === 1) return "1d ago";
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

const inputStyle: React.CSSProperties = {
  padding: "0.5rem 0.85rem",
  borderRadius: 10,
  border: "1px solid var(--line)",
  fontSize: "0.875rem",
  minWidth: 200,
};
