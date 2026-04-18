import { NextResponse } from "next/server";
import {
  markOnboardingEmailSent,
  getUsersDueForNextOnboardingEmail,
  sendOnboardingEmail
} from "@/lib/server/email-sequences";

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

  const url = new URL(request.url);
  const limitParam = Number(url.searchParams.get("limit") ?? "100");
  const dryRun = url.searchParams.get("dryRun") === "1";
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 250) : 100;

  let totalSent = 0;
  let totalSkipped = 0;
  let totalFailed = 0;
  const users = await getUsersDueForNextOnboardingEmail(limit);

  for (const user of users) {
    try {
      if (dryRun) {
        totalSkipped++;
        continue;
      }

      const result = await sendOnboardingEmail(user.id, user.nextEmailNumber);
      if (result.ok) {
        await markOnboardingEmailSent(user.id, user.nextEmailNumber);
        totalSent++;
      } else if (result.skipped) {
        totalSkipped++;
      } else {
        totalFailed++;
      }
    } catch {
      totalFailed++;
    }
  }

  return NextResponse.json({
    ok: true,
    dryRun,
    queuedUsers: users.length,
    sent: totalSent,
    skipped: totalSkipped,
    failed: totalFailed,
    sample: users.slice(0, 10).map((user) => ({
      id: user.id,
      email: user.email,
      nextEmailNumber: user.nextEmailNumber,
      onboardingEmailsSent: user.onboardingEmailsSent
    }))
  });
}
