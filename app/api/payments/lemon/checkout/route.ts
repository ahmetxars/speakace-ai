import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { trackAnalyticsEvent } from "@/lib/analytics-store";
import { buildLemonCheckoutUrl, commerceConfig } from "@/lib/commerce";
import { getAuthenticatedUser, getSessionCookieName } from "@/lib/server/auth";

function buildCheckoutAnalyticsPath(input: {
  ctaPath?: string;
  plan: "plus" | "pro" | "lifetime";
  billing: "weekly" | "annual";
  campaign?: string;
}) {
  if (input.ctaPath?.trim()) return input.ctaPath.trim().slice(0, 240);

  const params = new URLSearchParams({ plan: input.plan, billing: input.billing });
  if (input.campaign?.trim()) params.set("campaign", input.campaign.trim().slice(0, 80));
  return `/api/payments/lemon/checkout?${params.toString()}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawPlan = searchParams.get("plan");
  const plan: "plus" | "pro" | "lifetime" = rawPlan === "pro" ? "pro" : rawPlan === "lifetime" ? "lifetime" : "plus";
  const rawBilling = searchParams.get("billing");
  const billing: "weekly" | "annual" = rawBilling === "annual" ? "annual" : "weekly";
  const coupon = searchParams.get("coupon") ?? undefined;
  const campaign = searchParams.get("campaign") ?? undefined;
  const ctaPath = searchParams.get("cta") ?? undefined;
  const ctaEvent = searchParams.get("cta_event") ?? undefined;
  const checkoutId = crypto.randomUUID();
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const profile = await getAuthenticatedUser(token);

  if (profile) {
    try {
      await trackAnalyticsEvent({
        userId: profile.id,
        event: "checkout_initiated",
        path: buildCheckoutAnalyticsPath({ plan, billing, campaign, ctaPath })
      });
    } catch {
      // Analytics must never block a buyer from reaching checkout.
    }
  }

  const checkoutUrl = buildLemonCheckoutUrl(
    profile
      ? {
          plan,
          billing,
          email: profile.email,
          name: profile.name,
          userId: profile.id,
          coupon,
          campaign,
          ctaPath,
          ctaEvent,
          checkoutId
        }
      : { plan, billing, coupon, campaign, ctaPath, ctaEvent, checkoutId }
  );

  const response = NextResponse.redirect(checkoutUrl || commerceConfig.plusMonthlyCheckout);
  if (ctaPath || campaign || rawPlan) {
    response.cookies.set(
      "speakace_checkout_attribution",
      JSON.stringify({
        ctaPath: ctaPath ?? null,
        ctaEvent: ctaEvent ?? null,
        campaign: campaign ?? null,
        plan,
        billing,
        checkoutId
      }),
      {
        httpOnly: false,
        sameSite: "lax",
        secure: process.env.APP_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 6
      }
    );
  }

  return response;
}
