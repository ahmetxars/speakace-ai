import { getSql, hasDatabaseUrl } from "@/lib/server/db";

export interface EditablePage {
  id: string;
  slug: string;
  title: string;
  content: string;
  language: string;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
}

export async function getEditablePage(slug: string, language: string = "en"): Promise<EditablePage | null> {
  if (!hasDatabaseUrl()) return null;

  const sql = getSql();
  try {
    const rows = await sql<EditablePage[]>`
      select id, slug, title, content, language, status, created_at as "createdAt", updated_at as "updatedAt"
      from editable_pages
      where slug = ${slug} and language = ${language} and status = 'published'
      limit 1
    `;

    return rows[0] || null;
  } catch {
    // Table might not exist yet
    return null;
  }
}

export async function listEditablePages(language?: string): Promise<EditablePage[]> {
  if (!hasDatabaseUrl()) return [];

  const sql = getSql();
  try {
    const rows = await sql<EditablePage[]>`
      select id, slug, title, content, language, status, created_at as "createdAt", updated_at as "updatedAt"
      from editable_pages
      ${language ? sql`where language = ${language}` : sql``}
      order by updated_at desc
    `;

    return rows;
  } catch {
    return [];
  }
}

export async function updateEditablePage(input: {
  slug: string;
  language?: string;
  title: string;
  content: string;
  status?: "draft" | "published";
}): Promise<void> {
  if (!hasDatabaseUrl()) {
    throw new Error("Database not configured");
  }

  const sql = getSql();
  const now = new Date().toISOString();
  const language = input.language || "en";
  const status = input.status || "published";

  try {
    // Try to update first
    const result = await sql`
      update editable_pages
      set title = ${input.title}, content = ${input.content}, status = ${status}, updated_at = ${now}
      where slug = ${input.slug} and language = ${language}
    `;

    // If no rows updated, insert
    if (result.count === 0) {
      await sql`
        insert into editable_pages (id, slug, language, title, content, status, created_at, updated_at)
        values (
          ${Math.random().toString(36).substring(7)},
          ${input.slug},
          ${language},
          ${input.title},
          ${input.content},
          ${status},
          ${now},
          ${now}
        )
      `;
    }
  } catch (error) {
    console.error("Error updating editable page:", error);
    throw new Error("Failed to update page");
  }
}
