import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "About SpeakAce",
  description: "Learn who SpeakAce is, what we are building, and why we want IELTS and TOEFL speaking practice to feel more helpful and human.",
  alternates: {
    canonical: "/about"
  },
  openGraph: {
    title: "About SpeakAce",
    description: "Meet the mission behind SpeakAce and see how we are building a more supportive speaking practice platform.",
    url: `${siteConfig.domain}/about`,
    siteName: siteConfig.name,
    type: "website"
  }
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="page-shell section" style={{ display: "grid", gap: "1.2rem" }}>
        <div className="section-head">
          <span className="eyebrow">About SpeakAce</span>
          <h1 style={{ fontSize: "clamp(2.7rem, 6vw, 5rem)", lineHeight: 0.95 }}>SpeakAce kimdir?</h1>
          <p>
            SpeakAce, speaking practice işini daha net, daha motive edici ve daha erişilebilir hale getirmek için
            kurulan yeni nesil bir sınav çalışma platformudur. Amacımız IELTS ve TOEFL speaking çalışan herkesin,
            tek başına kaldığında bile ne söyleyeceğini daha iyi bilmesi ve her denemede biraz daha güven kazanmasıdır.
          </p>
        </div>

        <div className="marketing-grid">
          <article className="card feature-card">
            <h3>Amacımız</h3>
            <p>
              Sadece puan göstermek değil, öğrencinin neden o puanı aldığını ve bir sonraki denemede neyi değiştirmesi
              gerektiğini açık şekilde göstermek istiyoruz.
            </p>
          </article>
          <article className="card feature-card">
            <h3>Yaklaşımımız</h3>
            <p>
              SpeakAce’i karmaşık değil, düzenli ve gerçekten kullanılabilir bir çalışma alanı olarak inşa ediyoruz.
              Her özellik daha fazla netlik, tekrar ve ilerleme hissi vermeli.
            </p>
          </article>
          <article className="card feature-card">
            <h3>Ekibimizin odağı</h3>
            <p>
              En iyisini bir anda değil, her gün daha iyi bir ürün çıkararak kuruyoruz. Bu yüzden öğrenci, öğretmen
              ve okul tarafını birlikte düşünüp sistemi sürekli rafine ediyoruz.
            </p>
          </article>
        </div>

        <div className="card institution-cta">
          <div>
            <span className="eyebrow">What we believe</span>
            <h2 style={{ margin: "0.8rem 0 0.5rem" }}>Herkese daha güçlü speaking pratiği sunmak istiyoruz</h2>
            <p className="practice-copy">
              SpeakAce’in temeli çok basit: iyi bir speaking platformu öğrenciyi yormamalı, ne yapacağını açıkça
              göstermeli ve düzenli tekrar yapmasını kolaylaştırmalı. Biz de tam olarak bunu inşa ediyoruz.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <Link className="button button-secondary" href="/app/practice">
              Start practice
            </Link>
            <Link className="button button-primary" href="/pricing">
              View Plus
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
