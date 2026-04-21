import { NextResponse } from "next/server";
import { getAuthenticatedUserFromCookies } from "@/lib/server/auth";
import { getWritingSession, submitWritingDraft } from "@/lib/writing-store";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const profile = await getAuthenticatedUserFromCookies();
    if (!profile || profile.role === "guest") {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const { id } = await params;
    const existing = await getWritingSession(id);
    if (!existing || (existing.userId !== profile.id && !profile.isAdmin)) {
      return NextResponse.json({ error: "Writing session not found." }, { status: 404 });
    }

    const body = await request.json();
    const result = await submitWritingDraft({ sessionId: id, draftText: String(body.draftText ?? ""), minutesSpent: body.minutesSpent });
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save writing draft." }, { status: 500 });
  }
}
