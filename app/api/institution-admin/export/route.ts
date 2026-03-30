import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { listInstitutionTeacherSummaries } from "@/lib/classroom-store";
import { getAuthenticatedUser, getSessionCookieName } from "@/lib/server/auth";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const profile = await getAuthenticatedUser(token);
  if (!profile?.isAdmin) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const summaries = await listInstitutionTeacherSummaries();
  const rows = [
    ["teacher_name", "teacher_email", "class_count", "student_count", "active_students", "average_score", "pending_approvals", "at_risk_students"].join(","),
    ...summaries.map((item) =>
      [
        csvCell(item.teacher.name),
        csvCell(item.teacher.email),
        item.classCount,
        item.studentCount,
        item.activeStudents,
        item.averageScore,
        item.pendingApprovalCount ?? 0,
        item.atRiskStudentCount ?? 0
      ].join(",")
    )
  ].join("\n");

  return new NextResponse(rows, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="institution-report.csv"'
    }
  });
}

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}
