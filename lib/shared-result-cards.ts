import { randomBytes } from "node:crypto";
import { getSql, hasDatabaseUrl } from "@/lib/server/db";
import { SharedResultCard } from "@/lib/types";

type SharedResultStore = {
  cards: Map<string, SharedResultCard>;
};

function getStore(): SharedResultStore {
  const globalStore = globalThis as typeof globalThis & { __speakAceSharedResults?: SharedResultStore };
  if (!globalStore.__speakAceSharedResults) {
    globalStore.__speakAceSharedResults = { cards: new Map() };
  }
  return globalStore.__speakAceSharedResults;
}

let ensuredTable = false;

async function ensureSharedResultTable() {
  if (!hasDatabaseUrl() || ensuredTable) return;
  const sql = getSql();
  await sql`
    create table if not exists shared_result_cards (
      slug text primary key,
      session_id text not null references speaking_sessions(id) on delete cascade,
      user_id text not null references users(id) on delete cascade,
      prompt_title text not null,
      exam_type text not null,
      task_type text not null,
      difficulty text not null,
      overall_score numeric(4,1) not null,
      scale_label text not null,
      delta numeric(4,1),
      learner_name text not null,
      avatar_data_url text,
      locale_flag text not null,
      streak_label text not null,
      badge_label text not null,
      next_exercise text not null,
      categories_json jsonb not null,
      created_at timestamptz not null default now()
    )
  `;
  await sql`create index if not exists idx_shared_result_cards_session_id on shared_result_cards(session_id)`;
  ensuredTable = true;
}

function createSlug() {
  return randomBytes(4).toString("base64url").toLowerCase();
}

function mapRow(row: {
  slug: string;
  session_id: string;
  user_id: string;
  prompt_title: string;
  exam_type: SharedResultCard["examType"];
  task_type: SharedResultCard["taskType"];
  difficulty: SharedResultCard["difficulty"];
  overall_score: number;
  scale_label: string;
  delta: number | null;
  learner_name: string;
  avatar_data_url: string | null;
  locale_flag: string;
  streak_label: string;
  badge_label: string;
  next_exercise: string;
  categories_json: unknown;
  created_at: string | Date;
}): SharedResultCard {
  return {
    slug: row.slug,
    sessionId: row.session_id,
    userId: row.user_id,
    promptTitle: row.prompt_title,
    examType: row.exam_type,
    taskType: row.task_type,
    difficulty: row.difficulty,
    overallScore: Number(row.overall_score),
    scaleLabel: row.scale_label,
    delta: row.delta == null ? null : Number(row.delta),
    learnerName: row.learner_name,
    avatarDataUrl: row.avatar_data_url ?? undefined,
    localeFlag: row.locale_flag,
    streakLabel: row.streak_label,
    badgeLabel: row.badge_label,
    nextExercise: row.next_exercise,
    categories: typeof row.categories_json === "string" ? JSON.parse(row.categories_json) : (row.categories_json as SharedResultCard["categories"]),
    createdAt: new Date(row.created_at).toISOString()
  };
}

export async function createSharedResultCard(input: Omit<SharedResultCard, "slug" | "createdAt">) {
  if (hasDatabaseUrl()) {
    await ensureSharedResultTable();
    const sql = getSql();
    const existingRows = await sql<Array<{
      slug: string;
      session_id: string;
      user_id: string;
      prompt_title: string;
      exam_type: SharedResultCard["examType"];
      task_type: SharedResultCard["taskType"];
      difficulty: SharedResultCard["difficulty"];
      overall_score: number;
      scale_label: string;
      delta: number | null;
      learner_name: string;
      avatar_data_url: string | null;
      locale_flag: string;
      streak_label: string;
      badge_label: string;
      next_exercise: string;
      categories_json: unknown;
      created_at: string | Date;
    }>>`
      select slug, session_id, user_id, prompt_title, exam_type, task_type, difficulty, overall_score,
        scale_label, delta, learner_name, avatar_data_url, locale_flag, streak_label, badge_label,
        next_exercise, categories_json, created_at
      from shared_result_cards
      where session_id = ${input.sessionId}
        and user_id = ${input.userId}
      limit 1
    `;

    if (existingRows[0]) {
      const existing = mapRow(existingRows[0]);
      await sql`
        update shared_result_cards
        set
          prompt_title = ${input.promptTitle},
          exam_type = ${input.examType},
          task_type = ${input.taskType},
          difficulty = ${input.difficulty},
          overall_score = ${input.overallScore},
          scale_label = ${input.scaleLabel},
          delta = ${input.delta ?? null},
          learner_name = ${input.learnerName},
          avatar_data_url = ${input.avatarDataUrl ?? null},
          locale_flag = ${input.localeFlag},
          streak_label = ${input.streakLabel},
          badge_label = ${input.badgeLabel},
          next_exercise = ${input.nextExercise},
          categories_json = ${JSON.stringify(input.categories)}::jsonb
        where slug = ${existing.slug}
      `;
      return {
        ...existing,
        ...input,
        slug: existing.slug,
        createdAt: existing.createdAt
      };
    }

    const card: SharedResultCard = {
      ...input,
      slug: createSlug(),
      createdAt: new Date().toISOString()
    };
    await sql`
      insert into shared_result_cards (
        slug, session_id, user_id, prompt_title, exam_type, task_type, difficulty, overall_score,
        scale_label, delta, learner_name, avatar_data_url, locale_flag, streak_label, badge_label,
        next_exercise, categories_json, created_at
      ) values (
        ${card.slug}, ${card.sessionId}, ${card.userId}, ${card.promptTitle}, ${card.examType}, ${card.taskType}, ${card.difficulty}, ${card.overallScore},
        ${card.scaleLabel}, ${card.delta ?? null}, ${card.learnerName}, ${card.avatarDataUrl ?? null}, ${card.localeFlag}, ${card.streakLabel}, ${card.badgeLabel},
        ${card.nextExercise}, ${JSON.stringify(card.categories)}::jsonb, ${card.createdAt}
      )
    `;
    return card;
  }

  const existing = Array.from(getStore().cards.values()).find((card) => card.sessionId === input.sessionId && card.userId === input.userId);
  if (existing) {
    const updated: SharedResultCard = {
      ...existing,
      ...input,
      slug: existing.slug,
      createdAt: existing.createdAt
    };
    getStore().cards.set(existing.slug, updated);
    return updated;
  }

  const card: SharedResultCard = {
    ...input,
    slug: createSlug(),
    createdAt: new Date().toISOString()
  };
  getStore().cards.set(card.slug, card);
  return card;
}

export async function getSharedResultCard(slug: string) {
  if (hasDatabaseUrl()) {
    await ensureSharedResultTable();
    const sql = getSql();
    const rows = await sql<Array<{
      slug: string;
      session_id: string;
      user_id: string;
      prompt_title: string;
      exam_type: SharedResultCard["examType"];
      task_type: SharedResultCard["taskType"];
      difficulty: SharedResultCard["difficulty"];
      overall_score: number;
      scale_label: string;
      delta: number | null;
      learner_name: string;
      avatar_data_url: string | null;
      locale_flag: string;
      streak_label: string;
      badge_label: string;
      next_exercise: string;
      categories_json: unknown;
      created_at: string | Date;
    }>>`
      select slug, session_id, user_id, prompt_title, exam_type, task_type, difficulty, overall_score,
        scale_label, delta, learner_name, avatar_data_url, locale_flag, streak_label, badge_label,
        next_exercise, categories_json, created_at
      from shared_result_cards
      where slug = ${slug}
      limit 1
    `;
    return rows[0] ? mapRow(rows[0]) : null;
  }

  return getStore().cards.get(slug) ?? null;
}
