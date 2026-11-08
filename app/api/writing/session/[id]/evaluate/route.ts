import { NextResponse } from "next/server";
import { getAuthenticatedUserFromCookies } from "@/lib/server/auth";
import { checkRateLimit, rateLimitResponse } from "@/lib/server/rate-limit";
import { evaluateStoredWritingSession, getWritingSession, MAX_WRITING_DRAFT_LENGTH } from "@/lib/writing-store";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const profile = await getAuthenticatedUserFromCookies();
    if (!profile || profile.role === "guest") {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const { id } = await params;
    const existing = await getWritingSession(id);
    if (!existing || (existing.userId !== profile.id && !profile.isAdmin)) {
      return NextResponse.json({ error: "Writing session not found or has no draft." }, { status: 404 });
    }

    if (existing.draftText && existing.draftText.length > MAX_WRITING_DRAFT_LENGTH) {
      return NextResponse.json({ error: "Shorten your draft before evaluating it." }, { status: 400 });
    }

    const limit = checkRateLimit({ key: `writing-evaluate:${profile.id}`, windowMs: 1000 * 60 * 15, max: 18 });
    if (!limit.allowed) return rateLimitResponse(limit.retryAfterSeconds);

    const session = await evaluateStoredWritingSession(id);
    if (!session) {
      return NextResponse.json({ error: "Writing session not found or has no draft." }, { status: 404 });
    }
    return NextResponse.json({ session });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Writing evaluation failed." }, { status: 500 });
  }
}
