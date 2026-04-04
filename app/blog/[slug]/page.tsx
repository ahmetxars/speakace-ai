import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { getBlogChromeCopy, getLocalizedBlogPost, getLocalizedBlogPosts } from "@/lib/blog-content";
import { getServerLanguage } from "@/lib/language";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getLocalizedBlogPost("en", slug);
  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `/blog/${post.slug}`
    },
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.description,
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
  const post = getLocalizedBlogPost(language, slug);
  if (!post) {
    notFound();
  }

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
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    mainEntityOfPage: `${siteConfig.domain}/blog/${post.slug}`,
    keywords: post.keywords.join(", "),
    author: {
      "@type": "Organization",
      name: "SpeakAce AI"
    },
    publisher: {
      "@type": "Organization",
      name: "SpeakAce AI"
    }
  };

  return (
    <>
      <SiteHeader />
      <main className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">{chrome.cta.blog}</span>
          <h1 style={{ fontSize: "clamp(2.6rem, 6vw, 4.5rem)", lineHeight: 0.98 }}>{post.title}</h1>
          <p>{post.description}</p>
        </div>

        <article className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginBottom: "1rem" }}>
            <Link href="/blog" className="pill">{chrome.cta.blog}</Link>
            <Link href="/resources" className="pill">{pageLabels.resources}</Link>
            <Link href="/guides" className="pill">{pageLabels.guides}</Link>
          </div>
          <p style={{ color: "var(--muted)", lineHeight: 1.85 }}>{post.intro}</p>
          {post.sections.map((section) => (
            <section key={section.title} style={{ marginTop: "1.8rem" }}>
              <h2 style={{ marginBottom: "0.7rem" }}>{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} style={{ color: "var(--muted)", lineHeight: 1.85 }}>
                  {paragraph}
                </p>
              ))}
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
