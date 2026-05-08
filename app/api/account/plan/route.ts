import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAuthenticatedUser, getSessionCookieName } from "@/lib/server/auth";
import { syncBillingStateForMember } from "@/lib/store";

async function syncPlanResponse() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const profile = await getAuthenticatedUser(token);

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const syncedProfile = await syncBillingStateForMember(profile);

  return NextResponse.json({
    plan: syncedProfile.plan,
    billingStatus: syncedProfile.billingStatus ?? "free",
    profile: syncedProfile
  });
}

export async function GET() {
  return syncPlanResponse();
}

export async function POST() {
  return syncPlanResponse();
}
