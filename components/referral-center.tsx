"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppState } from "@/components/providers";
import { TrackedLink } from "@/components/tracked-link";

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

  const inviteMessage = useMemo(() => {
    if (!inviteLink) return "";
    const senderName = currentUser?.name?.trim() || "I";
    return tr
      ? `${senderName} SpeakAce ile IELTS/TOEFL speaking pratiği yapıyor. Sen de bu linkle ücretsiz deneyebilirsin: ${inviteLink}`
      : `${senderName} is using SpeakAce for IELTS/TOEFL speaking practice. You can try it free with this link: ${inviteLink}`;
  }, [currentUser?.name, inviteLink, tr]);

  const performanceHint = useMemo(() => {
    if (!summary) {
      return tr ? "Linkin hazirlanirken performans verisi de yuklenecek." : "Performance data will load together with your invite link.";
    }
    if (summary.signups >= 10) {
      return tr ? "Guclu dagitim sinyali: bu link artik kucuk bir affiliate kanali gibi calisiyor." : "Strong distribution signal: this link is starting to behave like a small affiliate channel.";
    }
    if (summary.signups >= 3) {
      return tr ? "Iyi gidiyor: en cok ayni hedefe calisan arkadaslar ve sinav gruplari donusuyor." : "Good traction: study partners and exam groups are usually the highest-converting audience from here.";
    }
    return tr ? "En hizli baslangic genelde 3-5 yakin study partner veya bir ogretmen toplulugu ile geliyor." : "The fastest start usually comes from 3-5 close study partners or one teacher-led group.";
  }, [summary, tr]);

  const copyLink = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setNotice(tr ? "Davet linki kopyalandı." : "Invite link copied.");
  };

  return (
    <main className="page-shell section" style={{ display: "grid", gap: "1rem" }}>
      <section className="card" style={{ padding: "1.5rem", display: "grid", gap: "0.85rem" }}>
        <span className="eyebrow">Referral</span>
        <h1 style={{ margin: 0 }}>
          {tr
            ? `${currentUser?.name?.split(" ")[0] ?? "Sen"} icin davet ve growth merkezi`
            : `Invite and growth center for ${currentUser?.name?.split(" ")[0] ?? "you"}`}
        </h1>
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
            <a className="button button-secondary" href={`mailto:?subject=${encodeURIComponent(tr ? "SpeakAce daveti" : "SpeakAce invite")}&body=${encodeURIComponent(inviteMessage)}`}>
              {tr ? "Email ile gonder" : "Send by email"}
            </a>
            <a className="button button-secondary" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(inviteLink || "")}`} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          </div>
          {notice ? <p style={{ margin: 0, color: "var(--success)" }}>{notice}</p> : null}
          <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.6 }}>{performanceHint}</p>
        </div>

        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
          <strong>{tr ? "Referral performansı" : "Referral performance"}</strong>
          <Stat label={tr ? "Invite code" : "Invite code"} value={summary?.code ?? "-"} />
          <Stat label={tr ? "Toplam signup" : "Total signups"} value={String(summary?.signups ?? 0)} />
          <Stat label={tr ? "Aktif trial / paid" : "Active trial / paid"} value={String(summary?.activeTrials ?? 0)} />
        </div>
      </section>

      <section className="grid" style={{ gridTemplateColumns: "minmax(280px, 0.95fr) minmax(320px, 1.05fr)", gap: "1rem", alignItems: "start" }}>
        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.75rem" }}>
          <strong>{tr ? "En iyi paylasim senaryolari" : "Best sharing scenarios"}</strong>
          <ul style={{ margin: 0, paddingLeft: "1.1rem", lineHeight: 1.7 }}>
            <li>{tr ? "Ayni IELTS/TOEFL hedefine calisan 3-5 study partner" : "3-5 study partners working toward the same IELTS/TOEFL target"}</li>
            <li>{tr ? "Kucuk bir speaking grubu veya Discord/Telegram toplulugu" : "A small speaking group or Discord/Telegram community"}</li>
            <li>{tr ? "Bir ogretmen veya kurs yoneticisine kurumsal deneme onerisi" : "A teacher or course lead who may want to test it with a class"}</li>
          </ul>
        </div>

        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.85rem" }}>
          <strong>{tr ? "Bir sonraki gelir adimi" : "Next revenue step"}</strong>
          <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
            {tr
              ? "Bireysel referral iyi bir baslangic. Daha buyuk carpani ise bir ogretmen veya okulun ayni urunu sinif bazli denemesi getirir."
              : "Individual referrals are a good start. The larger multiplier comes when one teacher or school tests the same product with a class."}
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <TrackedLink className="button button-primary" href="/for-schools" userId={currentUser?.id} analyticsEvent="marketing_cta_click" analyticsPath="/app/referrals/for-schools">
              {tr ? "Okul planlarini goster" : "Show school plans"}
            </TrackedLink>
            <TrackedLink className="button button-secondary" href="/pricing" userId={currentUser?.id} analyticsEvent="pricing_view" analyticsPath="/app/referrals/pricing">
              {tr ? "Bireysel planlari ac" : "Open individual pricing"}
            </TrackedLink>
          </div>
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
