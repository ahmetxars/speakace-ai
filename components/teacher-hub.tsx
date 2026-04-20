"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { useAppState } from "@/components/providers";
import { listPromptsForTask } from "@/lib/prompts";
import { ExamType, HomeworkAutoAssignRule, SharedClassStudyItem, TaskType, TeacherClassAnalytics, TeacherEnrollmentRequest, TeacherStudentOverview } from "@/lib/types";

type TeacherClassSummary = {
  id: string;
  teacherId: string;
  name: string;
  joinCode: string;
  createdAt: string;
  studentCount: number;
  pendingCount?: number;
  approvalRequired?: boolean;
  joinMessage?: string | null;
};

type HomeworkSummary = {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
};

type ClassTab = "overview" | "students" | "homework" | "study" | "settings";

const IELTS_TASKS: TaskType[] = ["ielts-part-1", "ielts-part-2", "ielts-part-3"];
const TOEFL_TASKS: TaskType[] = ["toefl-task-1", "toefl-task-2", "toefl-task-3", "toefl-task-4"];

export function TeacherHub() {
  const { currentUser, language } = useAppState();
  const tr = language === "tr";

  // ── core state ──────────────────────────────────────────────────────────────
  const [classes, setClasses] = useState<TeacherClassSummary[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [activeTab, setActiveTab] = useState<ClassTab>("overview");
  const [students, setStudents] = useState<TeacherStudentOverview[]>([]);
  const [analytics, setAnalytics] = useState<TeacherClassAnalytics | null>(null);
  const [sharedItems, setSharedItems] = useState<SharedClassStudyItem[]>([]);
  const [pendingRequests, setPendingRequests] = useState<TeacherEnrollmentRequest[]>([]);
  const [homeworkSummary, setHomeworkSummary] = useState<HomeworkSummary>({ total: 0, completed: 0, pending: 0, overdue: 0 });
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  // ── form state ──────────────────────────────────────────────────────────────
  const [newClassName, setNewClassName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [copiedCode, setCopiedCode] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [filters, setFilters] = useState<{ exam: "all" | ExamType; task: "all" | TaskType; skill: "all" | string }>({ exam: "all", task: "all", skill: "all" });
  const [rule, setRule] = useState<HomeworkAutoAssignRule | null>(null);
  const [shareExamType, setShareExamType] = useState<ExamType>("IELTS");
  const [shareTaskType, setShareTaskType] = useState<TaskType>("ielts-part-1");
  const [sharePromptId, setSharePromptId] = useState("");
  const [shareNote, setShareNote] = useState("");
  const [bulkHomework, setBulkHomework] = useState({ title: "", instructions: "", focusSkill: "Balanced practice", recommendedTaskType: "ielts-part-1" as TaskType, dueDays: 7 });
  const [classSettings, setClassSettings] = useState({ approvalRequired: true, joinMessage: "" });
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementBody, setAnnouncementBody] = useState("");

  // ── derived ─────────────────────────────────────────────────────────────────
  const selectedClass = useMemo(() => classes.find((c) => c.id === selectedClassId) ?? null, [classes, selectedClassId]);
  const availableTasks = useMemo(() => (shareExamType === "IELTS" ? IELTS_TASKS : TOEFL_TASKS), [shareExamType]);
  const availableSharePrompts = useMemo(() => listPromptsForTask(shareExamType, shareTaskType), [shareExamType, shareTaskType]);

  const filteredStudents = useMemo(
    () => students.filter((s) => {
      if (filters.exam !== "all" && s.lastExamType !== filters.exam) return false;
      if (filters.task !== "all" && s.lastTaskType !== filters.task) return false;
      if (filters.skill !== "all" && s.weakestSkill !== filters.skill) return false;
      if (studentSearch && !`${s.student.name} ${s.student.email}`.toLowerCase().includes(studentSearch.toLowerCase())) return false;
      return true;
    }),
    [filters, studentSearch, students]
  );

  const leaderboard = useMemo(
    () => [...filteredStudents].sort((a, b) => (b.averageScore ?? 0) - (a.averageScore ?? 0)).slice(0, 5),
    [filteredStudents]
  );

  const improvementLeaderboard = useMemo(
    () => [...filteredStudents].filter((s) => typeof s.scoreDelta === "number").sort((a, b) => (b.scoreDelta ?? -999) - (a.scoreDelta ?? -999)).slice(0, 5),
    [filteredStudents]
  );

  const filterSkillOptions = useMemo(
    () => [...new Set(students.map((s) => s.weakestSkill).filter(Boolean))] as string[],
    [students]
  );

  const atRiskStudents = useMemo(
    () => filteredStudents.filter((s) => (s.riskFlags?.length ?? 0) > 0).slice(0, 6),
    [filteredStudents]
  );

  // ── sync effects ─────────────────────────────────────────────────────────────
  useEffect(() => { setShareTaskType(shareExamType === "IELTS" ? "ielts-part-1" : "toefl-task-1"); }, [shareExamType]);
  useEffect(() => { setSharePromptId(availableSharePrompts[0]?.id ?? ""); }, [availableSharePrompts]);
  useEffect(() => {
    if (!selectedClass) return;
    setClassSettings({ approvalRequired: selectedClass.approvalRequired ?? true, joinMessage: selectedClass.joinMessage ?? "" });
  }, [selectedClass]);

  // ── data fetching ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser?.isTeacher && !currentUser?.isAdmin) return;
    fetch("/api/teacher/classes")
      .then((r) => r.json())
      .then((data: { classes?: TeacherClassSummary[] }) => {
        const next = data.classes ?? [];
        setClasses(next);
        setSelectedClassId((cur) => cur || next[0]?.id || "");
      });
  }, [currentUser?.id, currentUser?.isAdmin, currentUser?.isTeacher]);

  const refreshHomeworkSummary = useCallback(async () => {
    if (!currentUser?.isTeacher && !currentUser?.isAdmin) return;
    try {
      const r = await fetch("/api/teacher/homework");
      const data = (await r.json()) as { assignments?: Array<{ assignment: { completedAt?: string | null; dueAt?: string | null } }> };
      const a = data.assignments ?? [];
      const completed = a.filter((x) => x.assignment.completedAt).length;
      const overdue = a.filter((x) => !x.assignment.completedAt && x.assignment.dueAt && new Date(x.assignment.dueAt).getTime() < Date.now()).length;
      setHomeworkSummary({ total: a.length, completed, pending: a.length - completed, overdue });
    } catch {
      setHomeworkSummary({ total: 0, completed: 0, pending: 0, overdue: 0 });
    }
  }, [currentUser?.isAdmin, currentUser?.isTeacher]);

  useEffect(() => { void refreshHomeworkSummary(); }, [currentUser?.id, refreshHomeworkSummary]);

  const loadSelectedClass = useCallback(async (classId: string) => {
    try {
      const [sr, ar, shr, rr] = await Promise.all([
        fetch(`/api/teacher/classes/${classId}/students`),
        fetch(`/api/teacher/classes/${classId}/analytics`),
        fetch(`/api/teacher/classes/${classId}/shared-study`),
        fetch(`/api/teacher/classes/${classId}/auto-assign`),
      ]);
      const sd = (await sr.json()) as { students?: TeacherStudentOverview[]; pendingRequests?: TeacherEnrollmentRequest[] };
      const ad = (await ar.json()) as { analytics?: TeacherClassAnalytics };
      const shd = (await shr.json()) as { items?: SharedClassStudyItem[] };
      const rd = (await rr.json()) as { rule?: HomeworkAutoAssignRule };

      setStudents(sd.students ?? []);
      setPendingRequests(sd.pendingRequests ?? []);
      setAnalytics(ad.analytics ?? null);
      setSharedItems(shd.items ?? []);
      setRule(rd.rule ?? null);

      if (rd.rule?.enabled) {
        const run = await fetch(`/api/teacher/classes/${classId}/auto-assign`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "run" }) });
        const runData = (await run.json()) as { created?: Array<{ id: string }>; error?: string };
        if (run.ok && (runData.created?.length ?? 0) > 0) {
          setNotice(tr ? `${runData.created?.length} öğrenci için otomatik ödev üretildi.` : `Auto homework generated for ${runData.created?.length} students.`);
          void refreshHomeworkSummary();
        }
      }
    } catch {
      setStudents([]); setAnalytics(null); setSharedItems([]); setRule(null); setPendingRequests([]);
    }
  }, [refreshHomeworkSummary, tr]);

  useEffect(() => {
    if (!selectedClassId) { setStudents([]); setAnalytics(null); setSharedItems([]); setRule(null); return; }
    void loadSelectedClass(selectedClassId);
  }, [loadSelectedClass, selectedClassId]);

  // ── handlers ─────────────────────────────────────────────────────────────────
  const createClass = async () => {
    if (!newClassName.trim()) return;
    setError(""); setNotice("");
    const r = await fetch("/api/teacher/classes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newClassName }) });
    const data = (await r.json()) as { classroom?: TeacherClassSummary; error?: string };
    if (!r.ok || !data.classroom) { setError(data.error ?? (tr ? "Sınıf oluşturulamadı." : "Could not create class.")); return; }
    setClasses([data.classroom, ...classes]);
    setSelectedClassId(data.classroom.id);
    setActiveTab("overview");
    setNewClassName("");
    setNotice(tr ? "Sınıf oluşturuldu." : "Class created.");
  };

  const openClass = (id: string) => {
    setSelectedClassId(id);
    setActiveTab("overview");
    setNotice(""); setError("");
  };

  const goBack = () => {
    setSelectedClassId("");
    setActiveTab("overview");
    setNotice(""); setError("");
  };

  const addStudent = async () => {
    if (!selectedClassId) return;
    setError(""); setNotice("");
    const r = await fetch(`/api/teacher/classes/${selectedClassId}/students`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: studentEmail }) });
    const data = (await r.json()) as { error?: string };
    if (!r.ok) { setError(data.error ?? (tr ? "Öğrenci eklenemedi." : "Could not add student.")); return; }
    setStudentEmail("");
    setNotice(tr ? "Öğrenci sınıfa eklendi." : "Student added to class.");
    await loadSelectedClass(selectedClassId);
    setClasses((cur) => cur.map((c) => (c.id === selectedClassId ? { ...c, studentCount: c.studentCount + 1 } : c)));
  };

  const updateClassSettings = async () => {
    if (!selectedClassId) return;
    setError(""); setNotice("");
    const r = await fetch(`/api/teacher/classes/${selectedClassId}/settings`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(classSettings) });
    const data = (await r.json()) as { classroom?: TeacherClassSummary; error?: string };
    if (!r.ok || !data.classroom) { setError(data.error ?? (tr ? "Ayarlar kaydedilemedi." : "Could not save settings.")); return; }
    setClasses((cur) => cur.map((c) => (c.id === selectedClassId ? { ...c, ...data.classroom } : c)));
    setNotice(tr ? "Ayarlar kaydedildi." : "Settings saved.");
  };

  const handleApproval = async (studentId: string, action: "approve" | "reject") => {
    if (!selectedClassId) return;
    setError(""); setNotice("");
    const r = await fetch(`/api/teacher/classes/${selectedClassId}/approvals`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ studentId, action }) });
    const data = (await r.json()) as { error?: string };
    if (!r.ok) { setError(data.error ?? (tr ? "İşlem tamamlanamadı." : "Could not update approval.")); return; }
    setPendingRequests((cur) => cur.filter((p) => p.student.id !== studentId));
    await loadSelectedClass(selectedClassId);
    setNotice(action === "approve" ? (tr ? "Öğrenci onaylandı." : "Student approved.") : (tr ? "Talep reddedildi." : "Request rejected."));
  };

  const assignBulkHomework = async () => {
    if (!selectedClassId) return;
    setError(""); setNotice("");
    const r = await fetch(`/api/teacher/classes/${selectedClassId}/bulk-homework`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...bulkHomework, dueAt: new Date(Date.now() + 86400000 * bulkHomework.dueDays).toISOString() }) });
    const data = (await r.json()) as { created?: Array<{ id: string }>; error?: string };
    if (!r.ok) { setError(data.error ?? (tr ? "Toplu ödev oluşturulamadı." : "Could not create bulk homework.")); return; }
    setNotice(tr ? `${data.created?.length ?? 0} öğrenciye ödev atandı.` : `Homework assigned to ${data.created?.length ?? 0} students.`);
    await refreshHomeworkSummary();
  };

  const copyJoinCode = async () => {
    if (!selectedClass?.joinCode) return;
    try { await navigator.clipboard.writeText(selectedClass.joinCode); setCopiedCode(selectedClass.joinCode); setTimeout(() => setCopiedCode(""), 1800); }
    catch { setError(tr ? "Kopyalanamadı." : "Could not copy."); }
  };

  const copyInviteMessage = async () => {
    if (!selectedClass) return;
    const msg = tr
      ? `Merhaba! SpeakAce AI'daki "${selectedClass.name}" sınıfına katılmak için dashboard ekranında class code alanına ${selectedClass.joinCode} kodunu gir.`
      : `Hi! To join the "${selectedClass.name}" class in SpeakAce AI, enter the code ${selectedClass.joinCode} in your dashboard.`;
    try { await navigator.clipboard.writeText(msg); setNotice(tr ? "Davet mesajı kopyalandı." : "Invite message copied."); }
    catch { setError(tr ? "Kopyalanamadı." : "Could not copy."); }
  };

  const saveAutoAssignRule = async () => {
    if (!selectedClassId || !rule) return;
    setError(""); setNotice("");
    const r = await fetch(`/api/teacher/classes/${selectedClassId}/auto-assign`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(rule) });
    const data = (await r.json()) as { rule?: HomeworkAutoAssignRule; error?: string };
    if (!r.ok || !data.rule) { setError(data.error ?? (tr ? "Kural kaydedilemedi." : "Could not save rule.")); return; }
    setRule(data.rule);
    setNotice(tr ? "Otomatik ödev kuralı kaydedildi." : "Auto-assign rule saved.");
  };

  const runAutoAssignNow = async () => {
    if (!selectedClassId) return;
    setError(""); setNotice("");
    const r = await fetch(`/api/teacher/classes/${selectedClassId}/auto-assign`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "run" }) });
    const data = (await r.json()) as { created?: Array<{ id: string }>; error?: string };
    if (!r.ok) { setError(data.error ?? (tr ? "Çalıştırılamadı." : "Could not run auto assignment.")); return; }
    setNotice(tr ? `${data.created?.length ?? 0} yeni ödev üretildi.` : `${data.created?.length ?? 0} new homework items created.`);
    await refreshHomeworkSummary();
    await loadSelectedClass(selectedClassId);
  };

  const sendClassAnnouncement = async () => {
    if (!selectedClassId) return;
    setError(""); setNotice("");
    const r = await fetch("/api/announcements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ audienceType: "class", classId: selectedClassId, title: announcementTitle, body: announcementBody }) });
    const data = (await r.json()) as { error?: string };
    if (!r.ok) { setError(data.error ?? (tr ? "Duyuru gönderilemedi." : "Could not send announcement.")); return; }
    setAnnouncementTitle(""); setAnnouncementBody("");
    setNotice(tr ? "Duyuru gönderildi." : "Announcement sent.");
  };

  const sharePromptToClass = async () => {
    if (!selectedClassId || !sharePromptId) return;
    setError(""); setNotice("");
    const r = await fetch(`/api/teacher/classes/${selectedClassId}/shared-study`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ promptId: sharePromptId, note: shareNote }) });
    const data = (await r.json()) as { item?: SharedClassStudyItem; error?: string };
    if (!r.ok || !data.item) { setError(data.error ?? (tr ? "Prompt paylaşılamadı." : "Could not share prompt.")); return; }
    setSharedItems((cur) => [data.item!, ...cur]);
    setShareNote("");
    setNotice(tr ? "Prompt sınıf study listine eklendi." : "Prompt added to class study list.");
  };

  const removeSharedItem = async (itemId: string) => {
    if (!selectedClassId) return;
    const r = await fetch(`/api/teacher/classes/${selectedClassId}/shared-study?itemId=${encodeURIComponent(itemId)}`, { method: "DELETE" });
    if (!r.ok) { const data = (await r.json()) as { error?: string }; setError(data.error ?? (tr ? "Kaldırılamadı." : "Could not remove.")); return; }
    setSharedItems((cur) => cur.filter((i) => i.id !== itemId));
  };

  // ── access guard ─────────────────────────────────────────────────────────────
  if (!currentUser?.isTeacher && !currentUser?.isAdmin) {
    return (
      <div className="page-shell section">
        <section className="card" style={{ padding: "1.5rem", display: "grid", gap: "0.8rem" }}>
          <span className="eyebrow">Teacher hub</span>
          <h1 style={{ margin: 0 }}>{tr ? "Öğretmen erişimi gerekli" : "Teacher access required"}</h1>
          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
            {tr ? "Bu paneli kullanmak için hesabının öğretmen olarak tanımlanmış olması gerekiyor." : "Your account must be marked as a teacher to use this panel."}
          </p>
        </section>
      </div>
    );
  }

  // ── CLASS LIST VIEW ──────────────────────────────────────────────────────────
  if (!selectedClassId) {
    return (
      <div className="page-shell section" style={{ display: "grid", gap: "1.2rem" }}>

        {/* Header */}
        <section className="card" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
          <span className="eyebrow">Teacher hub</span>
          <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", margin: 0 }}>{tr ? "Sınıflarım" : "My classes"}</h1>
          <p style={{ color: "var(--muted)", margin: 0, lineHeight: 1.7 }}>
            {tr ? "Bir sınıfa girerek öğrenci listesini, ödevleri ve ayarları yönetebilirsin." : "Open a class to manage students, assignments, and settings."}
          </p>
          <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
            <Link className="button button-secondary" href="/app/teacher/institution">{tr ? "Kurum analitiği" : "Institution analytics"}</Link>
            <Link className="button button-secondary" href="/app/teacher/billing">{tr ? "Kurum paketi" : "Institution plan"}</Link>
          </div>
        </section>

        {/* Feedback */}
        {(notice || error) && (
          <div>
            {notice && <p style={{ color: "var(--success)", margin: 0 }}>{notice}</p>}
            {error && <p style={{ color: "var(--accent-deep)", margin: 0 }}>{error}</p>}
          </div>
        )}

        {/* Create class */}
        <section className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
          <span className="eyebrow">{tr ? "Yeni sınıf" : "New class"}</span>
          <h2 style={{ fontSize: "1.6rem", margin: 0 }}>{tr ? "Sınıf oluştur" : "Create a class"}</h2>
          <div style={{ display: "flex", gap: "0.6rem" }}>
            <input
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") void createClass(); }}
              placeholder={tr ? "Örnek: IELTS Akşam Grubu" : "Example: IELTS Evening Group"}
              style={{ flex: 1, padding: "0.85rem 1rem", borderRadius: 14, border: "1px solid var(--line)" }}
            />
            <button type="button" className="button button-primary" onClick={createClass} disabled={!newClassName.trim()}>
              {tr ? "Oluştur" : "Create"}
            </button>
          </div>
        </section>

        {/* Class cards */}
        {classes.length > 0 ? (
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.9rem" }}>
            {classes.map((cls) => (
              <button key={cls.id} type="button" className="card" onClick={() => openClass(cls.id)}
                style={{ padding: "1.3rem", textAlign: "left", cursor: "pointer", display: "grid", gap: "0.7rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.6rem" }}>
                  <strong style={{ fontSize: "1.1rem" }}>{cls.name}</strong>
                  {(cls.pendingCount ?? 0) > 0 && (
                    <span className="pill" style={{ background: "var(--accent-deep)", color: "white", fontSize: "0.78rem" }}>
                      {cls.pendingCount} {tr ? "bekleyen" : "pending"}
                    </span>
                  )}
                </div>
                <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
                  <TeacherStat label={tr ? "Öğrenci" : "Students"} value={String(cls.studentCount)} />
                  <TeacherStat label={tr ? "Bekleyen" : "Pending"} value={String(cls.pendingCount ?? 0)} />
                  <TeacherStat label={tr ? "Kod" : "Code"} value={cls.joinCode} />
                </div>
                <span style={{ color: "var(--accent)", fontWeight: 600, fontSize: "0.9rem" }}>
                  {tr ? "Sınıfa gir →" : "Open class →"}
                </span>
              </button>
            ))}
          </section>
        ) : (
          <section className="card" style={{ padding: "1.5rem", color: "var(--muted)" }}>
            {tr ? "Henüz sınıf yok. Yukarıdan ilk sınıfını oluştur." : "No classes yet. Create your first one above."}
          </section>
        )}
      </div>
    );
  }

  // ── CLASS DETAIL VIEW ────────────────────────────────────────────────────────
  const tabs: Array<{ id: ClassTab; label: string; badge?: number }> = [
    { id: "overview", label: tr ? "Genel Bakış" : "Overview" },
    { id: "students", label: tr ? "Öğrenciler" : "Students", badge: students.length },
    { id: "homework", label: tr ? "Ödevler" : "Homework", badge: homeworkSummary.overdue > 0 ? homeworkSummary.overdue : undefined },
    { id: "study", label: tr ? "Study List" : "Study List", badge: sharedItems.length > 0 ? sharedItems.length : undefined },
    { id: "settings", label: tr ? "Ayarlar" : "Settings", badge: pendingRequests.length > 0 ? pendingRequests.length : undefined },
  ];

  return (
    <div className="page-shell section" style={{ display: "grid", gap: "1.2rem" }}>

      {/* Class header */}
      <section className="card" style={{ padding: "1.2rem 1.5rem", display: "grid", gap: "0.8rem" }}>
        <button type="button" onClick={goBack} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: "0.9rem", textAlign: "left", padding: 0, width: "fit-content" }}>
          ← {tr ? "Tüm sınıflar" : "All classes"}
        </button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.8rem" }}>
          <div>
            <span className="eyebrow">Teacher hub</span>
            <h1 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", margin: "0.3rem 0 0" }}>{selectedClass?.name}</h1>
          </div>
          <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap" }}>
            <span className="pill" style={{ fontSize: "1rem", letterSpacing: "0.08em" }}>{selectedClass?.joinCode}</span>
            <button type="button" className="button button-secondary" onClick={copyJoinCode}>
              {copiedCode === selectedClass?.joinCode ? (tr ? "Kopyalandı ✓" : "Copied ✓") : (tr ? "Kodu kopyala" : "Copy code")}
            </button>
            <button type="button" className="button button-secondary" onClick={copyInviteMessage}>
              {tr ? "Davet mesajı" : "Invite"}
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap", borderBottom: "1px solid var(--line)", paddingBottom: "0.1rem", marginTop: "0.4rem" }}>
          {tabs.map((tab) => (
            <button key={tab.id} type="button" onClick={() => { setActiveTab(tab.id); setNotice(""); setError(""); }}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "0.5rem 1rem", borderRadius: "8px 8px 0 0",
                fontWeight: activeTab === tab.id ? 700 : 400,
                color: activeTab === tab.id ? "var(--accent)" : "var(--muted)",
                borderBottom: activeTab === tab.id ? "2.5px solid var(--accent)" : "2.5px solid transparent",
                fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "0.4rem",
              }}>
              {tab.label}
              {tab.badge !== undefined && (
                <span style={{ background: tab.id === "homework" ? "var(--accent-deep)" : "var(--accent)", color: "white", borderRadius: 999, fontSize: "0.72rem", padding: "0.1rem 0.45rem", fontWeight: 700 }}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Feedback */}
      {(notice || error) && (
        <div>
          {notice && <p style={{ color: "var(--success)", margin: 0 }}>{notice}</p>}
          {error && <p style={{ color: "var(--accent-deep)", margin: 0 }}>{error}</p>}
        </div>
      )}

      {/* ── TAB: Overview ───────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <>
          {/* Analytics stats */}
          {analytics && (
            <section className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem" }}>
              <span className="eyebrow">{tr ? "Sınıf istatistikleri" : "Class stats"}</span>
              <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "0.6rem" }}>
                <TeacherStat label={tr ? "Sınıf ort." : "Class avg"} value={analytics.classAverageScore ? analytics.classAverageScore.toFixed(1) : "-"} />
                <TeacherStat label={tr ? "Aktif" : "Active"} value={String(analytics.activeStudents)} />
                <TeacherStat label={tr ? "Deneme" : "Attempts"} value={String(analytics.totalAttempts)} />
                <TeacherStat label={tr ? "Ödev oranı" : "HW rate"} value={`${analytics.homeworkCompletionRate ?? 0}%`} />
                <TeacherStat label={tr ? "Geciken" : "Overdue"} value={String(analytics.overdueHomeworkCount ?? 0)} />
                <TeacherStat label={tr ? "Riskli" : "At-risk"} value={String(analytics.atRiskStudentCount ?? 0)} />
                <TeacherStat label={tr ? "Zayıf alan" : "Weak area"} value={analytics.mostCommonWeakestSkill ? translateCategoryLabel(analytics.mostCommonWeakestSkill, tr) : "-"} />
              </div>
            </section>
          )}

          {/* Pending approvals */}
          {pendingRequests.length > 0 && (
            <section className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem", background: "rgba(255, 200, 0, 0.05)" }}>
              <span className="eyebrow">{tr ? "Katılım onayları" : "Join approvals"}</span>
              <h2 style={{ fontSize: "1.5rem", margin: 0 }}>
                {tr ? `${pendingRequests.length} öğrenci onay bekliyor` : `${pendingRequests.length} students awaiting approval`}
              </h2>
              <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "0.6rem" }}>
                {pendingRequests.map((req) => (
                  <div key={req.student.id} className="card" style={{ padding: "1rem", display: "grid", gap: "0.5rem" }}>
                    <strong>{req.student.name}</strong>
                    <div className="practice-meta">{req.student.email}</div>
                    <div className="practice-meta">{new Date(req.requestedAt).toLocaleString(tr ? "tr-TR" : "en-US")}</div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button type="button" className="button button-primary" onClick={() => handleApproval(req.student.id, "approve")}>{tr ? "Onayla" : "Approve"}</button>
                      <button type="button" className="button button-secondary" onClick={() => handleApproval(req.student.id, "reject")}>{tr ? "Reddet" : "Reject"}</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* At-risk */}
          {atRiskStudents.length > 0 && (
            <section className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem", background: "rgba(217, 93, 57, 0.06)" }}>
              <span className="eyebrow">{tr ? "Risk sinyali" : "At-risk students"}</span>
              <h2 style={{ fontSize: "1.5rem", margin: 0 }}>
                {tr ? `${atRiskStudents.length} öğrencide uyarı` : `${atRiskStudents.length} students flagged`}
              </h2>
              <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.6rem" }}>
                {atRiskStudents.map((s) => (
                  <Link key={s.student.id} href={`/app/teacher/student/${s.student.id}`} className="card" style={{ padding: "0.9rem", display: "grid", gap: "0.3rem" }}>
                    <strong>{s.student.name}</strong>
                    <div className="practice-meta">{(s.riskFlags ?? []).join(" · ")}</div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Leaderboards */}
          {(leaderboard.length > 0 || improvementLeaderboard.length > 0) && (
            <section className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
              <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
                <span className="eyebrow">{tr ? "En yüksek skorlar" : "Top scorers"}</span>
                {leaderboard.map((s, i) => (
                  <div key={s.student.id} style={{ display: "grid", gridTemplateColumns: "28px minmax(0,1fr) auto", gap: "0.7rem", alignItems: "center" }}>
                    <span className="pill" style={{ fontSize: "0.78rem" }}>#{i + 1}</span>
                    <div><strong>{s.student.name}</strong><div className="practice-meta">{tr ? "Ort." : "Avg"} {s.averageScore?.toFixed(1) ?? "-"}</div></div>
                    <strong>{s.bestScore?.toFixed(1) ?? "-"}</strong>
                  </div>
                ))}
              </div>
              <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
                <span className="eyebrow">{tr ? "En çok gelişenler" : "Most improved"}</span>
                {improvementLeaderboard.length ? improvementLeaderboard.map((s, i) => (
                  <div key={s.student.id} style={{ display: "grid", gridTemplateColumns: "28px minmax(0,1fr) auto", gap: "0.7rem", alignItems: "center" }}>
                    <span className="pill" style={{ fontSize: "0.78rem" }}>+{i + 1}</span>
                    <div><strong>{s.student.name}</strong><div className="practice-meta">{s.lastTaskType ? humanizeTaskType(s.lastTaskType, tr) : "-"}</div></div>
                    <strong style={{ color: (s.scoreDelta ?? 0) >= 0 ? "var(--success)" : "var(--accent-deep)" }}>{formatDelta(s.scoreDelta)}</strong>
                  </div>
                )) : <p style={{ margin: 0, color: "var(--muted)" }}>{tr ? "Henüz yeterli veri yok." : "Not enough data yet."}</p>}
              </div>
            </section>
          )}
        </>
      )}

      {/* ── TAB: Students ───────────────────────────────────────────────────── */}
      {activeTab === "students" && (
        <section className="card" style={{ padding: "1.2rem", display: "grid", gap: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "0.8rem" }}>
            <div>
              <span className="eyebrow">{tr ? "Öğrenci listesi" : "Student roster"}</span>
              <h2 style={{ fontSize: "1.6rem", margin: "0.3rem 0 0" }}>
                {filteredStudents.length === students.length
                  ? (tr ? `${students.length} öğrenci` : `${students.length} students`)
                  : (tr ? `${filteredStudents.length} / ${students.length}` : `${filteredStudents.length} of ${students.length}`)}
              </h2>
            </div>
            <div style={{ display: "flex", gap: "0.55rem", flexWrap: "wrap" }}>
              <input
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder={tr ? "Öğrenci ara…" : "Search students…"}
                style={{ padding: "0.7rem 1rem", borderRadius: 14, border: "1px solid var(--line)", minWidth: 160 }}
              />
              <select value={filters.exam} onChange={(e) => setFilters((f) => ({ ...f, exam: e.target.value as "all" | ExamType }))} style={selectStyle}>
                <option value="all">{tr ? "Tüm sınavlar" : "All exams"}</option>
                <option value="IELTS">IELTS</option>
                <option value="TOEFL">TOEFL</option>
              </select>
              <select value={filters.task} onChange={(e) => setFilters((f) => ({ ...f, task: e.target.value as "all" | TaskType }))} style={selectStyle}>
                <option value="all">{tr ? "Tüm taskler" : "All tasks"}</option>
                {[...IELTS_TASKS, ...TOEFL_TASKS].map((t) => <option key={t} value={t}>{humanizeTaskType(t, tr)}</option>)}
              </select>
              {filterSkillOptions.length > 0 && (
                <select value={filters.skill} onChange={(e) => setFilters((f) => ({ ...f, skill: e.target.value }))} style={selectStyle}>
                  <option value="all">{tr ? "Tüm beceriler" : "All skills"}</option>
                  {filterSkillOptions.map((sk) => <option key={sk} value={sk}>{translateCategoryLabel(sk, tr)}</option>)}
                </select>
              )}
            </div>
          </div>
          <div style={{ display: "grid", gap: "0.55rem" }}>
            {filteredStudents.length ? filteredStudents.map((s) => (
              <Link key={s.student.id} href={`/app/teacher/student/${s.student.id}`} className="card"
                style={{ padding: "1rem", display: "grid", gap: "0.5rem", background: "var(--surface-strong)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                  <div>
                    <strong>{s.student.name}</strong>
                    <div className="practice-meta" style={{ marginTop: "0.2rem" }}>{s.student.email}</div>
                  </div>
                  <span className="pill">{s.averageScore?.toFixed(1) ?? "-"}</span>
                </div>
                <div className="grid" style={{ gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: "0.5rem" }}>
                  <TeacherStat label={tr ? "Deneme" : "Attempts"} value={String(s.totalSessions)} />
                  <TeacherStat label="Best" value={s.bestScore?.toFixed(1) ?? "-"} />
                  <TeacherStat label={tr ? "Zayıf" : "Weak"} value={s.weakestSkill ? translateCategoryLabel(s.weakestSkill, tr) : "-"} />
                  <TeacherStat label={tr ? "Artış" : "Delta"} value={formatDelta(s.scoreDelta)} />
                </div>
              </Link>
            )) : (
              <div className="card" style={{ padding: "1rem", color: "var(--muted)" }}>
                {tr ? "Bu filtrelerle eşleşen öğrenci yok." : "No students match the current filters."}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── TAB: Homework ───────────────────────────────────────────────────── */}
      {activeTab === "homework" && (
        <>
          {/* Summary */}
          <section className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem" }}>
            <span className="eyebrow">{tr ? "Ödev özeti" : "Homework summary"}</span>
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "0.6rem" }}>
              <TeacherStat label={tr ? "Toplam" : "Total"} value={String(homeworkSummary.total)} />
              <TeacherStat label={tr ? "Tamamlanan" : "Completed"} value={String(homeworkSummary.completed)} />
              <TeacherStat label={tr ? "Bekleyen" : "Pending"} value={String(homeworkSummary.pending)} />
              <TeacherStat label={tr ? "Geciken" : "Overdue"} value={String(homeworkSummary.overdue)} />
            </div>
          </section>

          <section className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem", alignItems: "start" }}>

            {/* Bulk homework */}
            <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
              <span className="eyebrow">{tr ? "Toplu ödev" : "Bulk homework"}</span>
              <h2 style={{ fontSize: "1.5rem", margin: 0 }}>{tr ? "Sınıfa ödev ata" : "Assign to whole class"}</h2>
              <input
                value={bulkHomework.title}
                onChange={(e) => setBulkHomework((b) => ({ ...b, title: e.target.value }))}
                placeholder={tr ? "Ödev başlığı" : "Homework title"}
                style={{ padding: "0.85rem", borderRadius: 14, border: "1px solid var(--line)" }}
              />
              <textarea
                value={bulkHomework.instructions}
                onChange={(e) => setBulkHomework((b) => ({ ...b, instructions: e.target.value }))}
                rows={4}
                placeholder={tr ? "Tüm sınıfa gidecek yönergeler…" : "Instructions for the entire class…"}
                style={{ padding: "0.85rem", borderRadius: 14, border: "1px solid var(--line)", resize: "vertical" }}
              />
              <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                <select value={bulkHomework.recommendedTaskType} onChange={(e) => setBulkHomework((b) => ({ ...b, recommendedTaskType: e.target.value as TaskType }))} style={selectStyle}>
                  {[...IELTS_TASKS, ...TOEFL_TASKS].map((t) => <option key={t} value={t}>{humanizeTaskType(t, tr)}</option>)}
                </select>
                <input
                  type="number" min="1" max="21"
                  value={bulkHomework.dueDays}
                  onChange={(e) => setBulkHomework((b) => ({ ...b, dueDays: Number(e.target.value) || 7 }))}
                  placeholder={tr ? "Gün sayısı" : "Due in days"}
                  style={{ padding: "0.85rem", borderRadius: 14, border: "1px solid var(--line)" }}
                />
              </div>
              <button type="button" className="button button-primary" onClick={assignBulkHomework}>
                {tr ? "Sınıfa ata" : "Assign to class"}
              </button>
            </div>

            {/* Auto-assign */}
            <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
              <span className="eyebrow">{tr ? "Otomatik atama" : "Auto-assign"}</span>
              <h2 style={{ fontSize: "1.5rem", margin: 0 }}>{tr ? "Düşük skor kuralı" : "Low-score rule"}</h2>
              <label style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <input type="checkbox" checked={Boolean(rule?.enabled)} onChange={(e) => setRule((r) => r ? { ...r, enabled: e.target.checked } : r)} />
                <span className="practice-meta">{tr ? "Otomatik atamayı etkinleştir" : "Enable auto-assign"}</span>
              </label>
              <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                <label style={{ display: "grid", gap: "0.3rem" }}>
                  <span className="practice-meta">{tr ? "Skor eşiği" : "Score threshold"}</span>
                  <input type="number" min="1" max="9" step="0.1" value={rule?.scoreThreshold ?? 5.5}
                    onChange={(e) => setRule((r) => r ? { ...r, scoreThreshold: Number(e.target.value) } : r)}
                    style={{ padding: "0.8rem", borderRadius: 14, border: "1px solid var(--line)" }} />
                </label>
                <label style={{ display: "grid", gap: "0.3rem" }}>
                  <span className="practice-meta">{tr ? "Teslim günü" : "Due in days"}</span>
                  <input type="number" min="1" max="21" value={rule?.dueDays ?? 7}
                    onChange={(e) => setRule((r) => r ? { ...r, dueDays: Number(e.target.value) } : r)}
                    style={{ padding: "0.8rem", borderRadius: 14, border: "1px solid var(--line)" }} />
                </label>
                <select value={rule?.examType ?? "all"} onChange={(e) => setRule((r) => r ? { ...r, examType: e.target.value as HomeworkAutoAssignRule["examType"] } : r)} style={selectStyle}>
                  <option value="all">{tr ? "Tüm sınavlar" : "All exams"}</option>
                  <option value="IELTS">IELTS</option>
                  <option value="TOEFL">TOEFL</option>
                </select>
                <select value={rule?.taskType ?? "all"} onChange={(e) => setRule((r) => r ? { ...r, taskType: e.target.value as HomeworkAutoAssignRule["taskType"] } : r)} style={selectStyle}>
                  <option value="all">{tr ? "Tüm taskler" : "All tasks"}</option>
                  {[...IELTS_TASKS, ...TOEFL_TASKS].map((t) => <option key={t} value={t}>{humanizeTaskType(t, tr)}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                <button type="button" className="button button-secondary" onClick={saveAutoAssignRule}>{tr ? "Kuralı kaydet" : "Save rule"}</button>
                <button type="button" className="button button-primary" onClick={runAutoAssignNow}>{tr ? "Şimdi çalıştır" : "Run now"}</button>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ── TAB: Study List ─────────────────────────────────────────────────── */}
      {activeTab === "study" && (
        <section className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem", alignItems: "start" }}>

          {/* Share form */}
          <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
            <span className="eyebrow">{tr ? "Prompt paylaş" : "Share prompt"}</span>
            <h2 style={{ fontSize: "1.5rem", margin: 0 }}>{tr ? "Sınıfa prompt ekle" : "Add prompt to class"}</h2>
            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
              <select value={shareExamType} onChange={(e) => setShareExamType(e.target.value as ExamType)} style={selectStyle}>
                <option value="IELTS">IELTS</option>
                <option value="TOEFL">TOEFL</option>
              </select>
              <select value={shareTaskType} onChange={(e) => setShareTaskType(e.target.value as TaskType)} style={selectStyle}>
                {availableTasks.map((t) => <option key={t} value={t}>{humanizeTaskType(t, tr)}</option>)}
              </select>
            </div>
            <select value={sharePromptId} onChange={(e) => setSharePromptId(e.target.value)} style={selectStyle}>
              {availableSharePrompts.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
            <textarea
              value={shareNote}
              onChange={(e) => setShareNote(e.target.value)}
              rows={3}
              placeholder={tr ? "Sınıfa kısa yönlendirme notu…" : "Short guidance note for the class…"}
              style={{ padding: "0.85rem", borderRadius: 14, border: "1px solid var(--line)", resize: "vertical" }}
            />
            <button type="button" className="button button-primary" onClick={sharePromptToClass}>
              {tr ? "Promptu paylaş" : "Share prompt"}
            </button>
          </div>

          {/* Shared items */}
          <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
            <span className="eyebrow">{tr ? "Paylaşılan promptlar" : "Shared prompts"}</span>
            <h2 style={{ fontSize: "1.5rem", margin: 0 }}>{tr ? "Sınıf study list" : "Class study list"}</h2>
            {sharedItems.length ? (
              <div style={{ display: "grid", gap: "0.55rem" }}>
                {sharedItems.map((item) => (
                  <div key={item.id} className="card" style={{ padding: "0.9rem", background: "rgba(29,111,117,0.06)", display: "grid", gap: "0.35rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.6rem" }}>
                      <strong style={{ fontSize: "0.95rem" }}>{item.title}</strong>
                      <button type="button" className="button button-secondary" style={{ fontSize: "0.8rem", padding: "0.3rem 0.7rem" }} onClick={() => removeSharedItem(item.id)}>
                        {tr ? "Kaldır" : "Remove"}
                      </button>
                    </div>
                    <div className="practice-meta">{item.examType} · {humanizeTaskType(item.taskType, tr)}</div>
                    {item.note && <div className="practice-meta">{item.note}</div>}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, color: "var(--muted)" }}>
                {tr ? "Henüz paylaşılan prompt yok. Soldan ekleyebilirsin." : "No prompts shared yet. Add one on the left."}
              </p>
            )}
          </div>
        </section>
      )}

      {/* ── TAB: Settings ───────────────────────────────────────────────────── */}
      {activeTab === "settings" && (
        <section className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem", alignItems: "start" }}>

          {/* Class settings */}
          <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
            <span className="eyebrow">{tr ? "Katılım ayarları" : "Enrollment settings"}</span>
            <h2 style={{ fontSize: "1.5rem", margin: 0 }}>{tr ? "Sınıf ayarları" : "Class settings"}</h2>
            <label style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <input type="checkbox" checked={classSettings.approvalRequired} onChange={(e) => setClassSettings((s) => ({ ...s, approvalRequired: e.target.checked }))} />
              <span className="practice-meta">{tr ? "Katılım onayı gereksin" : "Require approval to join"}</span>
            </label>
            <textarea
              value={classSettings.joinMessage}
              onChange={(e) => setClassSettings((s) => ({ ...s, joinMessage: e.target.value }))}
              rows={3}
              placeholder={tr ? "Katılım sonrası öğrenciye kısa mesaj…" : "Short note students see after joining…"}
              style={{ padding: "0.85rem", borderRadius: 14, border: "1px solid var(--line)", resize: "vertical" }}
            />
            <button type="button" className="button button-primary" onClick={updateClassSettings}>
              {tr ? "Ayarları kaydet" : "Save settings"}
            </button>

            <div style={{ borderTop: "1px solid var(--line)", paddingTop: "0.8rem", display: "grid", gap: "0.6rem" }}>
              <span className="practice-meta" style={{ fontWeight: 600 }}>{tr ? "Öğrenci ekle" : "Add student"}</span>
              <div style={{ display: "flex", gap: "0.6rem" }}>
                <input value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} placeholder="student@example.com"
                  style={{ flex: 1, padding: "0.8rem", borderRadius: 14, border: "1px solid var(--line)" }} />
                <button type="button" className="button button-secondary" onClick={addStudent}>{tr ? "Ekle" : "Add"}</button>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
              <a className="button button-secondary" href={`/api/teacher/classes/${selectedClassId}/export`}>{tr ? "CSV rapor indir" : "Download CSV"}</a>
              <Link className="button button-secondary" href="/app/teacher/compare">{tr ? "Öğrenci karşılaştır" : "Compare students"}</Link>
              <Link className="button button-secondary" href="/app/teacher/billing">{tr ? "Kurum paketi" : "Institution plan"}</Link>
            </div>
          </div>

          {/* Announcement */}
          <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
            <span className="eyebrow">{tr ? "Duyuru" : "Announcement"}</span>
            <h2 style={{ fontSize: "1.5rem", margin: 0 }}>{tr ? "Sınıfa mesaj gönder" : "Message the class"}</h2>
            <input
              value={announcementTitle}
              onChange={(e) => setAnnouncementTitle(e.target.value)}
              placeholder={tr ? "Duyuru başlığı" : "Announcement title"}
              style={{ padding: "0.85rem", borderRadius: 14, border: "1px solid var(--line)" }}
            />
            <textarea
              value={announcementBody}
              onChange={(e) => setAnnouncementBody(e.target.value)}
              rows={5}
              placeholder={tr ? "Sınıfa gidecek duyuru…" : "Announcement for the class…"}
              style={{ padding: "0.85rem", borderRadius: 14, border: "1px solid var(--line)", resize: "vertical" }}
            />
            <button type="button" className="button button-primary" onClick={sendClassAnnouncement}>
              {tr ? "Duyuruyu gönder" : "Send announcement"}
            </button>
          </div>
        </section>
      )}

    </div>
  );
}

// ── Helper components ──────────────────────────────────────────────────────────

function TeacherStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card" style={{ padding: "0.75rem", background: "rgba(255,255,255,0.6)" }}>
      <div style={{ color: "var(--muted)", fontSize: "0.82rem", marginBottom: "0.2rem" }}>{label}</div>
      <strong>{value}</strong>
    </div>
  );
}

function translateCategoryLabel(label: string, tr: boolean) {
  if (!tr) return label;
  const map: Record<string, string> = {
    "Fluency and Coherence": "Akıcılık ve Tutarlılık",
    "Lexical Resource": "Kelime Kullanımı",
    "Grammatical Range and Accuracy": "Dilbilgisi ve Doğruluk",
    Pronunciation: "Telaffuz",
    Delivery: "Delivery",
    "Language Use": "Dil kullanımı",
    "Topic Development": "İçerik gelişimi",
  };
  return map[label] ?? label;
}

function humanizeTaskType(taskType: TaskType, tr: boolean) {
  const labels: Record<TaskType, { tr: string; en: string }> = {
    "ielts-part-1": { tr: "IELTS Part 1", en: "IELTS Part 1" },
    "ielts-part-2": { tr: "IELTS Part 2", en: "IELTS Part 2" },
    "ielts-part-3": { tr: "IELTS Part 3", en: "IELTS Part 3" },
    "toefl-task-1": { tr: "TOEFL Task 1", en: "TOEFL Task 1" },
    "toefl-task-2": { tr: "TOEFL Task 2", en: "TOEFL Task 2" },
    "toefl-task-3": { tr: "TOEFL Task 3", en: "TOEFL Task 3" },
    "toefl-task-4": { tr: "TOEFL Task 4", en: "TOEFL Task 4" },
    "toefl-independent": { tr: "TOEFL Independent", en: "TOEFL Independent" },
    "toefl-integrated": { tr: "TOEFL Integrated", en: "TOEFL Integrated" },
  };
  return tr ? labels[taskType]?.tr ?? taskType : labels[taskType]?.en ?? taskType;
}

function formatDelta(value: number | null | undefined) {
  if (typeof value !== "number") return "-";
  return value > 0 ? `+${value.toFixed(1)}` : value.toFixed(1);
}

const selectStyle: CSSProperties = {
  padding: "0.8rem",
  borderRadius: 14,
  border: "1px solid var(--line)",
  background: "white",
};
