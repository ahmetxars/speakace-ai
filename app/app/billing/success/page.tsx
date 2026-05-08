"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAppState } from "@/components/providers";
import { trackClientEvent } from "@/lib/analytics-client";

type PlanCheckResponse = {
  plan?: "free" | "plus" | "pro" | "lifetime";
  billingStatus?: string;
};

type CheckoutAttribution = {
  ctaPath?: string | null;
  ctaEvent?: string | null;
  campaign?: string | null;
  plan?: "plus" | "pro" | "lifetime" | null;
  billing?: "weekly" | "annual" | null;
};

const PLAN_PURCHASE_META = {
  plus: {
    weekly: { value: 3.99, itemId: "plus_weekly", itemName: "SpeakAce Plus - Weekly" },
    annual: { value: 49, itemId: "plus_annual", itemName: "SpeakAce Plus - Annual" }
  },
  pro: {
    weekly: { value: 12, itemId: "pro_monthly", itemName: "SpeakAce Pro - Monthly" },
    annual: { value: 99, itemId: "pro_annual", itemName: "SpeakAce Pro - Annual" }
  },
  lifetime: {
    weekly: { value: 149, itemId: "lifetime", itemName: "SpeakAce Lifetime" },
    annual: { value: 149, itemId: "lifetime", itemName: "SpeakAce Lifetime" }
  }
} as const;

export default function BillingSuccessPage() {
  const { language, refreshSession, currentUser } = useAppState();
  const tr = language === "tr";
  const [status, setStatus] = useState<"checking" | "active" | "pending">("checking");
  const [plan, setPlan] = useState<string>("free");
  const [attribution, setAttribution] = useState<CheckoutAttribution | null>(null);
  const hasTrackedPurchaseRef = useRef(false);
  const hasTrackedAnalyticsRef = useRef(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const rawCookie = document.cookie
      .split("; ")
      .find((item) => item.startsWith("speakace_checkout_attribution="))
      ?.split("=")[1];
    if (!rawCookie) return;
    try {
      setAttribution(JSON.parse(decodeURIComponent(rawCookie)) as CheckoutAttribution);
    } catch {
      setAttribution(null);
    }
  }, []);

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
        if (data.plan === "plus" || data.plan === "pro" || data.plan === "lifetime") {
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

  useEffect(() => {
    if (status !== "active") {
      return;
    }

    if (currentUser?.id && !hasTrackedAnalyticsRef.current) {
      hasTrackedAnalyticsRef.current = true;
      void trackClientEvent({
        userId: currentUser.id,
        event: "checkout_completed",
        path: attribution?.ctaPath ?? "/app/billing/success"
      });
      void trackClientEvent({
        userId: currentUser.id,
        event: "billing_success_seen",
        path: "/app/billing/success"
      });
    }

    if (hasTrackedPurchaseRef.current) {
      return;
    }

    hasTrackedPurchaseRef.current = true;

    const trackedPlan = attribution?.plan === "pro" || attribution?.plan === "lifetime" ? attribution.plan : "plus";
    const trackedBilling = attribution?.billing === "annual" ? "annual" : "weekly";
    const purchaseMeta = PLAN_PURCHASE_META[trackedPlan][trackedBilling];

    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", "purchase", {
        transaction_id: Date.now().toString(),
        value: purchaseMeta.value,
        currency: "USD",
        items: [
          {
            item_id: purchaseMeta.itemId,
            item_name: purchaseMeta.itemName,
            price: purchaseMeta.value,
            quantity: 1
          }
        ]
      });
    }
  }, [attribution?.billing, attribution?.ctaPath, attribution?.plan, currentUser?.id, status]);

  const activePlanLabel = plan === "lifetime"
    ? "Lifetime"
    : plan === "pro"
      ? "Pro"
      : "Plus";

  return (
    <main className="page-shell section">
      <div className="card" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
        <span className="eyebrow">{tr ? "Odeme durumu" : "Billing status"}</span>
        <h1 style={{ margin: 0 }}>
          {status === "active"
            ? tr
              ? `${activePlanLabel} plani aktif`
              : `${activePlanLabel} is active`
            : tr
              ? "Odeme dogrulaniyor"
              : "Checking your payment"}
        </h1>
        <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
          {status === "active"
            ? tr
              ? "Odemen hesabina baglandi. Yukseltilmis geri bildirim ve daha guclu practice akisi artik acik."
              : "Your payment is linked to this account. Upgraded feedback and the stronger practice flow are now unlocked."
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
          <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)" }}>
            <strong>{tr ? "CTA kaynagi" : "CTA source"}</strong>
            <div>{attribution?.ctaPath ?? (tr ? "Bilinmiyor" : "Unknown")}</div>
          </div>
          <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)" }}>
            <strong>{tr ? "Campaign" : "Campaign"}</strong>
            <div>{attribution?.campaign ?? "—"}</div>
          </div>
        </div>
        {attribution?.ctaPath ? (
          <div className="card" style={{ padding: "1rem", background: "rgba(29, 111, 117, 0.08)" }}>
            <strong>{tr ? "Bu odeme nereden geldi?" : "Where did this checkout come from?"}</strong>
            <p style={{ margin: "0.55rem 0 0", lineHeight: 1.7 }}>
              {tr
                ? `Bu checkout akisi ${attribution.ctaPath} CTA'si uzerinden basladi. Admin panelinde bu kaynagi artik dogrudan gorebilirsin.`
                : `This checkout flow started from the ${attribution.ctaPath} CTA. You can now see that source directly in the admin panel.`}
            </p>
          </div>
        ) : null}
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
