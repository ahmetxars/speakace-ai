export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article" | "product";
  author?: string;
  publishedDate?: string;
  modifiedDate?: string;
}

export function generateMetaTags(metadata: SEOMetadata) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://speakace.org";
  const url = metadata.url ? `${baseUrl}${metadata.url}` : baseUrl;
  const image = metadata.image || `${baseUrl}/og-image.png`;

  return {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords?.join(", "),
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      url,
      type: metadata.type || "website",
      images: [{ url: image, width: 1200, height: 630 }]
    },
    twitter: {
      card: "summary_large_image",
      title: metadata.title,
      description: metadata.description,
      images: [image]
    }
  };
}

export function generateStructuredData(
  metadata: SEOMetadata & {
    schema: "Organization" | "Article" | "WebPage" | "BreadcrumbList";
    breadcrumbs?: Array<{ name: string; url: string }>;
    articleBody?: string;
    articleAuthor?: string;
    articlePublisher?: string;
  }
) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://speakace.org";

  switch (metadata.schema) {
    case "Organization":
      return {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "SpeakAce",
        url: baseUrl,
        logo: `${baseUrl}/logo.png`,
        description: metadata.description,
        sameAs: [
          "https://twitter.com/speakace",
          "https://facebook.com/speakace",
          "https://instagram.com/speakace"
        ]
      };

    case "Article":
      return {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: metadata.title,
        description: metadata.description,
        image: metadata.image || `${baseUrl}/og-image.png`,
        datePublished: metadata.publishedDate,
        dateModified: metadata.modifiedDate,
        author: {
          "@type": "Person",
          name: metadata.articleAuthor || "SpeakAce"
        },
        publisher: {
          "@type": "Organization",
          name: metadata.articlePublisher || "SpeakAce",
          logo: {
            "@type": "ImageObject",
            url: `${baseUrl}/logo.png`
          }
        }
      };

    case "WebPage":
      return {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: metadata.title,
        description: metadata.description,
        url: metadata.url ? `${baseUrl}${metadata.url}` : baseUrl,
        image: metadata.image || `${baseUrl}/og-image.png`,
        isPartOf: {
          "@type": "WebSite",
          name: "SpeakAce",
          url: baseUrl
        }
      };

    case "BreadcrumbList":
      return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: (metadata.breadcrumbs || []).map((crumb, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: crumb.name,
          item: `${baseUrl}${crumb.url}`
        }))
      };

    default:
      return null;
  }
}

export function generateCanonicalUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://speakace.org";
  return `${baseUrl}${path}`;
}
