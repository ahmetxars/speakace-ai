import { NextResponse } from "next/server";
import { listOrgTeacherSummaries, getOrgForAdmin } from "@/lib/server/org-store";
import { permissionErrorResponse, requireSchoolAdmin } from "@/lib/server/permissions";
import { hasDatabaseUrl } from "@/lib/server/db";
import { listInstitutionTeacherSummaries } from "@/lib/classroom-store";

export async function GET() {
  try {
    const profile = await requireSchoolAdmin();
    let summaries;

    if (hasDatabaseUrl()) {
      const org = await getOrgForAdmin(profile.id);
      if (!org) {
        return NextResponse.json({ error: "No organization found for your account." }, { status: 404 });
      }
      summaries = await listOrgTeacherSummaries(org.id);
    } else {
      summaries = await listInstitutionTeacherSummaries();
    }

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
  } catch (error) {
    return permissionErrorResponse(error);
  }
}

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}
