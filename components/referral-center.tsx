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

  const nextReferralMilestone = useMemo(() => {
    const signups = summary?.signups ?? 0;
    const nextTarget = signups < 3 ? 3 : signups < 10 ? 10 : signups + 5;
    const remaining = Math.max(0, nextTarget - signups);
    return tr
      ? `${nextTarget} signup hedefi icin ${remaining} kisi daha gerekiyor.`
      : `${remaining} more people needed to reach the next ${nextTarget}-signup milestone.`;
  }, [summary?.signups, tr]);

  const shareScripts = useMemo(
    () =>
      tr
        ? [
            {
              label: "Yakın arkadaş",
              text: `IELTS/TOEFL speaking pratiği için kullandigim uygulama bu. Ucretsiz bakmak istersen link: ${inviteLink}`
            },
            {
              label: "Study grubu",
              text: `Speaking pratiğini birlikte daha duzenli yapmak icin bunu acalim. Ben kullaniyorum, siz de su linkten girebilirsiniz: ${inviteLink}`
            },
            {
              label: "Eski ogrenci / tanidik",
              text: `IELTS/TOEFL speaking tarafinda yararli buldugum bir araci paylasiyorum. Ucretsiz denemek istersen: ${inviteLink}`
            }
          ]
        : [
            {
              label: "Close friend",
              text: `This is the app I use for IELTS/TOEFL speaking practice. If you want to try it free, here is the link: ${inviteLink}`
            },
            {
              label: "Study group",
              text: `Let’s use this to keep speaking practice more consistent. I’m already using it and you can join from this link: ${inviteLink}`
            },
            {
              label: "Old classmate",
              text: `Sharing a speaking tool I found useful for IELTS/TOEFL prep. If you want to try it free: ${inviteLink}`
            }
          ],
    [inviteLink, tr]
  );

  const copyLink = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setNotice(tr ? "Davet linki kopyalandı." : "Invite link copied.");
  };

  const copyScript = async (text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setNotice(tr ? "Paylasim metni kopyalandi." : "Share script copied.");
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
              ? "En hizli artis, kisa surede 3-5 yakin kisiyi bu linke yonlendirip ilk aktif trial veya paid donusumu gormekten geliyor."
              : "The fastest lift usually comes from sending this link to 3-5 close contacts quickly and getting the first active trial or paid conversion."}
          </p>
          <div className="card" style={{ padding: "0.85rem 0.95rem", background: "rgba(255,255,255,0.76)" }}>
            <strong style={{ display: "block", marginBottom: "0.3rem" }}>{tr ? "Mini hedef" : "Mini target"}</strong>
            <span style={{ color: "var(--muted)", lineHeight: 1.6 }}>{nextReferralMilestone}</span>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <TrackedLink className="button button-primary" href="/app/practice" userId={currentUser?.id} analyticsEvent="marketing_cta_click" analyticsPath="/app/referrals/practice">
              {tr ? "Practice'e don" : "Back to practice"}
            </TrackedLink>
            <TrackedLink className="button button-secondary" href="/app/billing" userId={currentUser?.id} analyticsEvent="checkout_cta_click" analyticsPath="/app/referrals/billing">
              {tr ? "Planlari ve odemeyi ac" : "Open billing and plans"}
            </TrackedLink>
          </div>
        </div>
      </section>

      <section className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.85rem" }}>
        <strong>{tr ? "Hazir paylasim metinleri" : "Ready-to-send share scripts"}</strong>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.85rem" }}>
          {shareScripts.map((script) => (
            <div key={script.label} className="card" style={{ padding: "0.95rem", display: "grid", gap: "0.6rem", background: "var(--surface-strong)" }}>
              <strong>{script.label}</strong>
              <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.65 }}>{script.text || (tr ? "Link hazirlaniyor..." : "Link is loading...")}</p>
              <button type="button" className="button button-secondary" onClick={() => void copyScript(script.text)} disabled={!script.text}>
                {tr ? "Metni kopyala" : "Copy script"}
              </button>
            </div>
          ))}
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
