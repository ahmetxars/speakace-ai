"use client";

import Link from "next/link";
import { useMemo } from "react";
import { buildPlanCheckoutPath, commerceConfig, couponCatalog, getPlanComparison } from "@/lib/commerce";
import { useAppState } from "@/components/providers";

export default function BillingPage() {
  const { currentUser, signedIn, language, refreshSession } = useAppState();
  const tr = language === "tr";
  const comparison = getPlanComparison(tr);
  const planOutcome = useMemo(
    () =>
      tr
        ? [
            "Daha fazla gunluk speaking hacmi",
            "Daha guclu transcript ve skor icgorusu",
            "Daha hizli retry ve ilerleme dongusu"
          ]
        : [
            "More daily speaking volume",
            "Stronger transcript and score insight",
            "Faster retry and improvement loops"
          ],
    [tr]
  );

  if (!signedIn) {
    return (
      <main className="page-shell section">
        <div className="card" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
          <span className="eyebrow">{tr ? "Ödeme" : "Billing"}</span>
          <h1 style={{ margin: 0 }}>{tr ? "Ödeme ayarları için giriş yap" : "Sign in to manage billing"}</h1>
          <p style={{ color: "var(--muted)", maxWidth: 720 }}>
            {tr ? "Fiyatları ana sayfada görebilirsin. Ücretli plan satın almak ve fatura bilgilerini yönetmek için önce giriş yapman gerekir." : "You can view pricing on the home page. To purchase a paid plan and manage invoices, sign in first."}
          </p>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <Link className="button button-primary" href="/auth">
              {tr ? "Giriş yap" : "Sign in"}
            </Link>
            <a className="button button-secondary" href={commerceConfig.plusCheckoutPath}>
              {tr ? "Plus planını gör" : "View Plus plan"}
            </a>
            <Link className="button button-secondary" href="/pricing">
              {tr ? "Fiyatlara dön" : "Back to pricing"}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell section">
      <div className="card" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
        <span className="eyebrow">{tr ? "Ödeme" : "Billing"}</span>
        <h1 style={{ margin: 0 }}>{tr ? "SpeakAce Plus veya Pro ile daha fazla speaking pratiği aç" : "Unlock more speaking practice with SpeakAce Plus or Pro"}</h1>
        <p style={{ color: "var(--muted)", maxWidth: 720 }}>
          {tr ? "Ücretli planı satın alan kullanıcılar daha yüksek günlük speaking limiti, daha derin AI geri bildirimi ve daha güçlü ilerleme takibi alır." : "Paid users unlock more daily speaking volume, deeper AI feedback, and stronger progress tracking."}
        </p>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)" }}>
            <strong>{tr ? "Mevcut plan" : "Current plan"}</strong>
            <p>{currentUser?.plan?.toUpperCase() ?? "FREE"}</p>
          </div>
          <div className="card" style={{ padding: "1rem", background: "rgba(29, 111, 117, 0.08)" }}>
            <strong>{commerceConfig.plusPlanName} · {commerceConfig.plusMonthlyPrice}/week</strong>
            <p>{tr ? "Haftalık planda günde 18 oturum, 35 dakika speaking süresi, daha ayrıntılı puan dökümü ve ilerleme takibi." : "Weekly plan with 18 daily sessions, 35 speaking minutes, score breakdowns, and stronger progress support."}</p>
          </div>
          <div className="card" style={{ padding: "1rem", background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.3)" }}>
            <strong style={{ color: "#b38600" }}>{commerceConfig.proPlanName} · {commerceConfig.proMonthlyPrice}/month</strong>
            <p>{tr ? "Günde 40 oturum, 90 dakika speaking süresi, öncelikli destek ve gelişmiş analitik." : "40 daily sessions, 90 speaking minutes, priority support, and advanced analytics."}</p>
          </div>
        </div>
        <div className="card" style={{ padding: "1rem", background: "rgba(255,255,255,0.6)" }}>
          <strong>{tr ? "Free ve Plus karşılaştırması" : "Free vs Plus"}</strong>
          <div style={{ display: "grid", gap: "0.65rem", marginTop: "0.8rem" }}>
            {comparison.map((item) => (
              <div key={item.label} style={{ display: "grid", gridTemplateColumns: "minmax(160px, 1fr) 110px 110px", gap: "0.7rem" }}>
                <span>{item.label}</span>
                <span className="practice-meta">{item.free}</span>
                <strong>{item.plus}</strong>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
          {currentUser?.plan === "free" ? (
            <>
              <a
                className="button button-primary"
                href={buildPlanCheckoutPath({ plan: "plus", coupon: couponCatalog.LAUNCH20.code, campaign: "billing_buy_plus" })}
              >
                {tr ? "Plus planını satın al" : "Buy Plus"}
              </a>
              <a
                className="button button-primary"
                href={buildPlanCheckoutPath({ plan: "pro", campaign: "billing_buy_pro" })}
                style={{ background: "#c9a227", borderColor: "#c9a227" }}
              >
                {tr ? "Pro planını satın al" : "Get Pro"}
              </a>
            </>
          ) : currentUser?.plan === "plus" ? (
            <>
              <a
                className="button button-primary"
                href={buildPlanCheckoutPath({ plan: "pro", campaign: "billing_upgrade_pro" })}
                style={{ background: "#c9a227", borderColor: "#c9a227" }}
              >
                {tr ? "Pro'ya yükselt" : "Upgrade to Pro"}
              </a>
              <a className="button button-secondary" href="/api/payments/lemon/portal">
                {tr ? "Faturayı yönet" : "Manage billing"}
              </a>
            </>
          ) : (
            <a className="button button-primary" href="/api/payments/lemon/portal">
              {tr ? "Faturayı yönet" : "Manage billing"}
            </a>
          )}
          <button className="button button-secondary" type="button" onClick={() => void refreshSession()}>
            {tr ? "Plani yenile" : "Refresh plan"}
          </button>
          <Link className="button button-secondary" href="/app/billing/success">
            {tr ? "Odeme durumunu kontrol et" : "Check payment status"}
          </Link>
          <Link className="button button-secondary" href="/pricing">
            {tr ? "Fiyat sayfasını aç" : "Open pricing page"}
          </Link>
        </div>
        <p style={{ color: "var(--muted)" }}>
          {tr
            ? `Şu anki planın: ${currentUser?.plan ?? "free"}. Checkout ve webhook akışı artık aynı hesabı kullanarak planı otomatik yükseltmek için hazır.`
            : `Current plan: ${currentUser?.plan ?? "free"}. The checkout and webhook flow is now wired to upgrade the same account automatically.`}
        </p>
        <div className="marketing-grid">
          {planOutcome.map((item) => (
            <article key={item} className="card feature-card">
              <h3>{item}</h3>
              <p>
                {tr
                  ? "Bu avantaj daha siki practice, daha net geri bildirim ve daha hizli skor gelisimi icin eklendi."
                  : "This advantage is built to support more practice, clearer feedback, and faster score growth."}
              </p>
            </article>
          ))}
        </div>

        {currentUser?.plan === "free" ? (
          <div className="marketing-grid">
            {Object.values(couponCatalog).map((coupon) => (
              <article key={coupon.code} className="card feature-card">
                <span className="pill">{tr ? "Kupon" : "Coupon"}</span>
                <h3>{coupon.code}</h3>
                <p>{coupon.description}</p>
                <a className="button button-secondary" href={buildPlanCheckoutPath({ plan: "plus", coupon: coupon.code, campaign: "billing_coupon" })}>
                  {tr ? "Bu kuponla aç" : `Use ${coupon.code}`}
                </a>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}
