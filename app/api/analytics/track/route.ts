import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AnalyticsEventName, trackAnalyticsEvent } from "@/lib/analytics-store";
import {
  ANALYTICS_VISITOR_COOKIE,
  canTrackAnalyticsAnonymously,
  normalizeAnalyticsVisitorId
} from "@/lib/analytics-policy";
import { getAuthenticatedUserFromCookies } from "@/lib/server/auth";
import { checkRateLimit, getRequestIp, rateLimitResponse } from "@/lib/server/rate-limit";

const ALLOWED_EVENTS = new Set<AnalyticsEventName>([
  "page_view",
  "pricing_view",
  "pricing_plus_click",
  "practice_start",
  "practice_limit_hit",
  "upgrade_prompt_view",
  "upgrade_prompt_cooldown_view",
  "upgrade_prompt_dismissed",
  "checkout_initiated",
  "billing_success_seen",
  "billing_sync_pending",
  "result_card_download",
  "result_share_x",
  "result_share_whatsapp",
  "result_share_linkedin",
  "result_share_native",
  "result_share_copy",
  "writing_start",
  "writing_submitted",
  "writing_evaluated",
  "writing_retry",
  "writing_pdf_export",
  "recording_uploaded",
  "simulation_complete",
  "interview_mode_start",
  "interview_followup_continue",
  "pdf_report_export",
  "target_score_updated",
  "mock_report_view",
  "notifications_view",
  "session_replay_view",
  "teacher_note_saved",
  "institution_admin_view",
  "analytics_dashboard_view",
  "marketing_cta_click",
  "pricing_cta_click",
  "checkout_cta_click",
  "signup_completed"
]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const event = typeof body.event === "string" ? body.event : "";
    if (!ALLOWED_EVENTS.has(event as AnalyticsEventName)) {
      return NextResponse.json({ error: "Invalid analytics event." }, { status: 400 });
    }

    const analyticsEvent = event as AnalyticsEventName;
    const profile = await getAuthenticatedUserFromCookies();
    if (!profile && !canTrackAnalyticsAnonymously(analyticsEvent)) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const ip = getRequestIp(request);
    const limit = checkRateLimit({
      key: `analytics:${ip}`,
      windowMs: 1000 * 60 * 15,
      max: 120
    });
    if (!limit.allowed) {
      return rateLimitResponse(limit.retryAfterSeconds, "Too many analytics events.");
    }

    const cookieStore = await cookies();
    const existingVisitorId = normalizeAnalyticsVisitorId(
      cookieStore.get(ANALYTICS_VISITOR_COOKIE)?.value
    );
    const visitorId = existingVisitorId ?? crypto.randomUUID();
    const rawPath = typeof body.path === "string" ? body.path.trim() : "";
    const path = rawPath.startsWith("/") ? rawPath.slice(0, 240) : undefined;

    await trackAnalyticsEvent({
      userId: profile?.id,
      visitorId,
      event: analyticsEvent,
      path
    });

    const response = NextResponse.json({ ok: true });
    if (!existingVisitorId) {
      response.cookies.set(ANALYTICS_VISITOR_COOKIE, visitorId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.APP_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 180
      });
    }
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not track analytics event.";
    const status = message === "Authentication required." ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
