import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAuthenticatedUser, getSessionCookieName } from "@/lib/server/auth";
import { upsertMember } from "@/lib/store";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const profile = await getAuthenticatedUser(token);

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    plan: profile.plan,
    billingStatus: profile.billingStatus ?? "free",
    profile
  });
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const profile = await getAuthenticatedUser(token);

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const nextPlan = body.plan === "pro" ? "pro" : body.plan === "plus" ? "plus" : "free";
  const updated = await upsertMember({ ...profile, plan: nextPlan });

  return NextResponse.json({ profile: updated });
}
