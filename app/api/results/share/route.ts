import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createSharedResultCard } from "@/lib/shared-result-cards";
import { getAuthenticatedUser, getSessionCookieName } from "@/lib/server/auth";
import { getSession } from "@/lib/store";
import { getStudentProfile } from "@/lib/student-profile-store";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const profile = await getAuthenticatedUser(token);
  if (!profile || profile.role === "guest") {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const sessionId = String(body.sessionId ?? "");
    const session = await getSession(sessionId);
    if (!session || session.userId !== profile.id || !session.report) {
      return NextResponse.json({ error: "Result session not found." }, { status: 404 });
    }

    const studentProfile = await getStudentProfile(profile.id);
    const card = await createSharedResultCard({
      sessionId: session.id,
      userId: profile.id,
      promptTitle: session.prompt.title,
      examType: session.examType,
      taskType: session.taskType,
      difficulty: session.difficulty,
      overallScore: session.report.overall,
      scaleLabel: session.report.scaleLabel,
      delta: typeof body.delta === "number" ? body.delta : body.delta ? Number(body.delta) : null,
      learnerName: body.learnerName ? String(body.learnerName) : profile.name,
      avatarDataUrl: studentProfile.avatarDataUrl || undefined,
      localeFlag: body.localeFlag ? String(body.localeFlag) : "🌍",
      streakLabel: body.streakLabel ? String(body.streakLabel) : "",
      badgeLabel: body.badgeLabel ? String(body.badgeLabel) : "Building momentum",
      nextExercise: session.report.nextExercise,
      categories: session.report.categories.map((item) => ({ label: item.label, score: item.score }))
    });

    const origin = new URL(request.url).origin;
    return NextResponse.json({ slug: card.slug, shareUrl: `${origin}/share/${card.slug}` });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not create share card." }, { status: 400 });
  }
}
