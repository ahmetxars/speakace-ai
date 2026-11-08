import { NextResponse } from "next/server";
import { checkSharedRateLimit, sharedRateLimitResponse } from "@/lib/server/rate-limit";
import { getAuthenticatedUserFromCookies } from "@/lib/server/auth";
import { createWritingSession } from "@/lib/writing-store";

export async function POST(request: Request) {
  try {
    const profile = await getAuthenticatedUserFromCookies();
    if (!profile || profile.role === "guest") {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const body = await request.json();
    const limit = await checkSharedRateLimit({ key: `writing-start:${profile.id}`, windowMs: 1000 * 60 * 15, max: 18 });
    if (!limit.allowed) {
      return sharedRateLimitResponse(limit, "Too many writing session starts. Please try again later.");
    }

    const result = await createWritingSession({
      userId: profile.id,
      taskType: body.taskType,
      difficulty: body.difficulty,
      promptId: body.promptId
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected writing session error." }, { status: 500 });
  }
}
