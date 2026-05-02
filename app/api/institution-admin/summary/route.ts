import { NextResponse } from "next/server";
import { getOrgAdminSummary, getOrgForAdmin } from "@/lib/server/org-store";
import { permissionErrorResponse, requireSchoolAdmin } from "@/lib/server/permissions";
import { hasDatabaseUrl } from "@/lib/server/db";
import { getInstitutionAdminSummary } from "@/lib/classroom-store";

export async function GET() {
  try {
    const profile = await requireSchoolAdmin();

    if (hasDatabaseUrl()) {
      const org = await getOrgForAdmin(profile.id);
      if (!org) {
        return NextResponse.json(
          { error: "No organization found for your account. Please set up your institution first." },
          { status: 404 }
        );
      }
      const summary = await getOrgAdminSummary(org.id);
      return NextResponse.json({ ...summary, orgId: org.id, orgName: org.name });
    }

    // In-memory dev fallback
    const summary = await getInstitutionAdminSummary();
    return NextResponse.json(summary);
  } catch (error) {
    return permissionErrorResponse(error);
  }
}
