import { updateAdminCustomBlogPost } from "@/lib/server/custom-blog";
import { getAdminPanelSession, getAdminSessionCookieName } from "@/lib/server/admin-panel";
import { cookies } from "next/headers";

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = await getAdminPanelSession(cookieStore.get(getAdminSessionCookieName())?.value);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    await updateAdminCustomBlogPost({
      id: body.id,
      status: body.status
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Blog update error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to update blog post" },
      { status: 400 }
    );
  }
}
