import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  clearAdminPanelSession,
  getAdminSessionCookieName,
  getAdminSessionCookieOptions
} from "@/lib/server/admin-panel";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getAdminSessionCookieName())?.value;
  await clearAdminPanelSession(token);
  cookieStore.set(getAdminSessionCookieName(), "", getAdminSessionCookieOptions(new Date(0)));
  return NextResponse.json({ ok: true });
}
