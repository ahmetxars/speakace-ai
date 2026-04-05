import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogReadingEnhancements } from "@/components/blog-reading-enhancements";
import { SiteHeader } from "@/components/site-header";
import { getBlogChromeCopy, getLocalizedBlogPost, getLocalizedBlogPosts } from "@/lib/blog-content";
import { getBlogPublicDescription, getBlogPublicTitle, getBlogSeoEntry } from "@/lib/blog-seo";
import { getServerLanguage } from "@/lib/language";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getLocalizedBlogPost("en", slug);
  if (!post) {
    return {};
  }
  const seoTitle = getBlogPublicTitle(slug, post.title);
  const seoDescription = getBlogPublicDescription(slug, post.description);

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: {
      canonical: `/blog/${post.slug}`
    },
    keywords: post.keywords,
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: `${siteConfig.domain}/blog/${post.slug}`,
      siteName: siteConfig.name,
      type: "article"
    }
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const language = await getServerLanguage();
  const chrome = getBlogChromeCopy(language);
  const pageLabels = {
    en: { resources: "Resources", guides: "Guides", readNext: "Read next" },
    tr: { resources: "Kaynaklar", guides: "Rehberler", readNext: "Sıradaki okunacak yazılar" },
    de: { resources: "Ressourcen", guides: "Leitfäden", readNext: "Als Nächstes lesen" },
    es: { resources: "Recursos", guides: "Guías", readNext: "Sigue leyendo" },
    fr: { resources: "Ressources", guides: "Guides", readNext: "À lire ensuite" },
    it: { resources: "Risorse", guides: "Guide", readNext: "Leggi dopo" },
    pt: { resources: "Recursos", guides: "Guias", readNext: "Ler a seguir" },
    nl: { resources: "Bronnen", guides: "Gidsen", readNext: "Lees hierna" },
    pl: { resources: "Materiały", guides: "Przewodniki", readNext: "Czytaj dalej" },
    ru: { resources: "Материалы", guides: "Гайды", readNext: "Читайте дальше" },
    ar: { resources: "المصادر", guides: "الأدلة", readNext: "اقرأ بعد ذلك" },
    ja: { resources: "リソース", guides: "ガイド", readNext: "次に読む" },
    ko: { resources: "리소스", guides: "가이드", readNext: "다음 글" }
  }[language];
  const ctaLabels = {
    en: { title: "Practice this topic with AI", description: "Get an IELTS-style score, instant feedback, and a clearer next attempt." },
    tr: { title: "Bu konuyu AI ile çalış", description: "IELTS benzeri skor, anında geri bildirim ve daha güçlü bir sonraki denemeyi gör." },
    de: { title: "Übe dieses Thema mit KI", description: "Sieh einen IELTS-ähnlichen Score, direktes Feedback und einen stärkeren nächsten Versuch." },
    es: { title: "Practica este tema con IA", description: "Obtén una puntuación estilo IELTS, feedback instantáneo y un intento más fuerte." },
    fr: { title: "Travaille ce sujet avec l’IA", description: "Obtiens un score type IELTS, un retour immédiat et une meilleure nouvelle tentative." },
    it: { title: "Lavora su questo tema con l’IA", description: "Ottieni un punteggio stile IELTS, feedback immediato e un tentativo successivo più forte." },
    pt: { title: "Pratique este tema com IA", description: "Receba uma pontuação estilo IELTS, feedback instantâneo e uma nova tentativa melhor." },
    nl: { title: "Oefen dit onderwerp met AI", description: "Krijg een IELTS-achtige score, directe feedback en een sterkere volgende poging." },
    pl: { title: "Ćwicz ten temat z AI", description: "Zobacz wynik w stylu IELTS, natychmiastowy feedback i mocniejszą kolejną próbę." },
    ru: { title: "Практикуйте эту тему с ИИ", description: "Получите балл в стиле IELTS, мгновенную обратную связь и более сильную следующую попытку." },
    ar: { title: "تدرّب على هذا الموضوع بالذكاء الاصطناعي", description: "احصل على درجة شبيهة بـ IELTS وملاحظات فورية ومحاولة أقوى بعد ذلك." },
    ja: { title: "このテーマをAIで練習する", description: "IELTS風スコア、即時フィードバック、より強い次の回答を確認できます。" },
    ko: { title: "이 주제를 AI로 연습해 보세요", description: "IELTS 스타일 점수, 즉시 피드백, 더 강한 다음 답변을 확인하세요." }
  }[language];
  const post = getLocalizedBlogPost(language, slug);
  if (!post) {
    notFound();
  }
  const seoTitle = getBlogPublicTitle(slug, post.title);
  const seoDescription = getBlogPublicDescription(slug, post.description);
  const seoEntry = getBlogSeoEntry(slug);

  const relatedPosts = getLocalizedBlogPosts(language).filter((item) => item.slug !== post.slug).slice(0, 3);
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.domain },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${siteConfig.domain}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${siteConfig.domain}/blog/${post.slug}` }
    ]
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: seoTitle,
    datePublished: seoEntry?.datePublished ?? "2026-03-01",
    description: seoDescription,
    mainEntityOfPage: `${siteConfig.domain}/blog/${post.slug}`,
    keywords: post.keywords.join(", "),
    author: {
      "@type": "Organization",
      name: "SpeakAce",
      url: siteConfig.domain
    },
    publisher: {
      "@type": "Organization",
      name: "SpeakAce",
      url: siteConfig.domain
    }
  };

  return (
    <>
      <SiteHeader />
      <BlogReadingEnhancements
        ctaLabel={ctaLabels.title}
        ctaDescription={ctaLabels.description}
        ctaHref="/app/practice?quickStart=1"
      />
      <main className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">{chrome.cta.blog}</span>
          <h1 style={{ fontSize: "clamp(2.6rem, 6vw, 4.5rem)", lineHeight: 0.98 }}>{seoTitle}</h1>
          <p>{seoDescription}</p>
        </div>

        <article className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginBottom: "1rem" }}>
            <Link href="/blog" className="pill">{chrome.cta.blog}</Link>
            <Link href="/resources" className="pill">{pageLabels.resources}</Link>
            <Link href="/guides" className="pill">{pageLabels.guides}</Link>
          </div>
          <p style={{ color: "var(--muted)", lineHeight: 1.85 }}>{post.intro}</p>

          <div className="card spotlight-card" style={{ marginTop: "1.2rem" }}>
            <strong>{ctaLabels.title}</strong>
            <p style={{ marginTop: "0.55rem" }}>{ctaLabels.description}</p>
            <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
              <Link className="button button-primary" href="/app/practice?quickStart=1">
                Start Speaking Now
              </Link>
              <Link className="button button-secondary" href="/free-ielts-speaking-test">
                try a free IELTS speaking test
              </Link>
              <Link className="button button-secondary" href={relatedPosts[0] ? `/blog/${relatedPosts[0].slug}` : "/ielts-speaking-topics"}>
                {relatedPosts[0] ? pageLabels.readNext : "IELTS Speaking Topics"}
              </Link>
            </div>
          </div>

          {post.sections.map((section) => (
            <section key={section.title} style={{ marginTop: "1.8rem" }}>
              <h2 style={{ marginBottom: "0.7rem" }}>{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} style={{ color: "var(--muted)", lineHeight: 1.85 }}>
                  {paragraph}
                </p>
              ))}
              {section.title === post.sections[2]?.title ? (
                <div className="card quick-pitch" style={{ marginTop: "1.1rem" }}>
                  <h3 style={{ marginBottom: "0.55rem" }}>Practice this topic now</h3>
                  <p className="practice-copy" style={{ marginBottom: "0.9rem" }}>
                    See your score first, fix one weak pattern, and retry the same topic with clearer fluency and stronger structure.
                  </p>
                  <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
                    <Link className="button button-primary" href="/app/practice?quickStart=1">
                      Practice this topic now
                    </Link>
                    <Link className="button button-secondary" href="/ielts-speaking-topics">
                      IELTS Speaking Topics
                    </Link>
                    <Link className="button button-secondary" href="/pricing">
                      Unlock full feedback
                    </Link>
                  </div>
                </div>
              ) : null}
            </section>
          ))}
        </article>

        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="section-head">
            <span className="eyebrow">{chrome.cta.latest}</span>
            <h2>{pageLabels.readNext}</h2>
          </div>
          <div className="marketing-grid">
            {relatedPosts.map((item) => (
              <article key={item.slug} className="card feature-card">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <Link className="button button-secondary" href={`/blog/${item.slug}`}>
                  {chrome.cta.read}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      </main>
    </>
  );
}
