"use client";

import type { Route } from "next";
import Link from "next/link";
import { useAppState } from "@/components/providers";
import {
  blogPosts,
  coreKeywords,
  shortLandingPoints,
  standoutFeatures,
  whySpeakAce
} from "@/lib/marketing-content";
import { siteConfig } from "@/lib/site";

const faqs = {
  en: [
    {
      question: "Is SpeakAce an official IELTS scoring service?",
      answer:
        "No. SpeakAce is an AI-powered IELTS and TOEFL speaking practice platform that gives estimated scores and feedback for preparation."
    },
    {
      question: "Can I improve my IELTS speaking score with daily AI practice?",
      answer:
        "Yes. Daily speaking practice with transcript review, feedback, and retry sessions can help you improve fluency, confidence, and answer structure."
    },
    {
      question: "Who is SpeakAce for?",
      answer:
        "SpeakAce is built for IELTS students, TOEFL students, language learners, teachers, and language schools that want stronger speaking practice."
    }
  ],
  tr: [
    {
      question: "SpeakAce resmi IELTS puanlama servisi mi?",
      answer:
        "Hayır. SpeakAce, hazırlık sürecinde tahmini skor ve geri bildirim sunan yapay zekâ destekli bir IELTS ve TOEFL speaking çalışma platformudur."
    },
    {
      question: "Günlük AI speaking pratiğiyle IELTS speaking skoru gelişir mi?",
      answer:
        "Evet. Günlük speaking çalışması, transcript incelemesi, geri bildirim ve tekrar denemeleri akıcılığı, özgüveni ve cevap yapısını geliştirmeye yardımcı olabilir."
    },
    {
      question: "SpeakAce kimler için uygun?",
      answer:
        "SpeakAce, IELTS ve TOEFL öğrencileri, İngilizce öğrenenler, öğretmenler ve speaking pratiğini güçlendirmek isteyen dil kursları için tasarlanmıştır."
    }
  ]
};

const howItWorks = {
  en: [
    {
      title: "Choose your exam and task",
      description:
        "Pick IELTS or TOEFL, then start the speaking task that matches what you want to improve."
    },
    {
      title: "Record your answer under time pressure",
      description:
        "Use your browser microphone and practice with a flow that feels closer to the real exam."
    },
    {
      title: "Review transcript, score estimate, and feedback",
      description:
        "See what you said, what sounds weak, and what can move your score higher."
    },
    {
      title: "Retry with a stronger plan",
      description:
        "Use the improved answer, pronunciation notes, and next-step guidance to make your next attempt better."
    }
  ],
  tr: [
    {
      title: "Sınavını ve görev tipini seç",
      description:
        "IELTS veya TOEFL seç, sonra geliştirmek istediğin speaking görevini başlat."
    },
    {
      title: "Süre baskısı altında cevabını kaydet",
      description:
        "Tarayıcı mikrofonunu kullan ve gerçek sınava daha çok benzeyen bir akışla pratik yap."
    },
    {
      title: "Transcript, skor tahmini ve geri bildirimi incele",
      description:
        "Ne söylediğini, nerede zayıf kaldığını ve skoru yükseltmek için neyi geliştirmen gerektiğini gör."
    },
    {
      title: "Daha güçlü bir planla tekrar dene",
      description:
        "Geliştirilmiş örnek cevap, telaffuz notları ve sonraki adımlarla bir sonraki denemeni daha iyi hale getir."
    }
  ]
};

const pricingReasons = {
  en: [
    "One good speaking lesson or mock interview can cost more than a full month of SpeakAce.",
    "For $9.99/month, learners can practice more often, get feedback faster, and build a real speaking routine.",
    "The value is not just AI feedback. It is the speed of the feedback loop, the quality of the transcript review, and the number of score-improving repetitions you can fit into one month."
  ],
  tr: [
    "Tek bir iyi speaking dersi veya mock görüşme, SpeakAce’in bir aylık ücretinden daha pahalı olabilir.",
    "Aylık $9.99 ile öğrenciler daha sık pratik yapabilir, daha hızlı geri bildirim alabilir ve gerçek bir speaking rutini kurabilir.",
    "Değer sadece AI geri bildiriminde değil; geri bildirim döngüsünün hızında, transcript incelemesinin kalitesinde ve bir ay içinde yapabileceğin gelişim odaklı tekrar sayısında."
  ]
};

const shortLandingCopy = {
  en: {
    title: "Short landing page version",
    cta: "Start IELTS speaking practice"
  },
  tr: {
    title: "Kısa landing sürümü",
    cta: "IELTS speaking çalışmasına başla"
  }
};

export function MarketingPage({
  eyebrow,
  title,
  description,
  focus,
  ctaHref
}: {
  eyebrow: string;
  title: string;
  description: string;
  focus: string;
  ctaHref: Route;
}) {
  const { language } = useAppState();
  const tr = language === "tr";
  const localizedFaqs = tr ? faqs.tr : faqs.en;
  const localizedHow = tr ? howItWorks.tr : howItWorks.en;
  const localizedPricingReasons = tr ? pricingReasons.tr : pricingReasons.en;
  const shortCopy = tr ? shortLandingCopy.tr : shortLandingCopy.en;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: localizedFaqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "9.99",
      priceCurrency: "USD"
    },
    description: siteConfig.description
  };

  return (
    <main>
      <section className="page-shell section home-hero">
        <div className="hero-copy">
          <span className="eyebrow">{eyebrow}</span>
          <h1>
            {tr
              ? "IELTS speaking pratiğini gerçek sınav baskısına daha yakın, daha akıllı bir AI koçla güçlendir."
              : title}
          </h1>
          <p className="hero-description">
            {tr
              ? "Cevabını kaydet, transcript’ini incele, tahmini band skorunu gör ve speaking puanını yükseltmek için sana en çok yardımcı olacak geri bildirimi al."
              : description}
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href={ctaHref}>
              {tr ? "Ücretsiz speaking denemesi başlat" : "Start free speaking practice"}
            </Link>
            <Link className="button button-secondary" href="/auth">
              {tr ? "Ücretsiz hesap oluştur" : "Create free account"}
            </Link>
          </div>
          <div className="hero-outcomes">
            {coreKeywords.slice(0, 5).map((keyword) => (
              <span key={keyword} className="pill">
                {keyword}
              </span>
            ))}
          </div>
          <div className="hero-proof">
            <div className="card proof-tile">
              <strong>{tr ? "Skoru yükseltmeye odaklan" : "Focus on score improvement"}</strong>
              <p>
                {tr
                  ? "Her deneme sana sadece puan değil, bir sonraki cevabı nasıl daha güçlü kuracağını da gösterir."
                  : "Every attempt gives you more than a score estimate. It shows how to make the next answer stronger."}
              </p>
            </div>
            <div className="card proof-tile">
              <strong>{tr ? "Daha çok konuş, daha hızlı öğren" : "Practice more, learn faster"}</strong>
              <p>
                {tr
                  ? "Hızlı kayıt, transcript ve geri bildirim döngüsü günlük speaking pratiğini daha sürdürülebilir yapar."
                  : "A fast record-review-retry loop makes daily IELTS speaking practice easier to maintain."}
              </p>
            </div>
          </div>
        </div>

        <aside className="card hero-result">
          <div className="pill">{tr ? "Örnek AI geri bildirimi" : "Sample AI feedback"}</div>
          <div className="score-showcase">
            <div className="score-value">7.0</div>
            <div className="score-label">
              {tr ? "Tahmini IELTS speaking skoru" : "Estimated IELTS speaking score"}
            </div>
          </div>
          <div className="card spotlight-card">
            <strong>{tr ? "Neyi daha iyi yapabilir?" : "What can improve next?"}</strong>
            <p>
              {tr
                ? "Cevap soruya doğrudan giriyor ve iyi bir örnek veriyor. Daha güçlü bağlaçlar, daha net telaffuz ve daha temiz kapanış cümleleri skoru yukarı taşıyabilir."
                : "The answer addresses the prompt directly and includes one relevant example. Clearer linking, cleaner pronunciation, and a stronger closing idea could move the score higher."}
            </p>
          </div>
          <div className="metrics-grid">
            <MiniMetric label={tr ? "Akıcılık" : "Fluency"} value="7.0" />
            <MiniMetric label={tr ? "Telaffuz" : "Pronunciation"} value="6.5" />
            <MiniMetric label={tr ? "Yapı" : "Structure"} value="7.5" />
          </div>
        </aside>
      </section>

      <section className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">{tr ? "Neden SpeakAce" : "Why SpeakAce"}</span>
          <h2>
            {tr
              ? "Konuşma pratiğini daha fazla denemeye, daha net geri bildirime ve daha yüksek IELTS speaking skoruna çevir"
              : "Turn more speaking attempts into better IELTS answers and stronger score growth"}
          </h2>
          <p>
            {tr
              ? "SpeakAce genel İngilizce sohbet için değil; IELTS speaking practice, IELTS speaking AI, improve IELTS speaking score ve speaking test simulator IELTS gibi yüksek niyetli aramalara gerçek değer üretmek için tasarlandı."
              : focus}
          </p>
        </div>
        <div className="marketing-grid">
          {whySpeakAce.map((item) => (
            <FeatureCard
              key={item.title.en}
              title={tr ? item.title.tr : item.title.en}
              description={tr ? item.description.tr : item.description.en}
            />
          ))}
        </div>
      </section>

      <section className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">{tr ? "30 güçlü özellik" : "30 high-value features"}</span>
          <h2>
            {tr
              ? "Öğrencilerin daha akıcı konuşmasına, daha güvenli hissetmesine ve IELTS speaking skorunu yükseltmesine yardımcı olan özellikler"
              : "Features designed to improve fluency, confidence, and IELTS speaking score"}
          </h2>
          <p>
            {tr
              ? "Bu özellikler sadece daha fazla araç sunmak için değil; daha iyi speaking cevabı kurmak, daha net telaffuz etmek ve sınav günü daha kontrollü konuşmak için tasarlandı."
              : "These features are built to improve real speaking performance, not just to add more buttons to the product."}
          </p>
        </div>
        <div className="marketing-grid">
          {standoutFeatures.map((item) => (
            <FeatureCard
              key={item.title.en}
              title={tr ? item.title.tr : item.title.en}
              description={tr ? item.description.tr : item.description.en}
            />
          ))}
        </div>
      </section>

      <section className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">{tr ? "Nasıl çalışır" : "How it works"}</span>
          <h2>
            {tr
              ? "4 basit adımda daha iyi IELTS speaking pratiği"
              : "A simple 4-step system for smarter IELTS speaking practice"}
          </h2>
        </div>
        <div className="steps-grid">
          {localizedHow.map((item, index) => (
            <StepCard
              key={item.title}
              index={`0${index + 1}`}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </section>

      <section id="pricing" className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">{tr ? "Fiyat değeri" : "Pricing value"}</span>
          <h2>
            {tr
              ? "Neden aylık $9.99 ödemeye değer?"
              : "Why $9.99/month is worth it for IELTS speaking practice"}
          </h2>
          <p>
            {tr
              ? "SpeakAce, tek bir özel dersin veya kısa bir mock speaking seansının maliyetinden daha düşük bir seviyede, düzenli AI English speaking practice sunar."
              : "SpeakAce is priced to feel easier than booking repeated mock sessions while still giving daily speaking value."}
          </p>
        </div>
        <div className="marketing-grid">
          {localizedPricingReasons.map((item) => (
            <FeatureCard key={item} title={tr ? "Neden değerli?" : "Why it matters"} description={item} />
          ))}
          <PricingCard
            ctaLabel={tr ? "Plus ile başla" : "Start with Plus"}
            name="Plus"
            price="$9.99"
            features={
              tr
                ? [
                    "Daha fazla günlük speaking süresi",
                    "Daha ayrıntılı transcript ve skor analizi",
                    "Tekrar denemeleriyle daha hızlı gelişim"
                  ]
                : [
                    "More daily speaking time",
                    "Deeper transcript and score analysis",
                    "Faster improvement through repeat attempts"
                  ]
            }
            featured
          />
        </div>
      </section>

      <section className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">{tr ? "Hızlı versiyon" : "Short landing page version"}</span>
          <h2>
            {tr
              ? "Kısa anlatım: SpeakAce ne sunuyor?"
              : "The fast version: what SpeakAce helps you do"}
          </h2>
        </div>
        <div className="card quick-pitch">
          <div className="quick-pitch-grid">
            <div>
              <h3 style={{ marginBottom: "0.8rem" }}>{shortCopy.title}</h3>
              <ul className="compact-list">
                {shortLandingPoints.map((item) => (
                  <li key={item.en}>{tr ? item.tr : item.en}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="practice-copy" style={{ marginBottom: "1rem" }}>
                {tr
                  ? "IELTS speaking practice, AI speaking feedback, tahmini band skorları ve speaking simulator deneyimini tek web uygulamasında birleştiriyoruz."
                  : "We combine IELTS speaking practice, AI speaking feedback, estimated band score support, and a speaking test simulator in one web product."}
              </p>
              <Link className="button button-primary" href={ctaHref}>
                {shortCopy.cta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">Blog</span>
          <h2>
            {tr
              ? "IELTS speaking skorunu yükseltmek isteyenler için içerikler"
              : "Content built to help learners improve IELTS speaking score"}
          </h2>
          <p>
            {tr
              ? "Google’dan organik trafik çekecek yüksek niyetli aramaları hedefleyen içerik sayfaları."
              : "SEO-focused content pages targeting real search intent around IELTS speaking practice and AI speaking tools."}
          </p>
        </div>
        <div className="marketing-grid">
          {blogPosts.map((post) => (
            <article key={post.slug} className="card feature-card">
              <div className="pill" style={{ marginBottom: "0.8rem" }}>
                {post.keywords[0]}
              </div>
              <h3>{post.title}</h3>
              <p>{post.description}</p>
              <Link href={`/blog/${post.slug}`} className="button button-secondary" style={{ marginTop: "0.7rem" }}>
                {tr ? "Yazıyı aç" : "Read article"}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">FAQ</span>
          <h2>{tr ? "Sık sorulan sorular" : "Frequently asked questions"}</h2>
        </div>
        <div className="marketing-grid">
          {localizedFaqs.map((faq) => (
            <FeatureCard key={faq.question} title={faq.question} description={faq.answer} />
          ))}
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }} />
    </main>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <article className="card feature-card">
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}

function StepCard({ index, title, description }: { index: string; title: string; description: string }) {
  return (
    <article className="card step-card">
      <span>{index}</span>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="card mini-metric">
      <div>{label}</div>
      <strong>{value}</strong>
    </div>
  );
}

function PricingCard({
  name,
  price,
  features,
  ctaLabel,
  featured = false
}: {
  name: string;
  price: string;
  features: string[];
  ctaLabel: string;
  featured?: boolean;
}) {
  return (
    <article className="card pricing-card" data-featured={featured ? "true" : "false"}>
      <h3>{name}</h3>
      <div className="price-tag">{price}</div>
      <ul>
        {features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      <Link className={`button ${featured ? "button-primary" : "button-secondary"}`} href="/auth">
        {ctaLabel}
      </Link>
    </article>
  );
}
