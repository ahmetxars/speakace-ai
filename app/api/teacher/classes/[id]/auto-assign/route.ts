import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ensureTeacherOwnsClass, listClassStudents } from "@/lib/classroom-store";
import { getAuthenticatedUser, getSessionCookieName } from "@/lib/server/auth";
import { checkRateLimit, getRequestIp } from "@/lib/server/rate-limit";
import { getHomeworkAutoAssignRule, runAdaptiveHomeworkAutoAssign, upsertHomeworkAutoAssignRule } from "@/lib/homework-store";

async function getTeacherProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const profile = await getAuthenticatedUser(token);
  if (!profile?.isTeacher && !profile?.isAdmin) {
    return null;
  }
  return profile;
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const profile = await getTeacherProfile();
  if (!profile) {
    return NextResponse.json({ error: "Teacher access required." }, { status: 403 });
  }

  try {
    const { id } = await params;
    await ensureTeacherOwnsClass(profile.id, id);
    const rule = await getHomeworkAutoAssignRule({ teacherId: profile.id, classId: id });
    return NextResponse.json({ rule });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load rule." }, { status: 400 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const profile = await getTeacherProfile();
  if (!profile) {
    return NextResponse.json({ error: "Teacher access required." }, { status: 403 });
  }

  const ip = getRequestIp(request);
  const limit = checkRateLimit({
    key: `teacher-auto-assign:${ip}:${profile.id}`,
    windowMs: 1000 * 60 * 15,
    max: 40
  });
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many auto-assign actions. Please try again later." }, { status: 429 });
  }

  try {
    const { id } = await params;
    await ensureTeacherOwnsClass(profile.id, id);
    const body = await request.json();
    const action = String(body.action ?? "save");

    if (action === "run") {
      const students = await listClassStudents({ teacherId: profile.id, classId: id });
      const result = await runAdaptiveHomeworkAutoAssign({
        teacherId: profile.id,
        classId: id,
        students: students.map((item) => ({
          id: item.student.id,
          averageScore: item.averageScore,
          totalSessions: item.totalSessions,
          weakestSkill: item.weakestSkill,
          lastExamType: item.lastExamType,
          lastTaskType: item.lastTaskType
        }))
      });
      return NextResponse.json({ rule: result.rule, created: result.created });
    }

    const rule = await upsertHomeworkAutoAssignRule({
      teacherId: profile.id,
      classId: id,
      enabled: Boolean(body.enabled),
      scoreThreshold: Number(body.scoreThreshold ?? 5.5),
      dueDays: Number(body.dueDays ?? 7),
      examType: body.examType === "IELTS" || body.examType === "TOEFL" ? body.examType : "all",
      taskType: typeof body.taskType === "string" ? body.taskType : "all",
      focusSkill: body.focusSkill ? String(body.focusSkill) : null
    });
    return NextResponse.json({ rule });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update auto-assign rule." }, { status: 400 });
  }
}
