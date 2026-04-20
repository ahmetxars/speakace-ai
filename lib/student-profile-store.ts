import { getSql, hasDatabaseUrl } from "@/lib/server/db";
import { ExamType, StudentProfile } from "@/lib/types";

type MemoryStudentProfileStore = {
  profiles: Map<string, StudentProfile>;
};

function getStore(): MemoryStudentProfileStore {
  const globalStore = globalThis as typeof globalThis & { __speakAceStudentProfiles?: MemoryStudentProfileStore };
  if (!globalStore.__speakAceStudentProfiles) {
    globalStore.__speakAceStudentProfiles = {
      profiles: new Map()
    };
  }
  return globalStore.__speakAceStudentProfiles;
}

function defaultProfile(userId: string): StudentProfile {
  return {
    userId,
    preferredExamType: "IELTS",
    targetScore: null,
    weeklyGoal: 4,
    dailyMinutesGoal: 15,
    studyDays: ["Mon", "Wed", "Fri"],
    currentLevel: "Building basics",
    focusSkill: "Balanced practice",
    examDate: null,
    targetReason: "Improve speaking score",
    discoverySource: "Google search",
    bio: "",
    avatarDataUrl: "",
    onboardingComplete: false,
    updatedAt: new Date().toISOString()
  };
}

function normalizeStudyDays(value: unknown) {
  if (Array.isArray(value)) {
    return value.map(String).slice(0, 7);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map(String).slice(0, 7);
      }
    } catch {
      return trimmed.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 7);
    }
  }

  return [];
}

function normalizeStudentProfile(userId: string, input?: Partial<StudentProfile> | null): StudentProfile {
  const fallback = defaultProfile(userId);
  const studyDays = normalizeStudyDays(input?.studyDays);

  return {
    userId,
    preferredExamType: input?.preferredExamType === "TOEFL" ? "TOEFL" : fallback.preferredExamType,
    targetScore: typeof input?.targetScore === "number" ? input.targetScore : fallback.targetScore,
    weeklyGoal: typeof input?.weeklyGoal === "number" && Number.isFinite(input.weeklyGoal) ? input.weeklyGoal : fallback.weeklyGoal,
    dailyMinutesGoal:
      typeof input?.dailyMinutesGoal === "number" && Number.isFinite(input.dailyMinutesGoal)
        ? input.dailyMinutesGoal
        : fallback.dailyMinutesGoal,
    studyDays: studyDays.length ? studyDays : fallback.studyDays,
    currentLevel: typeof input?.currentLevel === "string" && input.currentLevel.trim() ? input.currentLevel : fallback.currentLevel,
    focusSkill: typeof input?.focusSkill === "string" && input.focusSkill.trim() ? input.focusSkill : fallback.focusSkill,
    examDate: typeof input?.examDate === "string" && input.examDate.trim() ? input.examDate : fallback.examDate,
    targetReason:
      typeof input?.targetReason === "string" && input.targetReason.trim() ? input.targetReason : fallback.targetReason,
    discoverySource:
      typeof input?.discoverySource === "string" && input.discoverySource.trim()
        ? input.discoverySource
        : fallback.discoverySource,
    bio: typeof input?.bio === "string" ? input.bio : fallback.bio,
    avatarDataUrl: typeof input?.avatarDataUrl === "string" ? input.avatarDataUrl : fallback.avatarDataUrl,
    onboardingComplete: Boolean(input?.onboardingComplete),
    updatedAt: typeof input?.updatedAt === "string" && input.updatedAt ? input.updatedAt : fallback.updatedAt
  };
}

let ensuredAvatarColumn = false;

async function ensureStudentProfileColumns() {
  if (!hasDatabaseUrl() || ensuredAvatarColumn) return;
  const sql = getSql();
  await sql`alter table student_profiles add column if not exists avatar_data_url text`;
  ensuredAvatarColumn = true;
}

export async function getStudentProfile(userId: string) {
  if (hasDatabaseUrl()) {
    await ensureStudentProfileColumns();
    const sql = getSql();
    const rows = (await sql`
      select
        user_id as "userId",
        preferred_exam_type as "preferredExamType",
        target_score as "targetScore",
        weekly_goal as "weeklyGoal",
        daily_minutes_goal as "dailyMinutesGoal",
        study_days_json as "studyDays",
        current_level as "currentLevel",
        focus_skill as "focusSkill",
        exam_date as "examDate",
        target_reason as "targetReason",
        discovery_source as "discoverySource",
        bio,
        avatar_data_url as "avatarDataUrl",
        onboarding_complete as "onboardingComplete",
        updated_at as "updatedAt"
      from student_profiles
      where user_id = ${userId}
      limit 1
    `) as unknown as StudentProfile[];
    return normalizeStudentProfile(userId, rows[0]);
  }

  return normalizeStudentProfile(userId, getStore().profiles.get(userId));
}

export async function upsertStudentProfile(input: {
  userId: string;
  preferredExamType: ExamType;
  targetScore: number | null;
  weeklyGoal: number;
  dailyMinutesGoal?: number;
  studyDays: string[];
  currentLevel: string;
  focusSkill: string;
  examDate?: string | null;
  targetReason?: string;
  discoverySource?: string;
  bio?: string;
  avatarDataUrl?: string;
  onboardingComplete?: boolean;
}) {
  const next: StudentProfile = {
    userId: input.userId,
    preferredExamType: input.preferredExamType,
    targetScore: input.targetScore == null ? null : Number(input.targetScore.toFixed(1)),
    weeklyGoal: Math.max(1, Math.min(14, Math.round(input.weeklyGoal))),
    dailyMinutesGoal: Math.max(5, Math.min(60, Math.round(input.dailyMinutesGoal ?? 15))),
    studyDays: input.studyDays.slice(0, 7),
    currentLevel: input.currentLevel.trim() || "Building basics",
    focusSkill: input.focusSkill.trim() || "Balanced practice",
    examDate: input.examDate?.trim() || null,
    targetReason: input.targetReason?.trim() || "Improve speaking score",
    discoverySource: input.discoverySource?.trim() || "Google search",
    bio: input.bio?.trim() ?? "",
    avatarDataUrl: input.avatarDataUrl?.trim() ?? "",
    onboardingComplete: Boolean(input.onboardingComplete),
    updatedAt: new Date().toISOString()
  };

  if (hasDatabaseUrl()) {
    await ensureStudentProfileColumns();
    const sql = getSql();
    const bio = next.bio ?? "";
    const avatarDataUrl = next.avatarDataUrl ?? "";
    const dailyMinutesGoal = next.dailyMinutesGoal ?? 15;
    const examDate = next.examDate ?? null;
    const targetReason = next.targetReason ?? "Improve speaking score";
    const discoverySource = next.discoverySource ?? "Google search";
    const rows = (await sql`
      insert into student_profiles (
        user_id, preferred_exam_type, target_score, weekly_goal, study_days_json,
        daily_minutes_goal, current_level, focus_skill, exam_date, target_reason,
        discovery_source, bio, avatar_data_url, onboarding_complete, updated_at
      ) values (
        ${next.userId}, ${next.preferredExamType}, ${next.targetScore}, ${next.weeklyGoal},
        ${JSON.stringify(next.studyDays)}::jsonb, ${dailyMinutesGoal}, ${next.currentLevel},
        ${next.focusSkill}, ${examDate}, ${targetReason}, ${discoverySource},
        ${bio}, ${avatarDataUrl}, ${next.onboardingComplete ?? false}, ${next.updatedAt}
      )
      on conflict (user_id)
      do update set
        preferred_exam_type = excluded.preferred_exam_type,
        target_score = excluded.target_score,
        weekly_goal = excluded.weekly_goal,
        daily_minutes_goal = excluded.daily_minutes_goal,
        study_days_json = excluded.study_days_json,
        current_level = excluded.current_level,
        focus_skill = excluded.focus_skill,
        exam_date = excluded.exam_date,
        target_reason = excluded.target_reason,
        discovery_source = excluded.discovery_source,
        bio = excluded.bio,
        avatar_data_url = excluded.avatar_data_url,
        onboarding_complete = excluded.onboarding_complete,
        updated_at = excluded.updated_at
      returning
        user_id as "userId",
        preferred_exam_type as "preferredExamType",
        target_score as "targetScore",
        weekly_goal as "weeklyGoal",
        daily_minutes_goal as "dailyMinutesGoal",
        study_days_json as "studyDays",
        current_level as "currentLevel",
        focus_skill as "focusSkill",
        exam_date as "examDate",
        target_reason as "targetReason",
        discovery_source as "discoverySource",
        bio,
        avatar_data_url as "avatarDataUrl",
        onboarding_complete as "onboardingComplete",
        updated_at as "updatedAt"
    `) as unknown as StudentProfile[];
    return normalizeStudentProfile(next.userId, rows[0]);
  }

  getStore().profiles.set(next.userId, next);
  return normalizeStudentProfile(next.userId, next);
}
