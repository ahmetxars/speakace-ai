import type { Metadata } from "next";
import Link from "next/link";
import { MarketingSchema } from "@/components/marketing-schema";
import { SiteHeader } from "@/components/site-header";
import { buildPlanCheckoutPath, commerceConfig, couponCatalog, getPlanComparison } from "@/lib/commerce";
import type { Language } from "@/lib/copy";
import { getServerLanguage } from "@/lib/language";

const pricingCopy = {
  en: {
    title: "IELTS Speaking Pricing | Full Feedback and Unlimited Practice",
    description:
      "Compare free and Plus plans for IELTS speaking practice, full feedback, band-style scoring, and more daily speaking time.",
    eyebrow: "Pricing",
    heading: "IELTS speaking practice pricing built around faster score improvement",
    intro:
      "Start free, see your score first, then unlock full feedback, more daily speaking time, and a stronger IELTS scoring workflow.",
    launchOffer: "Launch offer",
    bestFor: "Best for",
    bestForValue: "Daily IELTS score improvement",
    corePromise: "Core promise",
    corePromiseValue: "Full feedback after every speaking attempt",
    price: "Price",
    free: "Free",
    start: "Start Speaking Now",
    faqTitle: "Common buying questions"
  },
  tr: {
    title: "IELTS Speaking Fiyatları | Tam Geri Bildirim ve Sınırsıza Yakın Pratik",
    description:
      "IELTS speaking pratiği için ücretsiz ve Plus planlarını; tam geri bildirim, band benzeri skor ve daha fazla günlük speaking süresiyle karşılaştırın.",
    eyebrow: "Fiyatlar",
    heading: "IELTS speaking pratiği için daha hızlı skor gelişimine uygun fiyatlar",
    intro:
      "Ücretsiz başla, önce skorunu gör, sonra tam geri bildirim, daha fazla günlük speaking süresi ve daha güçlü bir IELTS skorlama akışı aç.",
    launchOffer: "Tanıtım teklifi",
    bestFor: "En uygun kullanım",
    bestForValue: "Günlük IELTS skor gelişimi",
    corePromise: "Ana vaat",
    corePromiseValue: "Her denemeden sonra tam geri bildirim",
    price: "Fiyat",
    free: "Ücretsiz",
    start: "Konuşmaya başla",
    faqTitle: "Sık sorulan satın alma soruları"
  },
  de: {
    title: "IELTS-Speaking-Preise | Volles Feedback und mehr Übung",
    description: "Vergleiche Free und Plus für IELTS-Speaking mit vollem Feedback, Band-Signalen und mehr täglicher Sprechzeit.",
    eyebrow: "Preise",
    heading: "Preise für IELTS-Speaking-Training mit schnellerem Score-Fortschritt",
    intro: "Starte kostenlos, sieh zuerst deinen Score und schalte dann volles Feedback, mehr tägliche Sprechzeit und einen stärkeren IELTS-Workflow frei.",
    launchOffer: "Launch-Angebot",
    bestFor: "Am besten geeignet für",
    bestForValue: "Tägliche IELTS-Score-Verbesserung",
    corePromise: "Kernversprechen",
    corePromiseValue: "Volles Feedback nach jedem Versuch",
    price: "Preis",
    free: "Kostenlos",
    start: "Jetzt sprechen",
    faqTitle: "Häufige Kauffragen"
  },
  es: {
    title: "Precios IELTS Speaking | Feedback completo y más práctica",
    description: "Compara los planes Free y Plus para IELTS speaking con feedback completo, señal de banda y más tiempo diario.",
    eyebrow: "Precios",
    heading: "Precios para practicar IELTS speaking con mejora más rápida de puntuación",
    intro: "Empieza gratis, mira tu puntuación primero y luego desbloquea feedback completo, más tiempo diario y un mejor flujo IELTS.",
    launchOffer: "Oferta de lanzamiento",
    bestFor: "Ideal para",
    bestForValue: "Mejora diaria de IELTS",
    corePromise: "Promesa principal",
    corePromiseValue: "Feedback completo tras cada intento",
    price: "Precio",
    free: "Gratis",
    start: "Empieza a hablar",
    faqTitle: "Preguntas frecuentes de compra"
  },
  fr: {
    title: "Tarifs IELTS Speaking | Feedback complet et plus de pratique",
    description: "Comparez Free et Plus pour l’IELTS speaking avec retour complet, score type bande et plus de temps quotidien.",
    eyebrow: "Tarifs",
    heading: "Des tarifs pensés pour progresser plus vite en IELTS speaking",
    intro: "Commencez gratuitement, voyez d’abord votre score, puis débloquez le feedback complet, plus de temps quotidien et un meilleur flux IELTS.",
    launchOffer: "Offre de lancement",
    bestFor: "Idéal pour",
    bestForValue: "Progression quotidienne en IELTS",
    corePromise: "Promesse clé",
    corePromiseValue: "Retour complet après chaque essai",
    price: "Prix",
    free: "Gratuit",
    start: "Commencer à parler",
    faqTitle: "Questions fréquentes avant achat"
  },
  it: {
    title: "Prezzi IELTS Speaking | Feedback completo e più pratica",
    description: "Confronta Free e Plus per IELTS speaking con feedback completo, segnali di band e più tempo quotidiano.",
    eyebrow: "Prezzi",
    heading: "Prezzi per praticare IELTS speaking con miglioramento più rapido del punteggio",
    intro: "Inizia gratis, guarda prima il tuo punteggio, poi sblocca feedback completo, più tempo quotidiano e un flusso IELTS più forte.",
    launchOffer: "Offerta di lancio",
    bestFor: "Ideale per",
    bestForValue: "Miglioramento quotidiano IELTS",
    corePromise: "Promessa chiave",
    corePromiseValue: "Feedback completo dopo ogni tentativo",
    price: "Prezzo",
    free: "Gratis",
    start: "Inizia a parlare",
    faqTitle: "Domande frequenti sull’acquisto"
  },
  pt: {
    title: "Preços IELTS Speaking | Feedback completo e mais prática",
    description: "Compare Free e Plus para IELTS speaking com feedback completo, sinais de banda e mais tempo diário.",
    eyebrow: "Preços",
    heading: "Preços para praticar IELTS speaking com progresso mais rápido",
    intro: "Comece grátis, veja sua pontuação primeiro e depois desbloqueie feedback completo, mais tempo diário e um fluxo IELTS melhor.",
    launchOffer: "Oferta de lançamento",
    bestFor: "Melhor para",
    bestForValue: "Melhora diária no IELTS",
    corePromise: "Promessa principal",
    corePromiseValue: "Feedback completo após cada tentativa",
    price: "Preço",
    free: "Grátis",
    start: "Comece a falar",
    faqTitle: "Perguntas frequentes de compra"
  },
  nl: {
    title: "IELTS Speaking-prijzen | Volledige feedback en meer oefenen",
    description: "Vergelijk Free en Plus voor IELTS speaking met volledige feedback, band-signalen en meer dagelijkse spreektijd.",
    eyebrow: "Prijzen",
    heading: "Prijzen voor IELTS-speaking-oefening met snellere scoreverbetering",
    intro: "Begin gratis, zie eerst je score en ontgrendel daarna volledige feedback, meer dagelijkse spreektijd en een sterkere IELTS-flow.",
    launchOffer: "Lanceringsoffer",
    bestFor: "Beste voor",
    bestForValue: "Dagelijkse IELTS-scoreverbetering",
    corePromise: "Kernbelofte",
    corePromiseValue: "Volledige feedback na elke poging",
    price: "Prijs",
    free: "Gratis",
    start: "Begin met spreken",
    faqTitle: "Veelgestelde koopvragen"
  },
  pl: {
    title: "Cennik IELTS Speaking | Pełny feedback i więcej praktyki",
    description: "Porównaj Free i Plus dla IELTS speaking z pełnym feedbackiem, sygnałami band i większym limitem dziennym.",
    eyebrow: "Cennik",
    heading: "Cennik ćwiczeń IELTS speaking dla szybszej poprawy wyniku",
    intro: "Zacznij za darmo, najpierw zobacz wynik, a potem odblokuj pełny feedback, więcej czasu dziennie i lepszy workflow IELTS.",
    launchOffer: "Oferta startowa",
    bestFor: "Najlepsze dla",
    bestForValue: "Codziennej poprawy IELTS",
    corePromise: "Główna obietnica",
    corePromiseValue: "Pełny feedback po każdej próbie",
    price: "Cena",
    free: "Darmowy",
    start: "Zacznij mówić",
    faqTitle: "Najczęstsze pytania przed zakupem"
  },
  ru: {
    title: "Цены IELTS Speaking | Полный разбор и больше практики",
    description: "Сравните Free и Plus для IELTS speaking с полным разбором, сигналами band и большим дневным лимитом.",
    eyebrow: "Цены",
    heading: "Тарифы для IELTS speaking с более быстрым ростом результата",
    intro: "Начните бесплатно, сначала посмотрите свой балл, а затем откройте полный разбор, больше времени в день и более сильный IELTS workflow.",
    launchOffer: "Стартовое предложение",
    bestFor: "Лучше всего для",
    bestForValue: "Ежедневного роста IELTS",
    corePromise: "Главное обещание",
    corePromiseValue: "Полный разбор после каждой попытки",
    price: "Цена",
    free: "Бесплатно",
    start: "Начать говорить",
    faqTitle: "Частые вопросы перед покупкой"
  },
  ar: {
    title: "أسعار IELTS Speaking | ملاحظات كاملة وممارسة أكثر",
    description: "قارن بين Free وPlus في IELTS speaking مع ملاحظات كاملة وإشارات band ووقت يومي أكبر.",
    eyebrow: "الأسعار",
    heading: "خطط أسعار تساعدك على تحسين درجة IELTS speaking بشكل أسرع",
    intro: "ابدأ مجانًا، شاهد درجتك أولًا، ثم افتح الملاحظات الكاملة ووقتًا يوميًا أكبر وتدفق IELTS أقوى.",
    launchOffer: "عرض الإطلاق",
    bestFor: "الأفضل لـ",
    bestForValue: "تحسين IELTS اليومي",
    corePromise: "الوعد الأساسي",
    corePromiseValue: "ملاحظات كاملة بعد كل محاولة",
    price: "السعر",
    free: "مجاني",
    start: "ابدأ التحدث",
    faqTitle: "أسئلة الشراء الشائعة"
  },
  ja: {
    title: "IELTS Speaking料金 | 完全フィードバックとより多い練習",
    description: "FreeとPlusを比較し、完全フィードバック、bandシグナル、より多い毎日の練習時間を確認できます。",
    eyebrow: "料金",
    heading: "IELTS speakingをより速く伸ばすための料金プラン",
    intro: "まず無料で始めてスコアを確認し、その後に完全フィードバック、より多い練習時間、より強いIELTSフローを解放しましょう。",
    launchOffer: "ローンチ特典",
    bestFor: "最適な用途",
    bestForValue: "毎日のIELTSスコア改善",
    corePromise: "主な価値",
    corePromiseValue: "各挑戦後の完全フィードバック",
    price: "価格",
    free: "無料",
    start: "話し始める",
    faqTitle: "購入前によくある質問"
  },
  ko: {
    title: "IELTS Speaking 요금 | 전체 피드백과 더 많은 연습",
    description: "IELTS speaking을 위한 Free와 Plus를 비교하고 전체 피드백, band 신호, 더 많은 일일 연습 시간을 확인하세요.",
    eyebrow: "요금",
    heading: "IELTS speaking 점수를 더 빠르게 올리기 위한 요금제",
    intro: "무료로 시작해 점수를 먼저 확인한 뒤, 전체 피드백과 더 많은 일일 연습 시간, 더 강한 IELTS 흐름을 여세요.",
    launchOffer: "출시 혜택",
    bestFor: "추천 대상",
    bestForValue: "매일 IELTS 점수 향상",
    corePromise: "핵심 가치",
    corePromiseValue: "매 시도 후 전체 피드백",
    price: "가격",
    free: "무료",
    start: "말하기 시작",
    faqTitle: "구매 전 자주 묻는 질문"
  }
} as const;

function getPricingCopy(language: Language) {
  return ((pricingCopy as unknown) as Partial<Record<Language, (typeof pricingCopy)["en"]>>)[language] ?? pricingCopy.en;
}

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguage();
  const copy = getPricingCopy(language);
  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: "/pricing"
    }
  };
}

export default async function PricingPage() {
  const language = await getServerLanguage();
  const copy = getPricingCopy(language);
  const comparison = getPlanComparison(language === "tr");
  const faq = [
    {
      q: "How is Plus different from free?",
      a: "Plus increases your daily volume, gives deeper transcript and score insight, and makes retry-based improvement much easier."
    },
    {
      q: "Is this a subscription?",
      a: "Yes. SpeakAce Plus is a weekly plan built for learners who want more daily speaking practice and faster progress."
    },
    {
      q: "Who should buy Plus?",
      a: "Students preparing seriously for IELTS or TOEFL speaking, especially if they want a stronger daily feedback loop."
    }
  ];

  return (
    <>
      <MarketingSchema />
      <SiteHeader />
      <main className="page-shell section" style={{ display: "grid", gap: "1.2rem" }}>
        <div className="section-head">
          <span className="eyebrow">{copy.eyebrow}</span>
          <h1 style={{ fontSize: "clamp(2.7rem, 6vw, 5rem)", lineHeight: 0.95 }}>
            {copy.heading}
          </h1>
          <p>{copy.intro}</p>
        </div>

        <div className="stats-strip">
          <div className="card stat-strip-card">
            <div className="practice-meta">{copy.launchOffer}</div>
            <strong>{couponCatalog.LAUNCH20.code}</strong>
          </div>
          <div className="card stat-strip-card">
            <div className="practice-meta">{copy.bestFor}</div>
            <strong>{copy.bestForValue}</strong>
          </div>
          <div className="card stat-strip-card">
            <div className="practice-meta">{copy.corePromise}</div>
            <strong>{copy.corePromiseValue}</strong>
          </div>
          <div className="card stat-strip-card">
            <div className="practice-meta">{copy.price}</div>
            <strong>{commerceConfig.plusMonthlyPrice}/week</strong>
          </div>
        </div>

        <div className="marketing-grid">
          <article className="card pricing-card">
            <h3>{copy.free}</h3>
            <div className="price-tag">$0</div>
            <ul>
              <li>4 daily speaking sessions</li>
              <li>8 daily speaking minutes</li>
              <li>Starter score view and limited feedback</li>
            </ul>
            <Link className="button button-secondary" href="/auth">
              {copy.start}
            </Link>
          </article>

          <article className="card pricing-card" data-featured="true">
            <h3>{commerceConfig.plusPlanName}</h3>
            <div className="price-tag">{commerceConfig.plusMonthlyPrice}</div>
            <ul>
              <li>18 daily sessions</li>
              <li>35 daily speaking minutes</li>
              <li>Full feedback after each speaking attempt</li>
              <li>Expanded IELTS-style score insight</li>
              <li>Unlimited-feeling retry and improvement workflow</li>
              <li>Built for serious exam score growth</li>
            </ul>
            <a className="button button-primary" href={buildPlanCheckoutPath({ coupon: couponCatalog.LAUNCH20.code, campaign: "pricing_hero" })}>
              Unlock full feedback
            </a>
            <div className="practice-meta">Try coupon: {couponCatalog.LAUNCH20.code}</div>
          </article>
        </div>

        <div className="marketing-grid">
          {Object.values(couponCatalog).map((coupon) => (
            <article key={coupon.code} className="card feature-card">
              <div className="pill" style={{ marginBottom: "0.8rem" }}>Launch coupon</div>
              <h3>{coupon.label}</h3>
              <p>{coupon.description}</p>
              <a className="button button-secondary" href={buildPlanCheckoutPath({ coupon: coupon.code, campaign: "pricing_coupon" })}>
                Use {coupon.code}
              </a>
            </article>
          ))}
        </div>

        <div className="marketing-grid">
          {[
            {
              title: "What students pay for",
              description:
                "Not just AI output. They pay for a faster loop: speak, score, fix mistakes, retry, and track score movement without waiting."
            },
            {
              title: "Why teachers like the product",
              description:
                "The same plan lets teachers show visible score movement while students keep practicing between lessons."
            },
            {
              title: "Why Plus converts better than a generic plan",
              description:
                "It is tied to clear outcomes: more speaking, more feedback, stronger scoring insight, and less friction."
            }
          ].map((item) => (
            <article key={item.title} className="card testimonial-card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>

        <div className="card comparison-card">
          <h2 style={{ marginBottom: "0.9rem" }}>Free vs Plus</h2>
          <div className="comparison-table">
            <div className="comparison-head">Feature</div>
            <div className="comparison-head">Free</div>
            <div className="comparison-head">Plus</div>
            {comparison.map((item) => (
              <>
                <div key={`${item.label}-label`} className="comparison-cell comparison-label">{item.label}</div>
                <div key={`${item.label}-free`} className="comparison-cell">{item.free}</div>
                <div key={`${item.label}-plus`} className="comparison-cell">{item.plus}</div>
              </>
            ))}
          </div>
        </div>

        <div className="marketing-grid">
          <article className="card feature-card">
            <h3>Why Plus pays for itself</h3>
            <p>One private lesson can cost more than a full week of repeatable speaking practice, scoring, and feedback.</p>
          </article>
          <article className="card feature-card">
            <h3>Built for score movement</h3>
            <p>Plus is not only more usage. It is a better score-improvement loop: more attempts, deeper review, stronger retries, and clearer progress tracking.</p>
          </article>
          <article className="card feature-card">
            <h3>Start free, upgrade when ready</h3>
            <p>The free plan is enough to see your score and try the workflow. Plus is there when you want full feedback and more daily volume.</p>
          </article>
        </div>

        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem" }}>
          <span className="eyebrow">FAQ</span>
          <h2 style={{ margin: 0 }}>{copy.faqTitle}</h2>
          <div className="marketing-grid">
            {faq.map((item) => (
              <article key={item.q} className="card feature-card">
                <h3>{item.q}</h3>
                <p>{item.a}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="card institution-cta">
          <div>
            <span className="eyebrow">After purchase</span>
            <h2 style={{ margin: "0.8rem 0 0.5rem" }}>Already paid? Check your Plus status.</h2>
            <p className="practice-copy">
              If your plan does not refresh instantly, the billing success screen can re-check your
              plan and pull the new status into your account.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <Link className="button button-primary" href="/app/billing/success">
              Open billing status
            </Link>
            <a className="button button-secondary" href={buildPlanCheckoutPath({ coupon: couponCatalog.LAUNCH20.code, campaign: "pricing_bottom" })}>
              Buy Plus
            </a>
            <Link className="button button-secondary" href="/reviews">
              Read reviews
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
