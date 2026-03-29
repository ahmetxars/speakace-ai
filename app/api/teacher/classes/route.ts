import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createTeacherClass, listTeacherClasses } from "@/lib/classroom-store";
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

export async function GET() {
  const profile = await getTeacherProfile();
  if (!profile) {
    return NextResponse.json({ error: "Teacher access required." }, { status: 403 });
  }

  const classes = await listTeacherClasses(profile.id);
  return NextResponse.json({ classes });
}

export async function POST(request: Request) {
  const profile = await getTeacherProfile();
  if (!profile) {
    return NextResponse.json({ error: "Teacher access required." }, { status: 403 });
  }

  const ip = getRequestIp(request);
  const limit = checkRateLimit({
    key: `teacher-class-create:${ip}:${profile.id}`,
    windowMs: 1000 * 60 * 30,
    max: 12
  });
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many class creation attempts. Please try again later." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const classroom = await createTeacherClass({
      teacherId: profile.id,
      name: String(body.name ?? "")
    });
    return NextResponse.json({ classroom });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not create class." }, { status: 400 });
  }
}
