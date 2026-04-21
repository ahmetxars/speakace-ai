import { NextResponse } from "next/server";
import { getAuthenticatedUserFromCookies } from "@/lib/server/auth";
import { getProgressSummary } from "@/lib/store";

export async function GET() {
  const profile = await getAuthenticatedUserFromCookies();
  if (!profile || profile.role === "guest") {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  return NextResponse.json(await getProgressSummary(profile.id));
}
