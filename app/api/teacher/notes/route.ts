import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createTeacherNote } from "@/lib/classroom-store";
import { getAuthenticatedUser, getSessionCookieName } from "@/lib/server/auth";
import { checkRateLimit, getRequestIp } from "@/lib/server/rate-limit";

async function getTeacherProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const profile = await getAuthenticatedUser(token);
  if (!profile?.isTeacher && !profile?.isAdmin) {
    return null;
  }
  return profile;
}

export async function POST(request: Request) {
  const profile = await getTeacherProfile();
  if (!profile) {
    return NextResponse.json({ error: "Teacher access required." }, { status: 403 });
  }

  const ip = getRequestIp(request);
  const limit = checkRateLimit({
    key: `teacher-note:${ip}:${profile.id}`,
    windowMs: 1000 * 60 * 15,
    max: 40
  });
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many note submissions. Please try again later." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const note = await createTeacherNote({
      teacherId: profile.id,
      studentId: String(body.studentId ?? ""),
      sessionId: body.sessionId ? String(body.sessionId) : undefined,
      note: String(body.note ?? "")
    });
    return NextResponse.json({ note });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save teacher note." }, { status: 400 });
  }
}
