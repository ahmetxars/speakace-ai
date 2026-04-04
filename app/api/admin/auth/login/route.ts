import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  authenticateAdminPanel,
  createAdminPanelSession,
  getAdminSessionCookieName,
  getAdminSessionCookieOptions
} from "@/lib/server/admin-panel";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const identity = await authenticateAdminPanel({
      identifier: String(body.identifier ?? ""),
      password: String(body.password ?? "")
    });

    const session = await createAdminPanelSession(identity);
    const cookieStore = await cookies();
    cookieStore.set(
      getAdminSessionCookieName(),
      session.token,
      getAdminSessionCookieOptions(session.expiresAt)
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Admin sign in failed." },
      { status: 400 }
    );
  }
}
