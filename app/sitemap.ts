import type { MetadataRoute } from "next";
import { blogPosts } from "@/lib/marketing-content";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/pricing",
    "/for-teachers",
    "/for-schools",
    "/ielts-speaking-practice",
    "/toefl-speaking-practice",
    "/blog",
    "/auth",
    "/app"
  ];
  const blogRoutes = blogPosts.map((post) => `/blog/${post.slug}`);
  const allRoutes = [...routes, ...blogRoutes];

  return allRoutes.map((route) => ({
    url: `${siteConfig.domain}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/blog" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route.startsWith("/blog/") ? 0.82 : 0.8
  }));
}
