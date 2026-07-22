import { NextResponse } from "next/server";
import { AnalyticsEventName, trackAnalyticsEvent } from "@/lib/analytics-store";
import { requireAuthenticatedUser } from "@/lib/server/permissions";

const ALLOWED_EVENTS = new Set<AnalyticsEventName>([
  "page_view",
  "pricing_view",
  "pricing_plus_click",
  "practice_start",
  "practice_limit_hit",
  "upgrade_prompt_view",
  "checkout_initiated",
  "checkout_completed",
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
    const profile = await requireAuthenticatedUser();
    const body = await request.json();
    const event = typeof body.event === "string" ? body.event : "";
    if (!ALLOWED_EVENTS.has(event as AnalyticsEventName)) {
      return NextResponse.json({ error: "Invalid analytics event." }, { status: 400 });
    }

    await trackAnalyticsEvent({
      userId: profile.id,
      event: event as AnalyticsEventName,
      path: typeof body.path === "string" ? body.path.slice(0, 240) : undefined
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not track analytics event.";
    const status = message === "Authentication required." ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
