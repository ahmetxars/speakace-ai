"use client";

import type { Route } from "next";
import Link from "next/link";
import { useAppState } from "@/components/providers";
import { commerceConfig, getPlanComparison } from "@/lib/commerce";
import {
  blogPosts,
  coreKeywords,
  shortLandingPoints,
  standoutFeatures,
  whySpeakAce
} from "@/lib/marketing-content";
import { siteConfig } from "@/lib/site";

const trustSignals = {
  en: [
    { label: "Targeted use case", value: "IELTS + TOEFL speaking" },
    { label: "Core promise", value: "AI feedback in minutes" },
    { label: "Best for", value: "Students, teachers, schools" },
    { label: "Focus", value: "Score growth and confidence" }
  ],
  tr: [
    { label: "Odak kullanım", value: "IELTS + TOEFL speaking" },
    { label: "Ana vaat", value: "Dakikalar içinde AI feedback" },
    { label: "En uygun kitle", value: "Öğrenci, öğretmen, kurum" },
    { label: "Temel hedef", value: "Skor artışı ve özgüven" }
  ]
};

const testimonials = {
  en: [
    {
      quote:
        "It gave me the fastest feedback loop I had during IELTS preparation. I could see my weak answers immediately and retry them the same day.",
      author: "IELTS student",
      role: "Band 6.0 target learner"
    },
    {
      quote:
        "The transcript and stronger sample answer made it obvious why my speaking score was stuck.",
      author: "Self-study user",
      role: "Preparing for speaking retake"
    },
    {
      quote:
        "The class and homework tools make it much easier to monitor student speaking practice between lessons.",
      author: "Language teacher",
      role: "Uses SpeakAce with small groups"
    }
  ],
  tr: [
    {
      quote:
        "IELTS hazırlığında gördüğüm en hızlı geri bildirim döngüsünü verdi. Zayıf cevaplarımı aynı gün içinde görüp tekrar çalışabildim.",
      author: "IELTS öğrencisi",
      role: "Band 6.0 hedefi"
    },
    {
      quote:
        "Transcript ve geliştirilmiş örnek cevap, speaking skorunun neden takıldığını çok daha net gösterdi.",
      author: "Bireysel kullanıcı",
      role: "Speaking retake hazırlığı"
    },
    {
      quote:
        "Sınıf ve ödev araçları, speaking pratiğini ders aralarında takip etmeyi öğretmen için çok daha kolaylaştırıyor.",
      author: "Dil öğretmeni",
      role: "Küçük gruplarla kullanıyor"
    }
  ]
};

const useCases = {
  en: [
    {
      title: "For IELTS students",
      description: "Practice Part 1, Part 2, and Part 3 with score-focused AI feedback instead of random speaking prompts."
    },
    {
      title: "For self-study learners",
      description: "Build a daily speaking habit without needing a tutor every time you want feedback."
    },
    {
      title: "For teachers and schools",
      description: "Track class progress, assign homework, review attempts, and keep student speaking practice active between lessons."
    }
  ],
  tr: [
    {
      title: "IELTS öğrencileri için",
      description: "Rastgele speaking soruları yerine Part 1, Part 2 ve Part 3 için skor odaklı AI geri bildirimle çalış."
    },
    {
      title: "Kendi başına çalışan öğrenciler için",
      description: "Her geri bildirim için öğretmene ihtiyaç duymadan günlük speaking düzeni kur."
    },
    {
      title: "Öğretmenler ve kurslar için",
      description: "Sınıf gelişimini izle, ödev ata, denemeleri incele ve speaking pratiğini ders aralarında da canlı tut."
    }
  ]
};

const comparisonPoints = {
  en: [
    {
      title: "More focused than generic AI chat",
      description: "SpeakAce is built around exam speaking tasks, estimated score signals, and retry-based improvement."
    },
    {
      title: "Faster than waiting for manual review",
      description: "Students can record, review, and retry in one session instead of waiting days for feedback."
    },
    {
      title: "More practical than memorizing templates",
      description: "The product pushes learners toward clearer structure, better examples, and more natural speaking control."
    }
  ],
  tr: [
    {
      title: "Genel AI chat araçlarından daha odaklı",
      description: "SpeakAce; sınav speaking görevleri, tahmini skor sinyalleri ve tekrar denemeleri üzerinden gelişim için tasarlandı."
    },
    {
      title: "Manuel geri bildirim beklemekten daha hızlı",
      description: "Öğrenci tek oturum içinde kaydedip inceleyebilir ve yeniden deneyebilir; günlerce geri bildirim beklemez."
    },
    {
      title: "Ezber kalıplardan daha faydalı",
      description: "Ürün öğrenciyi daha net yapı, daha iyi örnek ve daha doğal konuşma kontrolüne iter."
    }
  ]
};

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
  const localizedTrustSignals = tr ? trustSignals.tr : trustSignals.en;
  const localizedTestimonials = tr ? testimonials.tr : testimonials.en;
  const localizedUseCases = tr ? useCases.tr : useCases.en;
  const localizedComparisonPoints = tr ? comparisonPoints.tr : comparisonPoints.en;
  const planComparison = getPlanComparison(tr);

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
            <a className="button button-secondary" href={commerceConfig.plusMonthlyCheckout} target="_blank" rel="noreferrer">
              {tr ? "Plus planını aç" : "Unlock Plus"}
            </a>
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

      <section className="page-shell section" style={{ paddingTop: 0 }}>
        <div className="stats-strip">
          {localizedTrustSignals.map((item) => (
            <div key={item.label} className="card stat-strip-card">
              <div className="practice-meta">{item.label}</div>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
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
          <span className="eyebrow">{tr ? "Kime uygun" : "Use cases"}</span>
          <h2>
            {tr
              ? "Aynı ürün içinde hem bireysel öğrenci hem de kurs kullanımı"
              : "One product for individual learners, teachers, and schools"}
          </h2>
          <p>
            {tr
              ? "Rakiplerde öne çıkan en güçlü şeylerden biri tek bir kullanım alanına sıkışmamak. SpeakAce bu yüzden hem bireysel practice hem de sınıf yönetimini aynı yapı içinde sunuyor."
              : "A big conversion advantage in this space is serving more than one use case well. SpeakAce is built for both solo practice and class workflows."}
          </p>
        </div>
        <div className="marketing-grid">
          {localizedUseCases.map((item) => (
            <FeatureCard key={item.title} title={item.title} description={item.description} />
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
          <span className="eyebrow">{tr ? "Neden şimdi" : "Why now"}</span>
          <h2>
            {tr
              ? "İnsanlar neden böyle bir ürüne para öder?"
              : "Why would someone pay for SpeakAce instead of using generic tools?"}
          </h2>
        </div>
        <div className="marketing-grid">
          {localizedComparisonPoints.map((item) => (
            <FeatureCard key={item.title} title={item.title} description={item.description} />
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
            ctaLabel={tr ? "Plus ile şimdi başla" : "Start Plus now"}
            name={commerceConfig.plusPlanName.replace(" Monthly", "")}
            price={commerceConfig.plusMonthlyPrice}
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
            href={commerceConfig.plusMonthlyCheckout}
            featured
          />
        </div>
        <div className="card comparison-card">
          <h3 style={{ marginBottom: "0.9rem" }}>{tr ? "Free ve Plus karşılaştırması" : "Free vs Plus"}</h3>
          <div className="comparison-table">
            <div className="comparison-head">{tr ? "Özellik" : "Feature"}</div>
            <div className="comparison-head">Free</div>
            <div className="comparison-head">Plus</div>
            {planComparison.map((item) => (
              <FragmentRow key={item.label} label={item.label} free={item.free} plus={item.plus} />
            ))}
          </div>
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
              <a className="button button-primary" href={commerceConfig.plusMonthlyCheckout} target="_blank" rel="noreferrer">
                {tr ? "Plus planını al" : "Get Plus"}
              </a>
              <Link className="button button-secondary" href={ctaHref} style={{ marginLeft: "0.7rem" }}>
                {shortCopy.cta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">{tr ? "Sosyal kanıt" : "Social proof"}</span>
          <h2>
            {tr
              ? "Ziyaretçi neden güven duymalı?"
              : "Why this can feel worth paying for"}
          </h2>
        </div>
        <div className="marketing-grid">
          {localizedTestimonials.map((item) => (
            <article key={item.quote} className="card testimonial-card">
              <p style={{ lineHeight: 1.8, marginBottom: "1rem" }}>&ldquo;{item.quote}&rdquo;</p>
              <strong>{item.author}</strong>
              <div className="practice-meta">{item.role}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="page-shell section">
        <div className="card institution-cta">
          <div>
            <span className="eyebrow">{tr ? "Kurslar için" : "For schools"}</span>
            <h2 style={{ margin: "0.8rem 0 0.5rem" }}>
              {tr
                ? "Kurslara satılabilecek bir speaking practice altyapısı"
                : "A speaking practice platform that also works for schools and teachers"}
            </h2>
            <p className="practice-copy">
              {tr
                ? "Öğretmen paneli, sınıf kodları, ödev atama, riskli öğrenci uyarıları ve kurum analitiği ile SpeakAce sadece öğrenci aracı değil, aynı zamanda eğitim kurumu ürünü de olabilir."
                : "With teacher dashboards, class codes, homework assignment, risk alerts, and institution analytics, SpeakAce is not only a student tool but a school-ready product."}
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <Link className="button button-secondary" href="/app/teacher">
              {tr ? "Öğretmen akışını gör" : "See teacher workflow"}
            </Link>
            <a className="button button-primary" href={commerceConfig.plusMonthlyCheckout} target="_blank" rel="noreferrer">
              {tr ? "Ödeme akışını test et" : "Test checkout"}
            </a>
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
  href,
  featured = false
}: {
  name: string;
  price: string;
  features: string[];
  ctaLabel: string;
  href: string;
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
      <a className={`button ${featured ? "button-primary" : "button-secondary"}`} href={href} target="_blank" rel="noreferrer">
        {ctaLabel}
      </a>
    </article>
  );
}

function FragmentRow({ label, free, plus }: { label: string; free: string; plus: string }) {
  return (
    <>
      <div className="comparison-cell comparison-label">{label}</div>
      <div className="comparison-cell">{free}</div>
      <div className="comparison-cell">{plus}</div>
    </>
  );
}
