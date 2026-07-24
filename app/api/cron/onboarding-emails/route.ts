import { NextResponse } from "next/server";
import {
  markOnboardingEmailSent,
  getUsersDueForNextOnboardingEmail,
  sendOnboardingEmail,
  getUsersForDailyTip,
  sendDailyTipEmail,
  getUsersDueForPracticeLimitRecoveryEmail,
  sendPracticeLimitRecoveryEmail,
  getUsersDueForCheckoutRecoveryEmail,
  sendCheckoutRecoveryEmail,
  getUsersDueForTrialLifecycleEmail,
  sendTrialLifecycleEmail,
  getCurrentEmailQuotaBlock,
  getEmailLifecycleBudgetStatus
} from "@/lib/server/email-sequences";

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

  const url = new URL(request.url);
  const limitParam = Number(url.searchParams.get("limit") ?? "100");
  const dryRun = url.searchParams.get("dryRun") === "1";
  const skipTips = url.searchParams.get("skipTips") === "1";
  const skipRecovery = url.searchParams.get("skipRecovery") === "1";
  const recoveryEnabled =
    process.env.ENABLE_REVENUE_RECOVERY_EMAILS === "true" ||
    process.env.ENABLE_PRACTICE_LIMIT_RECOVERY_EMAILS === "true";
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 250) : 100;
  const quotaBlock = await getCurrentEmailQuotaBlock();
  const lifecycleBudget = await getEmailLifecycleBudgetStatus();
  let remainingAttempts = lifecycleBudget.remaining;
  const sendingSuppressed = dryRun || Boolean(quotaBlock);

  // ── 1. Trial activation and renewal transparency ──────────────────────────
  let trialSent = 0;
  let trialSkipped = 0;
  let trialFailed = 0;
  const trialUsers = await getUsersDueForTrialLifecycleEmail(limit);

  for (const user of trialUsers) {
    try {
      if (sendingSuppressed || remainingAttempts <= 0) {
        trialSkipped++;
        continue;
      }

      remainingAttempts--;
      const result = await sendTrialLifecycleEmail(user.id, user.stage);
      if (result.ok) {
        trialSent++;
      } else if (result.skipped) {
        trialSkipped++;
      } else {
        trialFailed++;
      }
    } catch {
      trialFailed++;
    }
  }

  // ── 2. Checkout recovery ───────────────────────────────────────────────────
  let checkoutRecoverySent = 0;
  let checkoutRecoverySkipped = 0;
  let checkoutRecoveryFailed = 0;
  const checkoutRecoveryUsers = skipRecovery || !recoveryEnabled
    ? []
    : await getUsersDueForCheckoutRecoveryEmail(Math.min(limit, 50));

  for (const user of checkoutRecoveryUsers) {
    try {
      if (sendingSuppressed || remainingAttempts <= 0) {
        checkoutRecoverySkipped++;
        continue;
      }

      remainingAttempts--;
      const result = await sendCheckoutRecoveryEmail(user.id);
      if (result.ok) {
        checkoutRecoverySent++;
      } else if (result.skipped) {
        checkoutRecoverySkipped++;
      } else {
        checkoutRecoveryFailed++;
      }
    } catch {
      checkoutRecoveryFailed++;
    }
  }

  // ── 3. High-intent practice limit recovery ────────────────────────────────
  let recoverySent = 0;
  let recoverySkipped = 0;
  let recoveryFailed = 0;
  const recoveryUsers = skipRecovery || !recoveryEnabled
    ? []
    : await getUsersDueForPracticeLimitRecoveryEmail(Math.min(limit, 50));

  for (const user of recoveryUsers) {
    try {
      if (sendingSuppressed || remainingAttempts <= 0) {
        recoverySkipped++;
        continue;
      }

      remainingAttempts--;
      const result = await sendPracticeLimitRecoveryEmail(user.id);
      if (result.ok) {
        recoverySent++;
      } else if (result.skipped) {
        recoverySkipped++;
      } else {
        recoveryFailed++;
      }
    } catch {
      recoveryFailed++;
    }
  }

  // ── 4. Onboarding progression ──────────────────────────────────────────────
  let onboardingSent = 0;
  let onboardingSkipped = 0;
  let onboardingFailed = 0;
  const onboardingUsers = await getUsersDueForNextOnboardingEmail(limit);

  for (const user of onboardingUsers) {
    try {
      if (sendingSuppressed || remainingAttempts <= 0) {
        onboardingSkipped++;
        continue;
      }

      remainingAttempts--;
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

  // ── 5. General tips use only the budget left by high-intent messages ───────
  let tipSent = 0;
  let tipSkipped = 0;
  let tipFailed = 0;

  if (!skipTips && remainingAttempts > 0) {
    const tipUsers = await getUsersForDailyTip(Math.min(200, remainingAttempts));

    for (const user of tipUsers) {
      try {
        if (sendingSuppressed || remainingAttempts <= 0) {
          tipSkipped++;
          continue;
        }

        remainingAttempts--;
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
    emailQuota: quotaBlock
      ? { blocked: true, kind: quotaBlock.kind, detectedAt: quotaBlock.detectedAt }
      : { blocked: false },
    lifecycleBudget: {
      limit: lifecycleBudget.limit,
      sentToday: lifecycleBudget.sentToday,
      attemptsRemaining: remainingAttempts
    },
    onboarding: {
      queued: onboardingUsers.length,
      sent: onboardingSent,
      skipped: onboardingSkipped,
      failed: onboardingFailed,
      sample: onboardingUsers.slice(0, 5).map((u) => ({
        id: u.id,
        nextEmailNumber: u.nextEmailNumber
      }))
    },
    checkoutRecovery: skipRecovery || !recoveryEnabled
      ? { skipped: true, enabled: recoveryEnabled }
      : {
          enabled: true,
          queued: checkoutRecoveryUsers.length,
          sent: checkoutRecoverySent,
          skipped: checkoutRecoverySkipped,
          failed: checkoutRecoveryFailed
        },
    practiceLimitRecovery: skipRecovery || !recoveryEnabled
      ? { skipped: true, enabled: recoveryEnabled }
      : {
          enabled: true,
          queued: recoveryUsers.length,
          sent: recoverySent,
          skipped: recoverySkipped,
          failed: recoveryFailed,
          reasons: recoveryUsers.reduce<Record<string, number>>((summary, user) => {
            summary[user.reason] = (summary[user.reason] ?? 0) + 1;
            return summary;
          }, {})
        },
    dailyTip: skipTips
      ? { skipped: true }
      : { sent: tipSent, skipped: tipSkipped, failed: tipFailed },
    trialLifecycle: {
      queued: trialUsers.length,
      sent: trialSent,
      skipped: trialSkipped,
      failed: trialFailed,
      stages: trialUsers.reduce<Record<string, number>>((summary, user) => {
        summary[user.stage] = (summary[user.stage] ?? 0) + 1;
        return summary;
      }, {})
    }
  });
}
