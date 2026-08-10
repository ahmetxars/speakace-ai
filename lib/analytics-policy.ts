import type { AnalyticsEventName } from "@/lib/analytics-store";

export const ANALYTICS_VISITOR_COOKIE = "speakace_visitor_id";

const ANONYMOUS_ANALYTICS_EVENTS = new Set<AnalyticsEventName>([
  "page_view",
  "lead_magnet_requested",
  "pricing_view",
  "pricing_plus_click",
  "marketing_cta_click",
  "marketing_demo_started",
  "marketing_demo_completed",
  "marketing_demo_cta_click",
  "pricing_cta_click",
  "checkout_cta_click"
]);

export function canTrackAnalyticsAnonymously(event: AnalyticsEventName) {
  return ANONYMOUS_ANALYTICS_EVENTS.has(event);
}

export function normalizeAnalyticsVisitorId(value: string | null | undefined) {
  const normalized = value?.trim() ?? "";
  return /^[a-zA-Z0-9_-]{16,80}$/.test(normalized) ? normalized : null;
}
