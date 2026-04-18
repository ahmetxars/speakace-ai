import { PLAN_LIMITS } from "@/lib/membership";
import { evaluateWritingDraft, countWords } from "@/lib/writing-evaluator";
import { getWritingPrompt } from "@/lib/writing-prompts";
import { generateWritingFeedbackReport } from "@/lib/server/openai";
import { getSql, hasDatabaseUrl } from "@/lib/server/db";
import { getMember } from "@/lib/store";
import { Difficulty, WritingReport, WritingSession, WritingSummary, WritingTaskType } from "@/lib/types";

type WritingStore = {
  sessions: Map<string, WritingSession>;
};

function getStore(): WritingStore {
  const globalStore = globalThis as typeof globalThis & { __speakAceWritingStore?: WritingStore };
  if (!globalStore.__speakAceWritingStore) {
    globalStore.__speakAceWritingStore = {
      sessions: new Map()
    };
  }
  return globalStore.__speakAceWritingStore;
}

let ensuredTables = false;

async function ensureWritingTables() {
  if (!hasDatabaseUrl() || ensuredTables) return;
  const sql = getSql();
  await sql`
    create table if not exists writing_sessions (
      id text primary key,
      user_id text not null references users(id) on delete cascade,
      exam_type text not null default 'IELTS',
      task_type text not null,
      difficulty text not null,
      plan text not null,
      prompt_id text not null,
      prompt_title text not null,
      prompt_text text not null,
      recommended_minutes integer not null default 40,
      draft_text text,
      word_count integer,
      minutes_spent integer,
      submitted_at timestamptz,
      created_at timestamptz not null default now()
    )
  `;
  await sql`
    create table if not exists writing_reports (
      session_id text primary key references writing_sessions(id) on delete cascade,
      overall_score numeric(4,1) not null,
      scale_label text not null,
      categories_json jsonb not null,
      strengths_json jsonb not null,
      improvements_json jsonb not null,
      next_exercise text not null,
      caution text not null,
      corrected_version text not null,
      outline_json jsonb not null,
      created_at timestamptz not null default now()
    )
  `;
  await sql`create index if not exists idx_writing_sessions_user_created_at on writing_sessions(user_id, created_at desc)`;
  ensuredTables = true;
}

function serializeReport(row: {
  overall_score: number;
  scale_label: string;
  categories_json: unknown;
  strengths_json: unknown;
  improvements_json: unknown;
  next_exercise: string;
  caution: string;
  corrected_version: string;
  outline_json: unknown;
}): WritingReport {
  return {
    overall: Number(row.overall_score),
    scaleLabel: row.scale_label,
    categories: typeof row.categories_json === "string" ? JSON.parse(row.categories_json) : (row.categories_json as WritingReport["categories"]),
    strengths: typeof row.strengths_json === "string" ? JSON.parse(row.strengths_json) : (row.strengths_json as string[]),
    improvements: typeof row.improvements_json === "string" ? JSON.parse(row.improvements_json) : (row.improvements_json as string[]),
    nextExercise: row.next_exercise,
    caution: row.caution,
    correctedVersion: row.corrected_version,
    outline: typeof row.outline_json === "string" ? JSON.parse(row.outline_json) : (row.outline_json as string[])
  };
}

function sessionFromDb(row: {
  id: string;
  user_id: string;
  exam_type: "IELTS";
  task_type: WritingTaskType;
  difficulty: Difficulty;
  plan: WritingSession["plan"];
  prompt_id: string;
  prompt_title: string;
  prompt_text: string;
  recommended_minutes: number;
  draft_text: string | null;
  word_count: number | null;
  minutes_spent: number | null;
  submitted_at: string | Date | null;
  created_at: string | Date;
}): WritingSession {
  return {
    id: row.id,
    userId: row.user_id,
    examType: row.exam_type,
    taskType: row.task_type,
    difficulty: row.difficulty,
    plan: row.plan,
    prompt: {
      id: row.prompt_id,
      examType: row.exam_type,
      taskType: row.task_type,
      title: row.prompt_title,
      prompt: row.prompt_text,
      difficulty: row.difficulty,
      recommendedMinutes: row.recommended_minutes
    },
    createdAt: new Date(row.created_at).toISOString(),
    submittedAt: row.submitted_at ? new Date(row.submitted_at).toISOString() : null,
    draftText: row.draft_text ?? undefined,
    wordCount: row.word_count ?? undefined,
    minutesSpent: row.minutes_spent ?? undefined
  };
}

export async function createWritingSession(input: {
  userId: string;
  taskType: WritingTaskType;
  difficulty: Difficulty;
  promptId?: string;
}) {
  const member = await getMember(input.userId);
  if (!member) {
    return { error: "User profile not found. Sign in again to continue.", status: 401 as const };
  }

  const prompt = getWritingPrompt(input.promptId, input.difficulty);
  const limits = PLAN_LIMITS[member.plan];

  if (hasDatabaseUrl()) {
    await ensureWritingTables();
    const sql = getSql();
    const usageDate = new Date().toISOString().slice(0, 10);
    const [usage] = await sql<{ sessions_count: number }[]>`
      select sessions_count from usage_daily where user_id = ${input.userId} and usage_date = ${usageDate}
    `;
    const currentSessions = usage?.sessions_count ?? 0;

    if (!member.isAdmin && currentSessions >= limits.sessionsPerDay) {
      return { error: `${limits.label} users can start ${limits.sessionsPerDay} sessions per day. Upgrade for more practice.`, status: 403 as const };
    }

    const session: WritingSession = {
      id: crypto.randomUUID(),
      userId: input.userId,
      examType: "IELTS",
      taskType: input.taskType,
      difficulty: input.difficulty,
      plan: member.plan,
      prompt,
      createdAt: new Date().toISOString()
    };

    await sql`
      insert into writing_sessions (
        id, user_id, exam_type, task_type, difficulty, plan, prompt_id, prompt_title, prompt_text, recommended_minutes, created_at
      ) values (
        ${session.id}, ${session.userId}, ${session.examType}, ${session.taskType}, ${session.difficulty}, ${session.plan},
        ${session.prompt.id}, ${session.prompt.title}, ${session.prompt.prompt}, ${session.prompt.recommendedMinutes}, ${session.createdAt}
      )
    `;
    await sql`
      insert into usage_daily (user_id, usage_date, sessions_count, speaking_seconds)
      values (${input.userId}, ${usageDate}, 1, 0)
      on conflict (user_id, usage_date)
      do update set sessions_count = usage_daily.sessions_count + 1
    `;

    return { session };
  }

  const store = getStore();
  const session: WritingSession = {
    id: crypto.randomUUID(),
    userId: input.userId,
    examType: "IELTS",
    taskType: input.taskType,
    difficulty: input.difficulty,
    plan: member.plan,
    prompt,
    createdAt: new Date().toISOString()
  };
  store.sessions.set(session.id, session);
  return { session };
}

export async function submitWritingDraft(input: { sessionId: string; draftText: string; minutesSpent?: number }) {
  const draftText = input.draftText.trim();
  const wordCount = countWords(draftText);
  if (wordCount < 40) {
    return { error: "Please write a fuller draft before submitting.", status: 400 as const };
  }

  if (hasDatabaseUrl()) {
    await ensureWritingTables();
    const sql = getSql();
    const [row] = await sql<{ id: string }[]>`
      update writing_sessions
      set draft_text = ${draftText},
          word_count = ${wordCount},
          minutes_spent = ${input.minutesSpent ?? null},
          submitted_at = ${new Date().toISOString()}
      where id = ${input.sessionId}
      returning id
    `;
    if (!row) return { error: "Writing session not found.", status: 404 as const };
    return { session: await getWritingSession(input.sessionId) };
  }

  const store = getStore();
  const session = store.sessions.get(input.sessionId);
  if (!session) return { error: "Writing session not found.", status: 404 as const };
  const updated: WritingSession = {
    ...session,
    draftText,
    wordCount,
    minutesSpent: input.minutesSpent,
    submittedAt: new Date().toISOString()
  };
  store.sessions.set(input.sessionId, updated);
  return { session: updated };
}

export async function evaluateStoredWritingSession(sessionId: string) {
  const session = await getWritingSession(sessionId);
  if (!session || !session.draftText) return null;

  let report = evaluateWritingDraft({
    draftText: session.draftText,
    prompt: session.prompt,
    difficulty: session.difficulty
  });

  try {
    const aiReport = await generateWritingFeedbackReport({
      promptTitle: session.prompt.title,
      promptText: session.prompt.prompt,
      difficulty: session.difficulty,
      draftText: session.draftText
    });
    if (aiReport) {
      report = {
        overall: aiReport.overall,
        scaleLabel: aiReport.scaleLabel,
        categories: aiReport.categories.map((item) => ({
          category: item.category as WritingReport["categories"][number]["category"],
          label: item.label,
          score: item.score
        })),
        strengths: aiReport.strengths,
        improvements: aiReport.improvements,
        nextExercise: aiReport.nextExercise,
        caution: aiReport.caution,
        correctedVersion: aiReport.correctedVersion,
        outline: aiReport.outline
      };
    }
  } catch (error) {
    console.error(error);
  }

  if (hasDatabaseUrl()) {
    await ensureWritingTables();
    const sql = getSql();
    await sql`
      insert into writing_reports (
        session_id, overall_score, scale_label, categories_json, strengths_json, improvements_json,
        next_exercise, caution, corrected_version, outline_json
      ) values (
        ${sessionId}, ${report.overall}, ${report.scaleLabel}, ${JSON.stringify(report.categories)}::jsonb,
        ${JSON.stringify(report.strengths)}::jsonb, ${JSON.stringify(report.improvements)}::jsonb,
        ${report.nextExercise}, ${report.caution}, ${report.correctedVersion}, ${JSON.stringify(report.outline)}::jsonb
      )
      on conflict (session_id)
      do update set
        overall_score = excluded.overall_score,
        scale_label = excluded.scale_label,
        categories_json = excluded.categories_json,
        strengths_json = excluded.strengths_json,
        improvements_json = excluded.improvements_json,
        next_exercise = excluded.next_exercise,
        caution = excluded.caution,
        corrected_version = excluded.corrected_version,
        outline_json = excluded.outline_json
    `;
    return getWritingSession(sessionId);
  }

  const store = getStore();
  const updated: WritingSession = { ...session, report };
  store.sessions.set(sessionId, updated);
  return updated;
}

export async function getWritingSession(sessionId: string) {
  if (hasDatabaseUrl()) {
    await ensureWritingTables();
    const sql = getSql();
    const rows = await sql<Array<{
      id: string;
      user_id: string;
      exam_type: "IELTS";
      task_type: WritingTaskType;
      difficulty: Difficulty;
      plan: WritingSession["plan"];
      prompt_id: string;
      prompt_title: string;
      prompt_text: string;
      recommended_minutes: number;
      draft_text: string | null;
      word_count: number | null;
      minutes_spent: number | null;
      submitted_at: string | Date | null;
      created_at: string | Date;
      overall_score: number | null;
      scale_label: string | null;
      categories_json: unknown | null;
      strengths_json: unknown | null;
      improvements_json: unknown | null;
      next_exercise: string | null;
      caution: string | null;
      corrected_version: string | null;
      outline_json: unknown | null;
    }>>`
      select
        ws.id, ws.user_id, ws.exam_type, ws.task_type, ws.difficulty, ws.plan,
        ws.prompt_id, ws.prompt_title, ws.prompt_text, ws.recommended_minutes,
        ws.draft_text, ws.word_count, ws.minutes_spent, ws.submitted_at, ws.created_at,
        wr.overall_score, wr.scale_label, wr.categories_json, wr.strengths_json,
        wr.improvements_json, wr.next_exercise, wr.caution, wr.corrected_version, wr.outline_json
      from writing_sessions ws
      left join writing_reports wr on wr.session_id = ws.id
      where ws.id = ${sessionId}
      limit 1
    `;
    const row = rows[0];
    if (!row) return null;
    const session = sessionFromDb(row);
    if (row.overall_score !== null && row.scale_label && row.categories_json && row.strengths_json && row.improvements_json && row.next_exercise && row.caution && row.corrected_version && row.outline_json) {
      session.report = serializeReport({
        overall_score: row.overall_score,
        scale_label: row.scale_label,
        categories_json: row.categories_json,
        strengths_json: row.strengths_json,
        improvements_json: row.improvements_json,
        next_exercise: row.next_exercise,
        caution: row.caution,
        corrected_version: row.corrected_version,
        outline_json: row.outline_json
      });
    }
    return session;
  }

  return getStore().sessions.get(sessionId) ?? null;
}

export async function getWritingSummary(userId: string): Promise<WritingSummary> {
  if (!userId) {
    return { totalSessions: 0, averageScore: 0, latestSession: null, recentSessions: [], weakestCategory: null };
  }

  if (hasDatabaseUrl()) {
    await ensureWritingTables();
    const sql = getSql();
    const rows = await sql<Array<{
      id: string;
      user_id: string;
      exam_type: "IELTS";
      task_type: WritingTaskType;
      difficulty: Difficulty;
      plan: WritingSession["plan"];
      prompt_id: string;
      prompt_title: string;
      prompt_text: string;
      recommended_minutes: number;
      draft_text: string | null;
      word_count: number | null;
      minutes_spent: number | null;
      submitted_at: string | Date | null;
      created_at: string | Date;
      overall_score: number | null;
      scale_label: string | null;
      categories_json: unknown | null;
      strengths_json: unknown | null;
      improvements_json: unknown | null;
      next_exercise: string | null;
      caution: string | null;
      corrected_version: string | null;
      outline_json: unknown | null;
    }>>`
      select
        ws.id, ws.user_id, ws.exam_type, ws.task_type, ws.difficulty, ws.plan,
        ws.prompt_id, ws.prompt_title, ws.prompt_text, ws.recommended_minutes,
        ws.draft_text, ws.word_count, ws.minutes_spent, ws.submitted_at, ws.created_at,
        wr.overall_score, wr.scale_label, wr.categories_json, wr.strengths_json,
        wr.improvements_json, wr.next_exercise, wr.caution, wr.corrected_version, wr.outline_json
      from writing_sessions ws
      left join writing_reports wr on wr.session_id = ws.id
      where ws.user_id = ${userId}
      order by ws.created_at desc
      limit 10
    `;

    const recentSessions = rows.map((row) => {
      const session = sessionFromDb(row);
      if (row.overall_score !== null && row.scale_label && row.categories_json && row.strengths_json && row.improvements_json && row.next_exercise && row.caution && row.corrected_version && row.outline_json) {
        session.report = serializeReport({
          overall_score: row.overall_score,
          scale_label: row.scale_label,
          categories_json: row.categories_json,
          strengths_json: row.strengths_json,
          improvements_json: row.improvements_json,
          next_exercise: row.next_exercise,
          caution: row.caution,
          corrected_version: row.corrected_version,
          outline_json: row.outline_json
        });
      }
      return session;
    });

    const scored = recentSessions.filter((item) => item.report);
    const weakest = findWeakestWritingCategory(scored);
    return {
      totalSessions: recentSessions.length,
      averageScore: scored.length ? Number((scored.reduce((sum, item) => sum + (item.report?.overall ?? 0), 0) / scored.length).toFixed(1)) : 0,
      latestSession: recentSessions[0] ?? null,
      recentSessions,
      weakestCategory: weakest
    };
  }

  const recentSessions = [...getStore().sessions.values()]
    .filter((item) => item.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 10);
  const scored = recentSessions.filter((item) => item.report);
  return {
    totalSessions: recentSessions.length,
    averageScore: scored.length ? Number((scored.reduce((sum, item) => sum + (item.report?.overall ?? 0), 0) / scored.length).toFixed(1)) : 0,
    latestSession: recentSessions[0] ?? null,
    recentSessions,
    weakestCategory: findWeakestWritingCategory(scored)
  };
}

function findWeakestWritingCategory(sessions: WritingSession[]) {
  const buckets = new Map<string, { total: number; count: number }>();
  sessions.forEach((session) => {
    session.report?.categories.forEach((category) => {
      const current = buckets.get(category.label) ?? { total: 0, count: 0 };
      buckets.set(category.label, { total: current.total + category.score, count: current.count + 1 });
    });
  });

  const sorted = [...buckets.entries()]
    .map(([label, value]) => ({ label, score: value.total / value.count }))
    .sort((a, b) => a.score - b.score);
  return sorted[0]?.label ?? null;
}
