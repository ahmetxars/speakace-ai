import { NextResponse } from "next/server";
import { getRecordingRecoveryStatus } from "@/lib/practice-recovery";
import { getAuthenticatedUserFromCookies } from "@/lib/server/auth";

export async function GET() {
  const profile = await getAuthenticatedUserFromCookies();
  if (!profile || profile.role === "guest") {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  return NextResponse.json(await getRecordingRecoveryStatus(profile.id), {
    headers: { "Cache-Control": "private, no-store" }
  });
}
