import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAuthenticatedUser, getSessionCookieName } from "@/lib/server/auth";
import { addStudyListItem } from "@/lib/study-lists-store";
import { Difficulty, ExamType, TaskType } from "@/lib/types";

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
    promptId?: string;
    examType?: ExamType;
    taskType?: TaskType;
    difficulty?: Difficulty;
    title?: string;
  };

  const item = await addStudyListItem(profile.id, {
    folderId: body.folderId ?? "",
    promptId: body.promptId ?? "",
    examType: body.examType ?? "IELTS",
    taskType: body.taskType ?? "ielts-part-1",
    difficulty: body.difficulty ?? "Starter",
    title: body.title ?? "Saved prompt"
  });

  return NextResponse.json({ item });
}
