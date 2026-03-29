import { getMember, getProgressSummary } from "@/lib/store";
import { getSql, hasDatabaseUrl } from "@/lib/server/db";
import { listTeacherHomework } from "@/lib/homework-store";
import {
  InstitutionBillingSummary,
  MemberProfile,
  StudentClassMembership,
  TeacherClass,
  TeacherClassAnalytics,
  TeacherNote,
  TeacherStudentOverview
} from "@/lib/types";

type MemoryClassroomStore = {
  classes: Map<string, TeacherClass>;
  enrollments: Map<string, Set<string>>;
  notes: Map<string, TeacherNote>;
  billing: Map<string, InstitutionBillingSummary>;
};

function getStore(): MemoryClassroomStore {
  const globalStore = globalThis as typeof globalThis & { __speakAceClassroom?: MemoryClassroomStore };
  if (!globalStore.__speakAceClassroom) {
    globalStore.__speakAceClassroom = {
      classes: new Map(),
      enrollments: new Map(),
      notes: new Map(),
      billing: new Map()
    };
  }
  return globalStore.__speakAceClassroom;
}

function buildJoinCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

async function findMemberByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return null;

  if (hasDatabaseUrl()) {
    const sql = getSql();
    const rows = await sql<MemberProfile[]>`
      select id, email, name, role, plan, email_verified as "emailVerified", created_at as "createdAt"
      from users
      where email = ${normalizedEmail}
      limit 1
    `;
    return rows[0] ?? null;
  }

  const globalStore = globalThis as typeof globalThis & {
    __speakAceStore?: { members: Map<string, MemberProfile> };
  };

  const members = globalStore.__speakAceStore?.members;
  if (!members) return null;
  for (const profile of members.values()) {
    if (profile.email.toLowerCase() === normalizedEmail) return profile;
  }
  return null;
}

export async function ensureTeacherOwnsClass(teacherId: string, classId: string) {
  const classroom = await getTeacherClassById(classId);
  if (!classroom || classroom.teacherId !== teacherId) {
    throw new Error("Class not found or access denied.");
  }
  return classroom;
}

function buildDefaultInstitutionBilling(teacherId: string): InstitutionBillingSummary {
  const now = new Date().toISOString();
  return {
    teacherId,
    plan: "starter",
    status: "draft",
    seatCount: 20,
    monthlyPrice: 49,
    includedClasses: 3,
    includedStudents: 20,
    createdAt: now,
    updatedAt: now
  };
}

function getInstitutionPlanDefaults(plan: InstitutionBillingSummary["plan"]) {
  if (plan === "campus") {
    return { monthlyPrice: 249, includedClasses: 20, includedStudents: 250, minimumSeats: 120 };
  }
  if (plan === "team") {
    return { monthlyPrice: 99, includedClasses: 8, includedStudents: 80, minimumSeats: 40 };
  }
  return { monthlyPrice: 49, includedClasses: 3, includedStudents: 20, minimumSeats: 20 };
}

export async function createTeacherClass(input: { teacherId: string; name: string }) {
  const name = input.name.trim();
  if (!name) {
    throw new Error("Class name is required.");
  }

  const classroom: TeacherClass = {
    id: crypto.randomUUID(),
    teacherId: input.teacherId,
    name,
    joinCode: buildJoinCode(),
    createdAt: new Date().toISOString()
  };

  if (hasDatabaseUrl()) {
    const sql = getSql();
    const rows = await sql<TeacherClass[]>`
      insert into teacher_classes (id, teacher_id, name, join_code, created_at)
      values (${classroom.id}, ${classroom.teacherId}, ${classroom.name}, ${classroom.joinCode}, ${classroom.createdAt})
      returning id, teacher_id as "teacherId", name, join_code as "joinCode", created_at as "createdAt"
    `;
    return rows[0];
  }

  const store = getStore();
  store.classes.set(classroom.id, classroom);
  store.enrollments.set(classroom.id, new Set());
  return classroom;
}

export async function listTeacherClasses(teacherId: string) {
  if (hasDatabaseUrl()) {
    const sql = getSql();
    const rows = await sql<Array<TeacherClass & { studentCount: number }>>`
      select
        c.id,
        c.teacher_id as "teacherId",
        c.name,
        c.join_code as "joinCode",
        c.created_at as "createdAt",
        count(e.student_id)::int as "studentCount"
      from teacher_classes c
      left join teacher_class_enrollments e on e.class_id = c.id
      where c.teacher_id = ${teacherId}
      group by c.id
      order by c.created_at desc
    `;
    return rows;
  }

  const store = getStore();
  return [...store.classes.values()]
    .filter((item) => item.teacherId === teacherId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .map((item) => ({
      ...item,
      studentCount: store.enrollments.get(item.id)?.size ?? 0
    }));
}

export async function getTeacherClassById(classId: string) {
  if (hasDatabaseUrl()) {
    const sql = getSql();
    const rows = await sql<TeacherClass[]>`
      select id, teacher_id as "teacherId", name, join_code as "joinCode", created_at as "createdAt"
      from teacher_classes
      where id = ${classId}
      limit 1
    `;
    return rows[0] ?? null;
  }

  return getStore().classes.get(classId) ?? null;
}

export async function addStudentToTeacherClass(input: { teacherId: string; classId: string; studentEmail: string }) {
  await ensureTeacherOwnsClass(input.teacherId, input.classId);
  const student = await findMemberByEmail(input.studentEmail);
  if (!student || student.role === "guest") {
    throw new Error("Student account was not found.");
  }

  if (hasDatabaseUrl()) {
    const sql = getSql();
    await sql`
      insert into teacher_class_enrollments (class_id, student_id, joined_at)
      values (${input.classId}, ${student.id}, ${new Date().toISOString()})
      on conflict (class_id, student_id) do nothing
    `;
    return student;
  }

  const store = getStore();
  const set = store.enrollments.get(input.classId) ?? new Set<string>();
  set.add(student.id);
  store.enrollments.set(input.classId, set);
  return student;
}

export async function joinTeacherClassByCode(input: { studentId: string; joinCode: string }) {
  const normalizedCode = input.joinCode.trim().toUpperCase();
  if (!normalizedCode) {
    throw new Error("Class code is required.");
  }

  const student = await getMember(input.studentId);
  if (!student || student.role === "guest") {
    throw new Error("Student account was not found.");
  }

  if (hasDatabaseUrl()) {
    const sql = getSql();
    const classrooms = await sql<TeacherClass[]>`
      select id, teacher_id as "teacherId", name, join_code as "joinCode", created_at as "createdAt"
      from teacher_classes
      where upper(join_code) = ${normalizedCode}
      limit 1
    `;
    const classroom = classrooms[0];
    if (!classroom) {
      throw new Error("Class code was not found.");
    }
    await sql`
      insert into teacher_class_enrollments (class_id, student_id, joined_at)
      values (${classroom.id}, ${input.studentId}, ${new Date().toISOString()})
      on conflict (class_id, student_id) do nothing
    `;
    return classroom;
  }

  const classroom = [...getStore().classes.values()].find((item) => item.joinCode.toUpperCase() === normalizedCode);
  if (!classroom) {
    throw new Error("Class code was not found.");
  }
  const set = getStore().enrollments.get(classroom.id) ?? new Set<string>();
  set.add(input.studentId);
  getStore().enrollments.set(classroom.id, set);
  return classroom;
}

export async function listStudentClasses(studentId: string) {
  if (hasDatabaseUrl()) {
    const sql = getSql();
    return sql<StudentClassMembership[]>`
      select
        c.id as "classId",
        c.name as "className",
        t.name as "teacherName",
        t.email as "teacherEmail",
        c.join_code as "joinCode",
        e.joined_at as "joinedAt"
      from teacher_class_enrollments e
      join teacher_classes c on c.id = e.class_id
      join users t on t.id = c.teacher_id
      where e.student_id = ${studentId}
      order by e.joined_at desc
    `;
  }

  const store = getStore();
  const memberships: StudentClassMembership[] = [];
  for (const classroom of store.classes.values()) {
    const enrolled = store.enrollments.get(classroom.id)?.has(studentId);
    if (!enrolled) continue;
    const teacher = await getMember(classroom.teacherId);
    memberships.push({
      classId: classroom.id,
      className: classroom.name,
      teacherName: teacher?.name ?? "Teacher",
      teacherEmail: teacher?.email ?? "",
      joinCode: classroom.joinCode,
      joinedAt: classroom.createdAt
    });
  }
  return memberships.sort((a, b) => (a.joinedAt < b.joinedAt ? 1 : -1));
}

export async function listClassStudents(input: { teacherId: string; classId: string }) {
  await ensureTeacherOwnsClass(input.teacherId, input.classId);
  let studentIds: string[] = [];

  if (hasDatabaseUrl()) {
    const sql = getSql();
    const rows = await sql<Array<{ studentId: string }>>`
      select student_id as "studentId"
      from teacher_class_enrollments
      where class_id = ${input.classId}
      order by joined_at desc
    `;
    studentIds = rows.map((row) => row.studentId);
  } else {
    studentIds = [...(getStore().enrollments.get(input.classId) ?? new Set())];
  }

  const overviews = await Promise.all(
    studentIds.map(async (studentId) => {
      const student = await getMember(studentId);
      if (!student) return null;
      const summary = await getProgressSummary(studentId);
      return buildStudentOverview(student, summary);
    })
  );

  return overviews.filter(Boolean) as TeacherStudentOverview[];
}

export async function getTeacherClassAnalytics(input: { teacherId: string; classId: string }) {
  const classroom = await ensureTeacherOwnsClass(input.teacherId, input.classId);
  const students = await listClassStudents(input);
  const homework = (await listTeacherHomework(input.teacherId)).filter((item) => item.assignment.classId === input.classId);
  const scoredStudents = students.filter((student) => student.averageScore > 0);
  const classAverageScore = scoredStudents.length
    ? Number((scoredStudents.reduce((sum, student) => sum + student.averageScore, 0) / scoredStudents.length).toFixed(1))
    : 0;
  const classBestScore = students.length
    ? students.reduce<number | null>((best, student) => {
        if (student.bestScore == null) return best;
        return best == null ? student.bestScore : Math.max(best, student.bestScore);
      }, null)
    : null;
  const weaknessCounts = new Map<string, number>();
  let totalAttempts = 0;

  students.forEach((student) => {
    totalAttempts += student.totalSessions;
    if (!student.weakestSkill) return;
    weaknessCounts.set(student.weakestSkill, (weaknessCounts.get(student.weakestSkill) ?? 0) + 1);
  });

  const completedHomework = homework.filter((item) => item.assignment.completedAt).length;
  const activeHomework = homework.filter((item) => !item.assignment.completedAt);
  const now = Date.now();
  const overdueHomeworkCount = activeHomework.filter((item) => item.assignment.dueAt && new Date(item.assignment.dueAt).getTime() < now).length;
  const dueSoonHomeworkCount = activeHomework.filter((item) => {
    if (!item.assignment.dueAt) return false;
    const time = new Date(item.assignment.dueAt).getTime();
    return time >= now && time <= now + 1000 * 60 * 60 * 24 * 2;
  }).length;

  const mostCommonWeakestSkill =
    [...weaknessCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const analytics: TeacherClassAnalytics = {
    classId: classroom.id,
    className: classroom.name,
    totalStudents: students.length,
    activeStudents: students.filter((student) => student.totalSessions > 0).length,
    totalAttempts,
    classAverageScore,
    classBestScore,
    mostCommonWeakestSkill,
    homeworkCompletionRate: homework.length ? Number(((completedHomework / homework.length) * 100).toFixed(0)) : 0,
    overdueHomeworkCount,
    dueSoonHomeworkCount
  };

  return analytics;
}

export async function getTeacherStudentDetail(input: { teacherId: string; studentId: string }) {
  const classes = await listTeacherClasses(input.teacherId);
  const classIds = classes.map((item) => item.id);
  if (!classIds.length) {
    throw new Error("No classes found for this teacher.");
  }
  let enrolled = false;

  if (hasDatabaseUrl()) {
    const sql = getSql();
    const rows = await sql<Array<{ classId: string }>>`
      select class_id as "classId"
      from teacher_class_enrollments
      where student_id = ${input.studentId}
        and class_id = any(${classIds})
    `;
    enrolled = rows.length > 0;
  } else {
    const store = getStore();
    enrolled = classIds.some((classId) => store.enrollments.get(classId)?.has(input.studentId));
  }

  if (!enrolled) {
    throw new Error("Student is not enrolled in one of your classes.");
  }

  const student = await getMember(input.studentId);
  if (!student) {
    throw new Error("Student not found.");
  }

  const summary = await getProgressSummary(input.studentId);
  const notes = await listTeacherNotes({ teacherId: input.teacherId, studentId: input.studentId });

  return {
    student,
    summary,
    overview: buildStudentOverview(student, summary),
    notes
  };
}

export async function createTeacherNote(input: { teacherId: string; studentId: string; note: string; sessionId?: string }) {
  const trimmed = input.note.trim();
  if (!trimmed) {
    throw new Error("Note text is required.");
  }

  const detail = await getTeacherStudentDetail({ teacherId: input.teacherId, studentId: input.studentId });
  if (!detail.student) {
    throw new Error("Student not found.");
  }

  const note: TeacherNote = {
    id: crypto.randomUUID(),
    teacherId: input.teacherId,
    studentId: input.studentId,
    sessionId: input.sessionId,
    note: trimmed,
    createdAt: new Date().toISOString()
  };

  if (hasDatabaseUrl()) {
    const sql = getSql();
    const rows = await sql<TeacherNote[]>`
      insert into teacher_notes (id, teacher_id, student_id, session_id, note, created_at)
      values (${note.id}, ${note.teacherId}, ${note.studentId}, ${note.sessionId ?? null}, ${note.note}, ${note.createdAt})
      returning id, teacher_id as "teacherId", student_id as "studentId", session_id as "sessionId", note, created_at as "createdAt"
    `;
    return rows[0];
  }

  getStore().notes.set(note.id, note);
  return note;
}

export async function listTeacherNotes(input: { teacherId: string; studentId: string }) {
  if (hasDatabaseUrl()) {
    const sql = getSql();
    return sql<TeacherNote[]>`
      select id, teacher_id as "teacherId", student_id as "studentId", session_id as "sessionId", note, created_at as "createdAt"
      from teacher_notes
      where teacher_id = ${input.teacherId} and student_id = ${input.studentId}
      order by created_at desc
    `;
  }

  return [...getStore().notes.values()]
    .filter((item) => item.teacherId === input.teacherId && item.studentId === input.studentId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function getInstitutionBilling(teacherId: string) {
  if (hasDatabaseUrl()) {
    const sql = getSql();
    const rows = await sql<InstitutionBillingSummary[]>`
      select
        teacher_id as "teacherId",
        plan,
        status,
        seat_count as "seatCount",
        monthly_price as "monthlyPrice",
        included_classes as "includedClasses",
        included_students as "includedStudents",
        created_at as "createdAt",
        updated_at as "updatedAt"
      from institution_billing
      where teacher_id = ${teacherId}
      limit 1
    `;
    return rows[0] ?? buildDefaultInstitutionBilling(teacherId);
  }

  return getStore().billing.get(teacherId) ?? buildDefaultInstitutionBilling(teacherId);
}

export async function updateInstitutionBilling(input: {
  teacherId: string;
  plan: InstitutionBillingSummary["plan"];
  seatCount: number;
  status?: InstitutionBillingSummary["status"];
}) {
  const defaults = getInstitutionPlanDefaults(input.plan);
  const now = new Date().toISOString();
  const nextBilling: InstitutionBillingSummary = {
    teacherId: input.teacherId,
    plan: input.plan,
    status: input.status ?? "active",
    seatCount: Math.max(defaults.minimumSeats, input.seatCount),
    monthlyPrice: defaults.monthlyPrice,
    includedClasses: defaults.includedClasses,
    includedStudents: Math.max(defaults.includedStudents, input.seatCount),
    createdAt: now,
    updatedAt: now
  };

  if (hasDatabaseUrl()) {
    const sql = getSql();
    const existing = await getInstitutionBilling(input.teacherId);
    const createdAt = existing.createdAt ?? now;
    const rows = await sql<InstitutionBillingSummary[]>`
      insert into institution_billing (
        teacher_id, plan, status, seat_count, monthly_price, included_classes, included_students, created_at, updated_at
      ) values (
        ${nextBilling.teacherId}, ${nextBilling.plan}, ${nextBilling.status}, ${nextBilling.seatCount},
        ${nextBilling.monthlyPrice}, ${nextBilling.includedClasses}, ${nextBilling.includedStudents}, ${createdAt}, ${nextBilling.updatedAt}
      )
      on conflict (teacher_id)
      do update set
        plan = excluded.plan,
        status = excluded.status,
        seat_count = excluded.seat_count,
        monthly_price = excluded.monthly_price,
        included_classes = excluded.included_classes,
        included_students = excluded.included_students,
        updated_at = excluded.updated_at
      returning
        teacher_id as "teacherId",
        plan,
        status,
        seat_count as "seatCount",
        monthly_price as "monthlyPrice",
        included_classes as "includedClasses",
        included_students as "includedStudents",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;
    return rows[0];
  }

  const store = getStore();
  const existing = store.billing.get(input.teacherId);
  store.billing.set(input.teacherId, {
    ...nextBilling,
    createdAt: existing?.createdAt ?? now
  });
  return store.billing.get(input.teacherId)!;
}

function buildStudentOverview(student: MemberProfile, summary: Awaited<ReturnType<typeof getProgressSummary>>): TeacherStudentOverview {
  const scoredSessions = summary.recentSessions.filter((session) => session.report);
  const weakest = findWeakestSkill(summary.recentSessions);
  const bestScore = scoredSessions.length ? Math.max(...scoredSessions.map((session) => session.report?.overall ?? 0)) : null;
  const latestScored = scoredSessions[0];
  const baselineScored = scoredSessions[scoredSessions.length - 1];
  const scoreDelta =
    latestScored?.report && baselineScored?.report && latestScored.id !== baselineScored.id
      ? Number((latestScored.report.overall - baselineScored.report.overall).toFixed(1))
      : null;
  return {
    student,
    totalSessions: summary.totalSessions,
    averageScore: summary.averageScore,
    bestScore,
    weakestSkill: weakest,
    lastSessionTitle: summary.recentSessions[0]?.prompt.title ?? null,
    lastExamType: summary.recentSessions[0]?.examType ?? null,
    lastTaskType: summary.recentSessions[0]?.taskType ?? null,
    scoreDelta
  };
}

function findWeakestSkill(sessions: Awaited<ReturnType<typeof getProgressSummary>>["recentSessions"]) {
  const buckets = new Map<string, { total: number; count: number }>();

  sessions.forEach((session) => {
    session.report?.categories.forEach((category) => {
      const current = buckets.get(category.label) ?? { total: 0, count: 0 };
      buckets.set(category.label, {
        total: current.total + category.score,
        count: current.count + 1
      });
    });
  });

  if (!buckets.size) return null;

  return [...buckets.entries()]
    .map(([label, stats]) => ({ label, average: stats.total / stats.count }))
    .sort((a, b) => a.average - b.average)[0]?.label ?? null;
}
