"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Clock3, LifeBuoy, RefreshCw, ShieldAlert } from "lucide-react";
import { TrackedLink } from "@/components/tracked-link";
import { useAppState } from "@/components/providers";
import { trackClientEvent } from "@/lib/analytics-client";
import {
  buildBillingSyncPendingPath,
  type BillingRecoveryAttribution
} from "@/lib/billing-recovery";

type PlanCheckResponse = {
  plan?: "free" | "plus" | "pro" | "lifetime";
  billingStatus?: string;
};

type CheckoutAttribution = BillingRecoveryAttribution & {
  ctaEvent?: string | null;
  checkoutId?: string | null;
};

const PLAN_PURCHASE_META = {
  plus: {
    weekly: { value: 3.99, itemId: "plus_weekly", itemName: "SpeakAce Plus - Weekly" },
    annual: { value: 49.99, itemId: "plus_annual", itemName: "SpeakAce Plus - Annual" }
  },
  pro: {
    weekly: { value: 12, itemId: "pro_monthly", itemName: "SpeakAce Pro - Monthly" },
    annual: { value: 99, itemId: "pro_annual", itemName: "SpeakAce Pro - Annual" }
  },
  lifetime: {
    weekly: { value: 129.99, itemId: "lifetime", itemName: "SpeakAce Lifetime" },
    annual: { value: 129.99, itemId: "lifetime", itemName: "SpeakAce Lifetime" }
  }
} as const;

export default function BillingSuccessPage() {
  const { language, refreshSession, currentUser, signedIn } = useAppState();
  const tr = language === "tr";
  const [status, setStatus] = useState<"checking" | "active" | "pending">("checking");
  const [plan, setPlan] = useState<string>("free");
  const [billingStatus, setBillingStatus] = useState<string>("free");
  const [checkCycle, setCheckCycle] = useState(0);
  const [checkAttempts, setCheckAttempts] = useState(0);
  const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(null);
  const [attribution, setAttribution] = useState<CheckoutAttribution | null>(null);
  const hasTrackedPurchaseRef = useRef(false);
  const hasTrackedSuccessRef = useRef(false);
  const hasTrackedPendingRef = useRef(false);
  const refreshSessionRef = useRef(refreshSession);

  useEffect(() => {
    refreshSessionRef.current = refreshSession;
  }, [refreshSession]);

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
    let timeoutId: number | undefined;

    const finishPending = () => {
      if (cancelled) return;
      setLastCheckedAt(new Date().toISOString());
      setStatus("pending");
    };

    const check = async () => {
      attempts += 1;
      if (!cancelled) setCheckAttempts(attempts);

      try {
        const response = await fetch("/api/account/plan", { cache: "no-store" });
        if (!response.ok) {
          if (response.status === 401) {
            finishPending();
            return;
          }
          throw new Error("Plan sync request failed.");
        }
        const data = (await response.json()) as PlanCheckResponse;
        if (cancelled) return;
        setPlan(data.plan ?? "free");
        setBillingStatus(data.billingStatus ?? "free");
        setLastCheckedAt(new Date().toISOString());
        if (data.plan === "plus" || data.plan === "pro" || data.plan === "lifetime") {
          await refreshSessionRef.current();
          if (cancelled) return;
          setStatus("active");
          return;
        }
      } catch {
        if (cancelled) return;
      }

      if (attempts >= 8) {
        finishPending();
        return;
      }
      timeoutId = window.setTimeout(() => void check(), 2500);
    };

    setStatus("checking");
    setCheckAttempts(0);
    void check();
    return () => {
      cancelled = true;
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [checkCycle]);

  useEffect(() => {
    if (status !== "active") {
      return;
    }

    if (currentUser?.id && !hasTrackedSuccessRef.current) {
      hasTrackedSuccessRef.current = true;
      void trackClientEvent({
        userId: currentUser.id,
        event: "billing_success_seen",
        path: "/app/billing/success"
      });
    }

    if (hasTrackedPurchaseRef.current || !attribution?.checkoutId) {
      return;
    }

    hasTrackedPurchaseRef.current = true;

    const trackedPlan = attribution?.plan === "pro" || attribution?.plan === "lifetime" ? attribution.plan : "plus";
    const trackedBilling = attribution?.billing === "annual" ? "annual" : "weekly";
    const purchaseMeta = PLAN_PURCHASE_META[trackedPlan][trackedBilling];

    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", "purchase", {
        transaction_id: attribution.checkoutId,
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
  }, [attribution?.billing, attribution?.checkoutId, attribution?.ctaPath, attribution?.plan, currentUser?.id, status]);

  useEffect(() => {
    if (status !== "pending" || !signedIn || !currentUser?.id || hasTrackedPendingRef.current) {
      return;
    }

    hasTrackedPendingRef.current = true;
    void trackClientEvent({
      userId: currentUser.id,
      event: "billing_sync_pending",
      path: buildBillingSyncPendingPath(attribution)
    });
  }, [attribution, currentUser?.id, signedIn, status]);

  const activePlanLabel = plan === "lifetime"
    ? "Lifetime"
    : plan === "pro"
      ? "Pro"
      : "Plus";
  const activationSteps = tr
    ? [
        "Bugun bir speaking oturumu ac ve yeni limiti hemen kullan.",
        "Ayni gun retry yapip geri bildirimi cevaba uygula.",
        "Bir arkadasini davet edip referral akisini da aktif et."
      ]
    : [
        "Open one speaking session today and use the new limit immediately.",
        "Retry the same day and apply the feedback to your answer.",
        "Invite one friend and activate the referral loop as well."
      ];
  const statusLabel = status === "active"
    ? tr ? "Aktif" : "Active"
    : status === "checking"
      ? tr ? "Kontrol ediliyor" : "Checking"
      : tr ? "Senkronizasyon bekliyor" : "Sync pending";
  const lastCheckedLabel = lastCheckedAt
    ? new Intl.DateTimeFormat(tr ? "tr-TR" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }).format(new Date(lastCheckedAt))
    : "—";

  const retryPlanSync = () => {
    setCheckCycle((current) => current + 1);
  };

  return (
    <main className="page-shell section">
      <div className="card" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }} aria-live="polite">
        <span className="eyebrow">{tr ? "Odeme durumu" : "Billing status"}</span>
        <h1 style={{ margin: 0 }}>
          {status === "active"
            ? tr
              ? `${activePlanLabel} plani aktif`
              : `${activePlanLabel} is active`
            : status === "checking"
              ? tr
                ? "Odeme dogrulaniyor"
                : "Checking your payment"
              : tr
                ? "Odeme dondu, erisim hala senkronize ediliyor"
                : "Payment returned, but access is still syncing"}
        </h1>
        <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
          {status === "active"
            ? tr
              ? "Odemen hesabina baglandi. Yukseltilmis geri bildirim ve daha guclu practice akisi artik acik."
              : "Your payment is linked to this account. Upgraded feedback and the stronger practice flow are now unlocked."
            : status === "checking"
              ? tr
                ? "Odeme saglayicisi ile hesap durumunu otomatik olarak kontrol ediyoruz. Bu islem genellikle birkac saniye surer."
                : "We are checking your account status with the payment provider. This usually takes only a few seconds."
              : tr
                ? "Odemen tamamlanmis olabilir ancak erisim henuz hesaba baglanmadi. Tekrar satin alma; asagidaki kontrolu yeniden calistir veya destek ekibine ulas."
                : "Your payment may be complete, but access has not linked to this account yet. Do not purchase again; retry the check below or contact support."}
        </p>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.8rem" }}>
          <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)" }}>
            <strong>{tr ? "Mevcut plan" : "Current plan"}</strong>
            <div>{plan.toUpperCase()}</div>
          </div>
          <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)" }}>
            <strong>{tr ? "Durum" : "Status"}</strong>
            <div>{statusLabel}</div>
          </div>
          <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)" }}>
            <strong>{tr ? "Saglayici durumu" : "Provider status"}</strong>
            <div>{billingStatus.toUpperCase()}</div>
          </div>
          <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)" }}>
            <strong>{tr ? "CTA kaynagi" : "CTA source"}</strong>
            <div>{attribution?.ctaPath ?? (tr ? "Bilinmiyor" : "Unknown")}</div>
          </div>
          <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)" }}>
            <strong>{tr ? "Campaign" : "Campaign"}</strong>
            <div>{attribution?.campaign ?? "—"}</div>
          </div>
          <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)" }}>
            <strong>{tr ? "Son kontrol" : "Last checked"}</strong>
            <div>{lastCheckedLabel}</div>
          </div>
        </div>
        {status === "checking" ? (
          <div
            className="card"
            style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "0.75rem", background: "rgba(39, 104, 215, 0.08)" }}
          >
            <Clock3 size={20} color="var(--primary)" />
            <div>
              <strong>{tr ? "Hesap durumu kontrol ediliyor" : "Checking account access"}</strong>
              <p style={{ margin: "0.25rem 0 0", color: "var(--muted)" }}>
                {tr ? `Kontrol ${Math.max(checkAttempts, 1)} / 8` : `Check ${Math.max(checkAttempts, 1)} of 8`}
              </p>
            </div>
          </div>
        ) : null}
        {status === "pending" ? (
          <div
            className="card"
            style={{
              padding: "1rem",
              display: "grid",
              gap: "0.85rem",
              borderColor: "rgba(180, 83, 9, 0.28)",
              background: "rgba(245, 158, 11, 0.09)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
              <ShieldAlert size={21} color="#b45309" />
              <strong>{tr ? "Tekrar satin alma" : "Do not purchase again"}</strong>
            </div>
            <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
              {tr
                ? "Ayni plani yeniden almak cift odeme riski olusturur. Once yeniden kontrol et; erisim hala acilmazsa destek ekibine bu sayfadaki plan ve campaign bilgileriyle ulas."
                : "Buying the same plan again can create a duplicate charge. Check once more first; if access is still locked, contact support with the plan and campaign shown on this page."}
            </p>
            <div style={{ display: "grid", gap: "0.45rem", color: "var(--muted)", fontSize: "0.88rem" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                <RefreshCw size={15} />{tr ? "Yeniden kontrol, guvenli sunucu senkronizasyonunu bastan calistirir." : "Check again restarts the secure server-side sync."}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                <LifeBuoy size={15} />{tr ? "Destek ekibi odemeyi inceleyip hesabinla eslestirebilir." : "Support can review the payment and match it to your account."}
              </span>
            </div>
            <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
              <button className="button button-primary" type="button" onClick={retryPlanSync}>
                <RefreshCw size={16} />{tr ? "Tekrar kontrol et" : "Check again"}
              </button>
              <Link className="button button-secondary" href="/contact">
                <LifeBuoy size={16} />{tr ? "Destekle iletisime gec" : "Contact support"}
              </Link>
            </div>
          </div>
        ) : null}
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
        {status === "active" ? (
          <div
            className="card"
            style={{
              padding: "1rem",
              display: "grid",
              gap: "0.85rem",
              background: "linear-gradient(135deg, rgba(29, 111, 117, 0.08) 0%, rgba(255,255,255,0.98) 100%)"
            }}
          >
            <div>
              <strong>{tr ? "Ilk 10 dakikada en iyi sonraki adimlar" : "Best next steps in the next 10 minutes"}</strong>
              <p style={{ margin: "0.45rem 0 0", color: "var(--muted)", lineHeight: 1.7 }}>
                {tr
                  ? `${activePlanLabel} aktif oldugu anda en iyi sonuc, urunu hemen kullanip yeni davranisi ayni gun baslatmaktan gelir.`
                  : `The best outcome after activating ${activePlanLabel} is to use the product right away and start the new habit the same day.`}
              </p>
            </div>
            <div style={{ display: "grid", gap: "0.55rem" }}>
              {activationSteps.map((step) => (
                <div key={step} className="card" style={{ padding: "0.8rem 0.9rem", background: "rgba(255,255,255,0.78)" }}>
                  {step}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
              <TrackedLink
                className="button button-primary"
                href="/app/practice"
                userId={currentUser?.id}
                analyticsEvent="marketing_cta_click"
                analyticsPath="/app/billing/success/practice"
              >
                {tr ? "Hemen practice ac" : "Open practice now"}
              </TrackedLink>
              <TrackedLink
                className="button button-secondary"
                href="/app/referrals"
                userId={currentUser?.id}
                analyticsEvent="marketing_cta_click"
                analyticsPath="/app/billing/success/referrals"
              >
                {tr ? "Referral akisini ac" : "Open referrals"}
              </TrackedLink>
            </div>
          </div>
        ) : null}
        <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
          {status === "checking" ? (
            <button className="button button-primary" type="button" disabled>
              <RefreshCw size={16} />{tr ? "Plan kontrol ediliyor" : "Checking plan"}
            </button>
          ) : null}
          <Link className="button button-secondary" href="/app/billing">
            {tr ? "Odeme genel gorunumu" : "Billing overview"}
          </Link>
          <Link className="button button-secondary" href="/app/practice">
            {tr ? "Practice ac" : "Open practice"}
          </Link>
        </div>
      </div>
    </main>
  );
}
