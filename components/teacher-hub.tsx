"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useAppState } from "@/components/providers";
import { listPromptsForTask } from "@/lib/prompts";
import { ExamType, HomeworkAutoAssignRule, SharedClassStudyItem, TaskType, TeacherClassAnalytics, TeacherEnrollmentRequest, TeacherStudentOverview } from "@/lib/types";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BellRing,
  BookOpen,
  BookOpenCheck,
  CheckCircle,
  Clock,
  Copy,
  LayoutDashboard,
  ListChecks,
  Plus,
  Settings2,
  ShieldAlert,
  TrendingDown,
  UsersRound
} from "lucide-react";

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

type TeacherDashboardAnalytics = {
  totalClasses: number;
  totalStudents: number;
  activeStudents: number;
  averageScore: number;
  homeworkCompletionRate: number;
  overdueHomeworkCount: number;
  pendingApprovalCount: number;
  atRiskStudentCount: number;
  classes: TeacherClassAnalytics[];
};

type ClassTab = "overview" | "students" | "homework" | "announcements" | "study" | "settings";

const IELTS_TASKS: TaskType[] = ["ielts-part-1", "ielts-part-2", "ielts-part-3"];
const TOEFL_TASKS: TaskType[] = ["toefl-task-1", "toefl-task-2", "toefl-task-3", "toefl-task-4"];

export function TeacherHub({ initialClassId }: { initialClassId?: string }) {
  const { currentUser, language } = useAppState();
  const tr = language === "tr";
  const router = useRouter();

  // ── core state ──────────────────────────────────────────────────────────────
  const [classes, setClasses] = useState<TeacherClassSummary[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [activeTab, setActiveTab] = useState<ClassTab>("overview");
  const [students, setStudents] = useState<TeacherStudentOverview[]>([]);
  const [analytics, setAnalytics] = useState<TeacherClassAnalytics | null>(null);
  const [sharedItems, setSharedItems] = useState<SharedClassStudyItem[]>([]);
  const [pendingRequests, setPendingRequests] = useState<TeacherEnrollmentRequest[]>([]);
  const [homeworkSummary, setHomeworkSummary] = useState<HomeworkSummary>({ total: 0, completed: 0, pending: 0, overdue: 0 });
  const [dashboardAnalytics, setDashboardAnalytics] = useState<TeacherDashboardAnalytics | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);

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
  const [officeHoursStart, setOfficeHoursStart] = useState("09:00");
  const [officeHoursEnd, setOfficeHoursEnd] = useState("17:00");
  const [officeHoursDays, setOfficeHoursDays] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri"]);
  const [atRiskOnly, setAtRiskOnly] = useState(false);
  const [inactiveOnly, setInactiveOnly] = useState(false);
  const [scoreDropOnly, setScoreDropOnly] = useState(false);

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
      if (atRiskOnly && (s.riskFlags?.length ?? 0) === 0) return false;
      if (inactiveOnly && !s.riskFlags?.includes("Inactive 7d")) return false;
      if (scoreDropOnly && !(typeof s.scoreDelta === "number" && s.scoreDelta < 0)) return false;
      return true;
    }),
    [atRiskOnly, filters, inactiveOnly, scoreDropOnly, studentSearch, students]
  );

  const filterSkillOptions = useMemo(
    () => [...new Set(students.map((s) => s.weakestSkill).filter(Boolean))] as string[],
    [students]
  );

  const atRiskStudents = useMemo(
    () => students.filter((s) => (s.riskFlags?.length ?? 0) > 0).slice(0, 6),
    [students]
  );

  const completionRate = homeworkSummary.total > 0
    ? Math.round((homeworkSummary.completed / homeworkSummary.total) * 100)
    : 0;

  // ── sync effects ─────────────────────────────────────────────────────────────
  useEffect(() => { setShareTaskType(shareExamType === "IELTS" ? "ielts-part-1" : "toefl-task-1"); }, [shareExamType]);
  useEffect(() => { setSharePromptId(availableSharePrompts[0]?.id ?? ""); }, [availableSharePrompts]);
  useEffect(() => {
    if (!selectedClass) return;
    setClassSettings({ approvalRequired: selectedClass.approvalRequired ?? true, joinMessage: selectedClass.joinMessage ?? "" });
  }, [selectedClass]);

  // ── data fetching ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser?.isTeacher && !currentUser?.isAdmin) { setLoadingClasses(false); return; }
    setLoadingClasses(true);
    fetch("/api/teacher/classes")
      .then((r) => r.json())
      .then((data: { classes?: TeacherClassSummary[] }) => {
        const next = data.classes ?? [];
        setClasses(next);
        setSelectedClassId((cur) => {
          if (initialClassId && next.some((item) => item.id === initialClassId)) return initialClassId;
          return cur && next.some((item) => item.id === cur) ? cur : "";
        });
      })
      .finally(() => setLoadingClasses(false));
  }, [currentUser?.id, currentUser?.isAdmin, currentUser?.isTeacher, initialClassId]);

  useEffect(() => {
    if (!currentUser?.isTeacher && !currentUser?.isAdmin) return;
    fetch("/api/teacher/institution")
      .then((r) => r.json())
      .then((data: { analytics?: TeacherDashboardAnalytics }) => setDashboardAnalytics(data.analytics ?? null))
      .catch(() => setDashboardAnalytics(null));
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
    setLoadingStudents(true);
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
    } finally {
      setLoadingStudents(false);
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
    setActiveTab("overview");
    setNewClassName("");
    setNotice(tr ? "Sınıf oluşturuldu." : "Class created.");
    router.push(`/app/teacher/classes/${data.classroom.id}` as Route);
  };

  const openClass = (id: string) => {
    setActiveTab("overview");
    setNotice(""); setError("");
    router.push(`/app/teacher/classes/${id}` as Route);
  };

  const goBack = () => {
    setSelectedClassId("");
    setActiveTab("overview");
    setNotice(""); setError("");
    router.push("/app/teacher" as Route);
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

  const sendOverdueReminders = async () => {
    if (!selectedClassId || homeworkSummary.overdue === 0) return;
    setError(""); setNotice("");
    const r = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        audienceType: "class",
        classId: selectedClassId,
        title: tr ? "Gecikmiş ödeviniz var" : "You have overdue homework",
        body: tr
          ? "Lütfen gecikmiş ödevinizi en kısa sürede tamamlayın. Sorularınız için öğretmeninizle iletişime geçin."
          : "You have overdue assignments. Please complete them as soon as possible or contact your teacher.",
      }),
    });
    const data = (await r.json()) as { error?: string };
    if (!r.ok) { setError(data.error ?? (tr ? "Hatırlatma gönderilemedi." : "Could not send reminder.")); return; }
    setNotice(tr ? "Hatırlatma mesajı sınıfa gönderildi." : "Reminder sent to the class.");
  };

  if (loadingClasses && currentUser) {
    return <TeacherWorkspaceLoading tr={tr} />;
  }

  if (!currentUser?.isTeacher && !currentUser?.isAdmin) {
    return (
      <main className="teacher-workspace-page page-shell">
        <section className="teacher-workspace-access">
          <AlertTriangle size={22} />
          <div>
            <strong>{tr ? "Öğretmen erişimi gerekli" : "Teacher access required"}</strong>
            <p>
              {tr
                ? "Bu paneli kullanmak için hesabının öğretmen olarak tanımlanmış olması gerekiyor."
                : "Your account must be marked as a teacher to use this panel."}
            </p>
          </div>
        </section>
      </main>
    );
  }

  if (!selectedClassId) {
    const pendingApprovals = dashboardAnalytics?.pendingApprovalCount
      ?? classes.reduce((sum, item) => sum + (item.pendingCount ?? 0), 0);
    const classRows = classes.map((classroom) => {
      const classAnalytics = dashboardAnalytics?.classes.find((item) => item.classId === classroom.id);
      return {
        classroom,
        attempts: classAnalytics?.totalAttempts ?? 0,
        average: classAnalytics?.classAverageScore ?? null,
        completion: classAnalytics?.homeworkCompletionRate ?? null,
        active: classAnalytics?.activeStudents ?? 0,
        atRisk: classAnalytics?.atRiskStudentCount ?? 0
      };
    });
    const maxClassAttempts = Math.max(1, ...classRows.map((item) => item.attempts));
    const firstClass = classes[0];
    const approvalClass = [...classes].sort((a, b) => (b.pendingCount ?? 0) - (a.pendingCount ?? 0))[0];

    return (
      <main className="teacher-workspace-page page-shell">
        <section className="teacher-workspace teacher-workspace-dashboard">
          <header className="teacher-workspace-toolbar">
            <div className="teacher-workspace-toolbar-context">
              <span><LayoutDashboard size={18} /></span>
              <div>
                <strong>{tr ? "Öğretmen alanı" : "Teacher workspace"}</strong>
                <small>{tr ? "Sınıflar ve öncelikler" : "Classes and priorities"}</small>
              </div>
            </div>
            <nav aria-label={tr ? "Öğretmen menüsü" : "Teacher navigation"}>
              <button type="button" className="is-active">
                <LayoutDashboard size={18} />
                <span>{tr ? "Genel bakış" : "Overview"}</span>
              </button>
              <span className="teacher-workspace-nav-label">{tr ? "Sınıflar" : "Classes"}</span>
              {classes.slice(0, 6).map((classroom) => (
                <button key={classroom.id} type="button" onClick={() => openClass(classroom.id)}>
                  <UsersRound size={17} />
                  <span>{classroom.name}</span>
                  <small>{classroom.studentCount}</small>
                </button>
              ))}
            </nav>
            <div className="teacher-workspace-toolbar-actions">
              <Link href="/app/teacher/billing">
                <Settings2 size={17} />
                <span>{tr ? "Plan ve faturalama" : "Plan and billing"}</span>
              </Link>
              <button
                type="button"
                onClick={() => document.getElementById("teacher-create-class-name")?.focus()}
              >
                <Plus size={17} />
                <span>{tr ? "Yeni sınıf oluştur" : "Create a class"}</span>
              </button>
            </div>
          </header>

          <section className="teacher-workspace-main">
            <header className="teacher-workspace-head">
              <div>
                <span>{tr ? "Genel bakış" : "Overview"}</span>
                <h1>{tr ? "Öğretmen paneli" : "Teacher dashboard"}</h1>
                <p>
                  {tr
                    ? "Ders başlamadan önce sınıf hareketini ve öncelikli işleri tek bakışta gör."
                    : "See class activity and the work that needs attention before the next lesson."}
                </p>
              </div>
              <span className="teacher-workspace-period">{tr ? "Bu hafta" : "This week"}</span>
            </header>

            {(notice || error) && (
              <div className="teacher-workspace-feedback">
                {notice && <p className="teacher-feedback teacher-feedback-success">{notice}</p>}
                {error && <p className="teacher-feedback teacher-feedback-error">{error}</p>}
              </div>
            )}

            {classes.length === 0 ? (
              <section className="teacher-workspace-first-class">
                <div className="teacher-workspace-first-class-copy">
                  <span>{tr ? "İlk 60 saniye" : "Your first 60 seconds"}</span>
                  <h2>{tr ? "İlk sınıfını oluştur, gerisini panel düzenlesin." : "Create your first class. The workspace handles the rest."}</h2>
                  <p>
                    {tr
                      ? "Sınıf adını gir. SpeakAce benzersiz katılım kodunu hazırlayacak; öğrenciler geldikçe denemeler, ödevler ve takip gerektiren işler burada düzenlenecek."
                      : "Name the class and SpeakAce will create its join code. Attempts, assignments, and follow-up work will organize themselves as learners arrive."}
                  </p>
                  <div className="teacher-workspace-first-class-steps" aria-label={tr ? "Kurulum adımları" : "Setup steps"}>
                    <span><i>01</i>{tr ? "Sınıfı oluştur" : "Create the class"}</span>
                    <span><i>02</i>{tr ? "Kodu paylaş" : "Share the code"}</span>
                    <span><i>03</i>{tr ? "İlerlemeyi izle" : "Track progress"}</span>
                  </div>
                </div>
                <div className="teacher-workspace-first-class-form">
                  <label htmlFor="teacher-create-class-name">{tr ? "Sınıf adı" : "Class name"}</label>
                  <input
                    id="teacher-create-class-name"
                    value={newClassName}
                    onChange={(event) => setNewClassName(event.target.value)}
                    onKeyDown={(event) => { if (event.key === "Enter") void createClass(); }}
                    placeholder={tr ? "IELTS Akşam Grubu" : "IELTS Evening Group"}
                    autoFocus
                  />
                  <button type="button" className="button button-primary" onClick={createClass} disabled={!newClassName.trim()}>
                    <Plus size={16} />
                    {tr ? "İlk sınıfımı oluştur" : "Create my first class"}
                  </button>
                  <small>{tr ? "Katılım kodu otomatik oluşturulur." : "A private join code is created automatically."}</small>
                </div>
              </section>
            ) : (
              <>
            <section className="teacher-workspace-kpis" aria-label={tr ? "Genel istatistikler" : "Overview metrics"}>
              <TeacherStat label={tr ? "Sınıf" : "Classes"} value={String(dashboardAnalytics?.totalClasses ?? classes.length)} />
              <TeacherStat label={tr ? "Aktif öğrenci" : "Active students"} value={String(dashboardAnalytics?.activeStudents ?? 0)} detail={`${dashboardAnalytics?.totalStudents ?? 0} ${tr ? "toplam" : "total"}`} />
              <TeacherStat label={tr ? "Sınıf ortalaması" : "Class average"} value={dashboardAnalytics?.averageScore ? dashboardAnalytics.averageScore.toFixed(1) : "-"} />
              <TeacherStat
                label={tr ? "Dikkat gerekli" : "Need attention"}
                value={String((dashboardAnalytics?.atRiskStudentCount ?? 0) + pendingApprovals + homeworkSummary.overdue)}
                detail={`${pendingApprovals} ${tr ? "onay" : "approvals"}`}
                tone="alert"
              />
            </section>

            <section className="teacher-workspace-overview-grid">
              <article className="teacher-workspace-panel">
                <PanelHeading
                  eyebrow={tr ? "Sınıf aktivitesi" : "Class activity"}
                  title={`${classRows.reduce((sum, item) => sum + item.attempts, 0)} ${tr ? "deneme" : "attempts"}`}
                  icon={<BarChart3 size={18} />}
                />
                {classRows.some((item) => item.attempts > 0) ? (
                  <div className="teacher-workspace-chart" aria-label={tr ? "Sınıflara göre deneme dağılımı" : "Attempts by class"}>
                    {classRows.slice(0, 7).map((item) => (
                      <div key={item.classroom.id}>
                        <span
                          style={{ height: `${Math.max(10, Math.round((item.attempts / maxClassAttempts) * 100))}%` }}
                          title={`${item.classroom.name}: ${item.attempts}`}
                        />
                        <small>{classInitials(item.classroom.name)}</small>
                      </div>
                    ))}
                  </div>
                ) : (
                  <WorkspaceEmpty
                    title={tr ? "Henüz sınıf aktivitesi yok" : "No class activity yet"}
                    body={tr ? "İlk sınıfını oluşturduğunda aktivite burada görünecek." : "Activity will appear here after you create your first class."}
                  />
                )}
              </article>

              <article className="teacher-workspace-panel teacher-workspace-action-panel">
                <PanelHeading
                  eyebrow={tr ? "Aksiyon kuyruğu" : "Action queue"}
                  title={tr ? "Öncelikli işler" : "Priority work"}
                  icon={<ShieldAlert size={18} />}
                />
                <ActionRow
                  label={tr ? "Geciken ödevleri hatırlat" : "Remind overdue homework"}
                  value={homeworkSummary.overdue}
                  cta={tr ? "Aç" : "Open"}
                  onClick={() => firstClass && openClass(firstClass.id)}
                />
                <ActionRow
                  label={tr ? "Katılım onaylarını incele" : "Review join approvals"}
                  value={pendingApprovals}
                  cta={tr ? "İncele" : "Review"}
                  onClick={() => approvalClass && openClass(approvalClass.id)}
                />
                <ActionRow
                  label={tr ? "Riskli öğrencileri kontrol et" : "Check at-risk learners"}
                  value={dashboardAnalytics?.atRiskStudentCount ?? 0}
                  cta={tr ? "Gör" : "View"}
                  onClick={() => firstClass && openClass(firstClass.id)}
                />
              </article>
            </section>

            <section className="teacher-workspace-panel teacher-workspace-class-panel">
              <PanelHeading
                eyebrow={tr ? "Sınıf nabzı" : "Class pulse"}
                title={`${classes.length} ${tr ? "sınıf" : classes.length === 1 ? "class" : "classes"}`}
                icon={<UsersRound size={18} />}
              />
              {classRows.length ? (
                <div className="teacher-workspace-class-table">
                  <div className="teacher-workspace-class-head">
                    <span>{tr ? "Sınıf" : "Class"}</span>
                    <span>{tr ? "Aktif" : "Active"}</span>
                    <span>{tr ? "Ortalama" : "Average"}</span>
                    <span>{tr ? "Ödev" : "Homework"}</span>
                    <span>{tr ? "Durum" : "Status"}</span>
                  </div>
                  {classRows.map((item, index) => (
                    <button key={item.classroom.id} type="button" onClick={() => openClass(item.classroom.id)} className="teacher-workspace-class-row">
                      <span>
                        <i>{String(index + 1).padStart(2, "0")}</i>
                        <b>{item.classroom.name}</b>
                        <small>{item.classroom.joinCode}</small>
                      </span>
                      <strong>{item.active || item.classroom.studentCount}</strong>
                      <span>{item.average ? item.average.toFixed(1) : "-"}</span>
                      <span>{item.completion === null ? "-" : `${item.completion}%`}</span>
                      <span data-tone={item.atRisk > 0 || (item.classroom.pendingCount ?? 0) > 0 ? "attention" : "good"}>
                        {item.atRisk > 0
                          ? `${item.atRisk} ${tr ? "riskli" : "at risk"}`
                          : (item.classroom.pendingCount ?? 0) > 0
                            ? `${item.classroom.pendingCount} ${tr ? "bekliyor" : "pending"}`
                            : tr ? "Yolunda" : "On track"}
                      </span>
                      <ArrowRight size={16} />
                    </button>
                  ))}
                </div>
              ) : (
                <WorkspaceEmpty
                  title={tr ? "Henüz sınıf yok" : "No classes yet"}
                  body={tr ? "İlk sınıfını oluştur ve öğrencileri kısa bir kodla davet et." : "Create your first class and invite learners with a short join code."}
                />
              )}
            </section>

            <section className="teacher-workspace-create">
              <div>
                <span>{tr ? "Yeni sınıf" : "New class"}</span>
                <h2>{tr ? "Bir sonraki grubunu başlat" : "Start your next group"}</h2>
                <p>{tr ? "Sınıf adı yeterli. Katılım kodunu otomatik oluşturacağız." : "Add a class name and we will generate the join code."}</p>
              </div>
              <div className="teacher-workspace-create-form">
                <input
                  id="teacher-create-class-name"
                  value={newClassName}
                  onChange={(event) => setNewClassName(event.target.value)}
                  onKeyDown={(event) => { if (event.key === "Enter") void createClass(); }}
                  placeholder={tr ? "IELTS Akşam Grubu" : "IELTS Evening Group"}
                />
                <button type="button" className="button button-primary" onClick={createClass} disabled={!newClassName.trim()}>
                  <Plus size={16} />
                  {tr ? "Sınıf oluştur" : "Create class"}
                </button>
              </div>
            </section>
              </>
            )}
          </section>
        </section>
      </main>
    );
  }

  const tabs: Array<{ id: ClassTab; label: string; badge?: number; icon: typeof LayoutDashboard }> = [
    { id: "overview", label: tr ? "Genel bakış" : "Overview", icon: LayoutDashboard },
    { id: "students", label: tr ? "Öğrenciler" : "Students", badge: students.length, icon: UsersRound },
    { id: "homework", label: tr ? "Ödevler" : "Assignments", badge: homeworkSummary.overdue || undefined, icon: BookOpenCheck },
    { id: "announcements", label: tr ? "Duyurular" : "Announcements", icon: BellRing },
    { id: "study", label: tr ? "Study list" : "Study list", badge: sharedItems.length || undefined, icon: ListChecks },
    { id: "settings", label: tr ? "Ayarlar" : "Settings", badge: pendingRequests.length || undefined, icon: Settings2 }
  ];
  const activeTabMeta = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  const pulseStudents = [...students].sort((a, b) => b.totalSessions - a.totalSessions).slice(0, 7);
  const maxStudentAttempts = Math.max(1, ...pulseStudents.map((student) => student.totalSessions));
  const overviewStudents = [...students]
    .sort((a, b) => (b.riskFlags?.length ?? 0) - (a.riskFlags?.length ?? 0) || b.totalSessions - a.totalSessions)
    .slice(0, 7);
  const attentionCount = (analytics?.atRiskStudentCount ?? atRiskStudents.length) + homeworkSummary.overdue + pendingRequests.length;

  return (
    <main className="teacher-workspace-page page-shell">
      <section className="teacher-workspace teacher-workspace-class">
        <header className="teacher-workspace-toolbar teacher-workspace-class-toolbar">
          <div className="teacher-workspace-toolbar-context">
            <button type="button" onClick={goBack} className="teacher-workspace-back" aria-label={tr ? "Tüm sınıflar" : "All classes"}>
              <ArrowLeft size={16} />
            </button>
            <div className="teacher-workspace-class-name">
              <span>{tr ? "Aktif sınıf" : "Active class"}</span>
              <strong>{selectedClass?.name}</strong>
            </div>
          </div>
          <nav aria-label={tr ? "Sınıf menüsü" : "Class navigation"}>
            {tabs.map(({ id, label, badge, icon: Icon }) => (
              <button
                key={id}
                type="button"
                className={activeTab === id ? "is-active" : ""}
                onClick={() => {
                  setActiveTab(id);
                  setNotice("");
                  setError("");
                }}
              >
                <Icon size={18} />
                <span>{label}</span>
                {badge !== undefined && <small data-alert={id === "homework" && badge > 0}>{badge}</small>}
              </button>
            ))}
          </nav>
        </header>

        <section className="teacher-workspace-main">
          <header className="teacher-workspace-head">
            <div>
              <span>{activeTabMeta.label}</span>
              <h1>{selectedClass?.name}</h1>
              <p>
                {activeTab === "overview"
                  ? tr ? "Sınıfın nabzını gör ve bir sonraki ders için doğru aksiyonu seç." : "Read the class pulse and choose the right action for the next lesson."
                  : tr ? "Sınıf araçları tek, sakin bir çalışma alanında." : "Class tools stay together in one calm workspace."}
              </p>
            </div>
            <div className="teacher-workspace-head-actions">
              <span>{selectedClass?.joinCode}</span>
              <button type="button" onClick={copyJoinCode}>
                <Copy size={15} />
                {copiedCode === selectedClass?.joinCode ? (tr ? "Kopyalandı" : "Copied") : (tr ? "Kopyala" : "Copy")}
              </button>
              <button type="button" onClick={copyInviteMessage}>
                <BellRing size={15} />
                {tr ? "Davet et" : "Invite"}
              </button>
            </div>
          </header>

          {(notice || error) && (
            <div className="teacher-workspace-feedback">
              {notice && <p className="teacher-feedback teacher-feedback-success">{notice}</p>}
              {error && <p className="teacher-feedback teacher-feedback-error">{error}</p>}
            </div>
          )}

          {activeTab === "overview" && (
            <>
              {loadingStudents ? (
                <HubLoading label={tr ? "Sınıf verileri hazırlanıyor…" : "Preparing class data…"} />
              ) : (
                <>
                  <section className="teacher-workspace-kpis" aria-label={tr ? "Sınıf istatistikleri" : "Class metrics"}>
                    <TeacherStat label={tr ? "Sınıf ortalaması" : "Class average"} value={analytics?.classAverageScore ? analytics.classAverageScore.toFixed(1) : "-"} detail={analytics?.classBestScore ? `${tr ? "En iyi" : "Best"} ${analytics.classBestScore.toFixed(1)}` : undefined} />
                    <TeacherStat label={tr ? "Haftalık deneme" : "Practice attempts"} value={String(analytics?.totalAttempts ?? 0)} detail={`${analytics?.activeStudents ?? 0} ${tr ? "aktif öğrenci" : "active learners"}`} />
                    <TeacherStat label={tr ? "Ödev tamamlandı" : "Homework complete"} value={`${analytics?.homeworkCompletionRate ?? completionRate}%`} detail={`${homeworkSummary.completed} / ${homeworkSummary.total}`} />
                    <TeacherStat label={tr ? "Dikkat gerekli" : "Need attention"} value={String(attentionCount)} detail={`${pendingRequests.length} ${tr ? "onay" : "approvals"}`} tone="alert" />
                  </section>

                  <section className="teacher-workspace-overview-grid">
                    <article className="teacher-workspace-panel">
                      <PanelHeading
                        eyebrow={tr ? "Pratik aktivitesi" : "Practice activity"}
                        title={`${analytics?.totalAttempts ?? 0} ${tr ? "deneme" : "attempts"}`}
                        icon={<BarChart3 size={18} />}
                      />
                      {pulseStudents.some((student) => student.totalSessions > 0) ? (
                        <div className="teacher-workspace-chart" aria-label={tr ? "Öğrenci denemeleri" : "Learner attempts"}>
                          {pulseStudents.map((student) => (
                            <div key={student.student.id}>
                              <span
                                style={{ height: `${Math.max(10, Math.round((student.totalSessions / maxStudentAttempts) * 100))}%` }}
                                title={`${student.student.name}: ${student.totalSessions}`}
                              />
                              <small>{personInitials(student.student.name)}</small>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <WorkspaceEmpty
                          title={tr ? "Henüz pratik verisi yok" : "No practice data yet"}
                          body={tr ? "Öğrenciler ilk denemelerini tamamladığında dağılım burada görünecek." : "The distribution will appear after learners complete their first attempts."}
                        />
                      )}
                    </article>

                    <article className="teacher-workspace-panel teacher-workspace-action-panel">
                      <PanelHeading
                        eyebrow={tr ? "Aksiyon kuyruğu" : "Action queue"}
                        title={`${attentionCount} ${tr ? "öncelik" : attentionCount === 1 ? "priority" : "priorities"}`}
                        icon={<ShieldAlert size={18} />}
                      />
                      <ActionRow
                        label={tr ? "Riskli öğrencileri incele" : "Review at-risk learners"}
                        value={analytics?.atRiskStudentCount ?? atRiskStudents.length}
                        cta={tr ? "Gör" : "View"}
                        onClick={() => {
                          setAtRiskOnly(true);
                          setActiveTab("students");
                        }}
                      />
                      <ActionRow
                        label={tr ? "Geciken ödevleri hatırlat" : "Remind overdue assignments"}
                        value={homeworkSummary.overdue}
                        cta={tr ? "Ödevler" : "Assignments"}
                        onClick={() => setActiveTab("homework")}
                      />
                      <ActionRow
                        label={tr ? "Katılım taleplerini yanıtla" : "Respond to join requests"}
                        value={pendingRequests.length}
                        cta={tr ? "Onaylar" : "Approvals"}
                        onClick={() => setActiveTab("settings")}
                      />
                    </article>
                  </section>

                  <section className="teacher-workspace-panel teacher-workspace-roster-panel">
                    <PanelHeading
                      eyebrow={tr ? "Öğrenci nabzı" : "Learner pulse"}
                      title={`${students.length} ${tr ? "öğrenci" : students.length === 1 ? "learner" : "learners"}`}
                      icon={<UsersRound size={18} />}
                    />
                    {overviewStudents.length ? (
                      <div className="teacher-workspace-roster">
                        <div className="teacher-workspace-roster-head">
                          <span>{tr ? "Öğrenci" : "Learner"}</span>
                          <span>{tr ? "Son ortalama" : "Latest average"}</span>
                          <span>{tr ? "Mevcut odak" : "Current focus"}</span>
                          <span>{tr ? "Durum" : "Status"}</span>
                        </div>
                        {overviewStudents.map((student, index) => {
                          const status = getStudentStatus(student, tr);
                          return (
                            <div className="teacher-workspace-roster-row" key={student.student.id}>
                              <span>
                                <i>{String(index + 1).padStart(2, "0")}</i>
                                <span>
                                  <Link href={`/app/teacher/student/${student.student.id}`}>{student.student.name}</Link>
                                  <small>{student.student.email}</small>
                                </span>
                              </span>
                              <strong>{student.averageScore?.toFixed(1) ?? "-"}</strong>
                              <span>{student.weakestSkill ? translateCategoryLabel(student.weakestSkill, tr) : tr ? "Dengeli pratik" : "Balanced practice"}</span>
                              <span data-tone={status.tone}>{status.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <WorkspaceEmpty
                        title={tr ? "Sınıfta henüz öğrenci yok" : "No learners in this class yet"}
                        body={tr ? "Katılım kodunu paylaş veya Ayarlar bölümünden öğrenci ekle." : "Share the join code or add a learner from Settings."}
                      />
                    )}
                    {students.length > overviewStudents.length && (
                      <button type="button" className="teacher-workspace-text-action" onClick={() => setActiveTab("students")}>
                        {tr ? "Tüm öğrenci listesini aç" : "Open full roster"}
                        <ArrowRight size={15} />
                      </button>
                    )}
                  </section>

                  {pendingRequests.length > 0 && (
                    <section className="teacher-workspace-panel teacher-workspace-approval-panel">
                      <PanelHeading
                        eyebrow={tr ? "Katılım onayları" : "Join approvals"}
                        title={`${pendingRequests.length} ${tr ? "talep bekliyor" : "requests waiting"}`}
                        icon={<CheckCircle size={18} />}
                      />
                      <div className="teacher-workspace-approval-list">
                        {pendingRequests.map((request) => (
                          <div key={request.student.id}>
                            <span>
                              <strong>{request.student.name}</strong>
                              <small>{request.student.email}</small>
                            </span>
                            <time>{new Date(request.requestedAt).toLocaleDateString(tr ? "tr-TR" : "en-US")}</time>
                            <div>
                              <button type="button" onClick={() => handleApproval(request.student.id, "approve")}>{tr ? "Onayla" : "Approve"}</button>
                              <button type="button" onClick={() => handleApproval(request.student.id, "reject")}>{tr ? "Reddet" : "Reject"}</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )}
            </>
          )}

          {activeTab === "students" && (
            <section className="teacher-workspace-panel teacher-workspace-section">
              <PanelHeading
                eyebrow={tr ? "Öğrenci listesi" : "Student roster"}
                title={filteredStudents.length === students.length
                  ? `${students.length} ${tr ? "öğrenci" : students.length === 1 ? "learner" : "learners"}`
                  : `${filteredStudents.length} / ${students.length}`}
                icon={<UsersRound size={18} />}
              />
              <div className="teacher-workspace-filter-bar">
                <input
                  value={studentSearch}
                  onChange={(event) => setStudentSearch(event.target.value)}
                  placeholder={tr ? "Öğrenci ara…" : "Search learners…"}
                  aria-label={tr ? "Öğrenci ara" : "Search learners"}
                />
                <select value={filters.exam} onChange={(event) => setFilters((current) => ({ ...current, exam: event.target.value as "all" | ExamType }))}>
                  <option value="all">{tr ? "Tüm sınavlar" : "All exams"}</option>
                  <option value="IELTS">IELTS</option>
                  <option value="TOEFL">TOEFL</option>
                </select>
                <select value={filters.task} onChange={(event) => setFilters((current) => ({ ...current, task: event.target.value as "all" | TaskType }))}>
                  <option value="all">{tr ? "Tüm görevler" : "All tasks"}</option>
                  {[...IELTS_TASKS, ...TOEFL_TASKS].map((task) => <option key={task} value={task}>{humanizeTaskType(task, tr)}</option>)}
                </select>
                {filterSkillOptions.length > 0 && (
                  <select value={filters.skill} onChange={(event) => setFilters((current) => ({ ...current, skill: event.target.value }))}>
                    <option value="all">{tr ? "Tüm beceriler" : "All skills"}</option>
                    {filterSkillOptions.map((skill) => <option key={skill} value={skill}>{translateCategoryLabel(skill, tr)}</option>)}
                  </select>
                )}
              </div>
              <div className="teacher-workspace-filter-chips">
                <button type="button" className={atRiskOnly ? "is-active is-alert" : ""} onClick={() => setAtRiskOnly((value) => !value)}>
                  <AlertTriangle size={13} />
                  {tr ? "Sadece riskli" : "At-risk only"}
                </button>
                <button type="button" className={inactiveOnly ? "is-active" : ""} onClick={() => setInactiveOnly((value) => !value)}>
                  <Clock size={13} />
                  {tr ? "Sadece pasif" : "Inactive only"}
                </button>
                <button type="button" className={scoreDropOnly ? "is-active is-alert" : ""} onClick={() => setScoreDropOnly((value) => !value)}>
                  <TrendingDown size={13} />
                  {tr ? "Skoru düşenler" : "Score drop"}
                </button>
                {filterSkillOptions.slice(0, 4).map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    className={filters.skill === skill ? "is-active" : ""}
                    onClick={() => setFilters((current) => ({ ...current, skill: current.skill === skill ? "all" : skill }))}
                  >
                    {translateCategoryLabel(skill, tr)}
                  </button>
                ))}
              </div>
              {filteredStudents.length ? (
                <div className="teacher-workspace-student-table">
                  <div className="teacher-workspace-student-head">
                    <span>{tr ? "Öğrenci" : "Learner"}</span>
                    <span>{tr ? "Deneme" : "Attempts"}</span>
                    <span>{tr ? "Ortalama" : "Average"}</span>
                    <span>{tr ? "Odak" : "Focus"}</span>
                    <span>{tr ? "Durum" : "Status"}</span>
                    <span />
                  </div>
                  {filteredStudents.map((student, index) => {
                    const status = getStudentStatus(student, tr);
                    return (
                      <div className="teacher-workspace-student-row" key={student.student.id}>
                        <span>
                          <i>{String(index + 1).padStart(2, "0")}</i>
                          <span>
                            <strong>{student.student.name}</strong>
                            <small>{student.student.email}</small>
                          </span>
                        </span>
                        <strong>{student.totalSessions}</strong>
                        <span>
                          {student.averageScore?.toFixed(1) ?? "-"}
                          {typeof student.scoreDelta === "number" && (
                            <small data-positive={student.scoreDelta >= 0}>{formatDelta(student.scoreDelta)}</small>
                          )}
                        </span>
                        <span>{student.weakestSkill ? translateCategoryLabel(student.weakestSkill, tr) : "-"}</span>
                        <span data-tone={status.tone}>{status.label}</span>
                        <span>
                          <Link href={`/app/teacher/student/${student.student.id}`}>{tr ? "Detay" : "Detail"}</Link>
                          <Link href={`/app/teacher/compare?student=${student.student.id}`}>{tr ? "Kıyasla" : "Compare"}</Link>
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <WorkspaceEmpty
                  title={tr ? "Eşleşen öğrenci yok" : "No matching learners"}
                  body={tr ? "Aramayı veya aktif filtreleri değiştir." : "Change the search or active filters."}
                />
              )}
            </section>
          )}

          {activeTab === "homework" && (
            <section className="teacher-workspace-tab-stack">
              <div className="teacher-workspace-kpis">
                <TeacherStat label={tr ? "Toplam" : "Total"} value={String(homeworkSummary.total)} />
                <TeacherStat label={tr ? "Tamamlanan" : "Completed"} value={String(homeworkSummary.completed)} detail={`${completionRate}%`} />
                <TeacherStat label={tr ? "Bekleyen" : "Pending"} value={String(homeworkSummary.pending)} />
                <TeacherStat label={tr ? "Geciken" : "Overdue"} value={String(homeworkSummary.overdue)} tone={homeworkSummary.overdue > 0 ? "alert" : "default"} />
              </div>

              <article className="teacher-workspace-panel teacher-workspace-progress-panel">
                <PanelHeading
                  eyebrow={tr ? "Ödev ilerlemesi" : "Assignment progress"}
                  title={`${completionRate}% ${tr ? "tamamlandı" : "complete"}`}
                  icon={<BookOpenCheck size={18} />}
                />
                <div className="teacher-workspace-progress">
                  <span style={{ width: `${completionRate}%` }} />
                </div>
                <div className="teacher-workspace-progress-legend">
                  <span><i data-tone="good" />{tr ? "Tamamlandı" : "Completed"} · {homeworkSummary.completed}</span>
                  <span><i />{tr ? "Bekliyor" : "Pending"} · {homeworkSummary.pending}</span>
                  <span><i data-tone="alert" />{tr ? "Gecikti" : "Overdue"} · {homeworkSummary.overdue}</span>
                  {homeworkSummary.overdue > 0 && (
                    <button type="button" onClick={sendOverdueReminders}>{tr ? "Hatırlatma gönder" : "Send reminders"}</button>
                  )}
                </div>
              </article>

              <div className="teacher-workspace-form-grid">
                <article className="teacher-workspace-panel teacher-workspace-form-panel">
                  <PanelHeading
                    eyebrow={tr ? "Toplu ödev" : "Bulk assignment"}
                    title={tr ? "Tüm sınıfa görev ver" : "Assign the whole class"}
                    icon={<BookOpen size={18} />}
                  />
                  <label>
                    <span>{tr ? "Ödev başlığı" : "Assignment title"}</span>
                    <input value={bulkHomework.title} onChange={(event) => setBulkHomework((current) => ({ ...current, title: event.target.value }))} placeholder={tr ? "Part 2 akıcılık çalışması" : "Part 2 fluency practice"} />
                  </label>
                  <label>
                    <span>{tr ? "Yönergeler" : "Instructions"}</span>
                    <textarea value={bulkHomework.instructions} onChange={(event) => setBulkHomework((current) => ({ ...current, instructions: event.target.value }))} rows={4} placeholder={tr ? "Öğrencilere gidecek kısa ve açık yönerge…" : "Short, clear guidance for learners…"} />
                  </label>
                  <div className="teacher-workspace-field-grid">
                    <label>
                      <span>{tr ? "Görev türü" : "Task type"}</span>
                      <select value={bulkHomework.recommendedTaskType} onChange={(event) => setBulkHomework((current) => ({ ...current, recommendedTaskType: event.target.value as TaskType }))}>
                        {[...IELTS_TASKS, ...TOEFL_TASKS].map((task) => <option key={task} value={task}>{humanizeTaskType(task, tr)}</option>)}
                      </select>
                    </label>
                    <label>
                      <span>{tr ? "Teslim süresi" : "Due in days"}</span>
                      <input type="number" min="1" max="21" value={bulkHomework.dueDays} onChange={(event) => setBulkHomework((current) => ({ ...current, dueDays: Number(event.target.value) || 7 }))} />
                    </label>
                  </div>
                  <button type="button" className="button button-primary" onClick={assignBulkHomework}>{tr ? "Sınıfa ata" : "Assign to class"}</button>
                </article>

                <article className="teacher-workspace-panel teacher-workspace-form-panel">
                  <PanelHeading
                    eyebrow={tr ? "Otomatik atama" : "Auto-assign"}
                    title={tr ? "Düşük skora göre takip" : "Follow up low scores"}
                    icon={<ListChecks size={18} />}
                  />
                  <label className="teacher-workspace-checkbox">
                    <input type="checkbox" checked={Boolean(rule?.enabled)} onChange={(event) => setRule((current) => current ? { ...current, enabled: event.target.checked } : current)} />
                    <span>{tr ? "Otomatik atamayı etkinleştir" : "Enable auto-assign"}</span>
                  </label>
                  <div className="teacher-workspace-field-grid">
                    <label>
                      <span>{tr ? "Skor eşiği" : "Score threshold"}</span>
                      <input type="number" min="1" max="9" step="0.1" value={rule?.scoreThreshold ?? 5.5} onChange={(event) => setRule((current) => current ? { ...current, scoreThreshold: Number(event.target.value) } : current)} />
                    </label>
                    <label>
                      <span>{tr ? "Teslim süresi" : "Due in days"}</span>
                      <input type="number" min="1" max="21" value={rule?.dueDays ?? 7} onChange={(event) => setRule((current) => current ? { ...current, dueDays: Number(event.target.value) } : current)} />
                    </label>
                    <label>
                      <span>{tr ? "Sınav" : "Exam"}</span>
                      <select value={rule?.examType ?? "all"} onChange={(event) => setRule((current) => current ? { ...current, examType: event.target.value as HomeworkAutoAssignRule["examType"] } : current)}>
                        <option value="all">{tr ? "Tüm sınavlar" : "All exams"}</option>
                        <option value="IELTS">IELTS</option>
                        <option value="TOEFL">TOEFL</option>
                      </select>
                    </label>
                    <label>
                      <span>{tr ? "Görev" : "Task"}</span>
                      <select value={rule?.taskType ?? "all"} onChange={(event) => setRule((current) => current ? { ...current, taskType: event.target.value as HomeworkAutoAssignRule["taskType"] } : current)}>
                        <option value="all">{tr ? "Tüm görevler" : "All tasks"}</option>
                        {[...IELTS_TASKS, ...TOEFL_TASKS].map((task) => <option key={task} value={task}>{humanizeTaskType(task, tr)}</option>)}
                      </select>
                    </label>
                  </div>
                  <div className="teacher-workspace-button-row">
                    <button type="button" className="button button-secondary" onClick={saveAutoAssignRule}>{tr ? "Kuralı kaydet" : "Save rule"}</button>
                    <button type="button" className="button button-primary" onClick={runAutoAssignNow}>{tr ? "Şimdi çalıştır" : "Run now"}</button>
                  </div>
                </article>
              </div>
            </section>
          )}

          {activeTab === "announcements" && (
            <section className="teacher-workspace-form-grid teacher-workspace-announcement-grid">
              <article className="teacher-workspace-panel teacher-workspace-form-panel">
                <PanelHeading
                  eyebrow={tr ? "Yeni duyuru" : "New announcement"}
                  title={tr ? "Sınıfa mesaj gönder" : "Message the class"}
                  icon={<BellRing size={18} />}
                />
                <label>
                  <span>{tr ? "Başlık" : "Title"}</span>
                  <input value={announcementTitle} onChange={(event) => setAnnouncementTitle(event.target.value)} placeholder={tr ? "Bu haftanın odağı" : "This week's focus"} />
                </label>
                <label>
                  <span>{tr ? "Mesaj" : "Message"}</span>
                  <textarea value={announcementBody} onChange={(event) => setAnnouncementBody(event.target.value)} rows={7} placeholder={tr ? "Sınıfa gidecek kısa ve açık duyuru…" : "A short, clear announcement for the class…"} />
                </label>
                <button type="button" className="button button-primary" onClick={sendClassAnnouncement}>{tr ? "Duyuruyu gönder" : "Send announcement"}</button>
              </article>

              <aside className="teacher-workspace-panel teacher-workspace-delivery-panel">
                <PanelHeading
                  eyebrow={tr ? "Teslimat özeti" : "Delivery summary"}
                  title={tr ? "Göndermeden önce" : "Before you send"}
                  icon={<CheckCircle size={18} />}
                />
                <dl>
                  <div>
                    <dt>{tr ? "Alıcılar" : "Recipients"}</dt>
                    <dd>{students.length} {tr ? "öğrenci" : students.length === 1 ? "learner" : "learners"}</dd>
                  </div>
                  <div>
                    <dt>{tr ? "Sınıf" : "Class"}</dt>
                    <dd>{selectedClass?.name}</dd>
                  </div>
                  <div>
                    <dt>{tr ? "Kanal" : "Channel"}</dt>
                    <dd>{tr ? "SpeakAce bildirimleri" : "SpeakAce notifications"}</dd>
                  </div>
                </dl>
                <p>
                  {tr
                    ? "Duyuruyu tek bir aksiyon, tarih veya ders odağı etrafında kısa tut."
                    : "Keep the announcement short and centered on one action, date, or lesson focus."}
                </p>
              </aside>
            </section>
          )}

          {activeTab === "study" && (
            <section className="teacher-workspace-form-grid">
              <article className="teacher-workspace-panel teacher-workspace-form-panel">
                <PanelHeading
                  eyebrow={tr ? "Prompt paylaş" : "Share prompt"}
                  title={tr ? "Sınıf study listine ekle" : "Add to the class study list"}
                  icon={<ListChecks size={18} />}
                />
                <div className="teacher-workspace-field-grid">
                  <label>
                    <span>{tr ? "Sınav" : "Exam"}</span>
                    <select value={shareExamType} onChange={(event) => setShareExamType(event.target.value as ExamType)}>
                      <option value="IELTS">IELTS</option>
                      <option value="TOEFL">TOEFL</option>
                    </select>
                  </label>
                  <label>
                    <span>{tr ? "Görev" : "Task"}</span>
                    <select value={shareTaskType} onChange={(event) => setShareTaskType(event.target.value as TaskType)}>
                      {availableTasks.map((task) => <option key={task} value={task}>{humanizeTaskType(task, tr)}</option>)}
                    </select>
                  </label>
                </div>
                <label>
                  <span>Prompt</span>
                  <select value={sharePromptId} onChange={(event) => setSharePromptId(event.target.value)}>
                    {availableSharePrompts.map((prompt) => <option key={prompt.id} value={prompt.id}>{prompt.title}</option>)}
                  </select>
                </label>
                <label>
                  <span>{tr ? "Öğretmen notu" : "Teacher note"}</span>
                  <textarea value={shareNote} onChange={(event) => setShareNote(event.target.value)} rows={4} placeholder={tr ? "Bu promptta neye dikkat etmeleri gerektiğini yaz…" : "Tell learners what to focus on…"} />
                </label>
                <button type="button" className="button button-primary" onClick={sharePromptToClass}>{tr ? "Promptu paylaş" : "Share prompt"}</button>
              </article>

              <article className="teacher-workspace-panel teacher-workspace-form-panel">
                <PanelHeading
                  eyebrow={tr ? "Paylaşılan çalışmalar" : "Shared practice"}
                  title={`${sharedItems.length} ${tr ? "prompt" : sharedItems.length === 1 ? "prompt" : "prompts"}`}
                  icon={<BookOpenCheck size={18} />}
                />
                {sharedItems.length ? (
                  <div className="teacher-workspace-study-list">
                    {sharedItems.map((item, index) => (
                      <div key={item.id}>
                        <i>{String(index + 1).padStart(2, "0")}</i>
                        <span>
                          <strong>{item.title}</strong>
                          <small>{item.examType} · {humanizeTaskType(item.taskType, tr)}</small>
                          {item.note && <p>{item.note}</p>}
                        </span>
                        <button type="button" onClick={() => removeSharedItem(item.id)}>{tr ? "Kaldır" : "Remove"}</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <WorkspaceEmpty
                    title={tr ? "Henüz prompt paylaşılmadı" : "No prompts shared yet"}
                    body={tr ? "Soldaki formdan ilk yönlendirilmiş çalışmayı ekle." : "Add the first guided practice from the form."}
                  />
                )}
              </article>
            </section>
          )}

          {activeTab === "settings" && (
            <section className="teacher-workspace-settings-grid">
              <article className="teacher-workspace-panel teacher-workspace-form-panel">
                <PanelHeading
                  eyebrow={tr ? "Katılım" : "Enrollment"}
                  title={tr ? "Sınıf ayarları" : "Class settings"}
                  icon={<Settings2 size={18} />}
                />
                <label className="teacher-workspace-checkbox">
                  <input type="checkbox" checked={classSettings.approvalRequired} onChange={(event) => setClassSettings((current) => ({ ...current, approvalRequired: event.target.checked }))} />
                  <span>{tr ? "Katılım için öğretmen onayı iste" : "Require teacher approval to join"}</span>
                </label>
                <label>
                  <span>{tr ? "Katılım mesajı" : "Join message"}</span>
                  <textarea value={classSettings.joinMessage} onChange={(event) => setClassSettings((current) => ({ ...current, joinMessage: event.target.value }))} rows={4} placeholder={tr ? "Öğrencinin katıldıktan sonra göreceği not…" : "A short note learners see after joining…"} />
                </label>
                <button type="button" className="button button-primary" onClick={updateClassSettings}>{tr ? "Ayarları kaydet" : "Save settings"}</button>
                <div className="teacher-workspace-divider" />
                <label>
                  <span>{tr ? "E-posta ile öğrenci ekle" : "Add learner by email"}</span>
                  <div className="teacher-workspace-inline-field">
                    <input value={studentEmail} onChange={(event) => setStudentEmail(event.target.value)} placeholder="student@example.com" />
                    <button type="button" className="button button-secondary" onClick={addStudent}>{tr ? "Ekle" : "Add"}</button>
                  </div>
                </label>
                <div className="teacher-workspace-button-row">
                  <a className="button button-secondary" href={`/api/teacher/classes/${selectedClassId}/export`}>{tr ? "CSV indir" : "Download CSV"}</a>
                  <Link className="button button-secondary" href="/app/teacher/compare">{tr ? "Öğrencileri kıyasla" : "Compare learners"}</Link>
                </div>
              </article>

              <article className="teacher-workspace-panel teacher-workspace-form-panel">
                <PanelHeading
                  eyebrow={tr ? "Müsaitlik" : "Availability"}
                  title={tr ? "Ofis saatleri" : "Office hours"}
                  icon={<Clock size={18} />}
                />
                <p className="teacher-workspace-form-note">
                  {tr
                    ? "Öğrencilerin sana ne zaman ulaşabileceğini netleştir."
                    : "Make it clear when learners can reach you."}
                </p>
                <div className="teacher-workspace-field-grid">
                  <label>
                    <span>{tr ? "Başlangıç" : "Start"}</span>
                    <input type="time" value={officeHoursStart} onChange={(event) => setOfficeHoursStart(event.target.value)} />
                  </label>
                  <label>
                    <span>{tr ? "Bitiş" : "End"}</span>
                    <input type="time" value={officeHoursEnd} onChange={(event) => setOfficeHoursEnd(event.target.value)} />
                  </label>
                </div>
                <div className="teacher-workspace-days">
                  <span>{tr ? "Günler" : "Days"}</span>
                  <div>
                    {(tr ? ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"] : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]).map((day, index) => {
                      const key = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index];
                      const active = officeHoursDays.includes(key);
                      return (
                        <button key={key} type="button" className={active ? "is-active" : ""} onClick={() => setOfficeHoursDays((days) => active ? days.filter((item) => item !== key) : [...days, key])}>
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="teacher-workspace-schedule-preview">
                  <Clock size={16} />
                  <span>{officeHoursDays.join(", ")} · {officeHoursStart}–{officeHoursEnd}</span>
                </div>
              </article>

              {pendingRequests.length > 0 && (
                <article className="teacher-workspace-panel teacher-workspace-approval-panel">
                  <PanelHeading
                    eyebrow={tr ? "Bekleyen talepler" : "Pending requests"}
                    title={`${pendingRequests.length} ${tr ? "öğrenci" : pendingRequests.length === 1 ? "learner" : "learners"}`}
                    icon={<CheckCircle size={18} />}
                  />
                  <div className="teacher-workspace-approval-list">
                    {pendingRequests.map((request) => (
                      <div key={request.student.id}>
                        <span>
                          <strong>{request.student.name}</strong>
                          <small>{request.student.email}</small>
                        </span>
                        <time>{new Date(request.requestedAt).toLocaleDateString(tr ? "tr-TR" : "en-US")}</time>
                        <div>
                          <button type="button" onClick={() => handleApproval(request.student.id, "approve")}>{tr ? "Onayla" : "Approve"}</button>
                          <button type="button" onClick={() => handleApproval(request.student.id, "reject")}>{tr ? "Reddet" : "Reject"}</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              )}
            </section>
          )}
        </section>
      </section>
    </main>
  );
}

// ── Helper components ──────────────────────────────────────────────────────────

function TeacherStat({
  label,
  value,
  detail,
  tone = "default"
}: {
  label: string;
  value: string;
  detail?: string;
  tone?: "default" | "alert";
}) {
  return (
    <article className="teacher-workspace-stat" data-tone={tone}>
      <span>{label}</span>
      <strong>{value}</strong>
      {detail && <small>{detail}</small>}
    </article>
  );
}

function ActionRow({ label, value, cta, onClick }: { label: string; value: number; cta: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="teacher-workspace-action-row">
      <span>{String(value).padStart(2, "0")}</span>
      <p>{label}</p>
      <small>{cta}</small>
      <ArrowRight size={15} />
    </button>
  );
}

function PanelHeading({ eyebrow, title, icon }: { eyebrow: string; title: string; icon: ReactNode }) {
  return (
    <div className="teacher-workspace-panel-head">
      <div>
        <span>{eyebrow}</span>
        <strong>{title}</strong>
      </div>
      {icon}
    </div>
  );
}

function WorkspaceEmpty({ title, body }: { title: string; body: string }) {
  return (
    <div className="teacher-workspace-empty">
      <span><Plus size={16} /></span>
      <div>
        <strong>{title}</strong>
        <p>{body}</p>
      </div>
    </div>
  );
}

function getStudentStatus(student: TeacherStudentOverview, tr: boolean): { label: string; tone: "attention" | "good" | "neutral" } {
  if ((student.riskFlags?.length ?? 0) > 0) {
    return { label: tr ? "Takip et" : "Follow up", tone: "attention" };
  }
  if (student.totalSessions === 0) {
    return { label: tr ? "Başlamadı" : "Not started", tone: "neutral" };
  }
  if ((student.scoreDelta ?? 0) > 0) {
    return { label: tr ? "Gelişiyor" : "Improving", tone: "good" };
  }
  return { label: tr ? "Yolunda" : "On track", tone: "good" };
}

function classInitials(name: string) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  return initials || "CL";
}

function personInitials(name: string) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  return initials || "ST";
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

function HubLoading({ label }: { label: string }) {
  return (
    <div className="teacher-workspace-loading">
      <span>{label}</span>
      <div>
        <i />
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}

function TeacherWorkspaceLoading({ tr }: { tr: boolean }) {
  return (
    <main className="teacher-workspace-page page-shell">
      <section className="teacher-workspace teacher-workspace-is-loading" aria-busy="true">
        <section className="teacher-workspace-main">
          <HubLoading label={tr ? "Öğretmen paneli hazırlanıyor…" : "Preparing teacher workspace…"} />
        </section>
      </section>
    </main>
  );
}
