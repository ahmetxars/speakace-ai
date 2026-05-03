import { NextResponse } from "next/server";
import { getOrgForAdmin, getOrgTeacherDetail } from "@/lib/server/org-store";
import { permissionErrorResponse, requireSchoolAdmin } from "@/lib/server/permissions";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const profile = await requireSchoolAdmin();
    const org = await getOrgForAdmin(profile.id);
    if (!org) {
      return NextResponse.json({ error: "No organization found for your account." }, { status: 404 });
    }
    const { id } = await params;
    const detail = await getOrgTeacherDetail(org.id, id);
    return NextResponse.json(detail);
  } catch (error) {
    return permissionErrorResponse(error);
  }
}
