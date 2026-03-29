import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { compareStudentsForTeacher } from "@/lib/classroom-store";
import { getAuthenticatedUser, getSessionCookieName } from "@/lib/server/auth";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const profile = await getAuthenticatedUser(token);
  if (!profile?.isTeacher && !profile?.isAdmin) {
    return NextResponse.json({ error: "Teacher access required." }, { status: 403 });
  }

  const url = new URL(request.url);
  const leftId = url.searchParams.get("leftId") ?? "";
  const rightId = url.searchParams.get("rightId") ?? "";
  if (!leftId || !rightId) {
    return NextResponse.json({ error: "Two student ids are required." }, { status: 400 });
  }

  try {
    const comparison = await compareStudentsForTeacher({ teacherId: profile.id, leftId, rightId });
    return NextResponse.json({ comparison });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not compare students." }, { status: 400 });
  }
}
