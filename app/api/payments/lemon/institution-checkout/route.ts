import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { buildInstitutionCheckoutUrl, commerceConfig } from "@/lib/commerce";
import { getAuthenticatedUser, getSessionCookieName } from "@/lib/server/auth";
import { InstitutionBillingSummary } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const plan = (searchParams.get("plan") ?? "starter") as InstitutionBillingSummary["plan"];
  const seatCount = parseInt(searchParams.get("seats") ?? "20", 10);

  const validPlans: InstitutionBillingSummary["plan"][] = ["starter", "team", "campus"];
  if (!validPlans.includes(plan)) {
    return NextResponse.json({ error: "Invalid institution plan." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const profile = await getAuthenticatedUser(token);

  if (!profile) {
    return NextResponse.redirect(
      new URL("/auth/signin?redirect=/app/teacher/billing", request.url)
    );
  }

  if (!profile.isTeacher && !profile.isAdmin) {
    return NextResponse.json({ error: "Teacher access required." }, { status: 403 });
  }

  const checkoutUrl = buildInstitutionCheckoutUrl({
    plan,
    email: profile.email,
    name: profile.name,
    userId: profile.id,
    seatCount: isNaN(seatCount) ? undefined : seatCount
  });

  return NextResponse.redirect(checkoutUrl || commerceConfig.institutionStarterCheckout);
}
