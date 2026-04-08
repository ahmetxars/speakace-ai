"use client";

import type { Route } from "next";
import Link from "next/link";
import { useAppState } from "@/components/providers";
import { AdSenseUnit } from "@/components/adsense-unit";

type MarketingPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  focus: string;
  ctaHref: Route | string;
  variant?: "default" | "minimal";
};

const sectionCopy = {
  en: {
    badge: "AI-powered speaking practice",
    badgeLive: "1,000+ learners practicing today",
    trusted: "Trusted by learners in 50+ countries.",
    cta: "Start Speaking Now",
    demo: "Watch 60s demo →",
    trustBar: "Free • No signup required • Cancel anytime",
    scoreLabel: "Band score improved",
    whyEyebrow: "Why SpeakAce",
    whyTitle: "Why learners choose SpeakAce instead of generic tools",
    whyCards: [
      {
        title: "Built for exam speaking",
        body: "Practice IELTS and TOEFL speaking tasks that feel like real prep instead of generic chat prompts."
      },
      {
        title: "Feedback you can act on",
        body: "See a band-style score, transcript, and clearer next steps after every attempt."
      },
      {
        title: "A calmer study system",
        body: "Retry the same answer, compare improvement, and build a daily speaking rhythm that actually sticks."
      }
    ],
    howEyebrow: "How it works",
    howTitle: "Three steps to a better band score",
    howCards: [
      {
        title: "Pick your exam and task",
        body: "Start with IELTS or TOEFL, then choose the speaking task you want to practice right now."
      },
      {
        title: "Record one focused answer",
        body: "Use one real question, one clear answer, and one attempt to see how your speaking holds up."
      },
      {
        title: "Review, fix, and retry",
        body: "Check the transcript, estimated score, and improvement notes, then record again with more control."
      }
    ],
    howCtaTitle: "Ready to see your score?",
    howCtaMeta: "Free session · No account needed · Results in 60 seconds",
    featureEyebrow: "Platform fit",
    featureTitle: "Everything speaks the same language: score improvement",
    featureCards: [
      "Guided practice flows for IELTS and TOEFL",
      "Transcript review with stronger retry direction",
      "Teacher and class visibility when you need structure",
      "Tools, prompts, and daily practice hooks that lead back into speaking"
    ],
    testEyebrow: "Proof",
    testTitle: "What learners say after their first week",
    faqEyebrow: "FAQ",
    faqTitle: "Questions learners ask before they start",
    faqs: [
      {
        q: "How accurate is the AI band score estimate?",
        a: "SpeakAce gives an estimated IELTS band score based on fluency, pronunciation, structure, and idea support. It is designed to show progress across attempts, not replace an official examiner."
      },
      {
        q: "Do I need to create an account to start?",
        a: "No. You can start a free speaking session without signing up. Creating an account helps you save history, track scores, and keep a daily rhythm."
      },
      {
        q: "Can I use SpeakAce for TOEFL preparation?",
        a: "Yes. SpeakAce includes TOEFL-style speaking tasks alongside IELTS, using the same core feedback areas: fluency, pronunciation, structure, and coherence."
      },
      {
        q: "How is SpeakAce different from general AI tools?",
        a: "General tools respond to text. SpeakAce is built specifically for spoken English scoring, transcript review, and exam-focused improvement."
      },
      {
        q: "Can teachers use SpeakAce with students?",
        a: "Yes. Teachers can create classes, assign speaking homework, track attempts, and see progress from a single panel."
      }
    ]
  },
  tr: {
    badge: "Yapay zekâ destekli speaking practice",
    badgeLive: "Bugün 1.000+ öğrenci pratik yapıyor",
    trusted: "50+ ülkedeki öğrenciler tarafından kullanılıyor.",
    cta: "Hemen Konuşmaya Başla",
    demo: "60 sn demoyu izle →",
    trustBar: "Ücretsiz • Kayıt gerektirmez • İstediğin zaman iptal et",
    scoreLabel: "Band skoru gelişti",
    whyEyebrow: "Neden SpeakAce",
    whyTitle: "Öğrenciler neden genel araçlar yerine SpeakAce'i seçiyor",
    whyCards: [
      {
        title: "Sınav speaking'i için tasarlandı",
        body: "Genel sohbet prompt'ları yerine gerçek IELTS ve TOEFL speaking görevleriyle çalışırsın."
      },
      {
        title: "Harekete geçirici geri bildirim",
        body: "Her denemeden sonra band benzeri skor, transcript ve bir sonraki net gelişim adımını görürsün."
      },
      {
        title: "Daha sakin bir çalışma sistemi",
        body: "Aynı cevabı tekrar dene, farkı gör, günlük speaking düzenini daha kolay kur."
      }
    ],
    howEyebrow: "Nasıl çalışır",
    howTitle: "Daha iyi bir band skoruna giden üç adım",
    howCards: [
      {
        title: "Sınav ve görevi seç",
        body: "Önce IELTS veya TOEFL'ı seç, sonra o anda çalışmak istediğin speaking görevini aç."
      },
      {
        title: "Tek bir odaklı cevap kaydet",
        body: "Gerçek bir soruya tek bir net cevap ver ve mevcut speaking seviyeni gör."
      },
      {
        title: "İncele, düzelt, tekrar dene",
        body: "Transcript'i, tahmini skoru ve geliştirme notlarını görüp daha kontrollü bir yeni deneme yap."
      }
    ],
    howCtaTitle: "Skorunu görmeye hazır mısın?",
    howCtaMeta: "Ücretsiz oturum · Hesap gerekmez · 60 saniyede sonuç",
    featureEyebrow: "Platform uyumu",
    featureTitle: "Buradaki her şey aynı hedefe çalışıyor: skor gelişimi",
    featureCards: [
      "IELTS ve TOEFL için yönlendirmeli practice akışı",
      "Transcript incelemesi ve daha güçlü retry yönü",
      "Öğretmen ve sınıf görünürlüğü gerektiğinde hazır",
      "Araçlar, prompt'lar ve günlük alışkanlık akışı tekrar speaking'e bağlanır"
    ],
    testEyebrow: "Kanıt",
    testTitle: "İlk haftadan sonra öğrenciler ne diyor",
    faqEyebrow: "SSS",
    faqTitle: "Başlamadan önce en çok sorulanlar",
    faqs: [
      {
        q: "AI band skoru tahmini ne kadar doğru?",
        a: "SpeakAce; akıcılık, telaffuz, yapı ve fikir desteğine göre tahmini bir IELTS band skoru verir. Resmî puanlamayı birebir kopyalamaz, ama denemeler arası gelişimi net gösterir."
      },
      {
        q: "Başlamak için hesap oluşturmam gerekiyor mu?",
        a: "Hayır. Ücretsiz bir speaking oturumuna kayıt olmadan başlayabilirsin. Hesap açarsan geçmişini ve skorlarını takip edebilirsin."
      },
      {
        q: "SpeakAce TOEFL hazırlığı için de uygun mu?",
        a: "Evet. IELTS yanında TOEFL tarzı speaking görevleri de var ve aynı temel alanlarda geri bildirim veriyor."
      },
      {
        q: "Genel AI araçlarından farkı ne?",
        a: "Genel araçlar yazıya cevap verir. SpeakAce ise sesini dinler, transcript çıkarır ve sınav odaklı speaking gelişimi için tasarlanmıştır."
      },
      {
        q: "Öğretmenler öğrencileriyle kullanabilir mi?",
        a: "Evet. Öğretmenler sınıf kurabilir, ödev verebilir ve denemeleri tek panelden izleyebilir."
      }
    ]
  }
} as const;

const weeklyTestimonials = [
  {
    initials: "AT",
    tone: "is-purple",
    name: "Ayşe T.",
    country: "🇹🇷 Turkey",
    score: "Band 5.5 → 7.0",
    quote:
      "I practiced every morning for 10 days. The transcript review helped me see exactly where I was repeating myself."
  },
  {
    initials: "KM",
    tone: "is-blue",
    name: "Kenji M.",
    country: "🇯🇵 Japan",
    score: "Band 6.0 → 7.5",
    quote:
      "The retry feature is what makes this different. I could hear the improvement between attempt one and attempt three."
  },
  {
    initials: "PK",
    tone: "is-green",
    name: "Priya K.",
    country: "🇮🇳 India",
    score: "Band 6.5 → 7.5",
    quote:
      "SpeakAce shows why your score is low, not just what it is. That changed my Part 2 answers completely."
  },
  {
    initials: "AR",
    tone: "is-orange",
    name: "Ahmed R.",
    country: "🇪🇬 Egypt",
    score: "Band 5.0 → 6.5",
    quote:
      "Three weeks of daily practice. My fluency improved because the daily prompt habit finally gave me consistency."
  }
] as const;

type SectionLocale = (typeof sectionCopy)[keyof typeof sectionCopy];

function HeroScoreCard({ focus, trust }: { focus: string; trust: SectionLocale }) {
  return (
    <div className="sa-hero-card">
      <span className="sa-hero-card-badge">Band movement</span>
      <div className="sa-hero-bandline">6.5 → 7.0</div>
      <p className="sa-hero-bandnote">{trust.scoreLabel}</p>

      <div className="sa-hero-progress">
        <ProgressRow label="Fluency" value={78} />
        <ProgressRow label="Pronunciation" value={72} />
        <ProgressRow label="Structure" value={75} />
      </div>

      <div className="sa-hero-focus">
        <span>Why this page exists</span>
        <p>{focus}</p>
      </div>
    </div>
  );
}

function ProgressRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="sa-progress-row">
      <div className="sa-progress-head">
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>
      <div className="sa-progress-track">
        <span className="sa-progress-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function MarketingPage({ eyebrow, title, description, focus, ctaHref }: MarketingPageProps) {
  const { language } = useAppState();
  const t = sectionCopy[language === "tr" ? "tr" : "en"];
  const primaryHref = ctaHref as Route;

  return (
    <main className="sa-home-shell">
      <section className="page-shell sa-hero-grid">
        <div className="sa-hero-copy">
          <span className="sa-live-badge">
            <span className="sa-live-dot" />
            {t.badgeLive}
          </span>
          <span className="eyebrow sa-hero-eyebrow">{eyebrow || t.badge}</span>
          <h1>{title}</h1>
          <p className="sa-hero-description">
            {description}
            <br />
            {t.trusted}
          </p>
          <div className="sa-hero-actions">
            <Link href={primaryHref} className="sa-primary-button">
              {t.cta}
            </Link>
            <a href="#how-it-works" className="sa-secondary-button">
              {t.demo}
            </a>
          </div>
          <div className="sa-hero-trust">{t.trustBar}</div>
        </div>

        <HeroScoreCard focus={focus} trust={t} />
      </section>

      <section className="page-shell sa-section">
        <span className="eyebrow">{t.whyEyebrow}</span>
        <div className="sa-section-head">
          <h2>{t.whyTitle}</h2>
        </div>
        <div className="sa-why-grid">
          {t.whyCards.map((card) => (
            <article key={card.title} className="card sa-why-card">
              <span className="sa-card-chip">Score-focused</span>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="page-shell sa-section">
        <span className="eyebrow">{t.howEyebrow}</span>
        <div className="sa-section-head">
          <h2>{t.howTitle}</h2>
        </div>
        <div className="sa-steps-grid">
          {t.howCards.map((step, index) => (
            <article key={step.title} className="card sa-step-card">
              <span className="sa-step-number">0{index + 1}</span>
              <span className="sa-step-icon">{index === 0 ? "🎯" : index === 1 ? "🎙️" : "📈"}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
        <div className="card sa-cta-panel">
          <div>
            <h3>{t.howCtaTitle}</h3>
            <p>{t.howCtaMeta}</p>
          </div>
          <Link href={primaryHref} className="sa-primary-button">
            {t.cta}
          </Link>
        </div>
      </section>

      <section className="page-shell sa-section">
        <span className="eyebrow">{t.featureEyebrow}</span>
        <div className="sa-section-head">
          <h2>{t.featureTitle}</h2>
        </div>
        <div className="sa-bento-grid">
          {t.featureCards.map((item, index) => (
            <article key={item} className={`card sa-bento-card is-${index + 1}`}>
              <span className="sa-card-chip">SpeakAce</span>
              <h3>{item}</h3>
              <p>{index % 2 === 0 ? "Less friction, more speaking volume, and clearer score direction." : "Built to move users from prompt to result without losing context."}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-shell sa-section">
        <span className="eyebrow">{t.testEyebrow}</span>
        <div className="sa-section-head">
          <h2>{t.testTitle}</h2>
        </div>
        <div className="sa-testimonial-grid">
          {weeklyTestimonials.map((item) => (
            <article key={item.name} className="card sa-testimonial-card">
              <div className="sa-testimonial-top">
                <span className={`sa-avatar ${item.tone}`}>{item.initials}</span>
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.country}</span>
                </div>
                <span className="sa-score-badge">{item.score}</span>
              </div>
              <div className="sa-stars">★★★★★</div>
              <p>{item.quote}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-shell sa-section">
        <div className="sa-inline-promo">
          <div>
            <span className="eyebrow">Try a free IELTS speaking test</span>
            <h2>See your transcript, estimated score, and next fix in one attempt.</h2>
          </div>
          <div className="sa-inline-promo-actions">
            <Link href="/free-ielts-speaking-test" className="sa-secondary-button">
              Free test
            </Link>
            <Link href="/blog" className="sa-ghost-button">
              Read guides
            </Link>
          </div>
        </div>
      </section>

      <section className="page-shell sa-section">
        <span className="eyebrow">{t.faqEyebrow}</span>
        <div className="sa-section-head">
          <h2>{t.faqTitle}</h2>
        </div>
        <div className="sa-faq-list">
          {t.faqs.map((item) => (
            <details key={item.q} className="card sa-faq-item">
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="page-shell sa-section">
        <AdSenseUnit className="sa-home-ad" />
      </section>
    </main>
  );
}
