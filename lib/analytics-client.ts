import type { AnalyticsEventName } from "@/lib/analytics-store";
import { canTrackAnalyticsAnonymously } from "@/lib/analytics-policy";

type ClientAnalyticsInput = {
  userId?: string | null;
  event: AnalyticsEventName;
  path?: string;
  eventId?: string;
  source?: string;
  plan?: string;
  locale?: string;
};

const GA_EVENT_MAP: Partial<Record<AnalyticsEventName, string>> = {
  lead_magnet_requested: "generate_lead",
  marketing_demo_started: "tutorial_begin",
  marketing_demo_completed: "tutorial_complete",
  marketing_demo_cta_click: "select_content",
  checkout_recovery_view: "checkout_recovery_view",
  checkout_recovery_continued: "checkout_recovery_continued",
  checkout_recovery_dismissed: "checkout_recovery_dismissed",
  signup_completed: "sign_up",
  first_score: "first_score",
  return_practice: "return_practice",
  return_reminder_added: "return_reminder_added",
  microphone_permission_requested: "microphone_permission_requested",
  microphone_permission_granted: "microphone_permission_granted",
  microphone_permission_blocked: "microphone_permission_blocked",
  practice_limit_hit: "limit_hit"
};

export async function trackClientEvent(input: ClientAnalyticsInput) {
  if (process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "false") return;

  const occurredAt = new Date().toISOString();
  const eventId = input.eventId ?? (typeof crypto !== "undefined" ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);
  const gaEvent = GA_EVENT_MAP[input.event];

  if (gaEvent && typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", gaEvent, {
      event_id: eventId,
      source: input.source,
      plan: input.plan,
      locale: input.locale,
      page_path: input.path
    });
  }

  if (!input.userId && !canTrackAnalyticsAnonymously(input.event)) return;

  const body = JSON.stringify({
    event: input.event,
    path: input.path,
    eventId,
    source: input.source,
    plan: input.plan,
    locale: input.locale,
    occurredAt
  });

  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const queued = navigator.sendBeacon(
        "/api/analytics/track",
        new Blob([body], { type: "application/json" })
      );
      if (queued) return;
    }

    await fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body
    });
  } catch {
    // best-effort analytics only
  }
}
