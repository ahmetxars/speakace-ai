import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  getSessionCookieName,
  getSessionCookieOptions,
  signOutSession
} from "@/lib/server/auth";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  await signOutSession(token);
  cookieStore.set(getSessionCookieName(), "", getSessionCookieOptions(new Date(0)));
  return NextResponse.json({ ok: true });
}
