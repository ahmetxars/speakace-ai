import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAuthenticatedUser, getSessionCookieName } from "@/lib/server/auth";
import { createStudyTask } from "@/lib/study-lists-store";

async function getProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  return getAuthenticatedUser(token);
}

export async function POST(request: Request) {
  const profile = await getProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    folderId?: string;
    title?: string;
    note?: string;
    dueAt?: string | null;
  };

  const task = await createStudyTask(profile.id, {
    folderId: body.folderId ?? "",
    title: body.title ?? "",
    note: body.note ?? "",
    dueAt: body.dueAt ?? null
  });
  return NextResponse.json({ task });
}
