import { NextResponse } from "next/server";
import { buildAdaptiveHomeworkSuggestions, createHomeworkAssignment, listTeacherHomework } from "@/lib/homework-store";
import { permissionErrorResponse, requireTeacher, requireTeacherOwnsStudent } from "@/lib/server/permissions";
import { checkRateLimit, getRequestIp } from "@/lib/server/rate-limit";
import { TaskType } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const profile = await requireTeacher();
    const url = new URL(request.url);
    const studentId = url.searchParams.get("studentId");

    if (studentId) {
      // Verify teacher owns the student before generating suggestions (H-4 fix)
      await requireTeacherOwnsStudent(profile.id, studentId);
      const suggestions = await buildAdaptiveHomeworkSuggestions(studentId);
      return NextResponse.json({ suggestions });
    }

    const assignments = await listTeacherHomework(profile.id);
    return NextResponse.json({ assignments });
  } catch (error) {
    return permissionErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const profile = await requireTeacher();

    const ip = getRequestIp(request);
    const limit = checkRateLimit({
      key: `teacher-homework:${ip}:${profile.id}`,
      windowMs: 1000 * 60 * 15,
      max: 40
    });
    if (!limit.allowed) {
      return NextResponse.json({ error: "Too many homework actions. Please try again later." }, { status: 429 });
    }

    const body = await request.json();
    const studentId = String(body.studentId ?? "");

    // Verify the teacher owns this student before assigning homework (H-4 fix).
    // This prevents teachers from assigning homework to arbitrary student IDs.
    await requireTeacherOwnsStudent(profile.id, studentId);

    const assignment = await createHomeworkAssignment({
      teacherId: profile.id,
      studentId,
      classId: body.classId ? String(body.classId) : undefined,
      title: String(body.title ?? ""),
      instructions: String(body.instructions ?? ""),
      focusSkill: String(body.focusSkill ?? ""),
      recommendedTaskType: String(body.recommendedTaskType ?? "ielts-part-1") as TaskType,
      promptId: body.promptId ? String(body.promptId) : undefined,
      dueAt: body.dueAt ? String(body.dueAt) : undefined
    });
    return NextResponse.json({ assignment });
  } catch (error) {
    return permissionErrorResponse(error);
  }
}
