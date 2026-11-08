import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAuthenticatedUser, getSessionCookieName } from "@/lib/server/auth";
import { sendGeneratedStudyPlanEmail, hasEmailTransport } from "@/lib/server/email";
import { checkSharedRateLimit, sharedRateLimitResponse } from "@/lib/server/rate-limit";
import { createStudyFolder, createStudyTask, listStudyListData } from "@/lib/study-lists-store";

async function getProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  return getAuthenticatedUser(token);
}

export async function POST(request: Request) {
  const profile = await getProfile();
  if (!profile || profile.role === "guest") {
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

  const title = (typeof body?.title === "string" ? body.title.trim().slice(0, 160) : "") || "Speaking study plan";
  const plan = typeof body?.plan === "string" ? body.plan.trim() : "";
  if (!plan) {
    return NextResponse.json({ error: "Plan text is required." }, { status: 400 });
  }

  if (plan.length > 12_000) {
    return NextResponse.json({ error: "Plan text must be at most 12,000 characters." }, { status: 400 });
  }

  const limit = await checkSharedRateLimit({
    key: `study-plan:${profile.id}`,
    windowMs: 60 * 60 * 1000,
    max: 5
  });
  if (!limit.allowed) return sharedRateLimitResponse(limit, "Too many study plans. Please try again later.");

  const studyData = await listStudyListData(profile.id);
  const existingFolder = studyData.folders.find((folder) => folder.name.toLowerCase() === "tool plans");
  const folder = existingFolder ?? (await createStudyFolder(profile.id, "Tool plans"));
  const dueDays = typeof body.dueDays === "number" && Number.isFinite(body.dueDays) ? Math.max(1, Math.min(30, body.dueDays)) : 7;
  const dueAt = new Date(Date.now() + dueDays * 24 * 60 * 60 * 1000).toISOString();

  const noteParts = [
    plan,
    typeof body.goalType === "string" && body.goalType ? `Goal: ${body.goalType.slice(0, 160)}` : "",
    Number.isFinite(body.minutesPerDay) ? `Daily minutes: ${body.minutesPerDay}` : "",
    Number.isFinite(body.daysPerWeek) ? `Days per week: ${body.daysPerWeek}` : "",
    typeof body.slug === "string" && body.slug ? `Source tool: ${body.slug.slice(0, 120)}` : ""
  ].filter(Boolean);

  const task = await createStudyTask(profile.id, {
    folderId: folder.id,
    title,
    note: noteParts.join("\n"),
    dueAt
  });

  let emailSent = false;
  if (hasEmailTransport()) {
    const delivery = await sendGeneratedStudyPlanEmail({
      to: profile.email,
      name: profile.name,
      title,
      plan,
      dueAt
    }).catch(() => null);
    emailSent = delivery?.ok === true;
  }

  return NextResponse.json({
    task,
    folder,
    message: emailSent ? "Plan saved to your study list and sent to your email." : "Plan saved to your study list."
  });
}
