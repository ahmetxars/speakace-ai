import { NextResponse } from "next/server";
import { getInstitutionAnalytics } from "@/lib/classroom-store";
import { permissionErrorResponse, requireTeacher } from "@/lib/server/permissions";

export async function GET() {
  try {
    const profile = await requireTeacher();
    const analytics = await getInstitutionAnalytics(profile.id);
    return NextResponse.json({ analytics });
  } catch (error) {
    return permissionErrorResponse(error);
  }
}
