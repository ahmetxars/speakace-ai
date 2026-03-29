import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAuthenticatedUser, getSessionCookieName } from "@/lib/server/auth";
import { getStudentProfile, upsertStudentProfile } from "@/lib/student-profile-store";

async function getSignedInProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  return getAuthenticatedUser(token);
}

export async function GET() {
  const profile = await getSignedInProfile();
  if (!profile || profile.role === "guest") {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const studentProfile = await getStudentProfile(profile.id);
  return NextResponse.json({ profile: studentProfile });
}

export async function POST(request: Request) {
  const profile = await getSignedInProfile();
  if (!profile || profile.role === "guest") {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const studentProfile = await upsertStudentProfile({
      userId: profile.id,
      preferredExamType: body.preferredExamType === "TOEFL" ? "TOEFL" : "IELTS",
      targetScore: typeof body.targetScore === "number" ? body.targetScore : body.targetScore ? Number(body.targetScore) : null,
      weeklyGoal: Number(body.weeklyGoal ?? 4),
      studyDays: Array.isArray(body.studyDays) ? body.studyDays.map(String) : [],
      currentLevel: String(body.currentLevel ?? ""),
      focusSkill: String(body.focusSkill ?? ""),
      bio: body.bio ? String(body.bio) : ""
    });
    return NextResponse.json({ profile: studentProfile });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save profile." }, { status: 400 });
  }
}
