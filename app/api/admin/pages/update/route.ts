import { updateEditablePage } from "@/lib/server/editable-pages";
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

    await updateEditablePage({
      slug: body.slug,
      language: body.language || "en",
      title: body.title,
      content: body.content,
      status: body.status || "published"
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Page update error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to update page" },
      { status: 400 }
    );
  }
}
