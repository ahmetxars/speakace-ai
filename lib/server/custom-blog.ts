import { randomUUID } from "node:crypto";
import type { Language } from "@/lib/copy";
import { getSql, hasDatabaseUrl } from "@/lib/server/db";
import type { AdminCustomPostRecord, CustomBlogPost } from "@/lib/types";

type BlogSection = {
  title: string;
  body: string[];
};

function normalizeKeywords(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item).trim())
    .filter(Boolean)
    .slice(0, 12);
}

function parseSections(body: string): BlogSection[] {
  const normalized = body.trim();
  if (!normalized) {
    return [{ title: "Overview", body: ["Content coming soon."] }];
  }

  const headingRegex = /^##\s+(.+)$/gm;
  const matches = [...normalized.matchAll(headingRegex)];
  if (!matches.length) {
    return [
      {
        title: "Guide",
        body: normalized.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean)
      }
    ];
  }

  const sections: BlogSection[] = [];
  matches.forEach((match, index) => {
    const title = match[1].trim();
    const start = match.index! + match[0].length;
    const end = matches[index + 1]?.index ?? normalized.length;
    const slice = normalized.slice(start, end).trim();
    const paragraphs = slice.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean);
    sections.push({
      title: title || `Section ${index + 1}`,
      body: paragraphs.length ? paragraphs : ["More details coming soon."]
    });
  });

  return sections;
}

function mapRowToCustomPost(row: {
  id: string;
  slug: string;
  language: string;
  title: string;
  description: string;
  keywords_json: unknown;
  intro: string;
  body: string;
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
  published_at: string | null;
}): CustomBlogPost {
  return {
    id: row.id,
    slug: row.slug,
    language: row.language,
    title: row.title,
    description: row.description,
    keywords: normalizeKeywords(row.keywords_json),
    intro: row.intro,
    sections: parseSections(row.body),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at
  };
}

export async function listPublishedCustomBlogPosts(language?: Language) {
  if (!hasDatabaseUrl()) return [];
  const sql = getSql();
  const rows = await sql<
    Array<{
      id: string;
      slug: string;
      language: string;
      title: string;
      description: string;
      keywords_json: unknown;
      intro: string;
      body: string;
      status: "draft" | "published";
      created_at: string;
      updated_at: string;
      published_at: string | null;
    }>
  >`
    select id, slug, language, title, description, keywords_json, intro, body, status, created_at, updated_at, published_at
    from custom_blog_posts
    where status = 'published'
      and (${language ?? null}::text is null or language = ${language ?? null})
    order by coalesce(published_at, created_at) desc
  `;

  return rows.map(mapRowToCustomPost);
}

export async function getPublishedCustomBlogPostBySlug(slug: string, language?: Language) {
  if (!hasDatabaseUrl()) return null;
  const sql = getSql();
  const rows = await sql<
    Array<{
      id: string;
      slug: string;
      language: string;
      title: string;
      description: string;
      keywords_json: unknown;
      intro: string;
      body: string;
      status: "draft" | "published";
      created_at: string;
      updated_at: string;
      published_at: string | null;
    }>
  >`
    select id, slug, language, title, description, keywords_json, intro, body, status, created_at, updated_at, published_at
    from custom_blog_posts
    where slug = ${slug}
      and status = 'published'
      and (${language ?? null}::text is null or language = ${language ?? null})
    limit 1
  `;

  return rows[0] ? mapRowToCustomPost(rows[0]) : null;
}

export async function listAdminCustomBlogPosts(): Promise<AdminCustomPostRecord[]> {
  if (!hasDatabaseUrl()) return [];
  const sql = getSql();
  const rows = await sql<
    Array<{
      id: string;
      slug: string;
      language: string;
      title: string;
      description: string;
      status: "draft" | "published";
      keywords_json: unknown;
      created_at: string;
      updated_at: string;
      published_at: string | null;
    }>
  >`
    select id, slug, language, title, description, status, keywords_json, created_at, updated_at, published_at
    from custom_blog_posts
    order by updated_at desc
  `;

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    language: row.language,
    title: row.title,
    description: row.description,
    status: row.status,
    keywords: normalizeKeywords(row.keywords_json),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at
  }));
}

export async function createAdminCustomBlogPost(input: {
  slug: string;
  language?: string;
  title: string;
  description: string;
  keywords?: string[];
  intro: string;
  body: string;
  status?: "draft" | "published";
}) {
  if (!hasDatabaseUrl()) {
    throw new Error("Custom blog posts require DATABASE_URL.");
  }

  const slug = input.slug.trim().toLowerCase();
  if (!/^[a-z0-9-]{4,120}$/.test(slug)) {
    throw new Error("Slug must use lowercase letters, numbers, and dashes only.");
  }

  const title = input.title.trim();
  const description = input.description.trim();
  const intro = input.intro.trim();
  const body = input.body.trim();
  if (!title || !description || !intro || !body) {
    throw new Error("Title, description, intro, and body are required.");
  }

  const status = input.status ?? "draft";
  const now = new Date().toISOString();
  const sql = getSql();
  await sql`
    insert into custom_blog_posts (
      id, slug, language, title, description, keywords_json, intro, body, status, created_at, updated_at, published_at
    ) values (
      ${randomUUID()},
      ${slug},
      ${input.language?.trim() || "en"},
      ${title},
      ${description},
      ${JSON.stringify((input.keywords ?? []).map((item) => item.trim()).filter(Boolean))},
      ${intro},
      ${body},
      ${status},
      ${now},
      ${now},
      ${status === "published" ? now : null}
    )
  `;
}

export async function updateAdminCustomBlogPost(input: {
  id: string;
  status?: "draft" | "published";
}) {
  if (!hasDatabaseUrl()) {
    throw new Error("Custom blog posts require DATABASE_URL.");
  }

  const sql = getSql();
  const nextStatus = input.status ?? "draft";
  const now = new Date().toISOString();
  await sql`
    update custom_blog_posts
    set
      status = ${nextStatus},
      updated_at = ${now},
      published_at = case
        when ${nextStatus} = 'published' and published_at is null then ${now}
        when ${nextStatus} = 'draft' then null
        else published_at
      end
    where id = ${input.id}
  `;
}

export async function listAllCustomBlogSlugs() {
  if (!hasDatabaseUrl()) return [];
  const sql = getSql();
  const rows = await sql<Array<{ slug: string }>>`
    select slug from custom_blog_posts where status = 'published'
  `;
  return rows.map((row) => row.slug);
}
