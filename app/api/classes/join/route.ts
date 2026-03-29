import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { joinTeacherClassByCode, listStudentClasses } from "@/lib/classroom-store";
import { getAuthenticatedUser, getSessionCookieName } from "@/lib/server/auth";
import { checkRateLimit, getRequestIp } from "@/lib/server/rate-limit";

async function getMemberProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const profile = await getAuthenticatedUser(token);
  if (!profile || profile.role === "guest") {
    return null;
  }
  return profile;
}

export async function GET() {
  const profile = await getMemberProfile();
  if (!profile) {
    return NextResponse.json({ error: "Sign in to view class memberships." }, { status: 401 });
  }

  const classes = await listStudentClasses(profile.id);
  return NextResponse.json({ classes });
}

export async function POST(request: Request) {
  const profile = await getMemberProfile();
  if (!profile) {
    return NextResponse.json({ error: "Sign in to join a class." }, { status: 401 });
  }

  const ip = getRequestIp(request);
  const limit = checkRateLimit({
    key: `student-join-class:${ip}:${profile.id}`,
    windowMs: 1000 * 60 * 10,
    max: 10
  });
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many join attempts. Please try again later." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const result = await joinTeacherClassByCode({
      studentId: profile.id,
      joinCode: String(body.joinCode ?? "")
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not join class." }, { status: 400 });
  }
}
