import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getNotificationsForUser } from "@/lib/notifications";
import { getAuthenticatedUser, getSessionCookieName } from "@/lib/server/auth";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const profile = await getAuthenticatedUser(token);

  if (!profile) {
    return NextResponse.json({ notifications: [] });
  }

  return NextResponse.json({
    notifications: await getNotificationsForUser(profile, false)
  });
}
