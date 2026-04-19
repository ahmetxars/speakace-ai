import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { AdSenseUnit } from "@/components/adsense-unit";
import { BlogAudioExample } from "@/components/blog-audio-example";
import { BlogReadingEnhancements } from "@/components/blog-reading-enhancements";
import { getBlogChromeCopy, getLocalizedBlogPost, getLocalizedBlogPosts } from "@/lib/blog-content";
import { getBlogPublicDescription, getBlogPublicTitle, getBlogSeoEntry } from "@/lib/blog-seo";
import { getServerLanguage } from "@/lib/language";
import { getPublishedCustomBlogPostBySlug, listPublishedCustomBlogPosts } from "@/lib/server/custom-blog";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getLocalizedBlogPost("en", slug) ?? (await getPublishedCustomBlogPostBySlug(slug, "en"));
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
  const post = getLocalizedBlogPost(language, slug) ?? (await getPublishedCustomBlogPostBySlug(slug, language));
  if (!post) {
    notFound();
  }
  const practiceCta = getBlogPracticeCta({ slug: post.slug, title: post.title, language });
  const seoTitle = getBlogPublicTitle(slug, post.title);
  const seoDescription = getBlogPublicDescription(slug, post.description);
  const seoEntry = getBlogSeoEntry(slug);
  const audioTranscript = buildBlogAudioTranscript(post);

  const relatedPosts = [
    ...(await listPublishedCustomBlogPosts(language)),
    ...getLocalizedBlogPosts(language)
  ].filter((item, index, arr) => item.slug !== post.slug && arr.findIndex((candidate) => candidate.slug === item.slug) === index).slice(0, 3);
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
      <BlogReadingEnhancements
        ctaLabel={ctaLabels.title}
        ctaDescription={ctaLabels.description}
        ctaHref={practiceCta.href as Route}
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

          <BlogAudioExample
            title={language === "tr" ? "Band 8-9 örnek akış" : "Band 8-9 sample flow"}
            transcript={audioTranscript}
            tr={language === "tr"}
          />

          <div className="card spotlight-card" style={{ marginTop: "1.2rem" }}>
            <strong>{ctaLabels.title}</strong>
            <p style={{ marginTop: "0.55rem" }}>{ctaLabels.description}</p>
            <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
              <Link className="button button-primary" href={practiceCta.href as Route}>
                {practiceCta.primaryLabel}
              </Link>
              <Link className="button button-secondary" href={practiceCta.secondaryHref as Route}>
                {practiceCta.secondaryLabel}
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
                  {linkParagraph(paragraph)}
                </p>
              ))}
              {section.title === post.sections[2]?.title ? (
                <div className="card quick-pitch" style={{ marginTop: "1.1rem" }}>
                  <h3 style={{ marginBottom: "0.55rem" }}>{practiceCta.inlineTitle}</h3>
                  <p className="practice-copy" style={{ marginBottom: "0.9rem" }}>
                    {practiceCta.inlineDescription}
                  </p>
                  <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
                    <Link className="button button-primary" href={practiceCta.href as Route}>
                      {practiceCta.primaryLabel}
                    </Link>
                    <Link className="button button-secondary" href={practiceCta.secondaryHref as Route}>
                      {practiceCta.secondaryLabel}
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

        <AdSenseUnit />

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

const internalLinkMap = [
  { phrase: "IELTS Part 1", href: "/ielts-speaking-part-1-questions" },
  { phrase: "IELTS Part 2", href: "/ielts-speaking-part-2-topics" },
  { phrase: "IELTS Part 3", href: "/ielts-speaking-part-3-questions" },
  { phrase: "IELTS speaking topics", href: "/ielts-speaking-topics" },
  { phrase: "free IELTS speaking test", href: "/free-ielts-speaking-test" },
  { phrase: "TOEFL speaking", href: "/app/practice" },
  { phrase: "IELTS speaking", href: "/app/practice?quickStart=1" }
];

function linkParagraph(paragraph: string): ReactNode {
  for (const item of internalLinkMap) {
    const index = paragraph.indexOf(item.phrase);
    if (index >= 0) {
      const before = paragraph.slice(0, index);
      const after = paragraph.slice(index + item.phrase.length);
      return (
        <>
          {before}
          <a href={item.href} style={{ color: "var(--primary)", fontWeight: 700 }}>
            {item.phrase}
          </a>
          {after}
        </>
      );
    }
  }

  return paragraph;
}

function buildBlogAudioTranscript(post: { intro: string; sections: Array<{ body: string[] }> }) {
  const segments = [post.intro, ...post.sections.flatMap((section) => section.body).slice(0, 2)]
    .map((item) => item.trim())
    .filter(Boolean);
  return segments.join(" ").slice(0, 700);
}

function getBlogPracticeCta(input: { slug: string; title: string; language: string }) {
  const source = `${input.slug} ${input.title}`.toLowerCase();
  const tr = input.language === "tr";

  if (source.includes("part-1")) {
    return {
      href: "/app/practice?examType=IELTS&taskType=ielts-part-1&quickStart=1",
      secondaryHref: "/ielts-speaking-part-1-questions",
      primaryLabel: tr ? "Bu Part 1 sorusunu şimdi dene" : "Practice this Part 1 question now",
      secondaryLabel: tr ? "Daha fazla Part 1 sorusu" : "More Part 1 questions",
      inlineTitle: tr ? "Bu Part 1 konusunu şimdi AI ile pratik yap" : "Practice this Part 1 topic with AI now",
      inlineDescription: tr
        ? "Kısa bir cevap ver, anında skor sinyali gör ve aynı Part 1 sorusunu daha akıcı şekilde tekrar dene."
        : "Give one short answer, see your score signal instantly, and retry the same Part 1 question with better fluency."
    };
  }

  if (source.includes("part-2") || source.includes("cue card") || source.includes("hometown")) {
    return {
      href: "/app/practice?examType=IELTS&taskType=ielts-part-2&quickStart=1",
      secondaryHref: "/ielts-speaking-part-2-topics",
      primaryLabel: tr ? "Bu Part 2 konusunu şimdi dene" : "Practice this Part 2 topic now",
      secondaryLabel: tr ? "Daha fazla Part 2 konusu" : "More Part 2 topics",
      inlineTitle: tr ? "Bu konuyu şimdi AI ile pratik yap" : "Practice this topic with AI now",
      inlineDescription: tr
        ? "Önce skorunu gör, sonra daha güçlü örnek ve daha net yapı ile aynı cue card'ı tekrar dene."
        : "See your score first, then retry the same cue card with a stronger example and cleaner structure."
    };
  }

  if (source.includes("part-3")) {
    return {
      href: "/app/practice?examType=IELTS&taskType=ielts-part-3&quickStart=1",
      secondaryHref: "/ielts-speaking-part-3-questions",
      primaryLabel: tr ? "Bu Part 3 sorusunu şimdi dene" : "Practice this Part 3 question now",
      secondaryLabel: tr ? "Daha fazla Part 3 sorusu" : "More Part 3 questions",
      inlineTitle: tr ? "Bu tartışma sorusunu AI ile pratik yap" : "Practice this discussion question with AI",
      inlineDescription: tr
        ? "Fikrini geliştir, neden ver, sonra aynı soruyu daha güçlü mantıkla yeniden söyle."
        : "Develop your opinion, add reasons, then retry the same question with stronger logic."
    };
  }

  return {
    href: "/app/practice?quickStart=1",
    secondaryHref: "/free-ielts-speaking-test",
    primaryLabel: tr ? "Bu konuyu şimdi AI ile pratik yap" : "Practice this topic with AI now",
    secondaryLabel: tr ? "Ücretsiz IELTS speaking testi" : "Free IELTS speaking test",
    inlineTitle: tr ? "Okuduğun konuyu şimdi dene" : "Turn this guide into practice now",
    inlineDescription: tr
      ? "Bir cevap ver, tahmini skorunu gör ve aynı konuyu daha net akıcılık ve yapı ile tekrar dene."
      : "Give one answer, see your estimated score, and retry the same topic with clearer fluency and stronger structure."
  };
}
