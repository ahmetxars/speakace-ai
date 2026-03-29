import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { addStudentToTeacherClass, listClassStudents } from "@/lib/classroom-store";
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

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const profile = await getTeacherProfile();
  if (!profile) {
    return NextResponse.json({ error: "Teacher access required." }, { status: 403 });
  }

  try {
    const { id } = await params;
    const students = await listClassStudents({ teacherId: profile.id, classId: id });
    return NextResponse.json({ students });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load students." }, { status: 400 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const profile = await getTeacherProfile();
  if (!profile) {
    return NextResponse.json({ error: "Teacher access required." }, { status: 403 });
  }

  const ip = getRequestIp(request);
  const limit = checkRateLimit({
    key: `teacher-add-student:${ip}:${profile.id}`,
    windowMs: 1000 * 60 * 30,
    max: 24
  });
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many student add attempts. Please try again later." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { id } = await params;
    const student = await addStudentToTeacherClass({
      teacherId: profile.id,
      classId: id,
      studentEmail: String(body.email ?? "")
    });
    return NextResponse.json({ student });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not add student." }, { status: 400 });
  }
}
