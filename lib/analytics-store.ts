import { hasDatabaseUrl } from "@/lib/server/db";

export type AnalyticsEventName =
  | "page_view"
  | "practice_start"
  | "recording_uploaded"
  | "simulation_complete"
  | "target_score_updated"
  | "mock_report_view";

export type AnalyticsEvent = {
  id: string;
  userId: string;
  event: AnalyticsEventName;
  path?: string;
  createdAt: string;
};

export type AnalyticsSummary = {
  totalEvents: number;
  pageViews: number;
  practiceStarts: number;
  uploads: number;
  simulationsCompleted: number;
  mockReportViews: number;
};

type AnalyticsStore = {
  events: AnalyticsEvent[];
};

function getStore(): AnalyticsStore {
  const globalStore = globalThis as typeof globalThis & { __speakAceAnalytics?: AnalyticsStore };
  if (!globalStore.__speakAceAnalytics) {
    globalStore.__speakAceAnalytics = { events: [] };
  }
  return globalStore.__speakAceAnalytics;
}

export async function trackAnalyticsEvent(input: { userId: string; event: AnalyticsEventName; path?: string }) {
  if (!input.userId || hasDatabaseUrl()) {
    return;
  }

  const store = getStore();
  store.events.push({
    id: crypto.randomUUID(),
    userId: input.userId,
    event: input.event,
    path: input.path,
    createdAt: new Date().toISOString()
  });
}

export async function getAnalyticsSummary(userId: string): Promise<AnalyticsSummary> {
  if (!userId || hasDatabaseUrl()) {
    return {
      totalEvents: 0,
      pageViews: 0,
      practiceStarts: 0,
      uploads: 0,
      simulationsCompleted: 0,
      mockReportViews: 0
    };
  }

  const events = getStore().events.filter((event) => event.userId === userId);
  const count = (name: AnalyticsEventName) => events.filter((event) => event.event === name).length;

  return {
    totalEvents: events.length,
    pageViews: count("page_view"),
    practiceStarts: count("practice_start"),
    uploads: count("recording_uploaded"),
    simulationsCompleted: count("simulation_complete"),
    mockReportViews: count("mock_report_view")
  };
}
