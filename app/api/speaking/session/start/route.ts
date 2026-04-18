import { NextResponse } from "next/server";
import { checkRateLimit, getRequestIp } from "@/lib/server/rate-limit";
import { createSession } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const ip = getRequestIp(request);
    const userId = String(body.userId ?? "demo-user");
    const limit = checkRateLimit({
      key: `session-start:${ip}:${userId}`,
      windowMs: 1000 * 60 * 15,
      max: 18
    });
    if (!limit.allowed) {
      return NextResponse.json({ error: "Too many session starts. Please try again later." }, { status: 429 });
    }

    const result = await createSession({
      userId,
      examType: body.examType,
      taskType: body.taskType,
      difficulty: body.difficulty,
      promptId: body.promptId,
      customPrompt: body.customPrompt
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("session/start failed", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unexpected session creation error."
      },
      { status: 500 }
    );
  }
}
