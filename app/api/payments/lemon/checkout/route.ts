import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { buildLemonCheckoutUrl, commerceConfig } from "@/lib/commerce";
import { getAuthenticatedUser, getSessionCookieName } from "@/lib/server/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawPlan = searchParams.get("plan");
  const plan: "plus" | "pro" = rawPlan === "pro" ? "pro" : "plus";
  const rawBilling = searchParams.get("billing");
  const billing: "weekly" | "annual" = rawBilling === "annual" ? "annual" : "weekly";
  const coupon = searchParams.get("coupon") ?? undefined;
  const campaign = searchParams.get("campaign") ?? undefined;
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const profile = await getAuthenticatedUser(token);

  const checkoutUrl = buildLemonCheckoutUrl(
    profile
      ? {
          plan,
          billing,
          email: profile.email,
          name: profile.name,
          userId: profile.id,
          coupon,
          campaign
        }
      : { plan, billing, coupon, campaign }
  );

  return NextResponse.redirect(checkoutUrl || commerceConfig.plusMonthlyCheckout);
}
