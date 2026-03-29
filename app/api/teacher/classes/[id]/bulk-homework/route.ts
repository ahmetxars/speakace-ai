import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { listClassStudents } from "@/lib/classroom-store";
import { createHomeworkAssignment } from "@/lib/homework-store";
import { getAuthenticatedUser, getSessionCookieName } from "@/lib/server/auth";
import { TaskType } from "@/lib/types";

async function getTeacherProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const profile = await getAuthenticatedUser(token);
  if (!profile?.isTeacher && !profile?.isAdmin) return null;
  return profile;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const profile = await getTeacherProfile();
  if (!profile) {
    return NextResponse.json({ error: "Teacher access required." }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { id } = await params;
    const students = await listClassStudents({ teacherId: profile.id, classId: id });
    const selected = Array.isArray(body.studentIds) && body.studentIds.length
      ? students.filter((student) => body.studentIds.includes(student.student.id))
      : students;
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
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not create bulk homework." }, { status: 400 });
  }
}
