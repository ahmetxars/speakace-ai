import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ANALYTICS_VISITOR_COOKIE,
  normalizeAnalyticsVisitorId
} from "@/lib/analytics-policy";
import { trackAnalyticsEvent } from "@/lib/analytics-store";
import {
  buildLemonCheckoutUrl,
  commerceConfig,
  type CheckoutBillingInterval
} from "@/lib/commerce";
import { getAuthenticatedUser, getSessionCookieName } from "@/lib/server/auth";

function buildCheckoutAnalyticsPath(input: {
  ctaPath?: string;
  plan: "plus" | "pro" | "lifetime";
  billing: CheckoutBillingInterval;
  campaign?: string;
}) {
  if (input.ctaPath?.trim()) return input.ctaPath.trim().slice(0, 240);

  const params = new URLSearchParams({ plan: input.plan, billing: input.billing });
  if (input.campaign?.trim()) params.set("campaign", input.campaign.trim().slice(0, 80));
  return `/api/payments/lemon/checkout?${params.toString()}`;
}

function isVerifiedCheckoutNavigation(request: Request) {
  const purpose = request.headers.get("purpose") ?? request.headers.get("sec-purpose");
  const isPrefetch = purpose?.toLowerCase().includes("prefetch")
    || request.headers.has("next-router-prefetch");

  return !isPrefetch
    && request.headers.get("sec-fetch-mode") === "navigate"
    && request.headers.get("sec-fetch-dest") === "document"
    && request.headers.get("sec-fetch-user") === "?1";
}

function buildCheckoutAnalyticsSource(campaign?: string) {
  const safeCampaign = campaign?.trim().slice(0, 80);
  return `verified_navigation:${safeCampaign || "direct"}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawPlan = searchParams.get("plan");
  const plan: "plus" | "pro" | "lifetime" = rawPlan === "pro" ? "pro" : rawPlan === "lifetime" ? "lifetime" : "plus";
  const rawBilling = searchParams.get("billing");
  const billing: CheckoutBillingInterval =
    rawBilling === "annual" ? "annual" : plan === "pro" ? "monthly" : "weekly";
  const coupon = searchParams.get("coupon") ?? undefined;
  const campaign = searchParams.get("campaign") ?? undefined;
  const ctaPath = searchParams.get("cta") ?? undefined;
  const ctaEvent = searchParams.get("cta_event") ?? undefined;
  const checkoutId = crypto.randomUUID();
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const profile = await getAuthenticatedUser(token);
  const existingVisitorId = normalizeAnalyticsVisitorId(
    cookieStore.get(ANALYTICS_VISITOR_COOKIE)?.value
  );
  const visitorId = existingVisitorId ?? crypto.randomUUID();

  if (isVerifiedCheckoutNavigation(request)) {
    try {
      await trackAnalyticsEvent({
        userId: profile?.id,
        visitorId,
        event: "checkout_initiated",
        path: buildCheckoutAnalyticsPath({ plan, billing, campaign, ctaPath }),
        eventId: checkoutId,
        source: buildCheckoutAnalyticsSource(campaign),
        plan,
        occurredAt: new Date().toISOString()
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
          checkoutId,
          visitorId
        }
      : { plan, billing, coupon, campaign, ctaPath, ctaEvent, checkoutId, visitorId }
  );

  const response = NextResponse.redirect(checkoutUrl || commerceConfig.plusMonthlyCheckout);
  if (!existingVisitorId) {
    response.cookies.set(ANALYTICS_VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.APP_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 180
    });
  }
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
