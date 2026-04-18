import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSessionCookieName, getAuthenticatedUser } from "@/lib/server/auth";
import { getUserReferralSummary } from "@/lib/referrals";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const profile = await getAuthenticatedUser(token);

  if (!profile) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  return NextResponse.json({ summary: await getUserReferralSummary(profile.id), profile });
}
