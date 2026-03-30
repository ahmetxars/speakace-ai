"use client";

import { useEffect, useState } from "react";
import { useAppState } from "@/components/providers";
import { trackClientEvent } from "@/lib/analytics-client";
import type { AnalyticsDashboardSummary } from "@/lib/analytics-store";

const emptySummary: AnalyticsDashboardSummary = {
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

export function AnalyticsDashboard() {
  const { currentUser, language } = useAppState();
  const tr = language === "tr";
  const [summary, setSummary] = useState<AnalyticsDashboardSummary>(emptySummary);

  useEffect(() => {
    fetch("/api/analytics/dashboard")
      .then((response) => response.json())
      .then((data: AnalyticsDashboardSummary) => setSummary(data))
      .catch(() => setSummary(emptySummary));
  }, []);

  useEffect(() => {
    if (!currentUser?.id) return;
    void trackClientEvent({ userId: currentUser.id, event: "analytics_dashboard_view", path: "/app/analytics" });
  }, [currentUser?.id]);

  return (
    <div className="page-shell section" style={{ display: "grid", gap: "1rem" }}>
      <section className="card" style={{ padding: "1.4rem", display: "grid", gap: "0.8rem" }}>
        <span className="eyebrow">{tr ? "Gerçek analytics" : "Real analytics"}</span>
        <h1 style={{ margin: 0 }}>{tr ? "Kullanım ve dönüşüm paneli" : "Usage and conversion dashboard"}</h1>
      </section>

      <section className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
        <Metric title={tr ? "Toplam event" : "Total events"} value={String(summary.totalEvents)} />
        <Metric title={tr ? "Sayfa görüntüleme" : "Page views"} value={String(summary.pageViews)} />
        <Metric title={tr ? "Practice başlangıcı" : "Practice starts"} value={String(summary.practiceStarts)} />
        <Metric title={tr ? "Upload" : "Uploads"} value={String(summary.uploads)} />
        <Metric title={tr ? "7 gün aktiflik" : "7-day activity"} value={String(summary.activeDays7)} />
        <Metric title={tr ? "View -> Practice" : "View -> Practice"} value={`${summary.conversionRate}%`} />
      </section>

      <section className="grid" style={{ gridTemplateColumns: "minmax(320px, 1fr) minmax(320px, 1fr)", gap: "1rem", alignItems: "start" }}>
        <div className="card" style={{ padding: "1rem", display: "grid", gap: "0.8rem" }}>
          <strong>{tr ? "Engagement funnel" : "Engagement funnel"}</strong>
          <FunnelRow label={tr ? "Page views" : "Page views"} value={summary.pageViews} max={summary.pageViews || 1} />
          <FunnelRow label={tr ? "Practice starts" : "Practice starts"} value={summary.practiceStarts} max={summary.pageViews || 1} />
          <FunnelRow label={tr ? "Uploads" : "Uploads"} value={summary.uploads} max={summary.pageViews || 1} />
          <FunnelRow label={tr ? "Mock reports" : "Mock reports"} value={summary.mockReportViews} max={summary.pageViews || 1} />
          <FunnelRow label={tr ? "Simulations" : "Simulations"} value={summary.simulationsCompleted} max={summary.pageViews || 1} />
        </div>

        <div className="card" style={{ padding: "1rem", display: "grid", gap: "0.8rem" }}>
          <strong>{tr ? "En çok kullanılan yollar" : "Top paths"}</strong>
          {summary.topPaths.length ? summary.topPaths.map((item) => (
            <div key={item.path} style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem" }}>
              <span className="practice-meta">{item.path}</span>
              <strong>{item.count}</strong>
            </div>
          )) : <div style={{ color: "var(--muted)" }}>{tr ? "Henüz veri yok." : "No data yet."}</div>}
        </div>
      </section>

      <section className="grid" style={{ gridTemplateColumns: "minmax(320px, 1fr) minmax(320px, 1fr)", gap: "1rem", alignItems: "start" }}>
        <div className="card" style={{ padding: "1rem", display: "grid", gap: "0.8rem" }}>
          <strong>{tr ? "Gunluk aktivite" : "Daily activity"}</strong>
          {summary.dailyBreakdown.length ? summary.dailyBreakdown.map((item) => (
            <div key={item.date} style={{ display: "grid", gridTemplateColumns: "96px 1fr auto", gap: "0.75rem", alignItems: "center" }}>
              <span className="practice-meta">{item.date}</span>
              <div style={{ height: 10, borderRadius: 999, background: "rgba(217, 93, 57, 0.08)", overflow: "hidden" }}>
                <div style={{ width: `${Math.max(Math.round((item.count / Math.max(...summary.dailyBreakdown.map((entry) => entry.count), 1)) * 100), item.count > 0 ? 8 : 0)}%`, height: "100%", background: "linear-gradient(90deg, var(--accent), var(--accent-cool))" }} />
              </div>
              <strong>{item.count}</strong>
            </div>
          )) : <div style={{ color: "var(--muted)" }}>{tr ? "Gunluk dagilim icin veri yok." : "No daily breakdown yet."}</div>}
        </div>

        <div className="card" style={{ padding: "1rem", display: "grid", gap: "0.8rem" }}>
          <strong>{tr ? "Son aktivite" : "Last activity"}</strong>
          <div className="card" style={{ padding: "0.95rem", background: "var(--surface-strong)" }}>
            {summary.lastEventAt
              ? new Date(summary.lastEventAt).toLocaleString(tr ? "tr-TR" : "en-US")
              : tr ? "Henüz event yok." : "No events yet."}
          </div>
          <div style={{ color: "var(--muted)", lineHeight: 1.7 }}>
            {tr
              ? "Bu panel artik sadece toplamlari degil, hangi gunlerde daha aktif oldugunu ve son urun hareketini de gosteriyor."
              : "This panel now shows not only totals but also your active days and the most recent product event."}
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)" }}>
      <div style={{ color: "var(--muted)", marginBottom: "0.35rem" }}>{title}</div>
      <div style={{ fontSize: "1.7rem", fontWeight: 800 }}>{value}</div>
    </div>
  );
}

function FunnelRow({ label, value, max }: { label: string; value: number; max: number }) {
  const width = Math.max(Math.round((value / Math.max(max, 1)) * 100), value > 0 ? 10 : 0);
  return (
    <div style={{ display: "grid", gap: "0.35rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem" }}>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div style={{ height: 10, borderRadius: 999, background: "rgba(29, 111, 117, 0.12)", overflow: "hidden" }}>
        <div style={{ width: `${width}%`, height: "100%", background: "linear-gradient(90deg, var(--accent), var(--accent-cool))" }} />
      </div>
    </div>
  );
}
