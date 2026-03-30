import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAnalyticsDashboardSummary } from "@/lib/analytics-store";
import { getAuthenticatedUser, getSessionCookieName } from "@/lib/server/auth";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const profile = await getAuthenticatedUser(token);

  if (!profile) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  return NextResponse.json(await getAnalyticsDashboardSummary(profile.id));
}
