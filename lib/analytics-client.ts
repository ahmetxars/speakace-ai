import type { AnalyticsEventName } from "@/lib/analytics-store";
import { canTrackAnalyticsAnonymously } from "@/lib/analytics-policy";

export async function trackClientEvent(input: { userId?: string | null; event: AnalyticsEventName; path?: string }) {
  if (!input.userId && !canTrackAnalyticsAnonymously(input.event)) return;
  if (process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "false") return;

  try {
    await fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        event: input.event,
        path: input.path
      })
    });
  } catch {
    // best-effort analytics only
  }
}
