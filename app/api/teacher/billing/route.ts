import { NextResponse } from "next/server";
import { getInstitutionBilling, updateInstitutionBilling } from "@/lib/classroom-store";
import { permissionErrorResponse, requireSchoolAdmin } from "@/lib/server/permissions";
import { checkRateLimit, getRequestIp } from "@/lib/server/rate-limit";
import { InstitutionPlan } from "@/lib/types";

export async function GET() {
  try {
    const profile = await requireSchoolAdmin();
    const billing = await getInstitutionBilling(profile.id);
    return NextResponse.json({ billing });
  } catch (error) {
    return permissionErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const profile = await requireSchoolAdmin();
    const ip = getRequestIp(request);
    const limit = checkRateLimit({
      key: `teacher-billing-update:${ip}:${profile.id}`,
      windowMs: 1000 * 60 * 10,
      max: 20
    });
    if (!limit.allowed) {
      return NextResponse.json({ error: "Too many billing updates. Please try again later." }, { status: 429 });
    }
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
    return permissionErrorResponse(error);
  }
}
