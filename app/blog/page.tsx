import type { Metadata } from "next";
import Link from "next/link";
import { AdSenseUnit } from "@/components/adsense-unit";
import { getBlogChromeCopy, getFeaturedBlogPosts } from "@/lib/blog-content";
import { getBlogPublicDescription, getBlogPublicTitle } from "@/lib/blog-seo";
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
  const { featured, firstPath, secondPath, all } = getFeaturedBlogPosts(language);
  const customPosts = await listPublishedCustomBlogPosts(language);
  const featuredTitle = getBlogPublicTitle(featured.slug, featured.title);
  const featuredDescription = getBlogPublicDescription(featured.slug, featured.description);
  const combinedPosts = [...customPosts, ...all];
  const pageLabels = {
    en: { count: "articles", latestIntro: "Read structured IELTS and TOEFL guides by topic, exam section, and study goal." },
    tr: { count: "yazı", latestIntro: "Konulara, sınav bölümlerine ve çalışma hedeflerine göre düzenlenmiş IELTS ve TOEFL yazılarını incele." },
    de: { count: "Artikel", latestIntro: "Lies strukturierte IELTS- und TOEFL-Leitfäden nach Thema, Prüfungsteil und Lernziel." },
    es: { count: "artículos", latestIntro: "Lee guías estructuradas de IELTS y TOEFL por tema, sección del examen y objetivo de estudio." },
    fr: { count: "articles", latestIntro: "Lisez des guides IELTS et TOEFL organisés par sujet, partie de l’examen et objectif d’étude." },
    it: { count: "articoli", latestIntro: "Leggi guide IELTS e TOEFL organizzate per argomento, sezione d’esame e obiettivo di studio." },
    pt: { count: "artigos", latestIntro: "Leia guias de IELTS e TOEFL organizados por tema, parte da prova e objetivo de estudo." },
    nl: { count: "artikelen", latestIntro: "Lees gestructureerde IELTS- en TOEFL-gidsen per onderwerp, examendeel en studiedoel." },
    pl: { count: "artykułów", latestIntro: "Czytaj uporządkowane materiały IELTS i TOEFL według tematu, części egzaminu i celu nauki." },
    ru: { count: "статей", latestIntro: "Читайте структурированные материалы по IELTS и TOEFL по теме, части экзамена и учебной цели." },
    ar: { count: "مقالًا", latestIntro: "اقرأ مقالات IELTS وTOEFL المرتبة حسب الموضوع وجزء الاختبار وهدف الدراسة." },
    ja: { count: "記事", latestIntro: "テーマ、試験パート、学習目的ごとに整理されたIELTS・TOEFLガイドを読めます。" },
    ko: { count: "개 글", latestIntro: "주제, 시험 파트, 학습 목표별로 정리된 IELTS·TOEFL 가이드를 읽어보세요." }
  }[language];

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
    <>
      <main className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">{chrome.cta.blog}</span>
          <h1 style={{ fontSize: "clamp(2.6rem, 6vw, 4.8rem)", lineHeight: 0.96 }}>
            {chrome.labels.blogTitle}
          </h1>
          <p>{chrome.labels.blogDescription}</p>
        </div>

        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="card institution-cta">
            <div>
              <span className="eyebrow">{chrome.cta.featured}</span>
              <h2 style={{ margin: "0.8rem 0 0.5rem" }}>{featuredTitle}</h2>
              <p className="practice-copy">{featuredDescription}</p>
            </div>
            <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
              <Link className="button button-primary" href={`/blog/${featured.slug}`}>
                {chrome.cta.read}
              </Link>
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="section-head">
            <span className="eyebrow">{chrome.cta.readingTracks}</span>
            <h2>{chrome.labels.latestDescription}</h2>
            <p>{pageLabels.latestIntro}</p>
          </div>
          <div className="marketing-grid">
            <article className="card feature-card">
              <div className="pill" style={{ marginBottom: "0.8rem" }}>{chrome.labels.startPath}</div>
              <h3 style={{ fontSize: "1.4rem" }}>{firstPath[0] ? getBlogPublicTitle(firstPath[0].slug, firstPath[0].title) : ""}</h3>
              <p>{chrome.labels.featuredDescription}</p>
              <div className="blog-reading-list">
                {firstPath.map((post) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-reading-link">
                    <strong>{getBlogPublicTitle(post.slug, post.title)}</strong>
                  </Link>
                ))}
              </div>
            </article>
            <article className="card feature-card">
              <div className="pill" style={{ marginBottom: "0.8rem" }}>{chrome.labels.advancedPath}</div>
              <h3 style={{ fontSize: "1.4rem" }}>{secondPath[0] ? getBlogPublicTitle(secondPath[0].slug, secondPath[0].title) : ""}</h3>
              <p>{chrome.labels.latestDescription}</p>
              <div className="blog-reading-list">
                {secondPath.map((post) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-reading-link">
                    <strong>{getBlogPublicTitle(post.slug, post.title)}</strong>
                  </Link>
                ))}
              </div>
            </article>
          </div>
        </section>

        <AdSenseUnit />

        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="section-head">
            <span className="eyebrow">{chrome.cta.latest}</span>
            <h2>{combinedPosts.length} {pageLabels.count}</h2>
          </div>
          <div className="marketing-grid">
            {combinedPosts.map((post) => (
              <article key={post.slug} className="card feature-card">
                <div className="pill" style={{ marginBottom: "0.8rem" }}>{post.keywords[0]}</div>
                <h2 style={{ fontSize: "1.45rem", marginBottom: "0.7rem" }}>{getBlogPublicTitle(post.slug, post.title)}</h2>
                <p>{getBlogPublicDescription(post.slug, post.description)}</p>
                <Link href={`/blog/${post.slug}`} className="button button-primary" style={{ marginTop: "0.7rem" }}>
                  {chrome.cta.readMore}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }} />
      </main>
    </>
  );
}
