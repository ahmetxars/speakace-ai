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
        <h1 style={{ margin: 0 }}>{tr ? "Kullanım özeti" : "Usage summary"}</h1>
      </section>

      <section className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
        <Metric title={tr ? "Toplam event" : "Total events"} value={String(summary.totalEvents)} />
        <Metric title={tr ? "Practice başlangıcı" : "Practice starts"} value={String(summary.practiceStarts)} />
        <Metric title={tr ? "Upload" : "Uploads"} value={String(summary.uploads)} />
        <Metric title={tr ? "Mock rapor" : "Mock reports"} value={String(summary.mockReportViews)} />
        <Metric title={tr ? "Simülasyon" : "Simulations"} value={String(summary.simulationsCompleted)} />
        <Metric title={tr ? "7 gün aktiflik" : "7-day activity"} value={String(summary.activeDays7)} />
      </section>

      <section className="grid" style={{ gridTemplateColumns: "minmax(320px, 1fr) minmax(320px, 1fr)", gap: "1rem", alignItems: "start" }}>
        <div className="card" style={{ padding: "1rem", display: "grid", gap: "0.8rem" }}>
          <strong>{tr ? "Practice özeti" : "Practice summary"}</strong>
          <FunnelRow label={tr ? "Practice başlangıcı" : "Practice starts"} value={summary.practiceStarts} max={Math.max(summary.practiceStarts, summary.uploads, summary.mockReportViews, summary.simulationsCompleted, 1)} />
          <FunnelRow label={tr ? "Uploads" : "Uploads"} value={summary.uploads} max={Math.max(summary.practiceStarts, summary.uploads, summary.mockReportViews, summary.simulationsCompleted, 1)} />
          <FunnelRow label={tr ? "Mock rapor" : "Mock reports"} value={summary.mockReportViews} max={Math.max(summary.practiceStarts, summary.uploads, summary.mockReportViews, summary.simulationsCompleted, 1)} />
          <FunnelRow label={tr ? "Simülasyon" : "Simulations"} value={summary.simulationsCompleted} max={Math.max(summary.practiceStarts, summary.uploads, summary.mockReportViews, summary.simulationsCompleted, 1)} />
          <div style={{ color: "var(--muted)", lineHeight: 1.7 }}>
            {tr
              ? "Bu alan sayfa trafiğini değil, ürün içinde gerçekten kullanılan speaking ve rapor akışlarını gösterir."
              : "This area focuses on real product usage, not page traffic."}
          </div>
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
              ? "Burada son ürün hareketini görürsün. Ayrı path listeleri göstermiyoruz ki ekran daha sade kalsın."
              : "This shows the latest product activity without cluttering the screen with route lists."}
          </div>
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
          <strong>{tr ? "Kısa yorum" : "Quick insight"}</strong>
          <div style={{ color: "var(--muted)", lineHeight: 1.7 }}>
            {tr
              ? summary.practiceStarts > 0
                ? "Practice akışı kullanılmış durumda. Şimdi asıl odak daha çok upload ve daha çok tamamlanmış rapor üretmek olmalı."
                : "Henüz gerçek speaking kullanımı düşük görünüyor. En faydalı sonraki adım birkaç deneme başlatıp transcript akışını beslemek."
              : summary.practiceStarts > 0
                ? "Practice is already in use. The next step is driving more uploads and more completed reports."
                : "Real speaking usage still looks light. The most useful next step is starting more attempts and feeding the transcript flow."}
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
