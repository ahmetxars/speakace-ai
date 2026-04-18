import { getSql, hasDatabaseUrl } from "@/lib/server/db";

export type AnalyticsEventName =
  | "page_view"
  | "practice_start"
  | "recording_uploaded"
  | "simulation_complete"
  | "target_score_updated"
  | "mock_report_view"
  | "notifications_view"
  | "session_replay_view"
  | "teacher_note_saved"
  | "institution_admin_view"
  | "analytics_dashboard_view"
  | "marketing_cta_click"
  | "pricing_cta_click"
  | "checkout_cta_click"
  | "signup_completed";

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

export type AnalyticsDashboardSummary = AnalyticsSummary & {
  activeDays7: number;
  conversionRate: number;
  topPaths: Array<{ path: string; count: number }>;
  dailyBreakdown: Array<{ date: string; count: number }>;
  lastEventAt: string | null;
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
  if (!input.userId) {
    return;
  }

  if (hasDatabaseUrl()) {
    const sql = getSql();
    await sql`
      insert into analytics_events (id, user_id, event, path, created_at)
      values (${crypto.randomUUID()}, ${input.userId}, ${input.event}, ${input.path ?? null}, ${new Date().toISOString()})
    `;
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
  if (!userId) {
    return {
      totalEvents: 0,
      pageViews: 0,
      practiceStarts: 0,
      uploads: 0,
      simulationsCompleted: 0,
      mockReportViews: 0
    };
  }

  if (hasDatabaseUrl()) {
    const sql = getSql();
    const rows = await sql<Array<{ event: AnalyticsEventName; count: number }>>`
      select event, count(*)::int as count
      from analytics_events
      where user_id = ${userId}
      group by event
    `;
    const count = (name: AnalyticsEventName) => rows.find((row) => row.event === name)?.count ?? 0;
    return {
      totalEvents: rows.reduce((sum, row) => sum + row.count, 0),
      pageViews: count("page_view"),
      practiceStarts: count("practice_start"),
      uploads: count("recording_uploaded"),
      simulationsCompleted: count("simulation_complete"),
      mockReportViews: count("mock_report_view")
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

export async function getAnalyticsDashboardSummary(userId: string): Promise<AnalyticsDashboardSummary> {
  if (!userId) {
    return {
      totalEvents: 0,
      pageViews: 0,
      practiceStarts: 0,
      uploads: 0,
      simulationsCompleted: 0,
      mockReportViews: 0,
      activeDays7: 0,
      conversionRate: 0,
      topPaths: [],
      dailyBreakdown: [],
      lastEventAt: null
    };
  }

  if (hasDatabaseUrl()) {
    const sql = getSql();
    const summary = await getAnalyticsSummary(userId);
    const dailyBreakdown = await sql<Array<{ date: string; count: number }>>`
      select to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as date, count(*)::int as count
      from analytics_events
      where user_id = ${userId}
        and created_at >= now() - interval '7 days'
      group by 1
      order by 1 asc
    `;
    const topPaths = await sql<Array<{ path: string | null; count: number }>>`
      select path, count(*)::int as count
      from analytics_events
      where user_id = ${userId}
        and path is not null
      group by path
      order by count desc
      limit 5
    `;
    const [lastEvent] = await sql<Array<{ created_at: string | Date }>>`
      select created_at
      from analytics_events
      where user_id = ${userId}
      order by created_at desc
      limit 1
    `;
    return {
      ...summary,
      activeDays7: dailyBreakdown.length,
      conversionRate: summary.pageViews ? Number(((summary.practiceStarts / summary.pageViews) * 100).toFixed(0)) : 0,
      topPaths: topPaths.map((item) => ({ path: item.path ?? "/", count: item.count })),
      dailyBreakdown,
      lastEventAt: lastEvent?.created_at ? new Date(lastEvent.created_at).toISOString() : null
    };
  }

  const events = getStore().events.filter((event) => event.userId === userId);
  const summary = await getAnalyticsSummary(userId);
  const dailyMap = new Map<string, number>();
  const pathMap = new Map<string, number>();
  let lastEventAt: string | null = null;

  events.forEach((event) => {
    const date = event.createdAt.slice(0, 10);
    dailyMap.set(date, (dailyMap.get(date) ?? 0) + 1);
    if (event.path) {
      pathMap.set(event.path, (pathMap.get(event.path) ?? 0) + 1);
    }
    if (!lastEventAt || event.createdAt > lastEventAt) {
      lastEventAt = event.createdAt;
    }
  });

  return {
    ...summary,
    activeDays7: [...dailyMap.keys()].length,
    conversionRate: summary.pageViews ? Number(((summary.practiceStarts / summary.pageViews) * 100).toFixed(0)) : 0,
    topPaths: [...pathMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([path, count]) => ({ path, count })),
    dailyBreakdown: [...dailyMap.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([date, count]) => ({ date, count })),
    lastEventAt
  };
}
