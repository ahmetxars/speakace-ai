import { createAdminCustomBlogPost } from "@/lib/server/custom-blog";
import { getAdminPanelSession, getAdminSessionCookieName } from "@/lib/server/admin-panel";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = await getAdminPanelSession(cookieStore.get(getAdminSessionCookieName())?.value);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    await createAdminCustomBlogPost({
      slug: body.slug,
      language: body.language || "en",
      title: body.title,
      description: body.description,
      intro: body.intro,
      body: body.body,
      keywords: body.keywords,
      status: body.status || "draft"
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Blog creation error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to create blog post" },
      { status: 400 }
    );
  }
}
