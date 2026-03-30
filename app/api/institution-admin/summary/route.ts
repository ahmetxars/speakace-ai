import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getInstitutionAdminSummary } from "@/lib/classroom-store";
import { getAuthenticatedUser, getSessionCookieName } from "@/lib/server/auth";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const profile = await getAuthenticatedUser(token);

  if (!profile?.isAdmin) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  return NextResponse.json(await getInstitutionAdminSummary());
}
