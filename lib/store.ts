import { buildRetryRequiredReport, buildSessionTranscript, cleanTranscriptText, detectTranscriptIssue, evaluateSession, getTranscriptQuality } from "@/lib/evaluator";
import { withAdminPrivileges } from "@/lib/admin";
import { PLAN_LIMITS } from "@/lib/membership";
import { getPromptTemplate } from "@/lib/prompts";
import { hasDatabaseUrl, getSql } from "@/lib/server/db";
import { generateFeedbackReport } from "@/lib/server/openai";
import {
  Difficulty,
  ExamType,
  MemberProfile,
  ProgressSummary,
  ScoreReport,
  SpeakingSession,
  TaskType
} from "@/lib/types";

interface SessionStore {
  sessions: Map<string, SpeakingSession>;
  usageByDay: Map<string, { sessions: number; seconds: number }>;
  members: Map<string, MemberProfile>;
}

function getStore(): SessionStore {
  const globalStore = globalThis as typeof globalThis & { __speakAceStore?: SessionStore };
  if (!globalStore.__speakAceStore) {
    globalStore.__speakAceStore = {
      sessions: new Map(),
      usageByDay: new Map(),
      members: new Map()
    };
  }

  return globalStore.__speakAceStore;
}

function todayKey(userId: string) {
  const dateKey = new Date().toISOString().slice(0, 10);
  return `${userId}:${dateKey}`;
}

function reportFromDb(row: {
  overall_score: number;
  scale_label: string;
  categories_json: string | unknown;
  strengths_json: string | unknown;
  improvements_json: string | unknown;
  next_exercise: string;
  caution: string;
  filler_words_json: string | unknown;
  improved_answer: string | null;
}): ScoreReport {
  return {
    overall: Number(row.overall_score),
    scaleLabel: row.scale_label,
    categories: typeof row.categories_json === "string" ? JSON.parse(row.categories_json) : (row.categories_json as ScoreReport["categories"]),
    strengths: typeof row.strengths_json === "string" ? JSON.parse(row.strengths_json) : (row.strengths_json as string[]),
    improvements:
      typeof row.improvements_json === "string"
        ? JSON.parse(row.improvements_json)
        : (row.improvements_json as string[]),
    nextExercise: row.next_exercise,
    caution: row.caution,
    fillerWords:
      typeof row.filler_words_json === "string"
        ? JSON.parse(row.filler_words_json)
        : (row.filler_words_json as string[]),
    improvedAnswer: row.improved_answer ?? ""
  };
}

function sessionFromDbRow(row: {
  id: string;
  user_id: string;
  exam_type: ExamType;
  task_type: TaskType;
  difficulty: Difficulty;
  plan: MemberProfile["plan"];
  prompt_id: string;
  prompt_title: string;
  prompt_text: string;
  prep_seconds: number;
  speaking_seconds: number;
  created_at: string | Date;
  audio_uploaded: boolean;
  audio_bytes: number | null;
  transcript: string | null;
  raw_transcript: string | null;
  cleaned_transcript: string | null;
  transcript_quality_score: number | null;
  transcript_quality_label: string | null;
}): SpeakingSession {
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
      prepSeconds: row.prep_seconds,
      speakingSeconds: row.speaking_seconds,
      difficulty: row.difficulty
    },
    createdAt: new Date(row.created_at).toISOString(),
    audioUploaded: row.audio_uploaded,
    audioBytes: row.audio_bytes ?? undefined,
    rawTranscript: row.raw_transcript ?? row.transcript ?? undefined,
    transcript: row.cleaned_transcript ?? row.transcript ?? undefined,
    transcriptQualityScore: row.transcript_quality_score ?? undefined,
    transcriptQualityLabel: row.transcript_quality_label ?? undefined,
    transcriptSource: row.transcript ? "openai" : undefined
  };
}

export async function createSession(input: {
  userId: string;
  examType: ExamType;
  taskType: TaskType;
  difficulty: Difficulty;
  promptId?: string;
}) {
  if (hasDatabaseUrl()) {
    const sql = getSql();
    const member = await getMember(input.userId);
    if (!member) {
      return {
        error: "User profile not found. Sign in again to continue.",
        status: 401 as const
      };
    }

    const limits = PLAN_LIMITS[member.plan];
    const usageDate = new Date().toISOString().slice(0, 10);
    const [usage] = await sql<{ sessions_count: number; speaking_seconds: number }[]>`
      select sessions_count, speaking_seconds
      from usage_daily
      where user_id = ${input.userId} and usage_date = ${usageDate}
    `;

    const currentUsage = {
      sessions: usage?.sessions_count ?? 0,
      seconds: usage?.speaking_seconds ?? 0
    };

    const prompt = getPromptTemplate(input.examType, input.taskType, input.difficulty, input.promptId);
    const nextSeconds = currentUsage.seconds + prompt.speakingSeconds;

    if (!member.isAdmin && currentUsage.sessions >= limits.sessionsPerDay) {
      return {
        error: `${limits.label} users can start ${limits.sessionsPerDay} sessions per day. Upgrade for more practice.`,
        status: 403 as const
      };
    }

    if (!member.isAdmin && nextSeconds > limits.speakingMinutesPerDay * 60) {
      return {
        error: `${limits.label} users can practice up to ${limits.speakingMinutesPerDay} speaking minutes per day.`,
        status: 403 as const
      };
    }

    const session: SpeakingSession = {
      id: crypto.randomUUID(),
      userId: input.userId,
      examType: input.examType,
      taskType: input.taskType,
      difficulty: input.difficulty,
      plan: member.plan,
      prompt,
      createdAt: new Date().toISOString(),
      audioUploaded: false
    };

    await sql`
      insert into speaking_sessions (
        id, user_id, exam_type, task_type, difficulty, plan, prompt_id, prompt_title, prompt_text,
        prep_seconds, speaking_seconds, audio_uploaded, created_at
      ) values (
        ${session.id}, ${session.userId}, ${session.examType}, ${session.taskType}, ${session.difficulty}, ${session.plan},
        ${session.prompt.id}, ${session.prompt.title}, ${session.prompt.prompt}, ${session.prompt.prepSeconds},
        ${session.prompt.speakingSeconds}, ${false}, ${session.createdAt}
      )
    `;

    await sql`
      insert into usage_daily (user_id, usage_date, sessions_count, speaking_seconds)
      values (${input.userId}, ${usageDate}, 1, ${prompt.speakingSeconds})
      on conflict (user_id, usage_date)
      do update set
        sessions_count = usage_daily.sessions_count + 1,
        speaking_seconds = usage_daily.speaking_seconds + ${prompt.speakingSeconds}
    `;

    return { session };
  }

  const store = getStore();
  const member = store.members.get(input.userId);
  if (!member) {
    return {
      error: "User profile not found. Sign in again to continue.",
      status: 401 as const
    };
  }

  const limits = PLAN_LIMITS[member.plan];
  const usageKey = todayKey(input.userId);
  const currentUsage = store.usageByDay.get(usageKey) ?? { sessions: 0, seconds: 0 };
  const prompt = getPromptTemplate(input.examType, input.taskType, input.difficulty, input.promptId);
  const nextSeconds = currentUsage.seconds + prompt.speakingSeconds;

  if (!member.isAdmin && currentUsage.sessions >= limits.sessionsPerDay) {
    return {
      error: `${limits.label} users can start ${limits.sessionsPerDay} sessions per day. Upgrade for more practice.`,
      status: 403 as const
    };
  }

  if (!member.isAdmin && nextSeconds > limits.speakingMinutesPerDay * 60) {
    return {
      error: `${limits.label} users can practice up to ${limits.speakingMinutesPerDay} speaking minutes per day.`,
      status: 403 as const
    };
  }

  const session: SpeakingSession = {
    id: crypto.randomUUID(),
    userId: input.userId,
    examType: input.examType,
    taskType: input.taskType,
    difficulty: input.difficulty,
    plan: member.plan,
    prompt,
    createdAt: new Date().toISOString(),
    audioUploaded: false
  };

  store.sessions.set(session.id, session);
  store.usageByDay.set(usageKey, {
    sessions: currentUsage.sessions + 1,
    seconds: nextSeconds
  });
  return { session };
}

export async function uploadSessionAudio(
  sessionId: string,
  audioBytes: number,
  transcript?: string | null,
  meta?: { transcriptSource?: "openai" | "generated"; transcriptStatus?: string }
) {
  if (hasDatabaseUrl()) {
    const sql = getSql();
    const [row] = await sql<{ id: string }[]>`
      update speaking_sessions
      set audio_uploaded = ${true}, audio_bytes = ${audioBytes}, transcript = ${transcript ?? null}, raw_transcript = ${transcript ?? null}
      where id = ${sessionId}
      returning id
    `;

    if (!row) {
      return null;
    }

    return getSession(sessionId);
  }

  const store = getStore();
  const session = store.sessions.get(sessionId);
  if (!session) {
    return null;
  }

  const updated: SpeakingSession = {
    ...session,
    audioUploaded: true,
    audioBytes,
    rawTranscript: transcript ?? session.rawTranscript,
    transcript: transcript ?? session.transcript,
    transcriptSource: meta?.transcriptSource ?? session.transcriptSource,
    transcriptStatus: meta?.transcriptStatus ?? session.transcriptStatus
  };
  store.sessions.set(sessionId, updated);
  return updated;
}

export async function evaluateStoredSession(sessionId: string) {
  const session = await getSession(sessionId);
  if (!session) {
    return null;
  }

  const rawTranscript = session.rawTranscript ?? session.transcript ?? buildSessionTranscript(session);
  const cleanedTranscript = cleanTranscriptText(rawTranscript);
  const transcriptIssue = detectTranscriptIssue(cleanedTranscript);
  const transcriptQuality = getTranscriptQuality(cleanedTranscript);
  let report = transcriptIssue
    ? buildRetryRequiredReport(session, transcriptIssue.code)
    : evaluateSession({ ...session, transcript: cleanedTranscript });

  if (!transcriptIssue) {
    try {
      const aiReport = await generateFeedbackReport({
        examType: session.examType,
        taskType: session.taskType,
        promptTitle: session.prompt.title,
        promptText: session.prompt.prompt,
        difficulty: session.difficulty,
        transcript: cleanedTranscript
      });

      if (aiReport) {
        report = {
          overall: aiReport.overall,
          scaleLabel: aiReport.scaleLabel,
          categories: aiReport.categories.map((category) => ({
            category: category.category as ScoreReport["categories"][number]["category"],
            label: category.label,
            score: category.score
          })),
          strengths: aiReport.strengths,
          improvements: aiReport.improvements,
          nextExercise: aiReport.nextExercise,
          caution: aiReport.caution,
          fillerWords: aiReport.fillerWords,
          improvedAnswer: aiReport.improvedAnswer
        };
      }
    } catch (error) {
      console.error(error);
    }
  }

  if (hasDatabaseUrl()) {
    const sql = getSql();
    await sql`
      update speaking_sessions
      set transcript = ${cleanedTranscript},
          raw_transcript = ${rawTranscript},
          cleaned_transcript = ${cleanedTranscript},
          transcript_quality_score = ${transcriptQuality.score},
          transcript_quality_label = ${transcriptQuality.label}
      where id = ${sessionId}
    `;

    await sql`
      insert into feedback_reports (
        session_id, overall_score, scale_label, categories_json, strengths_json, improvements_json,
        next_exercise, caution, filler_words_json, improved_answer
      ) values (
        ${sessionId},
        ${report.overall},
        ${report.scaleLabel},
        ${JSON.stringify(report.categories)}::jsonb,
        ${JSON.stringify(report.strengths)}::jsonb,
        ${JSON.stringify(report.improvements)}::jsonb,
        ${report.nextExercise},
        ${report.caution},
        ${JSON.stringify(report.fillerWords)}::jsonb,
        ${report.improvedAnswer}
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
        filler_words_json = excluded.filler_words_json,
        improved_answer = excluded.improved_answer
    `;

    return getSession(sessionId);
  }

  const store = getStore();
  const updated: SpeakingSession = {
    ...session,
    rawTranscript,
    transcript: cleanedTranscript,
    transcriptQualityScore: transcriptQuality.score,
    transcriptQualityLabel: transcriptQuality.label,
    transcriptSource: session.transcript ? session.transcriptSource ?? "openai" : "generated",
    transcriptStatus:
      transcriptIssue?.code === "non_english"
        ? "Non-English speech detected. Ask the learner to answer in English."
        : transcriptIssue?.code === "too_short"
          ? "The response was too short for reliable scoring."
          : session.transcriptStatus ?? "Saved locally and evaluated.",
    report
  };
  store.sessions.set(sessionId, updated);
  return updated;
}

export async function getSession(sessionId: string) {
  if (hasDatabaseUrl()) {
    const sql = getSql();
    const rows = await sql<{
      id: string;
      user_id: string;
      exam_type: ExamType;
      task_type: TaskType;
      difficulty: Difficulty;
      plan: MemberProfile["plan"];
      prompt_id: string;
      prompt_title: string;
      prompt_text: string;
      prep_seconds: number;
      speaking_seconds: number;
      created_at: string | Date;
      audio_uploaded: boolean;
      audio_bytes: number | null;
      transcript: string | null;
      raw_transcript: string | null;
      cleaned_transcript: string | null;
      transcript_quality_score: number | null;
      transcript_quality_label: string | null;
      overall_score: number | null;
      scale_label: string | null;
      categories_json: unknown | null;
      strengths_json: unknown | null;
      improvements_json: unknown | null;
      next_exercise: string | null;
      caution: string | null;
      filler_words_json: unknown | null;
      improved_answer: string | null;
    }[]>`
      select
        s.id, s.user_id, s.exam_type, s.task_type, s.difficulty, s.plan,
        s.prompt_id, s.prompt_title, s.prompt_text, s.prep_seconds, s.speaking_seconds,
        s.created_at, s.audio_uploaded, s.audio_bytes, s.transcript, s.raw_transcript, s.cleaned_transcript,
        s.transcript_quality_score, s.transcript_quality_label,
        f.overall_score, f.scale_label, f.categories_json, f.strengths_json,
        f.improvements_json, f.next_exercise, f.caution, f.filler_words_json, f.improved_answer
      from speaking_sessions s
      left join feedback_reports f on f.session_id = s.id
      where s.id = ${sessionId}
      limit 1
    `;

    const row = rows[0];
    if (!row) {
      return null;
    }

    const session = sessionFromDbRow(row);
    session.transcriptQualityScore = row.transcript_quality_score ?? undefined;
    session.transcriptQualityLabel = row.transcript_quality_label ?? undefined;
    if (row.overall_score !== null && row.scale_label) {
      session.report = reportFromDb({
        overall_score: row.overall_score,
        scale_label: row.scale_label,
        categories_json: row.categories_json ?? [],
        strengths_json: row.strengths_json ?? [],
        improvements_json: row.improvements_json ?? [],
        next_exercise: row.next_exercise ?? "",
        caution: row.caution ?? "",
        filler_words_json: row.filler_words_json ?? [],
        improved_answer: row.improved_answer ?? ""
      });
    }

    return session;
  }

  return getStore().sessions.get(sessionId) ?? null;
}

export async function getProgressSummary(userId: string): Promise<ProgressSummary> {
  if (hasDatabaseUrl()) {
    const sql = getSql();
    const member = await getMember(userId);
    const plan = member?.plan ?? "free";
    const limits = PLAN_LIMITS[plan];
    const usageDate = new Date().toISOString().slice(0, 10);

    const [usage] = await sql<{ sessions_count: number; speaking_seconds: number }[]>`
      select sessions_count, speaking_seconds
      from usage_daily
      where user_id = ${userId} and usage_date = ${usageDate}
    `;
    const [countRow] = await sql<{ count: string }[]>`
      select count(*)::text as count
      from speaking_sessions
      where user_id = ${userId}
    `;
    const [averageRow] = await sql<{ average: number | null }[]>`
      select avg(f.overall_score)::numeric(4,1) as average
      from feedback_reports f
      inner join speaking_sessions s on s.id = f.session_id
      where s.user_id = ${userId}
    `;
    const recentRows = await sql<{
      id: string;
      user_id: string;
      exam_type: ExamType;
      task_type: TaskType;
      difficulty: Difficulty;
      plan: MemberProfile["plan"];
      prompt_id: string;
      prompt_title: string;
      prompt_text: string;
      prep_seconds: number;
      speaking_seconds: number;
      created_at: string | Date;
      audio_uploaded: boolean;
      audio_bytes: number | null;
      transcript: string | null;
      raw_transcript: string | null;
      cleaned_transcript: string | null;
      transcript_quality_score: number | null;
      transcript_quality_label: string | null;
      overall_score: number | null;
      scale_label: string | null;
      categories_json: unknown | null;
      strengths_json: unknown | null;
      improvements_json: unknown | null;
      next_exercise: string | null;
      caution: string | null;
      filler_words_json: unknown | null;
      improved_answer: string | null;
    }[]>`
      select
        s.id, s.user_id, s.exam_type, s.task_type, s.difficulty, s.plan,
        s.prompt_id, s.prompt_title, s.prompt_text, s.prep_seconds, s.speaking_seconds,
        s.created_at, s.audio_uploaded, s.audio_bytes, s.transcript, s.raw_transcript, s.cleaned_transcript,
        s.transcript_quality_score, s.transcript_quality_label,
        f.overall_score, f.scale_label, f.categories_json, f.strengths_json,
        f.improvements_json, f.next_exercise, f.caution, f.filler_words_json, f.improved_answer
      from speaking_sessions s
      left join feedback_reports f on f.session_id = s.id
      where s.user_id = ${userId}
      order by s.created_at desc
      limit 28
    `;

    const recentSessions = recentRows.map((row) => {
      const session = sessionFromDbRow(row);
      session.transcriptQualityScore = row.transcript_quality_score ?? undefined;
      session.transcriptQualityLabel = row.transcript_quality_label ?? undefined;
      if (row.overall_score !== null && row.scale_label) {
        session.report = reportFromDb({
          overall_score: row.overall_score,
          scale_label: row.scale_label,
          categories_json: row.categories_json ?? [],
          strengths_json: row.strengths_json ?? [],
          improvements_json: row.improvements_json ?? [],
          next_exercise: row.next_exercise ?? "",
          caution: row.caution ?? "",
          filler_words_json: row.filler_words_json ?? [],
          improved_answer: row.improved_answer ?? ""
        });
      }
      return session;
    });

    const usedSessions = usage?.sessions_count ?? 0;
    const usedSeconds = usage?.speaking_seconds ?? 0;

    return {
      totalSessions: Number(countRow?.count ?? 0),
      averageScore: Number(averageRow?.average ?? 0),
      streakDays: Math.min(Number(countRow?.count ?? 0), 6),
      freeSessionsRemaining: member?.isAdmin ? 999 : Math.max(limits.sessionsPerDay - usedSessions, 0),
      remainingMinutesToday: member?.isAdmin ? 999 : Math.max(Number(((limits.speakingMinutesPerDay * 60 - usedSeconds) / 60).toFixed(1)), 0),
      currentPlan: member?.isAdmin ? "pro" : plan,
      recentSessions
    };
  }

  const store = getStore();
  const member = store.members.get(userId);
  const plan = member?.plan ?? "free";
  const limits = PLAN_LIMITS[plan];
  const usage = store.usageByDay.get(todayKey(userId)) ?? { sessions: 0, seconds: 0 };
  const recentSessions = [...store.sessions.values()]
    .filter((session) => session.userId === userId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const scoredSessions = recentSessions.filter((session) => session.report);
  const averageScore = scoredSessions.length
    ? Number(
        (
          scoredSessions.reduce((sum, session) => sum + (session.report?.overall ?? 0), 0) / scoredSessions.length
        ).toFixed(1)
      )
    : 0;

  const remainingSessions = Math.max(limits.sessionsPerDay - usage.sessions, 0);
  const remainingMinutesToday = Math.max(Number(((limits.speakingMinutesPerDay * 60 - usage.seconds) / 60).toFixed(1)), 0);

  return {
    totalSessions: recentSessions.length,
    averageScore,
    streakDays: Math.min(recentSessions.length, 6),
    freeSessionsRemaining: member?.isAdmin ? 999 : remainingSessions,
    remainingMinutesToday: member?.isAdmin ? 999 : remainingMinutesToday,
    currentPlan: member?.isAdmin ? "pro" : plan,
    recentSessions: recentSessions.slice(0, 28)
  };
}

export async function upsertMember(profile: MemberProfile) {
  if (hasDatabaseUrl()) {
    const sql = getSql();
    const rows = await sql<MemberProfile[]>`
      insert into users (id, email, name, role, plan, email_verified, admin_access, teacher_access, created_at)
      values (${profile.id}, ${profile.email}, ${profile.name}, ${profile.role}, ${profile.plan}, ${profile.emailVerified ?? false}, ${profile.adminAccess ?? false}, ${profile.teacherAccess ?? false}, ${profile.createdAt})
      on conflict (id)
      do update set
        email = excluded.email,
        name = excluded.name,
        role = excluded.role,
        plan = excluded.plan,
        email_verified = excluded.email_verified,
        admin_access = excluded.admin_access,
        teacher_access = excluded.teacher_access
      returning id, email, name, role, plan, email_verified as "emailVerified", admin_access as "adminAccess", teacher_access as "teacherAccess", created_at as "createdAt"
    `;

    return withAdminPrivileges(rows[0]);
  }

  const store = getStore();
  const nextProfile = withAdminPrivileges(profile);
  store.members.set(nextProfile.id, nextProfile);
  return nextProfile;
}

export async function getMember(userId: string) {
  if (hasDatabaseUrl()) {
    const sql = getSql();
    const rows = await sql<MemberProfile[]>`
      select id, email, name, role, plan, email_verified as "emailVerified", admin_access as "adminAccess", teacher_access as "teacherAccess", created_at as "createdAt"
      from users
      where id = ${userId}
      limit 1
    `;
    return rows[0] ? withAdminPrivileges(rows[0]) : null;
  }

  const profile = getStore().members.get(userId) ?? null;
  return profile ? withAdminPrivileges(profile) : null;
}

export async function resetStore() {
  if (hasDatabaseUrl()) {
    const sql = getSql();
    await sql`delete from feedback_reports`;
    await sql`delete from speaking_sessions`;
    await sql`delete from usage_daily`;
    await sql`delete from users`;
    return;
  }

  const store = getStore();
  store.sessions.clear();
  store.usageByDay.clear();
  store.members.clear();
}
