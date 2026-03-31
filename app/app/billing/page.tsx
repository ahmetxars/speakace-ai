"use client";

import Link from "next/link";
import { commerceConfig, getPlanComparison } from "@/lib/commerce";
import { useAppState } from "@/components/providers";

export default function BillingPage() {
  const { currentUser, signedIn, language } = useAppState();
  const tr = language === "tr";
  const comparison = getPlanComparison(tr);

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
        <h1 style={{ margin: 0 }}>{tr ? "SpeakAce Plus ile daha fazla speaking pratiği aç" : "Unlock more speaking practice with SpeakAce Plus"}</h1>
        <p style={{ color: "var(--muted)", maxWidth: 720 }}>
          {tr ? "Ücretli planı satın alan kullanıcılar daha yüksek günlük speaking limiti, daha derin AI geri bildirimi ve daha güçlü ilerleme takibi alır." : "Paid users unlock more daily speaking volume, deeper AI feedback, and stronger progress tracking."}
        </p>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)" }}>
            <strong>{tr ? "Mevcut plan" : "Current plan"}</strong>
            <p>{currentUser?.plan?.toUpperCase() ?? "FREE"}</p>
          </div>
          <div className="card" style={{ padding: "1rem", background: "rgba(29, 111, 117, 0.08)" }}>
            <strong>{commerceConfig.plusPlanName} · {commerceConfig.plusMonthlyPrice}</strong>
            <p>{tr ? "Günde 18 oturum, 35 dakika speaking süresi, daha ayrıntılı puan dökümü ve ilerleme takibi." : "18 daily sessions, 35 speaking minutes, score breakdowns, and stronger progress support."}</p>
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
            <a className="button button-primary" href={commerceConfig.plusCheckoutPath}>
              {tr ? "Plus planını satın al" : "Buy Plus"}
            </a>
          ) : (
            <a className="button button-primary" href="/api/payments/lemon/portal">
              {tr ? "Faturayı yönet" : "Manage billing"}
            </a>
          )}
          <Link className="button button-secondary" href="/pricing">
            {tr ? "Fiyat sayfasını aç" : "Open pricing page"}
          </Link>
        </div>
        <p style={{ color: "var(--muted)" }}>
          {tr
            ? `Şu anki planın: ${currentUser?.plan ?? "free"}. Checkout ve webhook akışı artık aynı hesabı kullanarak planı otomatik yükseltmek için hazır.`
            : `Current plan: ${currentUser?.plan ?? "free"}. The checkout and webhook flow is now wired to upgrade the same account automatically.`}
        </p>
      </div>
    </main>
  );
}
