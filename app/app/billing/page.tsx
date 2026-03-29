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
          <span className="eyebrow">{tr ? "Odeme" : "Billing"}</span>
          <h1 style={{ margin: 0 }}>{tr ? "Faturalandirma icin giris yap" : "Sign in to manage billing"}</h1>
          <p style={{ color: "var(--muted)", maxWidth: 720 }}>
            {tr ? "Fiyatlari ana sayfada gorebilirsin. Ucretli planlari satin almak ve fatura detaylarini yonetmek icin once giris yapman gerekir." : "You can view pricing on the home page. To purchase a paid plan and manage invoices, sign in first."}
          </p>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <Link className="button button-primary" href="/auth">
              {tr ? "Giris yap" : "Sign in"}
            </Link>
            <Link className="button button-secondary" href="/#pricing">
              {tr ? "Fiyatlara don" : "Back to pricing"}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell section">
      <div className="card" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
        <span className="eyebrow">{tr ? "Odeme" : "Billing"}</span>
        <h1 style={{ margin: 0 }}>{tr ? "Ucretli planlar checkout ile acilacak" : "Paid plans unlock after checkout"}</h1>
        <p style={{ color: "var(--muted)", maxWidth: 720 }}>
          {tr ? "Plus ve Pro planlari dogrudan butonla acilmiyor. Odeme sistemi baglandiginda checkout ile aktive edilecek." : "Plus and Pro should not unlock from a simple click. They will activate through checkout once payments are wired."}
        </p>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)" }}>
            <strong>{tr ? "Mevcut plan" : "Current plan"}</strong>
            <p>{currentUser?.plan?.toUpperCase() ?? "FREE"}</p>
          </div>
          <div className="card" style={{ padding: "1rem", background: "rgba(29, 111, 117, 0.08)" }}>
            <strong>Plus · $9</strong>
            <p>{tr ? "Gunluk 18 session, 35 dakika speaking, daha detayli score breakdown ve progress takibi." : "18 daily sessions, 35 speaking minutes, score breakdowns, and stronger progress support."}</p>
          </div>
          <div className="card" style={{ padding: "1rem", background: "rgba(217, 93, 57, 0.08)" }}>
            <strong>Pro · $12</strong>
            <p>{tr ? "Gunluk 40 session, 90 dakika speaking, daha derin feedback ve en yuksek calisma hacmi." : "40 daily sessions, 90 speaking minutes, deeper feedback, and the strongest study allowance."}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
          <button className="button button-secondary" type="button" disabled>
            {tr ? "Plus checkout yakinda" : "Plus checkout soon"}
          </button>
          <button className="button button-primary" type="button" disabled>
            {tr ? "Pro checkout yakinda" : "Pro checkout soon"}
          </button>
        </div>
        <p style={{ color: "var(--muted)" }}>
          {tr ? `Mevcut plan: ${currentUser?.plan ?? "free"}. Gercek odeme entegrasyonu bir sonraki adimda Stripe ile baglanacak.` : `Current plan: ${currentUser?.plan ?? "free"}. Real payment wiring will come next with Stripe.`}
        </p>
      </div>
    </main>
  );
}
