import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAuthenticatedUser, getSessionCookieName } from "@/lib/server/auth";
import { createStudyFolder, importStudyListData, listStudyListData } from "@/lib/study-lists-store";
import { StudyListFolder, StudyListItem } from "@/lib/types";

async function getProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  return getAuthenticatedUser(token);
}

export async function GET() {
  const profile = await getProfile();
  if (!profile) {
    return NextResponse.json({ folders: [], items: [], tasks: [] }, { status: 401 });
  }

  return NextResponse.json(await listStudyListData(profile.id));
}

export async function POST(request: Request) {
  const profile = await getProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    action?: "create-folder" | "import";
    name?: string;
    folders?: StudyListFolder[];
    items?: StudyListItem[];
  };

  if (body.action === "import") {
    await importStudyListData(profile.id, {
      folders: body.folders ?? [],
      items: body.items ?? []
    });
    return NextResponse.json(await listStudyListData(profile.id));
  }

  const folder = await createStudyFolder(profile.id, body.name ?? "");
  return NextResponse.json({ folder });
}
