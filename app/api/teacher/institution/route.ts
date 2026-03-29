import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getInstitutionAnalytics } from "@/lib/classroom-store";
import { getAuthenticatedUser, getSessionCookieName } from "@/lib/server/auth";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const profile = await getAuthenticatedUser(token);
  if (!profile?.isTeacher && !profile?.isAdmin) {
    return NextResponse.json({ error: "Teacher access required." }, { status: 403 });
  }

  try {
    const analytics = await getInstitutionAnalytics(profile.id);
    return NextResponse.json({ analytics });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load institution analytics." }, { status: 400 });
  }
}
