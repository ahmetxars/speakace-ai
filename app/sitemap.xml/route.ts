import { listAllCustomBlogSlugs } from "@/lib/server/custom-blog";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://speakace.org";
  let blogSlugs: string[] = [];

  try {
    blogSlugs = await listAllCustomBlogSlugs();
  } catch (error) {
    console.error("Failed to load custom blog slugs for sitemap.", error);
  }

  const staticPages = [
    { url: "/", changefreq: "weekly", priority: "1.0" },
    { url: "/pricing", changefreq: "monthly", priority: "0.9" },
    { url: "/blog", changefreq: "daily", priority: "0.9" },
    { url: "/about", changefreq: "monthly", priority: "0.8" },
    { url: "/contact", changefreq: "monthly", priority: "0.7" },
    { url: "/for-teachers", changefreq: "monthly", priority: "0.8" },
    { url: "/for-schools", changefreq: "monthly", priority: "0.8" },
    { url: "/app", changefreq: "weekly", priority: "0.9" }
  ];

  const blogPages = blogSlugs.map((slug) => ({
    url: `/blog/${slug}`,
    changefreq: "monthly",
    priority: "0.8"
  }));

  const allPages = [...staticPages, ...blogPages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allPages
    .map(
      (page) => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    )
    .join("")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400"
    }
  });
}
