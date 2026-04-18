"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppState } from "@/components/providers";

type ReferralSummary = {
  code: string;
  signups: number;
  activeTrials: number;
};

export function ReferralCenter() {
  const { currentUser, language } = useAppState();
  const tr = language === "tr";
  const [summary, setSummary] = useState<ReferralSummary | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetch("/api/referrals/me")
      .then((response) => response.json())
      .then((data: { summary?: ReferralSummary }) => setSummary(data.summary ?? null))
      .catch(() => setSummary(null));
  }, []);

  const inviteLink = useMemo(() => {
    if (!summary || typeof window === "undefined") return "";
    return `${window.location.origin}/auth?mode=signup&invite=${encodeURIComponent(summary.code.replace("invite:", ""))}`;
  }, [summary]);

  const copyLink = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setNotice(tr ? "Davet linki kopyalandı." : "Invite link copied.");
  };

  return (
    <main className="page-shell section" style={{ display: "grid", gap: "1rem" }}>
      <section className="card" style={{ padding: "1.5rem", display: "grid", gap: "0.85rem" }}>
        <span className="eyebrow">Referral</span>
        <h1 style={{ margin: 0 }}>{tr ? "Davet ve referral merkezi" : "Invite and referral center"}</h1>
        <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
          {tr
            ? "Arkadaşlarını SpeakAce'e davet et. Yeni kullanıcılar kişisel invite linkinle gelirse referral akışına düşer ve admin panelinde takip edilir."
            : "Invite friends to SpeakAce. New users who arrive through your personal invite link enter the referral flow and show up in admin analytics."}
        </p>
      </section>

      <section className="grid" style={{ gridTemplateColumns: "minmax(320px, 1.1fr) minmax(280px, 0.9fr)", gap: "1rem", alignItems: "start" }}>
        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
          <strong>{tr ? "Senin davet linkin" : "Your invite link"}</strong>
          <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)", wordBreak: "break-all" }}>
            {inviteLink || (tr ? "Link yükleniyor..." : "Loading link...")}
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button type="button" className="button button-primary" onClick={() => void copyLink()} disabled={!inviteLink}>
              {tr ? "Linki kopyala" : "Copy link"}
            </button>
            <a className="button button-secondary" href={`https://wa.me/?text=${encodeURIComponent(inviteLink || "")}`} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          </div>
          {notice ? <p style={{ margin: 0, color: "var(--success)" }}>{notice}</p> : null}
        </div>

        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
          <strong>{tr ? "Referral performansı" : "Referral performance"}</strong>
          <Stat label={tr ? "Invite code" : "Invite code"} value={summary?.code ?? "-"} />
          <Stat label={tr ? "Toplam signup" : "Total signups"} value={String(summary?.signups ?? 0)} />
          <Stat label={tr ? "Aktif trial / paid" : "Active trial / paid"} value={String(summary?.activeTrials ?? 0)} />
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card" style={{ padding: "0.9rem", background: "var(--surface-strong)", display: "grid", gap: "0.25rem" }}>
      <span className="practice-meta">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
