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

const IELTS_TASKS: TaskType[] = ["ielts-part-1", "ielts-part-2", "ielts-part-3"];
const TOEFL_TASKS: TaskType[] = ["toefl-task-1", "toefl-task-2", "toefl-task-3", "toefl-task-4"];

export function TeacherHub() {
  const { currentUser, language } = useAppState();
  const tr = language === "tr";
  const [classes, setClasses] = useState<TeacherClassSummary[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [students, setStudents] = useState<TeacherStudentOverview[]>([]);
  const [analytics, setAnalytics] = useState<TeacherClassAnalytics | null>(null);
  const [sharedItems, setSharedItems] = useState<SharedClassStudyItem[]>([]);
  const [pendingRequests, setPendingRequests] = useState<TeacherEnrollmentRequest[]>([]);
  const [newClassName, setNewClassName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState("");
  const [homeworkSummary, setHomeworkSummary] = useState<HomeworkSummary>({ total: 0, completed: 0, pending: 0, overdue: 0 });
  const [filters, setFilters] = useState<{ exam: "all" | ExamType; task: "all" | TaskType; skill: "all" | string }>({
    exam: "all",
    task: "all",
    skill: "all"
  });
  const [studentSearch, setStudentSearch] = useState("");
  const [rule, setRule] = useState<HomeworkAutoAssignRule | null>(null);
  const [shareExamType, setShareExamType] = useState<ExamType>("IELTS");
  const [shareTaskType, setShareTaskType] = useState<TaskType>("ielts-part-1");
  const [sharePromptId, setSharePromptId] = useState("");
  const [shareNote, setShareNote] = useState("");
  const [bulkHomework, setBulkHomework] = useState({
    title: "",
    instructions: "",
    focusSkill: "Balanced practice",
    recommendedTaskType: "ielts-part-1" as TaskType,
    dueDays: 7
  });
  const [classSettings, setClassSettings] = useState({
    approvalRequired: true,
    joinMessage: ""
  });
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementBody, setAnnouncementBody] = useState("");

  const selectedClass = useMemo(() => classes.find((item) => item.id === selectedClassId) ?? null, [classes, selectedClassId]);
  const availableTasks = useMemo(() => (shareExamType === "IELTS" ? IELTS_TASKS : TOEFL_TASKS), [shareExamType]);
  const availableSharePrompts = useMemo(() => listPromptsForTask(shareExamType, shareTaskType), [shareExamType, shareTaskType]);

  useEffect(() => {
    setShareTaskType(shareExamType === "IELTS" ? "ielts-part-1" : "toefl-task-1");
  }, [shareExamType]);

  useEffect(() => {
    setSharePromptId(availableSharePrompts[0]?.id ?? "");
  }, [availableSharePrompts]);

  useEffect(() => {
    if (!selectedClass) return;
    setClassSettings({
      approvalRequired: selectedClass.approvalRequired ?? true,
      joinMessage: selectedClass.joinMessage ?? ""
    });
  }, [selectedClass]);

  const filteredStudents = useMemo(
    () =>
      students.filter((item) => {
        if (filters.exam !== "all" && item.lastExamType !== filters.exam) return false;
        if (filters.task !== "all" && item.lastTaskType !== filters.task) return false;
        if (filters.skill !== "all" && item.weakestSkill !== filters.skill) return false;
        if (studentSearch && !`${item.student.name} ${item.student.email}`.toLowerCase().includes(studentSearch.toLowerCase())) return false;
        return true;
      }),
    [filters.exam, filters.skill, filters.task, studentSearch, students]
  );

  const leaderboard = useMemo(
    () =>
      [...filteredStudents]
        .sort((a, b) => {
          const scoreGap = (b.averageScore ?? 0) - (a.averageScore ?? 0);
          if (scoreGap !== 0) return scoreGap;
          return (b.bestScore ?? 0) - (a.bestScore ?? 0);
        })
        .slice(0, 5),
    [filteredStudents]
  );

  const improvementLeaderboard = useMemo(
    () =>
      [...filteredStudents]
        .filter((item) => typeof item.scoreDelta === "number")
        .sort((a, b) => (b.scoreDelta ?? -999) - (a.scoreDelta ?? -999))
        .slice(0, 5),
    [filteredStudents]
  );

  const filterSkillOptions = useMemo(
    () => [...new Set(students.map((item) => item.weakestSkill).filter(Boolean))] as string[],
    [students]
  );

  const atRiskStudents = useMemo(
    () => filteredStudents.filter((item) => (item.riskFlags?.length ?? 0) > 0).slice(0, 6),
    [filteredStudents]
  );

  const priorityActions = useMemo(() => {
    const items: Array<{ title: string; description: string }> = [];

    if ((selectedClass?.pendingCount ?? 0) > 0) {
      items.push({
        title: tr ? "Bekleyen katılımları onayla" : "Review pending join requests",
        description: tr
          ? `${selectedClass?.pendingCount ?? 0} öğrenci sınıfa girmek için onay bekliyor.`
          : `${selectedClass?.pendingCount ?? 0} students are waiting for teacher approval.`
      });
    }

    if (homeworkSummary.overdue > 0) {
      items.push({
        title: tr ? "Geciken ödevleri toparla" : "Recover overdue homework",
        description: tr
          ? `${homeworkSummary.overdue} homework teslim tarihi geçti; sınıfa kısa bir hatırlatma göndermek iyi olabilir.`
          : `${homeworkSummary.overdue} homework items are overdue; a class reminder could help.`
      });
    }

    if (atRiskStudents.length > 0) {
      items.push({
        title: tr ? "Riskli öğrencileri incele" : "Inspect at-risk students",
        description: tr
          ? `${atRiskStudents.length} öğrencide düşüş veya pasiflik sinyali var.`
          : `${atRiskStudents.length} students show decline or inactivity risk signals.`
      });
    }

    if (!items.length) {
      items.push({
        title: tr ? "Sınıf akışı dengede" : "Class flow looks healthy",
        description: tr
          ? "Şu an kritik uyarı yok; yeni prompt paylaşımı veya toplu homework ile momentumu koruyabilirsin."
          : "No urgent alerts right now; keep momentum with a shared prompt or a fresh class assignment."
      });
    }

    return items.slice(0, 3);
  }, [atRiskStudents.length, homeworkSummary.overdue, selectedClass?.pendingCount, tr]);

  useEffect(() => {
    if (!currentUser?.isTeacher && !currentUser?.isAdmin) return;
    fetch("/api/teacher/classes")
      .then((response) => response.json())
      .then((data: { classes?: TeacherClassSummary[] }) => {
        const nextClasses = data.classes ?? [];
        setClasses(nextClasses);
        setSelectedClassId((current) => current || nextClasses[0]?.id || "");
      });
  }, [currentUser?.id, currentUser?.isAdmin, currentUser?.isTeacher]);

  const refreshHomeworkSummary = useCallback(async () => {
    if (!currentUser?.isTeacher && !currentUser?.isAdmin) return;
    try {
      const response = await fetch("/api/teacher/homework");
      const data = (await response.json()) as { assignments?: Array<{ assignment: { completedAt?: string | null; dueAt?: string | null } }> };
      const assignments = data.assignments ?? [];
      const completed = assignments.filter((item) => item.assignment.completedAt).length;
      const overdue = assignments.filter(
        (item) => !item.assignment.completedAt && item.assignment.dueAt && new Date(item.assignment.dueAt).getTime() < Date.now()
      ).length;
      setHomeworkSummary({
        total: assignments.length,
        completed,
        pending: assignments.length - completed,
        overdue
      });
    } catch {
      setHomeworkSummary({ total: 0, completed: 0, pending: 0, overdue: 0 });
    }
  }, [currentUser?.isAdmin, currentUser?.isTeacher]);

  useEffect(() => {
    void refreshHomeworkSummary();
  }, [currentUser?.id, currentUser?.isAdmin, currentUser?.isTeacher, refreshHomeworkSummary]);

  const loadSelectedClass = useCallback(async (classId: string) => {
    try {
      const [studentsResponse, analyticsResponse, sharedResponse, ruleResponse] = await Promise.all([
        fetch(`/api/teacher/classes/${classId}/students`),
        fetch(`/api/teacher/classes/${classId}/analytics`),
        fetch(`/api/teacher/classes/${classId}/shared-study`),
        fetch(`/api/teacher/classes/${classId}/auto-assign`)
      ]);

      const studentsData = (await studentsResponse.json()) as { students?: TeacherStudentOverview[]; pendingRequests?: TeacherEnrollmentRequest[] };
      const analyticsData = (await analyticsResponse.json()) as { analytics?: TeacherClassAnalytics };
      const sharedData = (await sharedResponse.json()) as { items?: SharedClassStudyItem[] };
      const ruleData = (await ruleResponse.json()) as { rule?: HomeworkAutoAssignRule };

      setStudents(studentsData.students ?? []);
      setPendingRequests(studentsData.pendingRequests ?? []);
      setAnalytics(analyticsData.analytics ?? null);
      setSharedItems(sharedData.items ?? []);
      setRule(ruleData.rule ?? null);
      setClassSettings({
        approvalRequired: selectedClass?.approvalRequired ?? true,
        joinMessage: selectedClass?.joinMessage ?? ""
      });

      if (ruleData.rule?.enabled) {
        const runResponse = await fetch(`/api/teacher/classes/${classId}/auto-assign`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "run" })
        });
        const runData = (await runResponse.json()) as { created?: Array<{ id: string }>; error?: string };
        if (runResponse.ok && (runData.created?.length ?? 0) > 0) {
          setNotice(
            tr
              ? `${runData.created?.length} ogrenci icin otomatik homework uretildi.`
              : `Auto homework generated for ${runData.created?.length} students.`
          );
          void refreshHomeworkSummary();
        }
      }
    } catch {
      setStudents([]);
      setAnalytics(null);
      setSharedItems([]);
      setRule(null);
      setPendingRequests([]);
    }
  }, [refreshHomeworkSummary, selectedClass?.approvalRequired, selectedClass?.joinMessage, tr]);

  useEffect(() => {
    if (!selectedClassId) {
      setStudents([]);
      setAnalytics(null);
      setSharedItems([]);
      setRule(null);
      return;
    }
    void loadSelectedClass(selectedClassId);
  }, [loadSelectedClass, selectedClassId, tr]);

  const createClass = async () => {
    setError("");
    setNotice("");
    const response = await fetch("/api/teacher/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newClassName })
    });
    const data = (await response.json()) as { classroom?: TeacherClassSummary; error?: string };
    if (!response.ok || !data.classroom) {
      setError(data.error ?? (tr ? "Sinif olusturulamadi." : "Could not create class."));
      return;
    }
    const nextClasses = [data.classroom, ...classes];
    setClasses(nextClasses);
    setSelectedClassId(data.classroom.id);
    setNewClassName("");
    setNotice(tr ? "Sinif olusturuldu." : "Class created.");
  };

  const addStudent = async () => {
    if (!selectedClassId) return;
    setError("");
    setNotice("");
    const response = await fetch(`/api/teacher/classes/${selectedClassId}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: studentEmail })
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(data.error ?? (tr ? "Ogrenci eklenemedi." : "Could not add student."));
      return;
    }
    setStudentEmail("");
    setNotice(tr ? "Ogrenci sinifa eklendi." : "Student added to class.");
    await loadSelectedClass(selectedClassId);
    setClasses((current) => current.map((item) => (item.id === selectedClassId ? { ...item, studentCount: item.studentCount + 1 } : item)));
  };

  const updateClassSettings = async () => {
    if (!selectedClassId) return;
    setError("");
    setNotice("");
    const response = await fetch(`/api/teacher/classes/${selectedClassId}/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(classSettings)
    });
    const data = (await response.json()) as { classroom?: TeacherClassSummary; error?: string };
    if (!response.ok || !data.classroom) {
      setError(data.error ?? (tr ? "Sinif ayarlari kaydedilemedi." : "Could not save class settings."));
      return;
    }
    setClasses((current) => current.map((item) => (item.id === selectedClassId ? { ...item, ...data.classroom } : item)));
    setNotice(tr ? "Sinif ayarlari kaydedildi." : "Class settings saved.");
  };

  const handleApproval = async (studentId: string, action: "approve" | "reject") => {
    if (!selectedClassId) return;
    setError("");
    setNotice("");
    const response = await fetch(`/api/teacher/classes/${selectedClassId}/approvals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, action })
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(data.error ?? (tr ? "Onay islemi tamamlanamadi." : "Could not update approval."));
      return;
    }
    setPendingRequests((current) => current.filter((item) => item.student.id !== studentId));
    await loadSelectedClass(selectedClassId);
    setNotice(action === "approve" ? (tr ? "Ogrenci onaylandi." : "Student approved.") : tr ? "Talep reddedildi." : "Request rejected.");
  };

  const assignBulkHomework = async () => {
    if (!selectedClassId) return;
    setError("");
    setNotice("");
    const response = await fetch(`/api/teacher/classes/${selectedClassId}/bulk-homework`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...bulkHomework,
        dueAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * bulkHomework.dueDays).toISOString()
      })
    });
    const data = (await response.json()) as { created?: Array<{ id: string }>; error?: string };
    if (!response.ok) {
      setError(data.error ?? (tr ? "Toplu homework olusturulamadi." : "Could not create bulk homework."));
      return;
    }
    setNotice(tr ? `${data.created?.length ?? 0} ogrenciye toplu homework atandi.` : `Bulk homework assigned to ${data.created?.length ?? 0} students.`);
    await refreshHomeworkSummary();
  };

  const copyJoinCode = async () => {
    if (!selectedClass?.joinCode) return;
    try {
      await navigator.clipboard.writeText(selectedClass.joinCode);
      setCopiedCode(selectedClass.joinCode);
      setNotice(tr ? "Join code kopyalandi." : "Join code copied.");
      setTimeout(() => setCopiedCode(""), 1800);
    } catch {
      setError(tr ? "Join code kopyalanamadi." : "Could not copy join code.");
    }
  };

  const copyInviteMessage = async () => {
    if (!selectedClass) return;
    const message = tr
      ? `Merhaba! SpeakAce AI'daki "${selectedClass.name}" sinifina katilmak icin dashboard ekraninda class code alanina ${selectedClass.joinCode} kodunu gir. Katildiktan sonra speaking sonuclarin ogretmen paneline dusecek.`
      : `Hi! To join the "${selectedClass.name}" class in SpeakAce AI, open your dashboard and enter the class code ${selectedClass.joinCode} in the join box. Once you join, your speaking results will appear in the teacher panel.`;
    try {
      await navigator.clipboard.writeText(message);
      setNotice(tr ? "Davet mesaji kopyalandi." : "Invite message copied.");
    } catch {
      setError(tr ? "Davet mesaji kopyalanamadi." : "Could not copy invite message.");
    }
  };

  const saveAutoAssignRule = async () => {
    if (!selectedClassId || !rule) return;
    setError("");
    setNotice("");
    const response = await fetch(`/api/teacher/classes/${selectedClassId}/auto-assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rule)
    });
    const data = (await response.json()) as { rule?: HomeworkAutoAssignRule; error?: string };
    if (!response.ok || !data.rule) {
      setError(data.error ?? (tr ? "Kural kaydedilemedi." : "Could not save rule."));
      return;
    }
    setRule(data.rule);
    setNotice(tr ? "Otomatik odev kurali kaydedildi." : "Auto-assign rule saved.");
  };

  const sendClassAnnouncement = async () => {
    if (!selectedClassId) return;
    setError("");
    setNotice("");
    const response = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        audienceType: "class",
        classId: selectedClassId,
        title: announcementTitle,
        body: announcementBody
      })
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(data.error ?? (tr ? "Sinif duyurusu gonderilemedi." : "Could not send class announcement."));
      return;
    }
    setAnnouncementTitle("");
    setAnnouncementBody("");
    setNotice(tr ? "Sinif duyurusu gonderildi." : "Class announcement sent.");
  };

  const runAutoAssignNow = async () => {
    if (!selectedClassId) return;
    setError("");
    setNotice("");
    const response = await fetch(`/api/teacher/classes/${selectedClassId}/auto-assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "run" })
    });
    const data = (await response.json()) as { created?: Array<{ id: string }>; error?: string };
    if (!response.ok) {
      setError(data.error ?? (tr ? "Otomatik atama calistirilamadi." : "Could not run auto assignment."));
      return;
    }
    setNotice(
      tr ? `${data.created?.length ?? 0} yeni homework uretildi.` : `${data.created?.length ?? 0} new homework items created.`
    );
    await refreshHomeworkSummary();
    await loadSelectedClass(selectedClassId);
  };

  const sharePromptToClass = async () => {
    if (!selectedClassId || !sharePromptId) return;
    setError("");
    setNotice("");
    const response = await fetch(`/api/teacher/classes/${selectedClassId}/shared-study`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ promptId: sharePromptId, note: shareNote })
    });
    const data = (await response.json()) as { item?: SharedClassStudyItem; error?: string };
    if (!response.ok || !data.item) {
      setError(data.error ?? (tr ? "Prompt paylasilamadi." : "Could not share prompt."));
      return;
    }
    setSharedItems((current) => [data.item!, ...current]);
    setShareNote("");
    setNotice(tr ? "Prompt sinif study list'ine eklendi." : "Prompt added to the class study list.");
  };

  const removeSharedItem = async (itemId: string) => {
    if (!selectedClassId) return;
    setError("");
    const response = await fetch(`/api/teacher/classes/${selectedClassId}/shared-study?itemId=${encodeURIComponent(itemId)}`, {
      method: "DELETE"
    });
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? (tr ? "Prompt kaldirilamadi." : "Could not remove prompt."));
      return;
    }
    setSharedItems((current) => current.filter((item) => item.id !== itemId));
  };

  if (!currentUser?.isTeacher && !currentUser?.isAdmin) {
    return (
      <div className="page-shell section">
        <section className="card" style={{ padding: "1.5rem", display: "grid", gap: "0.8rem" }}>
          <span className="eyebrow">Teacher hub</span>
          <h1 style={{ margin: 0 }}>{tr ? "Ogretmen erisimi gerekli" : "Teacher access required"}</h1>
          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
            {tr ? "Bu paneli kullanmak icin hesabinin teacher olarak tanimlanmis olmasi gerekiyor." : "Your account must be marked as a teacher to use this panel."}
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="page-shell section" style={{ display: "grid", gap: "1.2rem" }}>

      {/* ── 1. Hero ─────────────────────────────────────────────────────────── */}
      <section className="card" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
        <span className="eyebrow">Teacher hub</span>
        <h1 style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", margin: 0 }}>
          {tr ? "Öğretmen paneli" : "Teacher panel"}
        </h1>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.7rem" }}>
          <TeacherStat label={tr ? "Toplam ödev" : "Total homework"} value={String(homeworkSummary.total)} />
          <TeacherStat label={tr ? "Tamamlanan" : "Completed"} value={String(homeworkSummary.completed)} />
          <TeacherStat label={tr ? "Bekleyen" : "Pending"} value={String(homeworkSummary.pending)} />
          <TeacherStat label={tr ? "Geciken" : "Overdue"} value={String(homeworkSummary.overdue)} />
        </div>
        <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
          <button type="button" className="button button-secondary" onClick={runAutoAssignNow} disabled={!selectedClassId}>
            {tr ? "Otomatik ödevi çalıştır" : "Run auto homework"}
          </button>
          <button type="button" className="button button-secondary" onClick={copyInviteMessage} disabled={!selectedClass}>
            {tr ? "Davet mesajını kopyala" : "Copy invite message"}
          </button>
          <Link className="button button-secondary" href="/app/teacher/institution">
            {tr ? "Kurum analitiği" : "Institution analytics"}
          </Link>
        </div>
      </section>

      {/* ── 2. Notice / error ───────────────────────────────────────────────── */}
      {(notice || error) && (
        <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
          {notice && <p style={{ color: "var(--success)", margin: 0 }}>{notice}</p>}
          {error && <p style={{ color: "var(--accent-deep)", margin: 0 }}>{error}</p>}
        </div>
      )}

      {/* ── 3. Class selector + control center ─────────────────────────────── */}
      <section className="grid" style={{ gridTemplateColumns: "minmax(280px, 1fr) minmax(280px, 1.4fr)", gap: "1rem", alignItems: "start" }}>

        {/* Left: class list + create */}
        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem" }}>
          <span className="eyebrow">{tr ? "Sınıflar" : "Classes"}</span>
          <h2 style={{ fontSize: "1.8rem", margin: 0 }}>{tr ? "Sınıf seç veya oluştur" : "Select or create a class"}</h2>
          <div style={{ display: "flex", gap: "0.6rem" }}>
            <input
              value={newClassName}
              onChange={(event) => setNewClassName(event.target.value)}
              placeholder={tr ? "Yeni sınıf adı" : "New class name"}
              style={{ flex: 1, padding: "0.8rem", borderRadius: 14, border: "1px solid var(--line)" }}
            />
            <button type="button" className="button button-primary" onClick={createClass} disabled={!newClassName.trim()}>
              {tr ? "Oluştur" : "Create"}
            </button>
          </div>
          <div style={{ display: "grid", gap: "0.55rem" }}>
            {classes.map((item) => (
              <button
                key={item.id}
                type="button"
                className="card"
                onClick={() => setSelectedClassId(item.id)}
                style={{
                  padding: "0.9rem",
                  textAlign: "left",
                  background: selectedClassId === item.id ? "rgba(29, 111, 117, 0.1)" : "var(--surface)",
                  cursor: "pointer",
                  border: selectedClassId === item.id ? "1.5px solid var(--accent)" : "1px solid var(--line)"
                }}
              >
                <strong>{item.name}</strong>
                <div className="practice-meta" style={{ marginTop: "0.3rem" }}>
                  {tr
                    ? `Kod: ${item.joinCode} · ${item.studentCount} öğrenci${(item.pendingCount ?? 0) > 0 ? ` · ${item.pendingCount} bekleyen` : ""}`
                    : `Code: ${item.joinCode} · ${item.studentCount} students${(item.pendingCount ?? 0) > 0 ? ` · ${item.pendingCount} pending` : ""}`}
                </div>
              </button>
            ))}
            {!classes.length && (
              <p style={{ margin: 0, color: "var(--muted)" }}>
                {tr ? "Henüz sınıf yok. Yukarıdan ilk sınıfını oluştur." : "No classes yet. Create your first one above."}
              </p>
            )}
          </div>
        </div>

        {/* Right: selected class overview */}
        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem", background: "rgba(29, 111, 117, 0.06)" }}>
          <span className="eyebrow">{tr ? "Seçili sınıf" : "Selected class"}</span>
          {selectedClass ? (
            <>
              <h2 style={{ fontSize: "1.9rem", margin: 0 }}>{selectedClass.name}</h2>
              <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", flexWrap: "wrap" }}>
                <span className="pill" style={{ fontSize: "1.05rem", letterSpacing: "0.08em" }}>{selectedClass.joinCode}</span>
                <button type="button" className="button button-secondary" onClick={copyJoinCode}>
                  {copiedCode === selectedClass.joinCode ? (tr ? "Kopyalandı ✓" : "Copied ✓") : (tr ? "Kodu kopyala" : "Copy code")}
                </button>
                <button type="button" className="button button-secondary" onClick={copyInviteMessage}>
                  {tr ? "Davet mesajı" : "Invite message"}
                </button>
              </div>
              {analytics ? (
                <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "0.6rem" }}>
                  <TeacherStat label={tr ? "Sınıf ort." : "Class avg"} value={analytics.classAverageScore ? analytics.classAverageScore.toFixed(1) : "-"} />
                  <TeacherStat label={tr ? "Aktif" : "Active"} value={String(analytics.activeStudents)} />
                  <TeacherStat label={tr ? "Deneme" : "Attempts"} value={String(analytics.totalAttempts)} />
                  <TeacherStat label={tr ? "Ödev oranı" : "HW rate"} value={`${analytics.homeworkCompletionRate ?? 0}%`} />
                  <TeacherStat label={tr ? "Geciken" : "Overdue"} value={String(analytics.overdueHomeworkCount ?? 0)} />
                  <TeacherStat label={tr ? "Bekleyen" : "Pending"} value={String(analytics.pendingApprovalCount ?? 0)} />
                  <TeacherStat label={tr ? "Riskli" : "At-risk"} value={String(analytics.atRiskStudentCount ?? 0)} />
                  <TeacherStat
                    label={tr ? "Zayıf alan" : "Weak area"}
                    value={analytics.mostCommonWeakestSkill ? translateCategoryLabel(analytics.mostCommonWeakestSkill, tr) : "-"}
                  />
                </div>
              ) : (
                <p style={{ margin: 0, color: "var(--muted)" }}>{tr ? "Analitik yükleniyor…" : "Loading analytics…"}</p>
              )}
              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                <a className="button button-secondary" href={`/api/teacher/classes/${selectedClassId}/export`}>
                  {tr ? "CSV rapor indir" : "Download CSV"}
                </a>
                <Link className="button button-secondary" href="/app/teacher/compare">
                  {tr ? "Öğrenci karşılaştır" : "Compare students"}
                </Link>
              </div>
            </>
          ) : (
            <p style={{ margin: 0, color: "var(--muted)" }}>
              {tr ? "Soldan bir sınıf seçtiğinde detaylar burada görünür." : "Select a class on the left to see details here."}
            </p>
          )}
        </div>
      </section>

      {/* ── 4. Priority board (always visible, content changes per class) ──── */}
      <section className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem" }}>
        <div>
          <span className="eyebrow">{tr ? "Öncelik panosu" : "Priority board"}</span>
          <h2 style={{ fontSize: "1.7rem", margin: "0.4rem 0 0" }}>
            {tr ? "Bugün en çok etkisi olacak adımlar" : "Highest-impact actions for today"}
          </h2>
        </div>
        <div className="quick-action-grid">
          {priorityActions.map((item) => (
            <article key={item.title} className="card quick-action-card" style={{ textAlign: "left" }}>
              <strong>{item.title}</strong>
              <div className="practice-meta">{item.description}</div>
            </article>
          ))}
        </div>
      </section>

      {/* ── 5. Pending approvals (only when there are some) ─────────────────── */}
      {selectedClass && pendingRequests.length > 0 && (
        <section className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem", background: "rgba(255, 200, 0, 0.06)" }}>
          <div>
            <span className="eyebrow">{tr ? "Katılım onayları" : "Join approvals"}</span>
            <h2 style={{ fontSize: "1.7rem", margin: "0.4rem 0 0" }}>
              {tr ? `${pendingRequests.length} öğrenci onay bekliyor` : `${pendingRequests.length} students awaiting approval`}
            </h2>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "0.7rem" }}>
            {pendingRequests.map((item) => (
              <div key={item.student.id} className="card" style={{ padding: "1rem", display: "grid", gap: "0.5rem" }}>
                <strong>{item.student.name}</strong>
                <div className="practice-meta">{item.student.email}</div>
                <div className="practice-meta">{new Date(item.requestedAt).toLocaleString(tr ? "tr-TR" : "en-US")}</div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button type="button" className="button button-primary" onClick={() => handleApproval(item.student.id, "approve")}>
                    {tr ? "Onayla" : "Approve"}
                  </button>
                  <button type="button" className="button button-secondary" onClick={() => handleApproval(item.student.id, "reject")}>
                    {tr ? "Reddet" : "Reject"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 6. At-risk alerts (only when there are some) ────────────────────── */}
      {selectedClass && atRiskStudents.length > 0 && (
        <section className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem", background: "rgba(217, 93, 57, 0.07)" }}>
          <div>
            <span className="eyebrow">{tr ? "Risk sinyali" : "At-risk"}</span>
            <h2 style={{ fontSize: "1.7rem", margin: "0.4rem 0 0" }}>
              {tr ? `${atRiskStudents.length} öğrencide uyarı sinyali var` : `${atRiskStudents.length} students with risk signals`}
            </h2>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.6rem" }}>
            {atRiskStudents.map((item) => (
              <Link key={item.student.id} href={`/app/teacher/student/${item.student.id}`} className="card" style={{ padding: "0.9rem", display: "grid", gap: "0.3rem" }}>
                <strong>{item.student.name}</strong>
                <div className="practice-meta">{(item.riskFlags ?? []).join(" · ")}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── 7. Student list (when class selected) ───────────────────────────── */}
      {selectedClass && (
        <section className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "0.8rem" }}>
            <div>
              <span className="eyebrow">{tr ? "Öğrenci listesi" : "Student roster"}</span>
              <h2 style={{ fontSize: "1.7rem", margin: "0.4rem 0 0" }}>
                {filteredStudents.length === students.length
                  ? (tr ? `${students.length} öğrenci` : `${students.length} students`)
                  : (tr ? `${filteredStudents.length} / ${students.length} öğrenci` : `${filteredStudents.length} of ${students.length} students`)}
              </h2>
            </div>
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
              <input
                value={studentSearch}
                onChange={(event) => setStudentSearch(event.target.value)}
                placeholder={tr ? "Öğrenci ara…" : "Search students…"}
                style={{ padding: "0.7rem 1rem", borderRadius: 14, border: "1px solid var(--line)", minWidth: 160 }}
              />
              <select value={filters.exam} onChange={(event) => setFilters((current) => ({ ...current, exam: event.target.value as "all" | ExamType }))} style={selectStyle}>
                <option value="all">{tr ? "Tüm sınavlar" : "All exams"}</option>
                <option value="IELTS">IELTS</option>
                <option value="TOEFL">TOEFL</option>
              </select>
              <select value={filters.task} onChange={(event) => setFilters((current) => ({ ...current, task: event.target.value as "all" | TaskType }))} style={selectStyle}>
                <option value="all">{tr ? "Tüm taskler" : "All tasks"}</option>
                {[...IELTS_TASKS, ...TOEFL_TASKS].map((task) => (
                  <option key={task} value={task}>{humanizeTaskType(task, tr)}</option>
                ))}
              </select>
              {filterSkillOptions.length > 0 && (
                <select value={filters.skill} onChange={(event) => setFilters((current) => ({ ...current, skill: event.target.value }))} style={selectStyle}>
                  <option value="all">{tr ? "Tüm beceriler" : "All skills"}</option>
                  {filterSkillOptions.map((skill) => (
                    <option key={skill} value={skill}>{translateCategoryLabel(skill, tr)}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div style={{ display: "grid", gap: "0.55rem" }}>
            {filteredStudents.length ? (
              filteredStudents.map((item) => (
                <Link key={item.student.id} href={`/app/teacher/student/${item.student.id}`} className="card" style={{ padding: "1rem", display: "grid", gap: "0.5rem", background: "var(--surface-strong)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                    <div>
                      <strong>{item.student.name}</strong>
                      <div className="practice-meta" style={{ marginTop: "0.2rem" }}>{item.student.email}</div>
                    </div>
                    <span className="pill">{item.averageScore ? item.averageScore.toFixed(1) : "-"}</span>
                  </div>
                  <div className="grid" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "0.5rem" }}>
                    <TeacherStat label={tr ? "Deneme" : "Attempts"} value={String(item.totalSessions)} />
                    <TeacherStat label="Best" value={item.bestScore?.toFixed(1) ?? "-"} />
                    <TeacherStat label={tr ? "Zayıf" : "Weak"} value={item.weakestSkill ? translateCategoryLabel(item.weakestSkill, tr) : "-"} />
                    <TeacherStat label={tr ? "Artış" : "Delta"} value={formatDelta(item.scoreDelta)} />
                  </div>
                </Link>
              ))
            ) : (
              <div className="card" style={{ padding: "1rem", color: "var(--muted)" }}>
                {tr ? "Bu filtrelerle eşleşen öğrenci yok." : "No students match the current filters."}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── 8. Leaderboards (when class selected) ───────────────────────────── */}
      {selectedClass && (leaderboard.length > 0 || improvementLeaderboard.length > 0) && (
        <section className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem", alignItems: "start" }}>
          <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
            <span className="eyebrow">{tr ? "En yüksek skorlar" : "Top scorers"}</span>
            {leaderboard.map((item, index) => (
              <div key={item.student.id} style={{ display: "grid", gridTemplateColumns: "28px minmax(0, 1fr) auto", gap: "0.7rem", alignItems: "center" }}>
                <span className="pill" style={{ fontSize: "0.8rem" }}>#{index + 1}</span>
                <div>
                  <strong>{item.student.name}</strong>
                  <div className="practice-meta">{tr ? "Ort." : "Avg"} {item.averageScore ? item.averageScore.toFixed(1) : "-"}</div>
                </div>
                <strong>{item.bestScore?.toFixed(1) ?? "-"}</strong>
              </div>
            ))}
          </div>
          <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
            <span className="eyebrow">{tr ? "En çok gelişenler" : "Most improved"}</span>
            {improvementLeaderboard.length ? (
              improvementLeaderboard.map((item, index) => (
                <div key={item.student.id} style={{ display: "grid", gridTemplateColumns: "28px minmax(0, 1fr) auto", gap: "0.7rem", alignItems: "center" }}>
                  <span className="pill" style={{ fontSize: "0.8rem" }}>+{index + 1}</span>
                  <div>
                    <strong>{item.student.name}</strong>
                    <div className="practice-meta">{item.lastTaskType ? humanizeTaskType(item.lastTaskType, tr) : "-"}</div>
                  </div>
                  <strong style={{ color: (item.scoreDelta ?? 0) >= 0 ? "var(--success)" : "var(--accent-deep)" }}>
                    {formatDelta(item.scoreDelta)}
                  </strong>
                </div>
              ))
            ) : (
              <p style={{ margin: 0, color: "var(--muted)" }}>{tr ? "Henüz yeterli delta verisi yok." : "Not enough score delta data yet."}</p>
            )}
          </div>
        </section>
      )}

      {/* ── 9. Homework tools (when class selected) ─────────────────────────── */}
      {selectedClass && (
        <section className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem", alignItems: "start" }}>

          {/* Bulk homework */}
          <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
            <span className="eyebrow">{tr ? "Toplu ödev" : "Bulk homework"}</span>
            <h2 style={{ fontSize: "1.5rem", margin: 0 }}>{tr ? "Sınıfa ödev ata" : "Assign to whole class"}</h2>
            <input
              value={bulkHomework.title}
              onChange={(event) => setBulkHomework((current) => ({ ...current, title: event.target.value }))}
              placeholder={tr ? "Ödev başlığı" : "Homework title"}
              style={{ padding: "0.8rem", borderRadius: 14, border: "1px solid var(--line)" }}
            />
            <textarea
              value={bulkHomework.instructions}
              onChange={(event) => setBulkHomework((current) => ({ ...current, instructions: event.target.value }))}
              rows={3}
              placeholder={tr ? "Tüm sınıfa gidecek yönergeler…" : "Instructions for the entire class…"}
              style={{ padding: "0.8rem", borderRadius: 14, border: "1px solid var(--line)", resize: "vertical" }}
            />
            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
              <select value={bulkHomework.recommendedTaskType} onChange={(event) => setBulkHomework((current) => ({ ...current, recommendedTaskType: event.target.value as TaskType }))} style={selectStyle}>
                {[...IELTS_TASKS, ...TOEFL_TASKS].map((task) => (
                  <option key={task} value={task}>{humanizeTaskType(task, tr)}</option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                max="21"
                value={bulkHomework.dueDays}
                onChange={(event) => setBulkHomework((current) => ({ ...current, dueDays: Number(event.target.value) || 7 }))}
                placeholder={tr ? "Teslim günü" : "Due in days"}
                style={{ padding: "0.8rem", borderRadius: 14, border: "1px solid var(--line)" }}
              />
            </div>
            <button type="button" className="button button-primary" onClick={assignBulkHomework}>
              {tr ? "Sınıfa ata" : "Assign to class"}
            </button>
          </div>

          {/* Auto-assign rule */}
          <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
            <span className="eyebrow">{tr ? "Otomatik atama" : "Auto-assign"}</span>
            <h2 style={{ fontSize: "1.5rem", margin: 0 }}>{tr ? "Düşük skor kuralı" : "Low-score rule"}</h2>
            <label style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <input type="checkbox" checked={Boolean(rule?.enabled)} onChange={(event) => setRule((current) => current ? { ...current, enabled: event.target.checked } : current)} />
              <span className="practice-meta">{tr ? "Otomatik atamayı etkinleştir" : "Enable auto-assign"}</span>
            </label>
            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
              <label style={{ display: "grid", gap: "0.3rem" }}>
                <span className="practice-meta">{tr ? "Skor eşiği" : "Score threshold"}</span>
                <input
                  type="number"
                  min="1"
                  max="9"
                  step="0.1"
                  value={rule?.scoreThreshold ?? 5.5}
                  onChange={(event) => setRule((current) => current ? { ...current, scoreThreshold: Number(event.target.value) } : current)}
                  style={{ padding: "0.8rem", borderRadius: 14, border: "1px solid var(--line)" }}
                />
              </label>
              <label style={{ display: "grid", gap: "0.3rem" }}>
                <span className="practice-meta">{tr ? "Teslim günü" : "Due in days"}</span>
                <input
                  type="number"
                  min="1"
                  max="21"
                  value={rule?.dueDays ?? 7}
                  onChange={(event) => setRule((current) => current ? { ...current, dueDays: Number(event.target.value) } : current)}
                  style={{ padding: "0.8rem", borderRadius: 14, border: "1px solid var(--line)" }}
                />
              </label>
              <select value={rule?.examType ?? "all"} onChange={(event) => setRule((current) => current ? { ...current, examType: event.target.value as HomeworkAutoAssignRule["examType"] } : current)} style={selectStyle}>
                <option value="all">{tr ? "Tüm sınavlar" : "All exams"}</option>
                <option value="IELTS">IELTS</option>
                <option value="TOEFL">TOEFL</option>
              </select>
              <select value={rule?.taskType ?? "all"} onChange={(event) => setRule((current) => current ? { ...current, taskType: event.target.value as HomeworkAutoAssignRule["taskType"] } : current)} style={selectStyle}>
                <option value="all">{tr ? "Tüm taskler" : "All tasks"}</option>
                {[...IELTS_TASKS, ...TOEFL_TASKS].map((task) => (
                  <option key={task} value={task}>{humanizeTaskType(task, tr)}</option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
              <button type="button" className="button button-secondary" onClick={saveAutoAssignRule}>{tr ? "Kuralı kaydet" : "Save rule"}</button>
              <button type="button" className="button button-secondary" onClick={runAutoAssignNow}>{tr ? "Şimdi çalıştır" : "Run now"}</button>
            </div>
          </div>
        </section>
      )}

      {/* ── 10. Study list share (when class selected) ──────────────────────── */}
      {selectedClass && (
        <section className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem", alignItems: "start" }}>

          {/* Share prompt */}
          <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
            <span className="eyebrow">{tr ? "Study list paylaş" : "Share study list"}</span>
            <h2 style={{ fontSize: "1.5rem", margin: 0 }}>{tr ? "Sınıfa prompt ekle" : "Add prompt to class"}</h2>
            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
              <select value={shareExamType} onChange={(event) => setShareExamType(event.target.value as ExamType)} style={selectStyle}>
                <option value="IELTS">IELTS</option>
                <option value="TOEFL">TOEFL</option>
              </select>
              <select value={shareTaskType} onChange={(event) => setShareTaskType(event.target.value as TaskType)} style={selectStyle}>
                {availableTasks.map((task) => (
                  <option key={task} value={task}>{humanizeTaskType(task, tr)}</option>
                ))}
              </select>
            </div>
            <select value={sharePromptId} onChange={(event) => setSharePromptId(event.target.value)} style={selectStyle}>
              {availableSharePrompts.map((prompt) => (
                <option key={prompt.id} value={prompt.id}>{prompt.title}</option>
              ))}
            </select>
            <textarea
              value={shareNote}
              onChange={(event) => setShareNote(event.target.value)}
              rows={2}
              placeholder={tr ? "Kısa yönlendirme notu…" : "Short guidance note for the class…"}
              style={{ padding: "0.8rem", borderRadius: 14, border: "1px solid var(--line)", resize: "vertical" }}
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
                  <div key={item.id} className="card" style={{ padding: "0.85rem", background: "rgba(29, 111, 117, 0.06)", display: "grid", gap: "0.35rem" }}>
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
                {tr ? "Henüz paylaşılan prompt yok." : "No prompts shared with this class yet."}
              </p>
            )}
          </div>
        </section>
      )}

      {/* ── 11. Announcement + Class settings (when class selected) ─────────── */}
      {selectedClass && (
        <section className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem", alignItems: "start" }}>

          {/* Announcement */}
          <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
            <span className="eyebrow">{tr ? "Duyuru" : "Announcement"}</span>
            <h2 style={{ fontSize: "1.5rem", margin: 0 }}>{tr ? "Sınıfa mesaj gönder" : "Message the class"}</h2>
            <input
              value={announcementTitle}
              onChange={(event) => setAnnouncementTitle(event.target.value)}
              placeholder={tr ? "Duyuru başlığı" : "Announcement title"}
              style={{ padding: "0.8rem", borderRadius: 14, border: "1px solid var(--line)" }}
            />
            <textarea
              value={announcementBody}
              onChange={(event) => setAnnouncementBody(event.target.value)}
              rows={3}
              placeholder={tr ? "Sınıfa gidecek duyuru…" : "Announcement for the class…"}
              style={{ padding: "0.8rem", borderRadius: 14, border: "1px solid var(--line)", resize: "vertical" }}
            />
            <button type="button" className="button button-primary" onClick={sendClassAnnouncement}>
              {tr ? "Duyuruyu gönder" : "Send announcement"}
            </button>
          </div>

          {/* Class settings + add student */}
          <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
            <span className="eyebrow">{tr ? "Sınıf ayarları" : "Class settings"}</span>
            <h2 style={{ fontSize: "1.5rem", margin: 0 }}>{tr ? "Katılım & öğrenci" : "Enrollment & students"}</h2>
            <label style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <input type="checkbox" checked={classSettings.approvalRequired} onChange={(event) => setClassSettings((current) => ({ ...current, approvalRequired: event.target.checked }))} />
              <span className="practice-meta">{tr ? "Katılım onayı gereksin" : "Require approval to join"}</span>
            </label>
            <textarea
              value={classSettings.joinMessage}
              onChange={(event) => setClassSettings((current) => ({ ...current, joinMessage: event.target.value }))}
              rows={2}
              placeholder={tr ? "Katılım sonrası öğrenciye kısa mesaj…" : "Short note students see after joining…"}
              style={{ padding: "0.8rem", borderRadius: 14, border: "1px solid var(--line)", resize: "vertical" }}
            />
            <button type="button" className="button button-secondary" onClick={updateClassSettings}>
              {tr ? "Ayarları kaydet" : "Save settings"}
            </button>
            <div style={{ display: "flex", gap: "0.6rem" }}>
              <input
                value={studentEmail}
                onChange={(event) => setStudentEmail(event.target.value)}
                placeholder="student@example.com"
                style={{ flex: 1, padding: "0.8rem", borderRadius: 14, border: "1px solid var(--line)" }}
              />
              <button type="button" className="button button-secondary" onClick={addStudent}>
                {tr ? "Ekle" : "Add"}
              </button>
            </div>
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
              <Link className="button button-secondary" href="/app/teacher/billing">
                {tr ? "Kurum paketi" : "Institution plan"}
              </Link>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}

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
  const labels: Record<string, string> = {
    "Fluency and Coherence": "Akıcılık ve Tutarlılık",
    "Lexical Resource": "Kelime Kullanımı",
    "Grammatical Range and Accuracy": "Dilbilgisi ve Doğruluk",
    Pronunciation: "Telaffuz",
    Delivery: "Delivery",
    "Language Use": "Dil kullanımı",
    "Topic Development": "İçerik gelişimi"
  };
  return labels[label] ?? label;
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
    "toefl-integrated": { tr: "TOEFL Integrated", en: "TOEFL Integrated" }
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
  background: "white"
};
