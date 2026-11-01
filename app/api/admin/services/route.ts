import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  getAdminPanelSession,
  getAdminSessionCookieName,
} from "@/lib/server/admin-panel";
import { checkServices } from "@/lib/server/service-health";
import { checkRateLimit, rateLimitResponse } from "@/lib/server/rate-limit";
export const maxDuration = 30;
export async function POST() {
  const cookieStore = await cookies();
  const session = await getAdminPanelSession(
    cookieStore.get(getAdminSessionCookieName())?.value,
  );
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const limit = checkRateLimit({
    key: "admin-service-check",
    windowMs: 60000,
    max: 3,
  });
  if (!limit.allowed)
    return rateLimitResponse(
      limit.retryAfterSeconds,
      "Kontrol için bir dakika bekleyin.",
    );
  return NextResponse.json(
    { checks: await checkServices(), checkedAt: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
