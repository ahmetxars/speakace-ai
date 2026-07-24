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
  signup_completed: "sign_up",
  first_score: "first_score",
  return_practice: "return_practice",
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

  try {
    await fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        event: input.event,
        path: input.path,
        eventId,
        source: input.source,
        plan: input.plan,
        locale: input.locale,
        occurredAt
      })
    });
  } catch {
    // best-effort analytics only
  }
}
