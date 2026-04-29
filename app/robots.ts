import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

const commonDisallow = ["/api/", "/admin/", "/app/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: commonDisallow
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: commonDisallow
      },
      // OpenAI — ChatGPT web browsing and GPT plugins
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: commonDisallow
      },
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
        disallow: commonDisallow
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        disallow: commonDisallow
      },
      // Anthropic — Claude web search
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: commonDisallow
      },
      {
        userAgent: "Claude-Web",
        allow: "/",
        disallow: commonDisallow
      },
      {
        userAgent: "anthropic-ai",
        allow: "/",
        disallow: commonDisallow
      },
      // Perplexity AI
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: commonDisallow
      },
      // Google — Gemini / AI Overviews
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: commonDisallow
      },
      // Meta — Meta AI
      {
        userAgent: "Meta-ExternalAgent",
        allow: "/",
        disallow: commonDisallow
      },
      // Cohere AI
      {
        userAgent: "cohere-ai",
        allow: "/",
        disallow: commonDisallow
      },
      // Common Crawl — training data used by many AI labs
      {
        userAgent: "CCBot",
        allow: "/",
        disallow: commonDisallow
      },
      // You.com
      {
        userAgent: "YouBot",
        allow: "/",
        disallow: commonDisallow
      },
      // Diffbot — enterprise knowledge graph
      {
        userAgent: "Diffbot",
        allow: "/",
        disallow: commonDisallow
      }
    ],
    sitemap: `${siteConfig.domain}/sitemap.xml`,
    host: siteConfig.domain
  };
}
