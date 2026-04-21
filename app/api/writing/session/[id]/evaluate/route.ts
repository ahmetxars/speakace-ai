import { NextResponse } from "next/server";
import { getAuthenticatedUserFromCookies } from "@/lib/server/auth";
import { evaluateStoredWritingSession, getWritingSession } from "@/lib/writing-store";

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

    const session = await evaluateStoredWritingSession(id);
    if (!session) {
      return NextResponse.json({ error: "Writing session not found or has no draft." }, { status: 404 });
    }
    return NextResponse.json({ session });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Writing evaluation failed." }, { status: 500 });
  }
}
