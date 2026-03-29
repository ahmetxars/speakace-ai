import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { updateTeacherClassSettings } from "@/lib/classroom-store";
import { getAuthenticatedUser, getSessionCookieName } from "@/lib/server/auth";

async function getTeacherProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const profile = await getAuthenticatedUser(token);
  if (!profile?.isTeacher && !profile?.isAdmin) return null;
  return profile;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const profile = await getTeacherProfile();
  if (!profile) {
    return NextResponse.json({ error: "Teacher access required." }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { id } = await params;
    const classroom = await updateTeacherClassSettings({
      teacherId: profile.id,
      classId: id,
      approvalRequired: Boolean(body.approvalRequired),
      joinMessage: body.joinMessage ? String(body.joinMessage) : ""
    });
    return NextResponse.json({ classroom });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save class settings." }, { status: 400 });
  }
}
