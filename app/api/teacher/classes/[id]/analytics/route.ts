import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getTeacherClassAnalytics } from "@/lib/classroom-store";
import { getAuthenticatedUser, getSessionCookieName } from "@/lib/server/auth";

async function getTeacherProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const profile = await getAuthenticatedUser(token);
  if (!profile?.isTeacher && !profile?.isAdmin) {
    return null;
  }
  return profile;
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const profile = await getTeacherProfile();
  if (!profile) {
    return NextResponse.json({ error: "Teacher access required." }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const analytics = await getTeacherClassAnalytics({ teacherId: profile.id, classId: id });
    return NextResponse.json({ analytics });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load class analytics." }, { status: 400 });
  }
}
