import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/ielts-speaking-practice", "/toefl-speaking-practice", "/auth", "/app"],
      disallow: ["/api/"]
    },
    sitemap: `${siteConfig.domain}/sitemap.xml`
  };
}
