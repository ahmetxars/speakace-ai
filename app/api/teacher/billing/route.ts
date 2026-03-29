import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getInstitutionBilling, updateInstitutionBilling } from "@/lib/classroom-store";
import { getAuthenticatedUser, getSessionCookieName } from "@/lib/server/auth";
import { checkRateLimit, getRequestIp } from "@/lib/server/rate-limit";
import { InstitutionPlan } from "@/lib/types";

async function getTeacherProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const profile = await getAuthenticatedUser(token);
  if (!profile?.isTeacher && !profile?.isAdmin) {
    return null;
  }
  return profile;
}

export async function GET() {
  const profile = await getTeacherProfile();
  if (!profile) {
    return NextResponse.json({ error: "Teacher access required." }, { status: 403 });
  }

  const billing = await getInstitutionBilling(profile.id);
  return NextResponse.json({ billing });
}

export async function POST(request: Request) {
  const profile = await getTeacherProfile();
  if (!profile) {
    return NextResponse.json({ error: "Teacher access required." }, { status: 403 });
  }

  const ip = getRequestIp(request);
  const limit = checkRateLimit({
    key: `teacher-billing-update:${ip}:${profile.id}`,
    windowMs: 1000 * 60 * 10,
    max: 20
  });
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many billing updates. Please try again later." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const plan = String(body.plan ?? "starter") as InstitutionPlan;
    const seatCount = Number(body.seatCount ?? 20);
    if (!["starter", "team", "campus"].includes(plan)) {
      return NextResponse.json({ error: "Invalid institution plan." }, { status: 400 });
    }

    const billing = await updateInstitutionBilling({
      teacherId: profile.id,
      plan,
      seatCount
    });
    return NextResponse.json({ billing });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update institution billing." }, { status: 400 });
  }
}
