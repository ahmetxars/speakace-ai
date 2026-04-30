import { NextResponse } from "next/server";
import {
  markOnboardingEmailSent,
  getUsersDueForNextOnboardingEmail,
  sendOnboardingEmail,
  getUsersForDailyTip,
  sendDailyTipEmail
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
  const skipTips = url.searchParams.get("skipTips") === "1";
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 250) : 100;

  // ── Onboarding emails ──────────────────────────────────────────────────────
  let onboardingSent = 0;
  let onboardingSkipped = 0;
  let onboardingFailed = 0;
  const onboardingUsers = await getUsersDueForNextOnboardingEmail(limit);

  for (const user of onboardingUsers) {
    try {
      if (dryRun) {
        onboardingSkipped++;
        continue;
      }

      const result = await sendOnboardingEmail(user.id, user.nextEmailNumber);
      if (result.ok) {
        await markOnboardingEmailSent(user.id, user.nextEmailNumber);
        onboardingSent++;
      } else if (result.skipped) {
        onboardingSkipped++;
      } else {
        onboardingFailed++;
      }
    } catch {
      onboardingFailed++;
    }
  }

  // ── Daily tip emails ───────────────────────────────────────────────────────
  let tipSent = 0;
  let tipSkipped = 0;
  let tipFailed = 0;

  if (!skipTips) {
    const tipUsers = await getUsersForDailyTip(200);

    for (const user of tipUsers) {
      try {
        if (dryRun) {
          tipSkipped++;
          continue;
        }

        const result = await sendDailyTipEmail(user.id);
        if (result.ok) {
          tipSent++;
        } else if (result.skipped) {
          tipSkipped++;
        } else {
          tipFailed++;
        }
      } catch {
        tipFailed++;
      }
    }
  }

  return NextResponse.json({
    ok: true,
    dryRun,
    onboarding: {
      queued: onboardingUsers.length,
      sent: onboardingSent,
      skipped: onboardingSkipped,
      failed: onboardingFailed,
      sample: onboardingUsers.slice(0, 5).map((u) => ({
        id: u.id,
        email: u.email,
        nextEmailNumber: u.nextEmailNumber
      }))
    },
    dailyTip: skipTips
      ? { skipped: true }
      : { sent: tipSent, skipped: tipSkipped, failed: tipFailed }
  });
}
