import { NextResponse } from "next/server";
import { ensureTeacherOwnsClass, listClassStudents } from "@/lib/classroom-store";
import { permissionErrorResponse, requireTeacher } from "@/lib/server/permissions";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const profile = await requireTeacher();
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
    return permissionErrorResponse(error);
  }
}

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}
