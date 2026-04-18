import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock3, GraduationCap, School, TrendingUp } from "lucide-react";
import { MarketingSchema } from "@/components/marketing-schema";
import { PricingCards } from "@/components/pricing-cards";
import { TrackedLink } from "@/components/tracked-link";
import { buildPlanCheckoutPath, commerceConfig, couponCatalog, getPlanComparison } from "@/lib/commerce";
import type { Language } from "@/lib/copy";
import { getServerLanguage } from "@/lib/language";
import { buildFaqJsonLd, jsonLdToHtml } from "@/lib/structured-data";

const pricingCopy = {
  en: {
    title: "IELTS Speaking Pricing | SpeakAce",
    description:
      "Compare IELTS speaking pricing, full feedback, AI band scoring, and weekly Plus value. Start free with no card ->",
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
    decisionEyebrow: "Buying clarity",
    decisionTitle: "Choose the plan by the kind of progress you want",
    decisionSubtitle: "The strongest pricing pages do not just list features. They explain which workflow you are actually buying.",
    decisionCards: [
      {
        icon: GraduationCap,
        title: "Free",
        body: "Best if you want to test the scoring flow, see your transcript, and confirm the product fits your exam prep style.",
        fit: "Use this if you are still evaluating the workflow."
      },
      {
        icon: TrendingUp,
        title: "Plus",
        body: "Best if you want daily speaking volume, deeper feedback, and a retry loop strong enough to move your score faster.",
        fit: "Use this if you want steady band improvement without expensive tutoring."
      },
      {
        icon: School,
        title: "Pro",
        body: "Best if you need maximum volume, stronger tracking, and a plan that supports heavier practice or coaching workflows.",
        fit: "Use this if speaking practice is already a serious weekly routine."
      }
    ],
    roiEyebrow: "Why it pays off",
    roiTitle: "What you are really paying for is repetition with useful feedback",
    roiPoints: [
      "One weak answer becomes a scored retry instead of a dead end.",
      "Daily volume makes improvement measurable instead of random.",
      "Full transcript review shows exactly why the score is stuck.",
      "The plan costs less than relying only on private speaking lessons."
    ],
    checkoutEyebrow: "Before checkout",
    checkoutTitle: "What happens after you upgrade",
    checkoutSteps: [
      "You keep the same account and unlock more daily speaking volume.",
      "Billing success refreshes your plan automatically inside SpeakAce.",
      "Your next practice session opens with the upgraded feedback flow."
    ],
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
    decisionEyebrow: "Satın alma netliği",
    decisionTitle: "Planı, istediğin gelişim biçimine göre seç",
    decisionSubtitle: "Güçlü fiyat sayfaları sadece özellik saymaz. Aslında hangi çalışma akışını satın aldığını da açıklar.",
    decisionCards: [
      {
        icon: GraduationCap,
        title: "Ücretsiz",
        body: "Skorlama akışını görmek, transcript’i incelemek ve ürünün çalışma tarzına uyup uymadığını anlamak için uygun.",
        fit: "Önce ürünü ve akışı değerlendirmek istiyorsan bunu kullan."
      },
      {
        icon: TrendingUp,
        title: "Plus",
        body: "Günlük speaking hacmi, daha derin geri bildirim ve skoru daha hızlı hareket ettiren retry döngüsü isteyenler için uygun.",
        fit: "Pahalı özel ders olmadan düzenli band gelişimi istiyorsan bunu kullan."
      },
      {
        icon: School,
        title: "Pro",
        body: "Daha yüksek hacim, daha güçlü takip ve yoğun pratik ya da koçluk akışı isteyen kullanıcılar için uygun.",
        fit: "Speaking pratiği zaten ciddi bir haftalık rutine dönüştüyse bunu kullan."
      }
    ],
    roiEyebrow: "Neden karşılığını verir",
    roiTitle: "Aslında satın aldığın şey, faydalı geri bildirimle tekrar edebilmek",
    roiPoints: [
      "Zayıf bir cevap çıkmaz sokak olmak yerine skorlu bir retry denemesine dönüşür.",
      "Günlük hacim sayesinde gelişim rastgele değil ölçülebilir olur.",
      "Tam transcript incelemesi skorun neden takıldığını net gösterir.",
      "Plan, sadece özel dersle ilerlemeye kıyasla çok daha düşük maliyetlidir."
    ],
    checkoutEyebrow: "Checkout öncesi",
    checkoutTitle: "Yükselttikten sonra ne olur",
    checkoutSteps: [
      "Aynı hesapla devam eder ve daha yüksek günlük speaking hacmini açarsın.",
      "Billing success ekranı planını SpeakAce içinde otomatik yeniler.",
      "Sonraki practice oturumun yükseltilmiş geri bildirim akışıyla açılır."
    ],
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
  const faqJsonLd = buildFaqJsonLd(faq.map((item) => ({ question: item.q, answer: item.a })));

  return (
    <>
      <MarketingSchema />
      <main className="page-shell section" style={{ display: "grid", gap: "1.2rem" }}>
        <div className="section-head">
          <span className="eyebrow">{copy.eyebrow}</span>
          <h1 style={{ fontSize: "clamp(2.7rem, 6vw, 5rem)", lineHeight: 0.95 }}>
            {copy.heading}
          </h1>
          <p>{copy.intro}</p>
        </div>

        <div className="marketing-grid">
          {[
            {
              title: "Band score confidence without private lesson pricing",
              body: "I liked seeing the score estimate first and then unlocking full feedback only when I wanted deeper review."
            },
            {
              title: "A simpler weekly plan for daily speaking practice",
              body: "The weekly price feels easier to try than a larger upfront monthly commitment, especially for test preparation."
            },
            {
              title: "Useful if you want feedback between real lessons",
              body: "The transcript plus retry loop gives enough structure to keep speaking active even outside tutoring sessions."
            }
          ].map((item) => (
            <article key={item.title} className="card testimonial-card">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>

        <div className="card" style={{ padding: "1.4rem", display: "grid", gap: "1.1rem" }}>
          <div className="section-head" style={{ gap: "0.35rem", marginBottom: 0 }}>
            <span className="eyebrow">{copy.decisionEyebrow}</span>
            <h2 style={{ margin: 0 }}> {copy.decisionTitle}</h2>
            <p style={{ margin: 0 }}>{copy.decisionSubtitle}</p>
          </div>
          <div className="marketing-grid">
            {copy.decisionCards.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="card feature-card" style={{ padding: "1.3rem" }}>
                  <div
                    style={{
                      width: "2.8rem",
                      height: "2.8rem",
                      borderRadius: "14px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(217, 93, 57, 0.10)",
                      color: "var(--accent)",
                      marginBottom: "0.85rem"
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                  <p className="practice-copy" style={{ marginTop: "0.6rem", fontWeight: 600 }}>
                    {item.fit}
                  </p>
                </article>
              );
            })}
          </div>
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
            <strong>{commerceConfig.plusMonthlyPrice}/week = ~$16/month</strong>
          </div>
        </div>

        <div className="card quick-pitch">
          <h2 style={{ marginBottom: "0.6rem" }}>One private IELTS lesson = $30–80. SpeakAce Plus = $3.99/week.</h2>
          <p className="practice-copy">
            If you want more than one speaking attempt per week, a structured AI review loop is much cheaper than relying only on private tutoring.
          </p>
        </div>

        <div className="marketing-grid">
          <article className="card feature-card" style={{ padding: "1.4rem" }}>
            <span className="eyebrow">{copy.roiEyebrow}</span>
            <h2 style={{ margin: "0.45rem 0 0.8rem" }}>{copy.roiTitle}</h2>
            <div style={{ display: "grid", gap: "0.8rem" }}>
              {copy.roiPoints.map((item) => (
                <div key={item} style={{ display: "flex", gap: "0.7rem", alignItems: "flex-start" }}>
                  <CheckCircle2 size={18} style={{ color: "var(--accent)", flexShrink: 0, marginTop: "0.15rem" }} />
                  <p style={{ margin: 0 }}>{item}</p>
                </div>
              ))}
            </div>
          </article>
          <article className="card feature-card" style={{ padding: "1.4rem" }}>
            <span className="eyebrow">{copy.checkoutEyebrow}</span>
            <h2 style={{ margin: "0.45rem 0 0.8rem" }}>{copy.checkoutTitle}</h2>
            <div style={{ display: "grid", gap: "0.85rem" }}>
              {copy.checkoutSteps.map((item, index) => (
                <div key={item} style={{ display: "flex", gap: "0.8rem", alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: "1.7rem",
                      height: "1.7rem",
                      borderRadius: "999px",
                      background: "rgba(27, 111, 117, 0.12)",
                      color: "var(--primary)",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: "0.1rem"
                    }}
                  >
                    {index + 1}
                  </div>
                  <p style={{ margin: 0 }}>{item}</p>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: "1rem",
                padding: "0.95rem 1rem",
                borderRadius: "16px",
                background: "rgba(255, 248, 242, 0.88)",
                border: "1px solid rgba(217, 93, 57, 0.16)"
              }}
            >
              <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", marginBottom: "0.35rem" }}>
                <Clock3 size={17} style={{ color: "var(--accent)" }} />
                <strong>Fastest path</strong>
              </div>
              <p style={{ margin: 0 }}>
                Start on free, confirm the workflow, then upgrade the moment you want more daily volume and stronger retry feedback.
              </p>
            </div>
          </article>
        </div>

        <PricingCards />

        <div className="marketing-grid">
          {Object.values(couponCatalog).map((coupon) => (
            <article key={coupon.code} className="card feature-card">
              <div className="pill" style={{ marginBottom: "0.8rem" }}>Launch coupon</div>
              <h3>{coupon.label}</h3>
              <p>{coupon.description}</p>
              <TrackedLink
                className="button button-secondary"
                href={buildPlanCheckoutPath({ coupon: coupon.code, campaign: "pricing_coupon" })}
                analyticsEvent="checkout_cta_click"
                analyticsPath={`/pricing/coupon/${coupon.code}`}
                gaEvent="begin_checkout"
                gaParams={{
                  currency: "USD",
                  value: 3.99,
                  coupon: coupon.code,
                  items: [{ item_id: "plus_weekly", item_name: "SpeakAce Plus - Weekly", price: 3.99, quantity: 1 }]
                }}
              >
                Use {coupon.code}
              </TrackedLink>
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
          <h2 style={{ marginBottom: "0.9rem" }}>Free vs Plus vs Pro</h2>
          <div className="comparison-table" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
            <div className="comparison-head">Feature</div>
            <div className="comparison-head">Free</div>
            <div className="comparison-head">Plus</div>
            <div className="comparison-head" style={{ color: "#b38600" }}>Pro</div>
            {comparison.map((item) => (
              <>
                <div key={`${item.label}-label`} className="comparison-cell comparison-label">{item.label}</div>
                <div key={`${item.label}-free`} className="comparison-cell">{item.free}</div>
                <div key={`${item.label}-plus`} className="comparison-cell">{item.plus}</div>
                <div key={`${item.label}-pro`} className="comparison-cell" style={{ fontWeight: 600, color: "#b38600" }}>
                  {item.label.toLowerCase().includes("session") ? "40" :
                   item.label.toLowerCase().includes("minute") || item.label.toLowerCase().includes("speaking") ? "90 min" :
                   item.label.toLowerCase().includes("feedback") ? "Advanced" :
                   "Full + trends"}
                </div>
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
            <TrackedLink
              className="button button-secondary"
              href={buildPlanCheckoutPath({ plan: "plus", coupon: couponCatalog.LAUNCH20.code, campaign: "pricing_bottom" })}
              analyticsEvent="checkout_cta_click"
              analyticsPath="/pricing/bottom/plus"
              gaEvent="begin_checkout"
              gaParams={{
                currency: "USD",
                value: 3.99,
                coupon: couponCatalog.LAUNCH20.code,
                items: [{ item_id: "plus_weekly", item_name: "SpeakAce Plus - Weekly", price: 3.99, quantity: 1 }]
              }}
            >
              Buy Plus
            </TrackedLink>
            <TrackedLink
              className="button button-secondary"
              href={buildPlanCheckoutPath({ plan: "pro", campaign: "pricing_bottom_pro" })}
              analyticsEvent="checkout_cta_click"
              analyticsPath="/pricing/bottom/pro"
              gaEvent="begin_checkout"
              gaParams={{
                currency: "USD",
                value: 9.99,
                items: [{ item_id: "pro_monthly", item_name: "SpeakAce Pro - Monthly", price: 9.99, quantity: 1 }]
              }}
              style={{ borderColor: "#c9a227", color: "#b38600" }}
            >
              Get Pro
            </TrackedLink>
            <Link className="button button-secondary" href="/reviews">
              Read reviews
            </Link>
          </div>
        </div>

        <div className="pricing-mobile-cta">
          <TrackedLink
            className="button button-primary"
            href="/app/practice?quickStart=1"
            analyticsEvent="pricing_cta_click"
            analyticsPath="/pricing/mobile-start-free"
            gaEvent="select_content"
            gaParams={{ content_type: "pricing_cta", item_id: "pricing_mobile_start_free", destination: "/app/practice?quickStart=1" }}
          >
            Start free — no card needed
          </TrackedLink>
        </div>
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdToHtml(faqJsonLd) }} />
    </>
  );
}
