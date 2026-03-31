"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppState } from "@/components/providers";

type PlanCheckResponse = {
  plan?: "free" | "plus" | "pro";
  billingStatus?: string;
};

export default function BillingSuccessPage() {
  const { language, refreshSession } = useAppState();
  const tr = language === "tr";
  const [status, setStatus] = useState<"checking" | "active" | "pending">("checking");
  const [plan, setPlan] = useState<string>("free");

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    const check = async () => {
      try {
        const response = await fetch("/api/account/plan", { cache: "no-store" });
        if (!response.ok) {
          if (!cancelled) setStatus("pending");
          return;
        }
        const data = (await response.json()) as PlanCheckResponse;
        if (cancelled) return;
        setPlan(data.plan ?? "free");
        if (data.plan === "plus" || data.plan === "pro") {
          await refreshSession();
          setStatus("active");
          return;
        }
      } catch {
        if (!cancelled) setStatus("pending");
        return;
      }

      attempts += 1;
      if (attempts >= 8) {
        if (!cancelled) setStatus("pending");
        return;
      }
      window.setTimeout(() => void check(), 2500);
    };

    void check();
    return () => {
      cancelled = true;
    };
  }, [refreshSession]);

  return (
    <main className="page-shell section">
      <div className="card" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
        <span className="eyebrow">{tr ? "Odeme durumu" : "Billing status"}</span>
        <h1 style={{ margin: 0 }}>
          {status === "active"
            ? tr
              ? "Plus plani aktif"
              : "Plus is active"
            : tr
              ? "Odeme dogrulaniyor"
              : "Checking your payment"}
        </h1>
        <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
          {status === "active"
            ? tr
              ? "Odemen hesabina baglandi. Daha yuksek speaking limiti ve genisletilmis geri bildirim artik acik."
              : "Your payment is linked to this account. Higher limits and expanded feedback are now unlocked."
            : tr
              ? "Webhook ve plan gecisi birkac saniye surebilir. Bu sayfa planini otomatik kontrol ediyor."
              : "Webhook processing can take a few seconds. This page is checking your plan automatically."}
        </p>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.8rem" }}>
          <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)" }}>
            <strong>{tr ? "Mevcut plan" : "Current plan"}</strong>
            <div>{plan.toUpperCase()}</div>
          </div>
          <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)" }}>
            <strong>{tr ? "Durum" : "Status"}</strong>
            <div>{status === "active" ? (tr ? "Aktif" : "Active") : tr ? "Bekleniyor" : "Pending"}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
          <button className="button button-primary" type="button" onClick={() => void refreshSession()}>
            {tr ? "Plani tekrar kontrol et" : "Refresh plan"}
          </button>
          <Link className="button button-secondary" href="/app/billing">
            {tr ? "Odeme sayfasina don" : "Back to billing"}
          </Link>
          <Link className="button button-secondary" href="/app/practice">
            {tr ? "Practice ac" : "Open practice"}
          </Link>
        </div>
      </div>
    </main>
  );
}
