import { NextResponse } from "next/server";
import { trackAnalyticsEvent } from "@/lib/analytics-store";
import {
  getLifecycleEmailDestination,
  verifyLifecycleEmailToken
} from "@/lib/server/lifecycle-email-link";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://speakace.org";

function isVerifiedEmailNavigation(request: Request) {
  const purpose = request.headers.get("purpose") ?? request.headers.get("sec-purpose");
  const isPrefetch = purpose?.toLowerCase().includes("prefetch")
    || request.headers.has("next-router-prefetch");

  return !isPrefetch
    && request.headers.get("sec-fetch-mode") === "navigate"
    && request.headers.get("sec-fetch-dest") === "document"
    && request.headers.get("sec-fetch-user") === "?1";
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const payload = verifyLifecycleEmailToken(token);
  const verifiedNavigation = Boolean(payload && isVerifiedEmailNavigation(request));
  const destination = payload && verifiedNavigation
    ? getLifecycleEmailDestination(payload.campaign)
    : "/app/practice";

  if (payload && verifiedNavigation) {
    try {
      await trackAnalyticsEvent({
        userId: payload.userId,
        event: "email_cta_click",
        path: `/app/practice/email_${payload.campaign}`,
        eventId: `email-cta:${payload.campaign}:${payload.userId}:${payload.issuedAt}`,
        source: `verified_navigation:${payload.campaign}`,
        occurredAt: new Date().toISOString()
      });
    } catch {
      // Attribution must never block a learner from reaching practice.
    }
  }

  return NextResponse.redirect(new URL(destination, SITE_URL));
}
