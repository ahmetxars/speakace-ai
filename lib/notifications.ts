import { listAnnouncementsForUser } from "@/lib/announcements-store";
import { listAtRiskStudentsForTeacher, listPendingClassRequests, listTeacherClasses } from "@/lib/classroom-store";
import { listStudentHomework, listTeacherHomework } from "@/lib/homework-store";
import { getProgressSummary } from "@/lib/store";
import { listStudyTaskRemindersForUser } from "@/lib/study-lists-store";
import { MemberProfile } from "@/lib/types";

export type NotificationItem = {
  id: string;
  level: "info" | "warning" | "success";
  title: string;
  body: string;
  href?: string;
  createdAt: string;
};

export async function getNotificationsForUser(profile: MemberProfile, tr: boolean) {
  const announcements = await listAnnouncementsForUser(profile).catch(() => []);

  if (profile.isAdmin) {
    const [teacherClasses, riskStudents] = await Promise.all([
      listTeacherClasses(profile.id).catch(() => []),
      listAtRiskStudentsForTeacher(profile.id).catch(() => [])
    ]);
    const pendingGroups = await Promise.all(
      teacherClasses.map((item) => listPendingClassRequests({ teacherId: profile.id, classId: item.id }).catch(() => []))
    );
    const pendingSummaries = teacherClasses
      .map((item, index) => ({
        ...item,
        pendingCount: pendingGroups[index]?.length ?? 0
      }))
      .filter((item) => item.pendingCount > 0);
    return [
      ...announcements.slice(0, 3).map((item) => ({
        id: `announcement-${item.id}`,
        level: "info" as const,
        title: item.title,
        body: item.body,
        href: "/app/notifications",
        createdAt: item.createdAt
      })),
      ...pendingSummaries.map((item) => ({
          id: `pending-${item.id}`,
          level: "warning" as const,
          title: tr ? "Bekleyen sınıf katılımı" : "Pending class approvals",
          body: tr
            ? `${item.name} sınıfında ${item.pendingCount} bekleyen talep var.`
            : `${item.name} has ${item.pendingCount} pending join requests.`,
          href: "/app/teacher",
          createdAt: new Date().toISOString()
        })),
      ...riskStudents.slice(0, 4).map((student) => ({
        id: `risk-${student.student.id}`,
        level: "warning" as const,
        title: tr ? "Riskli öğrenci uyarısı" : "At-risk student alert",
        body: tr
          ? `${student.student.name} için müdahale gerekebilir: ${(student.riskFlags ?? []).join(", ")}`
          : `${student.student.name} may need intervention: ${(student.riskFlags ?? []).join(", ")}`,
        href: `/app/teacher/student/${student.student.id}`,
        createdAt: new Date().toISOString()
      }))
    ];
  }

  if (profile.isTeacher) {
    const classes = await listTeacherClasses(profile.id).catch(() => []);
    const pendingGroups = await Promise.all(
      classes.map((item) => listPendingClassRequests({ teacherId: profile.id, classId: item.id }).catch(() => []))
    );
    const pendingRequests = pendingGroups.flat().slice(0, 5);
    const homework = await listTeacherHomework(profile.id).catch(() => []);
    const overdue = homework.filter((item) => !item.assignment.completedAt && item.assignment.dueAt && new Date(item.assignment.dueAt).getTime() < Date.now());
    return [
      ...announcements.slice(0, 3).map((item) => ({
        id: `announcement-${item.id}`,
        level: "info" as const,
        title: item.title,
        body: item.body,
        href: "/app/notifications",
        createdAt: item.createdAt
      })),
      ...pendingRequests.map((item) => ({
        id: `approval-${item.classId}-${item.student.id}`,
        level: "warning" as const,
        title: tr ? "Katılım onayı bekliyor" : "Approval required",
        body: tr
          ? `${item.student.name} sınıfa katılmak istiyor.`
          : `${item.student.name} wants to join your class.`,
        href: "/app/teacher",
        createdAt: item.requestedAt
      })),
      ...overdue.slice(0, 5).map((item) => ({
        id: `homework-${item.assignment.id}`,
        level: "info" as const,
        title: tr ? "Geciken homework" : "Overdue homework",
        body: tr
          ? `${item.studentName} için "${item.assignment.title}" gecikmiş durumda.`
          : `"${item.assignment.title}" for ${item.studentName} is overdue.`,
        href: `/app/teacher/student/${item.assignment.studentId}`,
        createdAt: item.assignment.createdAt
      }))
    ];
  }

  const [homework, summary] = await Promise.all([
    listStudentHomework(profile.id).catch(() => []),
    getProgressSummary(profile.id).catch(() => null)
  ]);
  const studyReminders = await listStudyTaskRemindersForUser(profile.id).catch(() => []);
  const now = Date.now();
  const dueSoon = homework.filter((item) => !item.completedAt && item.dueAt && new Date(item.dueAt).getTime() <= now + 1000 * 60 * 60 * 24 * 2);
  const overdue = homework.filter((item) => !item.completedAt && item.dueAt && new Date(item.dueAt).getTime() < now);
  const mission =
    summary && summary.recentSessions[0]
      ? {
          id: "daily-mission",
          level: "success" as const,
          title: tr ? "Bugünün mini görevi" : "Today's mini mission",
          body: tr
            ? `Bugün ${summary.recentSessions[0].taskType} için 1 temiz tekrar kaydı yap.`
            : `Today, do one clean retry for ${summary.recentSessions[0].taskType}.`,
          href: "/app/practice",
          createdAt: new Date().toISOString()
        }
      : null;
  return [
    ...announcements.slice(0, 3).map((item) => ({
      id: `announcement-${item.id}`,
      level: "info" as const,
      title: item.title,
      body: item.body,
      href: "/app/notifications",
      createdAt: item.createdAt
    })),
    ...studyReminders.slice(0, 4).map((item) => ({
      id: `study-reminder-${item.id}`,
      level: item.milestonePercent >= 100 ? ("warning" as const) : ("info" as const),
      title: tr
        ? item.milestonePercent >= 100
          ? "Study task suresi doldu"
          : `Study task icin %${100 - item.milestonePercent} sure kaldi`
        : item.title,
      body: tr
        ? item.body
            .replace("Study task deadline reached", "Study task suresi doldu")
            .replace("of your task time is left", "sure kaldi")
        : item.body,
      href: item.href ?? "/app/study-lists",
      createdAt: item.createdAt
    })),
    ...overdue.slice(0, 3).map((item) => ({
      id: `overdue-${item.id}`,
      level: "warning" as const,
      title: tr ? "Geciken ödev" : "Overdue homework",
      body: tr ? `"${item.title}" için teslim tarihi geçti.` : `The due date passed for "${item.title}".`,
      href: "/app",
      createdAt: item.createdAt
    })),
    ...dueSoon.slice(0, 3).map((item) => ({
      id: `due-soon-${item.id}`,
      level: "info" as const,
      title: tr ? "Yaklaşan teslim" : "Upcoming due date",
      body: tr ? `"${item.title}" yakında teslim edilmeli.` : `"${item.title}" is due soon.`,
      href: "/app",
      createdAt: item.createdAt
    })),
    ...(mission ? [mission] : [])
  ];
}
