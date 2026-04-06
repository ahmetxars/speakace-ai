import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createAdminCustomBlogPost } from "@/lib/server/custom-blog";
import { getAdminPanelSession, getAdminSessionCookieName } from "@/lib/server/admin-panel";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = await getAdminPanelSession(cookieStore.get(getAdminSessionCookieName())?.value);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await request.json();
    await createAdminCustomBlogPost({
      slug: String(body.slug ?? ""),
      language: String(body.language ?? "en"),
      title: String(body.title ?? ""),
      description: String(body.description ?? ""),
      keywords: String(body.keywords ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      intro: String(body.intro ?? ""),
      body: String(body.body ?? ""),
      status: body.status === "published" ? "published" : "draft"
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create custom blog post." },
      { status: 400 }
    );
  }
}
