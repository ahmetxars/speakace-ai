import { NextResponse } from "next/server";
import { getAuthenticatedUserFromCookies } from "@/lib/server/auth";
import { getWritingSession } from "@/lib/writing-store";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const profile = await getAuthenticatedUserFromCookies();
  if (!profile || profile.role === "guest") {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { id } = await params;
  const session = await getWritingSession(id);
  if (!session || (session.userId !== profile.id && !profile.isAdmin)) {
    return NextResponse.json({ error: "Writing session not found." }, { status: 404 });
  }
  return NextResponse.json({ session });
}
