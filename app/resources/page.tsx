import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { LeadCaptureForm } from "@/components/lead-capture-form";
import { SiteHeader } from "@/components/site-header";
import { getBlogChromeCopy, getLocalizedBlogPosts } from "@/lib/blog-content";
import type { Language } from "@/lib/copy";
import { getServerLanguage } from "@/lib/language";
import { siteConfig } from "@/lib/site";

const resourcesCopy = {
  en: {
    metaTitle: "IELTS Speaking Resources | SpeakAce",
    metaDescription:
      "Explore IELTS speaking resources, topic guides, band score strategy, and AI practice content. Start speaking free ->",
    ogTitle: "IELTS Speaking Resources | SpeakAce",
    ogDescription:
      "A resource hub for IELTS speaking practice, band score guidance, topic ideas, and task-specific improvement.",
    eyebrow: "Resources",
    heading: "IELTS speaking resources, guides, and practice ideas",
    intro:
      "Explore topic pages, band score guides, sample answers, and practical articles that help you move from reading into real speaking practice.",
    collectionsEyebrow: "Collections",
    collectionsTitle: "Start with the content format that fits your goal",
    exploreCollection: "Explore collection",
    resourceBadge: "Resource",
    openGuide: "Open guide",
    topicEyebrow: "Topic of the day",
    topicTitle: "One easy prompt to pull visitors into practice",
    topicText:
      "A simple daily topic works well because it gives people a low-friction reason to record one answer and see the transcript.",
    openTopic: "Open topic page",
    startFree: "Start free practice",
    freeChecklistEyebrow: "Free checklist",
    freeChecklistTitle: "Give new visitors one easy reason to stay",
    freeChecklistText:
      "A free checklist and welcome email create a softer first conversion for visitors who are not ready to buy yet.",
    readingPathsEyebrow: "Reading paths",
    readingPathsTitle: "Popular articles readers usually open first",
    readingPathsText:
      "Strong resource hubs usually give visitors a simple first path instead of showing an endless wall of links.",
    openAllArticles: "Open all articles"
  },
  tr: {
    metaTitle: "IELTS Speaking Kaynakları",
    metaDescription:
      "Skoru ve akıcılığı geliştirmek için hazırlanan IELTS speaking kaynaklarını, konu rehberlerini ve band stratejilerini keşfedin.",
    ogTitle: "IELTS Speaking Kaynakları | SpeakAce",
    ogDescription:
      "IELTS speaking pratiği, band skoru rehberleri, konu fikirleri ve görev bazlı gelişim için kaynak merkezi.",
    eyebrow: "Kaynaklar",
    heading: "IELTS speaking kaynakları, rehberler ve çalışma fikirleri",
    intro:
      "Konu sayfaları, band skoru rehberleri, örnek cevaplar ve okumayı gerçek speaking pratiğine bağlayan yararlı içerikleri keşfet.",
    collectionsEyebrow: "Koleksiyonlar",
    collectionsTitle: "Hedefine uyan içerik türüyle başla",
    exploreCollection: "Koleksiyonu aç",
    resourceBadge: "Kaynak",
    openGuide: "Rehberi aç",
    topicEyebrow: "Günün konusu",
    topicTitle: "Ziyaretçiyi pratiğe çeken kolay bir prompt",
    topicText:
      "Basit bir günlük konu, kullanıcıya düşük sürtünmeyle bir cevap kaydedip transcript görmesi için net bir sebep verir.",
    openTopic: "Konu sayfasını aç",
    startFree: "Ücretsiz pratiğe başla",
    freeChecklistEyebrow: "Ücretsiz kontrol listesi",
    freeChecklistTitle: "Yeni ziyaretçiye kalması için kolay bir sebep ver",
    freeChecklistText:
      "Ücretsiz kontrol listesi ve karşılama e-postası, hemen satın almaya hazır olmayan ziyaretçi için daha yumuşak bir ilk dönüşüm oluşturur.",
    readingPathsEyebrow: "Okuma yolları",
    readingPathsTitle: "Ziyaretçilerin önce açtığı popüler yazılar",
    readingPathsText:
      "Güçlü kaynak merkezleri ziyaretçiye sonsuz bağlantı yerine basit bir ilk yol sunar.",
    openAllArticles: "Tüm yazıları aç"
  },
  de: {
    metaTitle: "IELTS-Speaking-Ressourcen",
    metaDescription: "Entdecke IELTS-Speaking-Ressourcen, Themenleitfäden, Band-Strategien und praktische Übungsinhalte.",
    ogTitle: "IELTS-Speaking-Ressourcen | SpeakAce",
    ogDescription: "Ein Ressourcen-Hub für IELTS-Speaking-Praxis, Band-Strategien und Themenideen.",
    eyebrow: "Ressourcen",
    heading: "IELTS-Speaking-Ressourcen, Leitfäden und Übungsideen",
    intro: "Entdecke Themen-Seiten, Band-Leitfäden, Beispielantworten und praktische Artikel für echte Speaking-Praxis.",
    collectionsEyebrow: "Sammlungen",
    collectionsTitle: "Beginne mit dem Format, das zu deinem Ziel passt",
    exploreCollection: "Sammlung öffnen",
    resourceBadge: "Ressource",
    openGuide: "Leitfaden öffnen",
    topicEyebrow: "Thema des Tages",
    topicTitle: "Ein einfacher Prompt für den Einstieg",
    topicText: "Ein tägliches Thema gibt Besuchern einen schnellen Grund, eine Antwort aufzunehmen und das Transcript zu sehen.",
    openTopic: "Themenseite öffnen",
    startFree: "Kostenlos starten",
    freeChecklistEyebrow: "Gratis-Checkliste",
    freeChecklistTitle: "Gib neuen Besuchern einen leichten Grund zu bleiben",
    freeChecklistText: "Eine kostenlose Checkliste und eine Willkommensmail sorgen für eine weichere erste Conversion.",
    readingPathsEyebrow: "Lesepfade",
    readingPathsTitle: "Beliebte Artikel für den Einstieg",
    readingPathsText: "Starke Ressourcen-Hubs führen Besucher mit einem einfachen ersten Pfad statt mit einer Linkwand.",
    openAllArticles: "Alle Artikel öffnen"
  },
  fr: {
    metaTitle: "Ressources IELTS Speaking",
    metaDescription: "Découvrez des ressources IELTS speaking, des guides, des stratégies de score et des idées de pratique.",
    ogTitle: "Ressources IELTS Speaking | SpeakAce",
    ogDescription: "Un hub de ressources pour pratiquer l’IELTS speaking et progresser plus clairement.",
    eyebrow: "Ressources",
    heading: "Ressources, guides et idées de pratique pour l’IELTS speaking",
    intro: "Explorez des pages thématiques, des guides de score, des réponses modèles et des articles pratiques reliés à la vraie pratique orale.",
    collectionsEyebrow: "Collections",
    collectionsTitle: "Commencez avec le format qui correspond à votre objectif",
    exploreCollection: "Ouvrir la collection",
    resourceBadge: "Ressource",
    openGuide: "Ouvrir le guide",
    topicEyebrow: "Sujet du jour",
    topicTitle: "Un prompt simple pour entrer dans la pratique",
    topicText: "Un sujet quotidien donne une raison rapide d’enregistrer une réponse et de voir le transcript.",
    openTopic: "Ouvrir le sujet",
    startFree: "Commencer gratuitement",
    freeChecklistEyebrow: "Checklist gratuite",
    freeChecklistTitle: "Donnez une raison simple de rester",
    freeChecklistText: "Une checklist gratuite et un email d’accueil créent une première conversion plus douce.",
    readingPathsEyebrow: "Parcours de lecture",
    readingPathsTitle: "Articles populaires pour commencer",
    readingPathsText: "Un bon hub de ressources guide le visiteur avec un premier chemin simple.",
    openAllArticles: "Ouvrir tous les articles"
  },
  nl: {
    metaTitle: "IELTS-Speaking-bronnen",
    metaDescription: "Ontdek IELTS-speaking-bronnen, themagidsen, scorestrategieën en praktische oefeninhoud.",
    ogTitle: "IELTS-Speaking-bronnen | SpeakAce",
    ogDescription: "Een bronnenhub voor IELTS-speaking-oefening, band-strategie en onderwerpideeën.",
    eyebrow: "Bronnen",
    heading: "IELTS-speaking-bronnen, gidsen en oefenideeën",
    intro: "Ontdek onderwerp-pagina's, scoregidsen, voorbeeldantwoorden en praktische artikelen voor echte speaking-oefening.",
    collectionsEyebrow: "Collecties",
    collectionsTitle: "Begin met het format dat bij je doel past",
    exploreCollection: "Collectie openen",
    resourceBadge: "Bron",
    openGuide: "Gids openen",
    topicEyebrow: "Onderwerp van de dag",
    topicTitle: "Een makkelijke prompt om te beginnen",
    topicText: "Een eenvoudig dagelijks onderwerp geeft bezoekers een snelle reden om één antwoord op te nemen en het transcript te zien.",
    openTopic: "Onderwerppagina openen",
    startFree: "Gratis starten",
    freeChecklistEyebrow: "Gratis checklist",
    freeChecklistTitle: "Geef nieuwe bezoekers een makkelijke reden om te blijven",
    freeChecklistText: "Een gratis checklist en welkomstmail zorgen voor een zachtere eerste conversie.",
    readingPathsEyebrow: "Leesroutes",
    readingPathsTitle: "Populaire artikelen om mee te beginnen",
    readingPathsText: "Sterke bronnenhubs geven bezoekers een simpele eerste route in plaats van een muur van links.",
    openAllArticles: "Alle artikelen openen"
  }
} as const;

function getResourcesCopy(language: Language) {
  return ((resourcesCopy as unknown) as Partial<Record<Language, (typeof resourcesCopy)["en"]>>)[language] ?? resourcesCopy.en;
}

const resourceCards: Array<{
  href: Route;
  title: string;
  description: string;
}> = [
  {
    href: "/ielts-speaking-topics",
    title: "IELTS speaking topics",
    description: "Topic-led practice ideas for students who search by theme before they practice."
  },
  {
    href: "/ielts-band-score-guide",
    title: "IELTS band score guide",
    description: "A practical guide to what moves a speaking answer closer to a higher band score."
  },
  {
    href: "/ielts-speaking-part-1-questions",
    title: "IELTS Part 1 questions",
    description: "Faster answer patterns for short questions, fluency, and natural openings."
  },
  {
    href: "/ielts-speaking-part-2-topics",
    title: "IELTS Part 2 topics",
    description: "Cue-card strategy, idea planning, and story flow for stronger long turns."
  },
  {
    href: "/ielts-speaking-part-3-questions",
    title: "IELTS Part 3 questions",
    description: "More structured discussion answers with clearer examples and deeper thinking."
  },
  {
    href: "/english-speaking-confidence",
    title: "Speaking confidence",
    description: "Confidence-building guidance for learners who want calmer, clearer speaking."
  },
  {
    href: "/free-ielts-speaking-test",
    title: "Free IELTS speaking test",
    description: "A simple entry point for visitors who want to try the product before paying."
  },
  {
    href: "/weekly-ielts-speaking-challenge",
    title: "Weekly IELTS speaking challenge",
    description: "A habit-based challenge page that gives visitors a repeatable reason to return."
  },
  {
    href: "/ielts-speaking-sample-answers",
    title: "IELTS speaking sample answers",
    description: "A practical bridge between answer examples and real speaking practice."
  },
  {
    href: "/compare",
    title: "Compare speaking tools",
    description: "Comparison pages that target visitors who are already evaluating products."
  },
  {
    href: "/tools",
    title: "Free IELTS speaking tools",
    description: "Simple calculators, generators, and practice helpers learners can use before full speaking sessions."
  },
  {
    href: "/guides",
    title: "IELTS speaking guides",
    description: "Improvement-focused guide pages for fluency, structure, vocabulary, and pronunciation."
  }
];

const featuredCollections: Array<{
  title: string;
  description: string;
  href: Route;
}> = [
  {
    title: "Guides and strategy",
    description: "Clear articles for band score improvement, fluency, structure, and pronunciation.",
    href: "/guides"
  },
  {
    title: "Sample answers and topics",
    description: "Part 1, Part 2, and Part 3 practice content with usable answer ideas.",
    href: "/ielts-speaking-sample-answers"
  },
  {
    title: "Free tools and generators",
    description: "Simple tools learners can use before they move into full speaking practice.",
    href: "/tools"
  },
  {
    title: "Practice and comparison pages",
    description: "Free test flows, weekly challenge pages, and product comparisons for learners exploring options.",
    href: "/compare"
  }
];

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguage();
  const copy = getResourcesCopy(language);
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: {
      canonical: "/resources"
    },
    openGraph: {
      title: copy.ogTitle,
      description: copy.ogDescription,
      url: `${siteConfig.domain}/resources`,
      siteName: siteConfig.name,
      type: "website"
    }
  };
}

export default async function ResourcesPage() {
  const language = await getServerLanguage();
  const copy = getResourcesCopy(language);
  const chrome = getBlogChromeCopy(language);
  const blogPosts = getLocalizedBlogPosts(language);
  const featuredArticle = blogPosts[0];
  const popularArticles = blogPosts.slice(1, 7);
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "SpeakAce Resources",
    url: `${siteConfig.domain}/resources`
  };

  return (
    <>
      <SiteHeader />
      <main className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">{copy.eyebrow}</span>
          <h1 style={{ fontSize: "clamp(2.8rem, 6vw, 4.8rem)", lineHeight: 0.96 }}>
            {copy.heading}
          </h1>
          <p>{copy.intro}</p>
        </div>

        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="section-head">
            <span className="eyebrow">{copy.collectionsEyebrow}</span>
            <h2>{copy.collectionsTitle}</h2>
          </div>
          <div className="marketing-grid">
            {featuredCollections.map((collection) => (
              <article key={collection.href} className="card feature-card">
                <h3>{collection.title}</h3>
                <p>{collection.description}</p>
                <Link className="button button-secondary" href={collection.href}>
                  {copy.exploreCollection}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="card institution-cta">
            <div>
              <span className="eyebrow">{chrome.cta.featured}</span>
              <h2 style={{ margin: "0.8rem 0 0.5rem" }}>{featuredArticle.title}</h2>
              <p className="practice-copy">{featuredArticle.description}</p>
            </div>
            <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
              <Link className="button button-primary" href={`/blog/${featuredArticle.slug}`}>
                {chrome.cta.read}
              </Link>
              <Link className="button button-secondary" href="/blog">
                {chrome.cta.blog}
              </Link>
            </div>
          </div>
        </section>

        <div className="marketing-grid">
          {resourceCards.map((card) => (
            <article key={card.href} className="card feature-card">
              <div className="pill" style={{ marginBottom: "0.8rem" }}>{copy.resourceBadge}</div>
              <h2 style={{ fontSize: "1.4rem" }}>{card.title}</h2>
              <p>{card.description}</p>
              <Link className="button button-primary" href={card.href}>
                {copy.openGuide}
              </Link>
            </article>
          ))}
        </div>

        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="section-head">
            <span className="eyebrow">{copy.topicEyebrow}</span>
            <h2>{copy.topicTitle}</h2>
          </div>
          <div className="card institution-cta">
            <div>
              <h2 style={{ margin: "0 0 0.5rem" }}>Describe a useful object you use often</h2>
              <p className="practice-copy">{copy.topicText}</p>
            </div>
            <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
              <Link className="button button-primary" href="/ielts-speaking-topics/describe-a-useful-object">
                {copy.openTopic}
              </Link>
              <Link className="button button-secondary" href="/app/practice">
                {copy.startFree}
              </Link>
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="card lead-capture-card">
            <div>
              <span className="eyebrow">{copy.freeChecklistEyebrow}</span>
              <h2 style={{ margin: "0.8rem 0 0.5rem" }}>{copy.freeChecklistTitle}</h2>
              <p className="practice-copy">{copy.freeChecklistText}</p>
            </div>
            <div className="lead-capture-actions">
              <LeadCaptureForm source="resources_lead" />
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="section-head">
            <span className="eyebrow">{copy.readingPathsEyebrow}</span>
            <h2>{copy.readingPathsTitle}</h2>
            <p>{copy.readingPathsText}</p>
          </div>
          <div className="marketing-grid">
            {popularArticles.map((post) => (
              <article key={post.slug} className="card feature-card">
                <div className="pill" style={{ marginBottom: "0.8rem" }}>Article</div>
                <h3>{post.title}</h3>
                <p>{post.description}</p>
                <Link className="button button-secondary" href={`/blog/${post.slug}`}>
                  {chrome.cta.read}
                </Link>
              </article>
            ))}
          </div>
          <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center" }}>
            <Link className="button button-primary" href="/blog">
              {copy.openAllArticles}
            </Link>
          </div>
        </section>

        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="card institution-cta">
            <div>
              <span className="eyebrow">Next step</span>
              <h2 style={{ margin: "0.8rem 0 0.5rem" }}>Move from reading into practice</h2>
              <p className="practice-copy">
                The strongest learning path is simple: read one focused guide, try one timed
                speaking task, review the transcript, then repeat with clearer structure.
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
              <Link className="button button-secondary" href="/app/practice">
                Start practice
              </Link>
              <a className="button button-primary" href="/api/payments/lemon/checkout?plan=plus">
                Unlock Plus
              </a>
            </div>
          </div>
        </section>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
        />
      </main>
    </>
  );
}
