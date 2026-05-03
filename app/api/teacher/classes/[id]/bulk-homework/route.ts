import { NextResponse } from "next/server";
import { listClassStudents } from "@/lib/classroom-store";
import { createHomeworkAssignment } from "@/lib/homework-store";
import { permissionErrorResponse, requireTeacher } from "@/lib/server/permissions";
import { TaskType } from "@/lib/types";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const profile = await requireTeacher();
    const body = await request.json();
    const { id } = await params;

    if (!Array.isArray(body.studentIds) || body.studentIds.length === 0) {
      return NextResponse.json({ error: "studentIds must be a non-empty array." }, { status: 400 });
    }

    const students = await listClassStudents({ teacherId: profile.id, classId: id });
    const selected = students.filter((student) => body.studentIds.includes(student.student.id));
    const created = await Promise.all(
      selected.map((student) =>
        createHomeworkAssignment({
          teacherId: profile.id,
          studentId: student.student.id,
          classId: id,
          title: String(body.title ?? ""),
          instructions: String(body.instructions ?? ""),
          focusSkill: String(body.focusSkill ?? "Balanced practice"),
          recommendedTaskType: String(body.recommendedTaskType ?? "ielts-part-1") as TaskType,
          promptId: body.promptId ? String(body.promptId) : undefined,
          dueAt: body.dueAt ? String(body.dueAt) : undefined
        })
      )
    );
    return NextResponse.json({ created });
  } catch (error) {
    return permissionErrorResponse(error);
  }
}
