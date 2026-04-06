import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { updateAdminCustomBlogPost } from "@/lib/server/custom-blog";
import { getAdminPanelSession, getAdminSessionCookieName } from "@/lib/server/admin-panel";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const session = await getAdminPanelSession(cookieStore.get(getAdminSessionCookieName())?.value);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  try {
    const body = await request.json();
    await updateAdminCustomBlogPost({
      id,
      status: body.status === "published" ? "published" : "draft"
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not update custom blog post." },
      { status: 400 }
    );
  }
}
