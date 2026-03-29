import { getMember, getProgressSummary } from "@/lib/store";
import { getSql, hasDatabaseUrl } from "@/lib/server/db";
import { HomeworkAssignment, HomeworkAutoAssignRule, TaskType } from "@/lib/types";

type MemoryHomeworkStore = {
  assignments: Map<string, HomeworkAssignment>;
  rules: Map<string, HomeworkAutoAssignRule>;
};

function getStore(): MemoryHomeworkStore {
  const globalStore = globalThis as typeof globalThis & { __speakAceHomework?: MemoryHomeworkStore };
  if (!globalStore.__speakAceHomework) {
    globalStore.__speakAceHomework = { assignments: new Map(), rules: new Map() };
  }
  return globalStore.__speakAceHomework;
}

function buildDefaultRule(teacherId: string, classId: string): HomeworkAutoAssignRule {
  const now = new Date().toISOString();
  return {
    classId,
    teacherId,
    enabled: false,
    scoreThreshold: 5.5,
    dueDays: 7,
    createdAt: now,
    updatedAt: now
  };
}

export async function createHomeworkAssignment(input: {
  teacherId: string;
  studentId: string;
  classId?: string;
  title: string;
  instructions: string;
  focusSkill: string;
  recommendedTaskType: TaskType;
  promptId?: string;
  dueAt?: string;
}) {
  const assignment: HomeworkAssignment = {
    id: crypto.randomUUID(),
    teacherId: input.teacherId,
    studentId: input.studentId,
    classId: input.classId,
    title: input.title.trim(),
    instructions: input.instructions.trim(),
    focusSkill: input.focusSkill.trim(),
    recommendedTaskType: input.recommendedTaskType,
    promptId: input.promptId,
    dueAt: input.dueAt,
    createdAt: new Date().toISOString()
  };

  if (hasDatabaseUrl()) {
    const sql = getSql();
    const rows = await sql<HomeworkAssignment[]>`
      insert into homework_assignments (
        id, teacher_id, student_id, class_id, title, instructions, focus_skill,
        recommended_task_type, prompt_id, due_at, created_at
      ) values (
        ${assignment.id}, ${assignment.teacherId}, ${assignment.studentId}, ${assignment.classId ?? null},
        ${assignment.title}, ${assignment.instructions}, ${assignment.focusSkill},
        ${assignment.recommendedTaskType}, ${assignment.promptId ?? null}, ${assignment.dueAt ?? null}, ${assignment.createdAt}
      )
      returning
        id,
        teacher_id as "teacherId",
        student_id as "studentId",
        class_id as "classId",
        title,
        instructions,
        focus_skill as "focusSkill",
        recommended_task_type as "recommendedTaskType",
        prompt_id as "promptId",
        due_at as "dueAt",
        created_at as "createdAt",
        completed_at as "completedAt"
    `;
    return rows[0];
  }

  getStore().assignments.set(assignment.id, assignment);
  return assignment;
}

export async function listStudentHomework(studentId: string) {
  if (hasDatabaseUrl()) {
    const sql = getSql();
    return sql<HomeworkAssignment[]>`
      select
        id,
        teacher_id as "teacherId",
        student_id as "studentId",
        class_id as "classId",
        title,
        instructions,
        focus_skill as "focusSkill",
        recommended_task_type as "recommendedTaskType",
        prompt_id as "promptId",
        due_at as "dueAt",
        created_at as "createdAt",
        completed_at as "completedAt"
      from homework_assignments
      where student_id = ${studentId}
      order by created_at desc
    `;
  }

  return [...getStore().assignments.values()]
    .filter((item) => item.studentId === studentId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function listTeacherHomework(teacherId: string) {
  if (hasDatabaseUrl()) {
    const sql = getSql();
    const rows = await sql<Array<HomeworkAssignment & { studentName: string; studentEmail: string }>>`
      select
        a.id,
        a.teacher_id as "teacherId",
        a.student_id as "studentId",
        a.class_id as "classId",
        a.title,
        a.instructions,
        a.focus_skill as "focusSkill",
        a.recommended_task_type as "recommendedTaskType",
        a.prompt_id as "promptId",
        a.due_at as "dueAt",
        a.created_at as "createdAt",
        a.completed_at as "completedAt",
        u.name as "studentName",
        u.email as "studentEmail"
      from homework_assignments a
      join users u on u.id = a.student_id
      where a.teacher_id = ${teacherId}
      order by a.created_at desc
    `;
    return rows.map((row) => ({
      assignment: {
        id: row.id,
        teacherId: row.teacherId,
        studentId: row.studentId,
        classId: row.classId,
        title: row.title,
        instructions: row.instructions,
        focusSkill: row.focusSkill,
        recommendedTaskType: row.recommendedTaskType,
        promptId: row.promptId,
        dueAt: row.dueAt,
        createdAt: row.createdAt,
        completedAt: row.completedAt
      },
      studentName: row.studentName,
      studentEmail: row.studentEmail
    }));
  }

  const assignments = [...getStore().assignments.values()]
    .filter((item) => item.teacherId === teacherId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const rows = await Promise.all(
    assignments.map(async (assignment) => {
      const student = await getMember(assignment.studentId);
      return {
        assignment,
        studentName: student?.name ?? "Student",
        studentEmail: student?.email ?? ""
      };
    })
  );
  return rows;
}

export async function getHomeworkAutoAssignRule(input: { teacherId: string; classId: string }) {
  if (hasDatabaseUrl()) {
    const sql = getSql();
    const rows = await sql<HomeworkAutoAssignRule[]>`
      select
        class_id as "classId",
        teacher_id as "teacherId",
        enabled,
        score_threshold as "scoreThreshold",
        due_days as "dueDays",
        created_at as "createdAt",
        updated_at as "updatedAt"
      from homework_auto_assign_rules
      where class_id = ${input.classId} and teacher_id = ${input.teacherId}
      limit 1
    `;
    return rows[0] ?? buildDefaultRule(input.teacherId, input.classId);
  }

  return getStore().rules.get(`${input.teacherId}:${input.classId}`) ?? buildDefaultRule(input.teacherId, input.classId);
}

export async function upsertHomeworkAutoAssignRule(input: {
  teacherId: string;
  classId: string;
  enabled: boolean;
  scoreThreshold: number;
  dueDays: number;
}) {
  const now = new Date().toISOString();
  const next: HomeworkAutoAssignRule = {
    ...(await getHomeworkAutoAssignRule({ teacherId: input.teacherId, classId: input.classId })),
    teacherId: input.teacherId,
    classId: input.classId,
    enabled: input.enabled,
    scoreThreshold: Number(input.scoreThreshold.toFixed(1)),
    dueDays: Math.max(1, Math.min(21, Math.round(input.dueDays))),
    updatedAt: now
  };

  if (hasDatabaseUrl()) {
    const sql = getSql();
    const rows = await sql<HomeworkAutoAssignRule[]>`
      insert into homework_auto_assign_rules (
        class_id, teacher_id, enabled, score_threshold, due_days, created_at, updated_at
      ) values (
        ${next.classId}, ${next.teacherId}, ${next.enabled}, ${next.scoreThreshold}, ${next.dueDays}, ${next.createdAt}, ${next.updatedAt}
      )
      on conflict (class_id)
      do update set
        teacher_id = excluded.teacher_id,
        enabled = excluded.enabled,
        score_threshold = excluded.score_threshold,
        due_days = excluded.due_days,
        updated_at = excluded.updated_at
      returning
        class_id as "classId",
        teacher_id as "teacherId",
        enabled,
        score_threshold as "scoreThreshold",
        due_days as "dueDays",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;
    return rows[0];
  }

  getStore().rules.set(`${input.teacherId}:${input.classId}`, next);
  return next;
}

export async function markHomeworkCompleted(input: { assignmentId: string; studentId: string }) {
  const completedAt = new Date().toISOString();
  if (hasDatabaseUrl()) {
    const sql = getSql();
    const rows = await sql<HomeworkAssignment[]>`
      update homework_assignments
      set completed_at = ${completedAt}
      where id = ${input.assignmentId} and student_id = ${input.studentId}
      returning
        id,
        teacher_id as "teacherId",
        student_id as "studentId",
        class_id as "classId",
        title,
        instructions,
        focus_skill as "focusSkill",
        recommended_task_type as "recommendedTaskType",
        prompt_id as "promptId",
        due_at as "dueAt",
        created_at as "createdAt",
        completed_at as "completedAt"
    `;
    return rows[0] ?? null;
  }

  const assignment = getStore().assignments.get(input.assignmentId);
  if (!assignment || assignment.studentId !== input.studentId) return null;
  const next = { ...assignment, completedAt };
  getStore().assignments.set(input.assignmentId, next);
  return next;
}

export async function buildAdaptiveHomeworkSuggestions(studentId: string) {
  const summary = await getProgressSummary(studentId);
  const buckets = new Map<string, { total: number; count: number }>();

  summary.recentSessions.forEach((session) => {
    session.report?.categories.forEach((category) => {
      const current = buckets.get(category.label) ?? { total: 0, count: 0 };
      buckets.set(category.label, {
        total: current.total + category.score,
        count: current.count + 1
      });
    });
  });

  const weakest = [...buckets.entries()]
    .map(([label, stats]) => ({ label, average: stats.total / stats.count }))
    .sort((a, b) => a.average - b.average)[0]?.label;

  if (!weakest) {
    return [
      {
        title: "Foundation speaking reset",
        instructions: "Complete two fresh speaking attempts and focus on giving a direct answer plus one supporting reason.",
        focusSkill: "Core structure",
        recommendedTaskType: "ielts-part-1" as TaskType
      }
    ];
  }

  const suggestions: Array<{
    title: string;
    instructions: string;
    focusSkill: string;
    recommendedTaskType: TaskType;
  }> = [];

  if (weakest === "Pronunciation") {
    suggestions.push({
      title: "Pronunciation control drill",
      instructions: "Complete one short speaking attempt with slower pace, clear word endings, and stronger stress on key words.",
      focusSkill: weakest,
      recommendedTaskType: "ielts-part-1"
    });
  } else if (weakest === "Topic Development") {
    suggestions.push({
      title: "Reason + example homework",
      instructions: "Answer one longer prompt and make sure the response includes a clear opinion, one reason, and one concrete example.",
      focusSkill: weakest,
      recommendedTaskType: "ielts-part-2"
    });
  } else {
    suggestions.push({
      title: `${weakest} repair drill`,
      instructions: `Complete one targeted speaking attempt and make ${weakest} the single focus of the response.`,
      focusSkill: weakest,
      recommendedTaskType: "toefl-task-1"
    });
  }

  suggestions.push({
    title: "Retry and compare",
    instructions: "Repeat one previously weak prompt and compare the new transcript with the older result before the next class.",
    focusSkill: weakest,
    recommendedTaskType: suggestions[0].recommendedTaskType
  });

  return suggestions;
}

export async function runAdaptiveHomeworkAutoAssign(input: {
  teacherId: string;
  classId: string;
  students: Array<{ id: string; averageScore: number; totalSessions: number }>;
}) {
  const rule = await getHomeworkAutoAssignRule({ teacherId: input.teacherId, classId: input.classId });
  if (!rule.enabled) {
    return { rule, created: [] as HomeworkAssignment[] };
  }

  const existingAssignments = await listTeacherHomework(input.teacherId);
  const now = Date.now();
  const created: HomeworkAssignment[] = [];

  for (const student of input.students) {
    if (!student.totalSessions || !student.averageScore || student.averageScore >= rule.scoreThreshold) {
      continue;
    }

    const hasPending = existingAssignments.some(
      (item) =>
        item.assignment.studentId === student.id &&
        item.assignment.classId === input.classId &&
        !item.assignment.completedAt
    );
    if (hasPending) continue;

    const suggestion = (await buildAdaptiveHomeworkSuggestions(student.id))[0];
    if (!suggestion) continue;

    const assignment = await createHomeworkAssignment({
      teacherId: input.teacherId,
      studentId: student.id,
      classId: input.classId,
      title: suggestion.title,
      instructions: suggestion.instructions,
      focusSkill: suggestion.focusSkill,
      recommendedTaskType: suggestion.recommendedTaskType,
      dueAt: new Date(now + 1000 * 60 * 60 * 24 * rule.dueDays).toISOString()
    });
    created.push(assignment);
  }

  return { rule, created };
}
