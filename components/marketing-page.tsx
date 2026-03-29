"use client";

import type { Route } from "next";
import Link from "next/link";
import { useAppState } from "@/components/providers";
import { siteConfig } from "@/lib/site";

const outcomes = [
  "Timed speaking drills that build exam confidence",
  "AI transcript and score estimate after each attempt",
  "Band-style and rubric-style feedback you can act on",
  "Daily practice streaks that keep learners motivated"
];

const faqs = [
  {
    question: "Is SpeakAce AI an official IELTS or TOEFL scoring service?",
    answer: "No. It provides AI-generated practice feedback and score estimates to help learners prepare more effectively."
  },
  {
    question: "Can I practice speaking on my phone?",
    answer: "Yes. The product is designed as a responsive web app with browser-based recording."
  },
  {
    question: "What happens after I record my answer?",
    answer: "Your answer is transcribed, reviewed against the task type, and returned with strengths, improvement notes, and a recommended next exercise."
  },
  {
    question: "How many questions are available in the practice bank?",
    answer: "The practice bank includes dozens of IELTS and TOEFL speaking prompts across multiple task formats, and it will keep expanding."
  },
  {
    question: "What is included in the paid plans?",
    answer: "Paid plans unlock more daily speaking time, more sessions, deeper feedback, and stronger progress support."
  },
  {
    question: "Do I need to install any software to use the microphone?",
    answer: "No. The app uses your browser microphone permission flow, so you can begin speaking practice directly on the site."
  },
  {
    question: "Can I use SpeakAce AI before booking a real mock exam?",
    answer: "Yes. It is designed to help learners build confidence, consistency, and feedback loops between formal mock tests."
  }
];

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

  const localizedOutcomes = tr
    ? [
        "Sinav odakli konusma denemeleriyle ozguven kazan",
        "Her denemeden sonra transcript ve puan tahmini al",
        "Daha uygulanabilir speaking geri bildirimi gor",
        "Gunluk tekrar ritmiyle sureklilik yakala"
      ]
    : outcomes;
  const localizedFaqs = tr
    ? [
        {
          question: "SpeakAce AI resmi IELTS veya TOEFL puanlama servisi mi?",
          answer: "Hayir. Bu urun resmi sonuc vermez; sadece hazirlik surecinde AI destekli pratik geri bildirimi saglar."
        },
        {
          question: "Telefondan speaking pratigi yapabilir miyim?",
          answer: "Evet. Uygulama responsive web yapisinda oldugu icin telefon tarayicisinda da calisir."
        },
        {
          question: "Konusmam bittikten sonra ne oluyor?",
          answer: "Cevabin transcript'e donusturulur, gorev tipine gore incelenir ve guclu yonler ile gelistirme notlari dondurulur."
        },
        {
          question: "Soru havuzunda kac speaking sorusu var?",
          answer: "IELTS ve TOEFL icin farkli speaking formatlarinda onlarca soru bulunur ve bu havuz surekli buyur."
        },
        {
          question: "Ucretli planlarda ne aciliyor?",
          answer: "Daha fazla gunluk konusma suresi, daha fazla session ve daha detayli geri bildirim acilir."
        },
        {
          question: "Mikrofon icin ekstra program kurmam gerekir mi?",
          answer: "Hayir. Tarayicidaki mikrofon izni yeterlidir; direkt site uzerinden pratik baslayabilir."
        },
        {
          question: "Gercek mock exam oncesi kullanmak mantikli mi?",
          answer: "Evet. Formal deneme sinavlari arasinda ozguven ve speaking rutini kazanmak icin tasarlandi."
        }
      ]
    : faqs;
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: localizedFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  };

  return (
    <main>
      <section className="page-shell section home-hero">
        <div className="hero-copy">
          <span className="eyebrow">{eyebrow}</span>
          <h1>{tr ? "IELTS ve TOEFL speaking pratiğini daha temiz, daha hizli bir AI kocuyla yap." : title}</h1>
          <p className="hero-description">
            {tr
              ? "Sinav tipine uygun cevaplar kaydet, transcript incele, puan tahmini gor ve speaking odakli geri bildirimle duzenli calis."
              : description}
          </p>
          <div className="hero-proof">
            <div className="card proof-tile">
              <strong>{tr ? "Ritmi koru" : "Practice with momentum"}</strong>
              <p>{tr ? "Kisa gunluk calismalar daha surdurulebilir oldugu icin ogrenciler duzenli devam eder." : "Short daily sessions feel achievable, so learners keep coming back and improving."}</p>
            </div>
            <div className="card proof-tile">
              <strong>{tr ? "Sonraki adim net" : "Clear next move"}</strong>
              <p>{tr ? "Her cevap transcript, puan tahmini ve bir sonraki net calisma onerisiyle biter." : "Every answer ends with a transcript, a score estimate, and one concrete next exercise."}</p>
            </div>
          </div>
          <div className="hero-actions">
            <Link className="button button-primary" href={ctaHref}>
              {tr ? "Speaking calismasina basla" : "Start speaking practice"}
            </Link>
            <Link className="button button-secondary" href="/auth">
              {tr ? "Ucretsiz hesap olustur" : "Create free account"}
            </Link>
          </div>
          <div className="hero-outcomes">
            {localizedOutcomes.map((item) => (
              <span key={item} className="pill">
                {item}
              </span>
            ))}
          </div>
        </div>

        <aside className="card hero-result">
          <div className="pill">{tr ? "Ornek AI feedback" : "Sample AI feedback"}</div>
          <div className="score-showcase">
            <div className="score-value">7.0</div>
            <div className="score-label">{tr ? "Tahmini speaking skoru" : "Estimated speaking score"}</div>
          </div>
          <div className="card spotlight-card">
            <strong>{tr ? "Transcript yorumu" : "Transcript insight"}</strong>
            <p>
              {tr ? "Cevap soruya dogrudan giriyor, duzenli ilerliyor ve en az bir net ornek veriyor. Daha guclu kelime secimi ve daha keskin bir kapanis skoru yukseltebilir." : "The response answers the task directly, stays organized, and gives one solid example. More precise vocabulary and stronger conclusion sentences would raise the score."}
            </p>
          </div>
          <div className="metrics-grid">
            <MiniMetric label={tr ? "Akicilik" : "Fluency"} value="7.0" />
            <MiniMetric label={tr ? "Netlik" : "Clarity"} value="6.5" />
            <MiniMetric label={tr ? "Yapi" : "Structure"} value="7.5" />
          </div>
        </aside>
      </section>

      <section className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">{tr ? "Neden ise yariyor" : "Why this works"}</span>
          <h2>{tr ? "Mock testler arasinda daha iyi speaking feedback isteyen ogrenciler icin tasarlandi" : "Built for learners who need better speaking feedback between mock tests"}</h2>
          <p>
            {tr
              ? `${siteConfig.name} genel sohbet degil, dogrudan sinav hazirligi icin tasarlandi. Speaking preparation, timed drills ve score-oriented feedback cizgisinde ilerler.`
              : `${siteConfig.name} is designed for exam preparation, not generic conversation practice. ${focus}`}
          </p>
        </div>

        <div className="marketing-grid">
          <FeatureCard
            title={tr ? "Gercek sinav tarzi gorevler" : "Real exam-style tasks"}
            description={tr ? "Cue card, follow-up, independent ve integrated speaking soru tiplerini tek akista calis." : "Practice cue cards, follow-up questions, independent responses, and integrated speaking prompts in a cleaner workflow."}
          />
          <FeatureCard
            title={tr ? "Hizli AI incelemesi" : "Fast AI review"}
            description={tr ? "Kaydini yukle, belirsiz yorumlar yerine daha uygulanabilir transcript tabanli feedback al." : "Upload your recording and get transcript-based review with actionable feedback instead of vague encouragement."}
          />
          <FeatureCard
            title={tr ? "Takip edilebilir ilerleme" : "Progress you can track"}
            description={tr ? "Zayif kaldigin gorevleri tekrar et, denemeleri karsilastir ve trendini izle." : "Repeat weak task types, compare attempts, and watch your score trend improve over time."}
          />
        </div>
      </section>

      <section className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">{tr ? "Nasil calisir" : "How it works"}</span>
          <h2>{tr ? "Basit akis, guclu pratik degeri" : "Simple workflow, serious practice value"}</h2>
        </div>
        <div className="steps-grid">
          <StepCard index="01" title={tr ? "Sinav modunu sec" : "Choose exam mode"} description={tr ? "IELTS veya TOEFL sec, sonra soru tipi ve seviyeni belirle." : "Select IELTS or TOEFL, then choose your task type and difficulty."} />
          <StepCard index="02" title={tr ? "Cevabini kaydet" : "Record your answer"} description={tr ? "Tarayici mikrofonunu kullan, hazirlik sayacini takip et ve speaking suresini tamamla." : "Use the browser microphone, follow the prep timer, and complete the speaking window."} />
          <StepCard index="03" title={tr ? "Transcript ve puani incele" : "Review transcript and score"} description={tr ? "AI transcript, puan tahmini, kategori feedback'i ve sonraki adimlari gor." : "See AI-generated transcript, estimated score, category feedback, and next steps."} />
        </div>
      </section>

      <section id="pricing" className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">{tr ? "Fiyatlar" : "Pricing"}</span>
          <h2>{tr ? "Ucretsiz basla, daha fazlasina ihtiyacin olunca yuksel" : "Start free, upgrade when you need more volume"}</h2>
          <p>{tr ? "Ucretsiz erisimi hafif ama faydali tut. Duzenli calismaya gecince daha fazla speaking hacmi ac." : "Keep free access light and useful. Unlock deeper feedback and more practice once the product is part of your study routine."}</p>
        </div>
        <div className="marketing-grid">
          <PricingCard
            ctaLabel={tr ? "Ucretsiz dene" : "Try free"}
            name={tr ? "Ucretsiz" : "Free"}
            price="$0"
            features={tr ? ["Gunluk 4 speaking session", "Gunluk 8 dakika speaking", "Transcript ve temel feedback"] : ["4 daily speaking sessions", "8 speaking minutes per day", "Transcript and core feedback"]}
          />
          <PricingCard
            ctaLabel={tr ? "Plus'i ac" : "Try Plus"}
            name="Plus"
            price="$9"
            features={tr ? ["Gunluk 18 session", "Gunluk 35 dakika speaking", "Detayli rubric analizi ve kayitli ilerleme"] : ["18 daily sessions", "35 speaking minutes per day", "Detailed rubric breakdown and saved progress"]}
          />
          <PricingCard
            ctaLabel={tr ? "Pro'ya gec" : "Go Pro"}
            name="Pro"
            price="$12"
            features={tr ? ["Gunluk 40 session", "Gunluk 90 dakika speaking", "Daha derin feedback ve daha guclu skor analizi"] : ["40 daily sessions", "90 speaking minutes per day", "Deeper feedback, larger study allowance, and stronger scoring detail"]}
            featured
          />
        </div>
      </section>

      <section className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">FAQ</span>
          <h2>{tr ? "Denemeden once en cok sorulanlar" : "Common questions before you try it"}</h2>
        </div>
        <div className="marketing-grid">
          {localizedFaqs.map((faq) => (
            <FeatureCard key={faq.question} title={faq.question} description={faq.answer} />
          ))}
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
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

function PricingCard({
  name,
  price,
  features,
  ctaLabel,
  featured
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

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="card mini-metric">
      <div>{label}</div>
      <strong>{value}</strong>
    </div>
  );
}
