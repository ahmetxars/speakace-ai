import { getSql, hasDatabaseUrl } from "@/lib/server/db";
import { getAdminPanelSession, getAdminSessionCookieName } from "@/lib/server/admin-panel";
import { cookies } from "next/headers";

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = await getAdminPanelSession(cookieStore.get(getAdminSessionCookieName())?.value);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasDatabaseUrl()) {
      return Response.json({ error: "Database not configured" }, { status: 500 });
    }

    const body = await request.json();
    const sql = getSql();

    await sql`
      delete from custom_blog_posts
      where id = ${body.id}
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Blog deletion error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to delete blog post" },
      { status: 400 }
    );
  }
}
