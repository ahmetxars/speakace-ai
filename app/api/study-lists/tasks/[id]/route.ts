import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAuthenticatedUser, getSessionCookieName } from "@/lib/server/auth";
import { deleteStudyTask, updateStudyTask } from "@/lib/study-lists-store";

async function getProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  return getAuthenticatedUser(token);
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const profile = await getProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    title?: string;
    note?: string;
    dueAt?: string | null;
    completedAt?: string | null;
  };
  const { id } = await context.params;
  const task = await updateStudyTask(profile.id, id, body);
  return NextResponse.json({ task });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const profile = await getProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  await deleteStudyTask(profile.id, id);
  return NextResponse.json({ ok: true });
}
