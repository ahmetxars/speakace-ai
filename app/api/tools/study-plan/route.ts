import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAuthenticatedUser, getSessionCookieName } from "@/lib/server/auth";
import { sendGeneratedStudyPlanEmail, hasEmailTransport } from "@/lib/server/email";
import { createStudyFolder, createStudyTask, listStudyListData } from "@/lib/study-lists-store";

async function getProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  return getAuthenticatedUser(token);
}

export async function POST(request: Request) {
  const profile = await getProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    title?: string;
    slug?: string;
    plan?: string;
    dueDays?: number;
    goalType?: string;
    minutesPerDay?: number;
    daysPerWeek?: number;
  };

  const title = body.title?.trim() || "Speaking study plan";
  const plan = body.plan?.trim();
  if (!plan) {
    return NextResponse.json({ error: "Plan text is required." }, { status: 400 });
  }

  const studyData = await listStudyListData(profile.id);
  const existingFolder = studyData.folders.find((folder) => folder.name.toLowerCase() === "tool plans");
  const folder = existingFolder ?? (await createStudyFolder(profile.id, "Tool plans"));
  const dueDays = Math.max(1, Math.min(30, body.dueDays ?? 7));
  const dueAt = new Date(Date.now() + dueDays * 24 * 60 * 60 * 1000).toISOString();

  const noteParts = [
    plan,
    body.goalType ? `Goal: ${body.goalType}` : "",
    body.minutesPerDay ? `Daily minutes: ${body.minutesPerDay}` : "",
    body.daysPerWeek ? `Days per week: ${body.daysPerWeek}` : "",
    body.slug ? `Source tool: ${body.slug}` : ""
  ].filter(Boolean);

  const task = await createStudyTask(profile.id, {
    folderId: folder.id,
    title,
    note: noteParts.join("\n"),
    dueAt
  });

  if (hasEmailTransport()) {
    await sendGeneratedStudyPlanEmail({
      to: profile.email,
      name: profile.name,
      title,
      plan,
      dueAt
    });
  }

  return NextResponse.json({
    task,
    folder,
    message: "Plan saved to your study list and sent to your email."
  });
}
