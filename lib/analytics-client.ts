import type { AnalyticsEventName } from "@/lib/analytics-store";

export async function trackClientEvent(input: { userId?: string | null; event: AnalyticsEventName; path?: string }) {
  if (!input.userId) return;
  if (process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "false") return;

  try {
    await fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: input.userId,
        event: input.event,
        path: input.path
      })
    });
  } catch {
    // best-effort analytics only
  }
}
