import type { MetadataRoute } from "next";
import { blogPosts } from "@/lib/marketing-content";
import { siteConfig } from "@/lib/site";
import { seoTopicPages } from "@/lib/seo-topics";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/pricing",
    "/for-teachers",
    "/for-schools",
    "/teacher-demo",
    "/success-stories",
    "/resources",
    "/free-ielts-speaking-test",
    "/weekly-ielts-speaking-challenge",
    "/ielts-speaking-sample-answers",
    "/ielts-speaking-ai",
    "/improve-ielts-speaking-score",
    "/ai-english-speaking-practice",
    "/speaking-test-simulator-ielts",
    "/ielts-speaking-practice",
    "/toefl-speaking-practice",
    "/ielts-speaking-topics",
    "/ielts-band-score-guide",
    "/ielts-speaking-part-1-questions",
    "/ielts-speaking-part-2-topics",
    "/ielts-speaking-part-3-questions",
    "/english-speaking-confidence",
    "/blog",
    "/auth",
    "/app"
  ];
  const blogRoutes = blogPosts.map((post) => `/blog/${post.slug}`);
  const topicRoutes = seoTopicPages.map((topic) => `/ielts-speaking-topics/${topic.slug}`);
  const allRoutes = [...routes, ...blogRoutes, ...topicRoutes];

  return allRoutes.map((route) => ({
    url: `${siteConfig.domain}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/blog" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route.startsWith("/blog/") ? 0.82 : 0.8
  }));
}
