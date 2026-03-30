import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ensureTeacherOwnsClass, listClassStudents } from "@/lib/classroom-store";
import { getAuthenticatedUser, getSessionCookieName } from "@/lib/server/auth";

async function getTeacherProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const profile = await getAuthenticatedUser(token);
  if (!profile?.isTeacher && !profile?.isAdmin) return null;
  return profile;
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const profile = await getTeacherProfile();
  if (!profile) {
    return NextResponse.json({ error: "Teacher access required." }, { status: 403 });
  }

  try {
    const { id } = await params;
    await ensureTeacherOwnsClass(profile.id, id);
    const students = await listClassStudents({ teacherId: profile.id, classId: id });
    const rows = [
      ["name", "email", "average_score", "best_score", "weakest_skill", "total_sessions", "last_exam", "last_task", "risk_flags"].join(","),
      ...students.map((item) =>
        [
          csvCell(item.student.name),
          csvCell(item.student.email),
          item.averageScore,
          item.bestScore ?? "",
          csvCell(item.weakestSkill ?? ""),
          item.totalSessions,
          csvCell(item.lastExamType ?? ""),
          csvCell(item.lastTaskType ?? ""),
          csvCell((item.riskFlags ?? []).join(" | "))
        ].join(",")
      )
    ].join("\n");

    return new NextResponse(rows, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="class-${id}-report.csv"`
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not export class report." }, { status: 400 });
  }
}

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}
