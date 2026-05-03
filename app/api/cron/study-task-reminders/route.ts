import { NextResponse } from "next/server";
import { processStudyTaskReminders } from "@/lib/study-lists-store";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (secret) {
    return authHeader === `Bearer ${secret}`;
  }

  // No CRON_SECRET configured — allow Vercel platform cron header as fallback (dev/staging only)
  if (process.env.APP_ENV !== "production") {
    return Boolean(request.headers.get("x-vercel-cron"));
  }

  return false;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const created = await processStudyTaskReminders();
  return NextResponse.json({
    ok: true,
    createdCount: created.length
  });
}
