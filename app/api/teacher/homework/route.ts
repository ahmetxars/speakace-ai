import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { buildAdaptiveHomeworkSuggestions, createHomeworkAssignment, listTeacherHomework } from "@/lib/homework-store";
import { getAuthenticatedUser, getSessionCookieName } from "@/lib/server/auth";
import { checkRateLimit, getRequestIp } from "@/lib/server/rate-limit";
import { TaskType } from "@/lib/types";

async function getTeacherProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const profile = await getAuthenticatedUser(token);
  if (!profile?.isTeacher && !profile?.isAdmin) {
    return null;
  }
  return profile;
}

export async function GET(request: Request) {
  const profile = await getTeacherProfile();
  if (!profile) {
    return NextResponse.json({ error: "Teacher access required." }, { status: 403 });
  }

  const url = new URL(request.url);
  const studentId = url.searchParams.get("studentId");
  if (studentId) {
    const suggestions = await buildAdaptiveHomeworkSuggestions(studentId);
    return NextResponse.json({ suggestions });
  }

  const assignments = await listTeacherHomework(profile.id);
  return NextResponse.json({ assignments });
}

export async function POST(request: Request) {
  const profile = await getTeacherProfile();
  if (!profile) {
    return NextResponse.json({ error: "Teacher access required." }, { status: 403 });
  }

  const ip = getRequestIp(request);
  const limit = checkRateLimit({
    key: `teacher-homework:${ip}:${profile.id}`,
    windowMs: 1000 * 60 * 15,
    max: 40
  });
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many homework actions. Please try again later." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const assignment = await createHomeworkAssignment({
      teacherId: profile.id,
      studentId: String(body.studentId ?? ""),
      classId: body.classId ? String(body.classId) : undefined,
      title: String(body.title ?? ""),
      instructions: String(body.instructions ?? ""),
      focusSkill: String(body.focusSkill ?? ""),
      recommendedTaskType: String(body.recommendedTaskType ?? "ielts-part-1") as TaskType,
      promptId: body.promptId ? String(body.promptId) : undefined,
      dueAt: body.dueAt ? String(body.dueAt) : undefined
    });
    return NextResponse.json({ assignment });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not create homework." }, { status: 400 });
  }
}
