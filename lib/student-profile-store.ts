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
    onboardingComplete: false,
    updatedAt: new Date().toISOString()
  };
}

export async function getStudentProfile(userId: string) {
  if (hasDatabaseUrl()) {
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
        onboarding_complete as "onboardingComplete",
        updated_at as "updatedAt"
      from student_profiles
      where user_id = ${userId}
      limit 1
    `) as unknown as StudentProfile[];
    return rows[0] ?? defaultProfile(userId);
  }

  return getStore().profiles.get(userId) ?? defaultProfile(userId);
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
    onboardingComplete: Boolean(input.onboardingComplete),
    updatedAt: new Date().toISOString()
  };

  if (hasDatabaseUrl()) {
    const sql = getSql();
    const bio = next.bio ?? "";
    const dailyMinutesGoal = next.dailyMinutesGoal ?? 15;
    const examDate = next.examDate ?? null;
    const targetReason = next.targetReason ?? "Improve speaking score";
    const discoverySource = next.discoverySource ?? "Google search";
    const rows = (await sql`
      insert into student_profiles (
        user_id, preferred_exam_type, target_score, weekly_goal, study_days_json,
        daily_minutes_goal, current_level, focus_skill, exam_date, target_reason,
        discovery_source, bio, onboarding_complete, updated_at
      ) values (
        ${next.userId}, ${next.preferredExamType}, ${next.targetScore}, ${next.weeklyGoal},
        ${JSON.stringify(next.studyDays)}::jsonb, ${dailyMinutesGoal}, ${next.currentLevel},
        ${next.focusSkill}, ${examDate}, ${targetReason}, ${discoverySource},
        ${bio}, ${next.onboardingComplete ?? false}, ${next.updatedAt}
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
        onboarding_complete as "onboardingComplete",
        updated_at as "updatedAt"
    `) as unknown as StudentProfile[];
    return rows[0];
  }

  getStore().profiles.set(next.userId, next);
  return next;
}
