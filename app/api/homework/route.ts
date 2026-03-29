import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { listStudentHomework, markHomeworkCompleted } from "@/lib/homework-store";
import { getAuthenticatedUser, getSessionCookieName } from "@/lib/server/auth";
import { checkRateLimit, getRequestIp } from "@/lib/server/rate-limit";

async function getProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  return getAuthenticatedUser(token);
}

export async function GET() {
  const profile = await getProfile();
  if (!profile || profile.role === "guest") {
    return NextResponse.json({ error: "Sign in to view homework." }, { status: 401 });
  }

  const assignments = await listStudentHomework(profile.id);
  return NextResponse.json({ assignments });
}

export async function PATCH(request: Request) {
  const profile = await getProfile();
  if (!profile || profile.role === "guest") {
    return NextResponse.json({ error: "Sign in to update homework." }, { status: 401 });
  }

  const ip = getRequestIp(request);
  const limit = checkRateLimit({
    key: `student-homework-complete:${ip}:${profile.id}`,
    windowMs: 1000 * 60 * 10,
    max: 30
  });
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many homework updates. Please try again later." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const assignment = await markHomeworkCompleted({
      assignmentId: String(body.assignmentId ?? ""),
      studentId: profile.id
    });
    if (!assignment) {
      return NextResponse.json({ error: "Homework item not found." }, { status: 404 });
    }
    return NextResponse.json({ assignment });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update homework." }, { status: 400 });
  }
}
