import { NextResponse } from "next/server";
import { buildInstitutionCheckoutUrl, commerceConfig } from "@/lib/commerce";
import { getPostHogClient } from "@/lib/posthog-server";
import { requireSchoolAdmin } from "@/lib/server/permissions";
import { InstitutionBillingSummary } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const plan = (searchParams.get("plan") ?? "starter") as InstitutionBillingSummary["plan"];
  const seatCount = parseInt(searchParams.get("seats") ?? "20", 10);

  const validPlans: InstitutionBillingSummary["plan"][] = ["starter", "team", "campus"];
  if (!validPlans.includes(plan)) {
    return NextResponse.json({ error: "Invalid institution plan." }, { status: 400 });
  }

  let profile;
  try {
    profile = await requireSchoolAdmin();
  } catch {
    return NextResponse.redirect(
      new URL("/auth/signin?redirect=/app/teacher/billing", request.url)
    );
  }

  const checkoutUrl = buildInstitutionCheckoutUrl({
    plan,
    email: profile.email,
    name: profile.name,
    userId: profile.id,
    seatCount: isNaN(seatCount) ? undefined : seatCount
  });

  const posthog = getPostHogClient();
  posthog.capture({ distinctId: profile.id, event: "institution_checkout_initiated", properties: { plan, seat_count: isNaN(seatCount) ? 20 : seatCount } });

  return NextResponse.redirect(checkoutUrl || commerceConfig.institutionStarterCheckout);
}
