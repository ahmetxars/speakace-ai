import { NextResponse } from "next/server";
import { processStudyTaskReminders } from "@/lib/study-lists-store";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  const vercelCron = request.headers.get("x-vercel-cron");

  if (secret && authHeader === `Bearer ${secret}`) {
    return true;
  }

  return Boolean(vercelCron);
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
