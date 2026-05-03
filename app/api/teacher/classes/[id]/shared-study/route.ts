import { NextResponse } from "next/server";
import { getPromptById } from "@/lib/prompts";
import { ensureTeacherOwnsClass } from "@/lib/classroom-store";
import { permissionErrorResponse, requireTeacher } from "@/lib/server/permissions";
import { checkRateLimit, getRequestIp } from "@/lib/server/rate-limit";
import { createClassSharedStudyItem, listClassSharedStudyItems, removeClassSharedStudyItem } from "@/lib/shared-study-store";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const profile = await requireTeacher();
    const { id } = await params;
    await ensureTeacherOwnsClass(profile.id, id);
    const items = await listClassSharedStudyItems(id);
    return NextResponse.json({ items });
  } catch (error) {
    return permissionErrorResponse(error);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const profile = await requireTeacher();
    const ip = getRequestIp(request);
    const limit = checkRateLimit({
      key: `teacher-share-study:${ip}:${profile.id}`,
      windowMs: 1000 * 60 * 15,
      max: 50
    });
    if (!limit.allowed) {
      return NextResponse.json({ error: "Too many share attempts. Please try again later." }, { status: 429 });
    }
    const { id } = await params;
    await ensureTeacherOwnsClass(profile.id, id);
    const body = await request.json();
    const prompt = getPromptById(String(body.promptId ?? ""));
    if (!prompt) {
      return NextResponse.json({ error: "Prompt not found." }, { status: 404 });
    }
    const item = await createClassSharedStudyItem({
      classId: id,
      teacherId: profile.id,
      promptId: prompt.id,
      examType: prompt.examType,
      taskType: prompt.taskType,
      difficulty: prompt.difficulty,
      title: prompt.title,
      note: body.note ? String(body.note) : undefined
    });
    return NextResponse.json({ item });
  } catch (error) {
    return permissionErrorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const profile = await requireTeacher();
    const { id } = await params;
    await ensureTeacherOwnsClass(profile.id, id);
    const url = new URL(request.url);
    const itemId = url.searchParams.get("itemId");
    if (!itemId) {
      return NextResponse.json({ error: "Item id is required." }, { status: 400 });
    }
    const removed = await removeClassSharedStudyItem({ teacherId: profile.id, itemId });
    if (!removed) {
      return NextResponse.json({ error: "Shared study item not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return permissionErrorResponse(error);
  }
}
