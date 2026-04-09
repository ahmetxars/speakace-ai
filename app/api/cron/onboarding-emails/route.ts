import { NextResponse } from "next/server";
import {
  getUsersForOnboardingEmail,
  markOnboardingEmailSent,
  sendOnboardingEmail
} from "@/lib/server/email-sequences";

// Map from days-since-signup to email number
const SCHEDULE: Array<{ dayOffset: number; emailNumber: number }> = [
  { dayOffset: 2, emailNumber: 2 },
  { dayOffset: 4, emailNumber: 3 },
  { dayOffset: 7, emailNumber: 4 },
  { dayOffset: 10, emailNumber: 5 }
];

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

  let totalSent = 0;
  let totalSkipped = 0;

  for (const { dayOffset, emailNumber } of SCHEDULE) {
    const users = await getUsersForOnboardingEmail(dayOffset);

    for (const user of users) {
      // Only send if we haven't yet sent this email number for this user
      if (user.onboardingEmailsSent >= emailNumber) {
        totalSkipped++;
        continue;
      }

      try {
        const result = await sendOnboardingEmail(user.id, emailNumber);
        if (result.ok) {
          await markOnboardingEmailSent(user.id, emailNumber);
          totalSent++;
        } else if (result.skipped) {
          totalSkipped++;
        }
      } catch {
        // Non-blocking — continue with next user
      }
    }
  }

  return NextResponse.json({ ok: true, sent: totalSent, skipped: totalSkipped });
}
