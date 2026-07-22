import type { Metadata, Route } from "next";
import Link from "next/link";
import { ArrowRight, BookOpenText, Compass, Library } from "lucide-react";
import { AdSenseUnit } from "@/components/adsense-unit";
import { BlogLibrary, type BlogLibraryPost } from "@/components/blog-library";
import { getBlogChromeCopy, getFeaturedBlogPosts } from "@/lib/blog-content";
import { getBlogPublicDescription, getBlogPublicTitle } from "@/lib/blog-seo";
import { normalizePublicLanguage, type PublicLanguage } from "@/lib/copy";
import { getServerLanguage } from "@/lib/language";
import { listPublishedCustomBlogPosts } from "@/lib/server/custom-blog";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

const blogIndexMeta = {
  en: {
    title: "IELTS & TOEFL Speaking Guides | SpeakAce",
    description: "Read IELTS and TOEFL speaking guides, sample answers, study plans, and score improvement tips."
  },
  tr: {
    title: "IELTS ve TOEFL Speaking Rehberleri | SpeakAce",
    description: "IELTS ve TOEFL speaking rehberleri, örnek cevaplar, çalışma planları ve skor artırma ipuçlarını oku."
  },
  de: {
    title: "IELTS- und TOEFL-Speaking-Leitfäden | SpeakAce",
    description: "Lies IELTS- und TOEFL-Speaking-Leitfäden, Beispielantworten, Lernpläne und Tipps zur Score-Steigerung."
  },
  es: {
    title: "Guías de IELTS y TOEFL Speaking | SpeakAce",
    description: "Lee guías de IELTS y TOEFL speaking, respuestas modelo, planes de estudio y consejos para subir tu puntuación."
  },
  fr: {
    title: "Guides IELTS et TOEFL Speaking | SpeakAce",
    description: "Lisez des guides IELTS et TOEFL speaking, des réponses modèles, des plans d’étude et des conseils pour progresser."
  },
  it: {
    title: "Guide di IELTS e TOEFL Speaking | SpeakAce",
    description: "Leggi guide di IELTS e TOEFL speaking, risposte modello, piani di studio e consigli per aumentare il punteggio."
  },
  pt: {
    title: "Guias de IELTS e TOEFL Speaking | SpeakAce",
    description: "Leia guias de IELTS e TOEFL speaking, respostas modelo, planos de estudo e dicas para melhorar sua pontuação."
  },
  nl: {
    title: "IELTS- en TOEFL-speakinggidsen | SpeakAce",
    description: "Lees IELTS- en TOEFL-speakinggidsen, voorbeeldantwoorden, studieplannen en tips om je score te verhogen."
  },
  pl: {
    title: "Przewodniki IELTS i TOEFL Speaking | SpeakAce",
    description: "Czytaj przewodniki IELTS i TOEFL speaking, przykładowe odpowiedzi, plany nauki i wskazówki poprawiające wynik."
  },
  ru: {
    title: "Гайды по IELTS и TOEFL Speaking | SpeakAce",
    description: "Читайте гайды по IELTS и TOEFL speaking, примеры ответов, планы подготовки и советы по росту балла."
  },
  ar: {
    title: "أدلة IELTS وTOEFL Speaking | SpeakAce",
    description: "اقرأ أدلة IELTS وTOEFL speaking ونماذج الإجابات وخطط الدراسة ونصائح رفع الدرجة."
  },
  ja: {
    title: "IELTS・TOEFL Speaking ガイド | SpeakAce",
    description: "IELTS・TOEFL speaking のガイド、回答例、学習プラン、スコア向上のヒントを読めます。"
  },
  ko: {
    title: "IELTS·TOEFL Speaking 가이드 | SpeakAce",
    description: "IELTS·TOEFL speaking 가이드, 샘플 답변, 학습 계획, 점수 향상 팁을 확인하세요."
  }
} as const;

const blogIndexUi: Record<PublicLanguage, {
  eyebrow: string;
  title: string;
  description: string;
  countLabel: string;
  featuredEyebrow: string;
  featuredNote: string;
  readLabel: string;
  tracksEyebrow: string;
  tracksTitle: string;
  firstTrack: string;
  secondTrack: string;
  libraryEyebrow: string;
  libraryTitle: string;
  libraryDescription: string;
  tabLabel: string;
  searchPlaceholder: string;
  emptyLabel: string;
  showMoreLabel: string;
  categories: Record<"all" | "ielts" | "toefl" | "skills" | "strategy", string>;
}> = {
  en: {
    eyebrow: "SpeakAce field notes",
    title: "Build a better answer, one focused guide at a time.",
    description: "Practical IELTS and TOEFL speaking articles for the moment you know you need to improve, but need a clearer next move.",
    countLabel: "published guides",
    featuredEyebrow: "Start here",
    featuredNote: "A useful first read with a practical move you can apply in your next answer.",
    readLabel: "Read guide",
    tracksEyebrow: "Guided reading",
    tracksTitle: "Choose a short path instead of opening ten tabs",
    firstTrack: "Build the foundation",
    secondTrack: "Raise the score",
    libraryEyebrow: "Full archive",
    libraryTitle: "Find the guide that matches today’s problem",
    libraryDescription: "Filter the archive by exam, scoring skill, or strategy. Search for a specific topic when you already know it.",
    tabLabel: "Filter blog articles",
    searchPlaceholder: "Search the guide archive",
    emptyLabel: "No guide matches this search yet.",
    showMoreLabel: "Show more guides",
    categories: { all: "All guides", ielts: "IELTS", toefl: "TOEFL", skills: "Scoring skills", strategy: "Strategy" },
  },
  tr: {
    eyebrow: "SpeakAce saha notları",
    title: "Her seferinde tek bir odaklı rehberle daha iyi cevap kur.",
    description: "Gelişmen gerektiğini bildiğin ama sıradaki adımı netleştirmek istediğin anlar için pratik IELTS ve TOEFL speaking yazıları.",
    countLabel: "yayınlanmış rehber",
    featuredEyebrow: "Buradan başla",
    featuredNote: "Sıradaki cevabında uygulayabileceğin net bir hamle sunan faydalı bir ilk okuma.",
    readLabel: "Rehberi oku",
    tracksEyebrow: "Yönlendirilmiş okuma",
    tracksTitle: "On sekme açmak yerine kısa bir yol seç",
    firstTrack: "Temeli kur",
    secondTrack: "Skoru yükselt",
    libraryEyebrow: "Tüm arşiv",
    libraryTitle: "Bugünkü problemine uyan rehberi bul",
    libraryDescription: "Arşivi sınav, puanlama becerisi veya stratejiye göre filtrele. Konuyu biliyorsan doğrudan ara.",
    tabLabel: "Blog yazılarını filtrele",
    searchPlaceholder: "Rehber arşivinde ara",
    emptyLabel: "Bu aramayla eşleşen bir rehber henüz yok.",
    showMoreLabel: "Daha fazla rehber göster",
    categories: { all: "Tüm rehberler", ielts: "IELTS", toefl: "TOEFL", skills: "Puanlama becerileri", strategy: "Strateji" },
  },
  de: {
    eyebrow: "SpeakAce Praxisnotizen",
    title: "Baue mit jedem fokussierten Leitfaden eine bessere Antwort.",
    description: "Praktische IELTS- und TOEFL-Speaking-Artikel für den Moment, in dem du einen klaren nächsten Schritt brauchst.",
    countLabel: "veröffentlichte Leitfäden",
    featuredEyebrow: "Hier beginnen",
    featuredNote: "Ein sinnvoller erster Artikel mit einer Idee für deine nächste Antwort.",
    readLabel: "Leitfaden lesen",
    tracksEyebrow: "Geführtes Lesen",
    tracksTitle: "Wähle einen kurzen Pfad statt zehn Tabs",
    firstTrack: "Grundlage aufbauen",
    secondTrack: "Score steigern",
    libraryEyebrow: "Gesamtes Archiv",
    libraryTitle: "Finde den Leitfaden für dein heutiges Problem",
    libraryDescription: "Filtere nach Prüfung, Bewertungsfähigkeit oder Strategie und suche direkt nach einem Thema.",
    tabLabel: "Blogartikel filtern",
    searchPlaceholder: "Leitfäden durchsuchen",
    emptyLabel: "Noch kein Leitfaden passt zu dieser Suche.",
    showMoreLabel: "Mehr Leitfäden anzeigen",
    categories: { all: "Alle Leitfäden", ielts: "IELTS", toefl: "TOEFL", skills: "Bewertungsfähigkeiten", strategy: "Strategie" },
  },
  es: {
    eyebrow: "Notas prácticas de SpeakAce",
    title: "Construye una respuesta mejor con cada guía enfocada.",
    description: "Artículos prácticos de IELTS y TOEFL speaking para cuando sabes que debes mejorar y necesitas un siguiente paso claro.",
    countLabel: "guías publicadas",
    featuredEyebrow: "Empieza aquí",
    featuredNote: "Una primera lectura útil con una mejora que puedes aplicar en tu próxima respuesta.",
    readLabel: "Leer guía",
    tracksEyebrow: "Lectura guiada",
    tracksTitle: "Elige una ruta corta en lugar de abrir diez pestañas",
    firstTrack: "Construir la base",
    secondTrack: "Subir la puntuación",
    libraryEyebrow: "Archivo completo",
    libraryTitle: "Encuentra la guía para el problema de hoy",
    libraryDescription: "Filtra por examen, habilidad de puntuación o estrategia. Busca un tema concreto cuando ya lo conoces.",
    tabLabel: "Filtrar artículos",
    searchPlaceholder: "Buscar en el archivo",
    emptyLabel: "Todavía no hay una guía para esta búsqueda.",
    showMoreLabel: "Mostrar más guías",
    categories: { all: "Todas las guías", ielts: "IELTS", toefl: "TOEFL", skills: "Habilidades de puntuación", strategy: "Estrategia" },
  },
  fr: {
    eyebrow: "Notes pratiques SpeakAce",
    title: "Construisez une meilleure réponse, un guide ciblé à la fois.",
    description: "Des articles pratiques IELTS et TOEFL speaking pour le moment où vous avez besoin d’une prochaine étape claire.",
    countLabel: "guides publiés",
    featuredEyebrow: "Commencer ici",
    featuredNote: "Une première lecture utile avec une amélioration à appliquer dans votre prochaine réponse.",
    readLabel: "Lire le guide",
    tracksEyebrow: "Lecture guidée",
    tracksTitle: "Choisissez un parcours court plutôt que dix onglets",
    firstTrack: "Construire la base",
    secondTrack: "Augmenter le score",
    libraryEyebrow: "Archives complètes",
    libraryTitle: "Trouvez le guide adapté au problème du jour",
    libraryDescription: "Filtrez par examen, compétence de score ou stratégie, puis recherchez un sujet précis.",
    tabLabel: "Filtrer les articles",
    searchPlaceholder: "Rechercher dans les guides",
    emptyLabel: "Aucun guide ne correspond encore à cette recherche.",
    showMoreLabel: "Afficher plus de guides",
    categories: { all: "Tous les guides", ielts: "IELTS", toefl: "TOEFL", skills: "Compétences de score", strategy: "Stratégie" },
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguage();
  const meta = blogIndexMeta[language] ?? blogIndexMeta.en;

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: "/blog"
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${siteConfig.domain}/blog`,
      siteName: siteConfig.name,
      type: "website"
    }
  };
}

export default async function BlogIndexPage() {
  const language = await getServerLanguage();
  const chrome = getBlogChromeCopy(language);
  const ui = blogIndexUi[normalizePublicLanguage(language)];
  const { featured, firstPath, secondPath, all } = getFeaturedBlogPosts(language);
  const customPosts = await listPublishedCustomBlogPosts(language);
  const featuredTitle = getBlogPublicTitle(featured.slug, featured.title);
  const featuredDescription = getBlogPublicDescription(featured.slug, featured.description);
  const combinedPosts = [...customPosts, ...all].filter(
    (post, index, posts) => posts.findIndex((candidate) => candidate.slug === post.slug) === index
  );
  const libraryPosts: BlogLibraryPost[] = combinedPosts.map((post) => ({
    slug: post.slug,
    title: getBlogPublicTitle(post.slug, post.title),
    description: getBlogPublicDescription(post.slug, post.description),
    keywords: post.keywords,
  }));

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "SpeakAce Blog",
    url: `${siteConfig.domain}/blog`,
    blogPost: combinedPosts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      url: `${siteConfig.domain}/blog/${post.slug}`
    }))
  };

  return (
    <main className="blog-index">
      <section className="blog-index-hero">
        <div>
          <span className="content-kicker"><Compass size={14} />{ui.eyebrow}</span>
          <h1>{ui.title}</h1>
          <p>{ui.description}</p>
        </div>
        <aside className="blog-index-count" aria-label={`${combinedPosts.length} ${ui.countLabel}`}>
          <Library size={22} aria-hidden="true" />
          <strong>{combinedPosts.length}</strong>
          <span>{ui.countLabel}</span>
          <i />
        </aside>
      </section>

      <section className="blog-index-feature">
        <article className="blog-index-feature-main">
          <span className="content-kicker">{ui.featuredEyebrow}</span>
          <div className="blog-index-feature-number" aria-hidden="true">01</div>
          <h2>{featuredTitle}</h2>
          <p>{featuredDescription || ui.featuredNote}</p>
          <Link className="button button-primary" href={`/blog/${featured.slug}` as Route}>
            {ui.readLabel}<ArrowRight size={16} />
          </Link>
        </article>

        <aside className="blog-index-tracks">
          <div className="blog-index-tracks-head">
            <div>
              <span className="content-kicker">{ui.tracksEyebrow}</span>
              <h2>{ui.tracksTitle}</h2>
            </div>
            <BookOpenText size={23} aria-hidden="true" />
          </div>
          <div className="blog-index-track-columns">
            <div>
              <span>{ui.firstTrack}</span>
              {firstPath.slice(0, 3).map((post, index) => (
                <Link key={post.slug} href={`/blog/${post.slug}` as Route}>
                  <small>{String(index + 1).padStart(2, "0")}</small>
                  <strong>{getBlogPublicTitle(post.slug, post.title)}</strong>
                </Link>
              ))}
            </div>
            <div>
              <span>{ui.secondTrack}</span>
              {secondPath.slice(0, 3).map((post, index) => (
                <Link key={post.slug} href={`/blog/${post.slug}` as Route}>
                  <small>{String(index + 1).padStart(2, "0")}</small>
                  <strong>{getBlogPublicTitle(post.slug, post.title)}</strong>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <AdSenseUnit />

      <BlogLibrary
        eyebrow={ui.libraryEyebrow}
        title={ui.libraryTitle}
        description={ui.libraryDescription}
        tabLabel={ui.tabLabel}
        searchPlaceholder={ui.searchPlaceholder}
        resultLabel={ui.countLabel}
        emptyLabel={ui.emptyLabel}
        readLabel={chrome.cta.readMore}
        showMoreLabel={ui.showMoreLabel}
        categories={ui.categories}
        posts={libraryPosts}
      />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }} />
    </main>
  );
}
