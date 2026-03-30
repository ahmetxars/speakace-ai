"use client";

import Link from "next/link";
import { useAppState } from "@/components/providers";

export default function BillingPage() {
  const { currentUser, signedIn, language } = useAppState();
  const tr = language === "tr";

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
            <Link className="button button-secondary" href="/#pricing">
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
        <h1 style={{ margin: 0 }}>{tr ? "Ücretli planlar ödeme sonrasında açılır" : "Paid plans unlock after checkout"}</h1>
        <p style={{ color: "var(--muted)", maxWidth: 720 }}>
          {tr ? "Plus ve Pro planları tek tuşla açılmaz. Ödeme sistemi bağlandığında ödeme akışı tamamlandıktan sonra aktifleşir." : "Plus and Pro should not unlock from a simple click. They will activate through checkout once payments are wired."}
        </p>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)" }}>
            <strong>{tr ? "Mevcut plan" : "Current plan"}</strong>
            <p>{currentUser?.plan?.toUpperCase() ?? "FREE"}</p>
          </div>
          <div className="card" style={{ padding: "1rem", background: "rgba(29, 111, 117, 0.08)" }}>
            <strong>Plus · $9</strong>
            <p>{tr ? "Günde 18 oturum, 35 dakika speaking süresi, daha ayrıntılı puan dökümü ve ilerleme takibi." : "18 daily sessions, 35 speaking minutes, score breakdowns, and stronger progress support."}</p>
          </div>
          <div className="card" style={{ padding: "1rem", background: "rgba(217, 93, 57, 0.08)" }}>
            <strong>Pro · $12</strong>
            <p>{tr ? "Günde 40 oturum, 90 dakika speaking süresi, daha derin geri bildirim ve en yüksek çalışma hacmi." : "40 daily sessions, 90 speaking minutes, deeper feedback, and the strongest study allowance."}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
          <button className="button button-secondary" type="button" disabled>
            {tr ? "Plus ödeme akışı yakında" : "Plus checkout soon"}
          </button>
          <button className="button button-primary" type="button" disabled>
            {tr ? "Pro ödeme akışı yakında" : "Pro checkout soon"}
          </button>
        </div>
        <p style={{ color: "var(--muted)" }}>
          {tr ? `Şu anki planın: ${currentUser?.plan ?? "free"}. Gerçek ödeme entegrasyonu bir sonraki adımda Stripe ile bağlanacak.` : `Current plan: ${currentUser?.plan ?? "free"}. Real payment wiring will come next with Stripe.`}
        </p>
      </div>
    </main>
  );
}
