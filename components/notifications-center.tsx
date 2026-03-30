"use client";

import { useEffect, useState } from "react";
import { useAppState } from "@/components/providers";
import { trackClientEvent } from "@/lib/analytics-client";
import type { NotificationItem } from "@/lib/notifications";

export function NotificationsCenter() {
  const { currentUser, language } = useAppState();
  const tr = language === "tr";
  const [items, setItems] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (!currentUser?.id) return;
    fetch("/api/notifications")
      .then((response) => response.json())
      .then((data: { notifications?: NotificationItem[] }) => setItems(data.notifications ?? []))
      .catch(() => setItems([]));
  }, [currentUser?.id]);

  useEffect(() => {
    if (!currentUser?.id) return;
    void trackClientEvent({ userId: currentUser.id, event: "notifications_view", path: "/app/notifications" });
  }, [currentUser?.id]);

  return (
    <div className="page-shell section" style={{ display: "grid", gap: "1rem" }}>
      <section className="card" style={{ padding: "1.4rem", display: "grid", gap: "0.8rem" }}>
        <span className="eyebrow">{tr ? "Bildirimler" : "Notifications"}</span>
        <h1 style={{ margin: 0 }}>{tr ? "Action center" : "Action center"}</h1>
        <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
          {tr ? "Homework, onay, risk ve günlük görev bildirimleri burada toplanır." : "Homework, approval, risk, and daily mission notifications are collected here."}
        </p>
      </section>

      <section className="card" style={{ padding: "1rem", display: "grid", gap: "0.8rem" }}>
        {items.length ? (
          items.map((item) => (
            <div key={item.id} className="card" style={{ padding: "1rem", background: item.level === "warning" ? "rgba(217, 93, 57, 0.08)" : item.level === "success" ? "rgba(47, 125, 75, 0.08)" : "var(--surface-strong)" }}>
              <strong>{item.title}</strong>
              <p style={{ margin: "0.45rem 0 0", lineHeight: 1.7 }}>{item.body}</p>
              {item.href ? (
                <a href={item.href} className="button button-secondary" style={{ marginTop: "0.75rem", width: "fit-content" }}>
                  {tr ? "Ac" : "Open"}
                </a>
              ) : null}
            </div>
          ))
        ) : (
          <div style={{ color: "var(--muted)" }}>{tr ? "Şu an yeni bildirim yok." : "No new notifications right now."}</div>
        )}
      </section>
    </div>
  );
}
