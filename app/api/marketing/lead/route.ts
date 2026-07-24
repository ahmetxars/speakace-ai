import { NextRequest, NextResponse } from "next/server";
import { createMarketingLead } from "@/lib/marketing-leads";
import { sendInstitutionLeadEmail, sendLeadMagnetEmail, sendPlusTrialEmail, sendTeacherLeadEmail } from "@/lib/server/email";
import { checkRateLimit, getRequestIp, rateLimitResponse } from "@/lib/server/rate-limit";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  const ip = getRequestIp(request);
  const limit = checkRateLimit({ key: `lead:${ip}`, windowMs: 1000 * 60 * 60, max: 5 });
  if (!limit.allowed) {
    return rateLimitResponse(limit.retryAfterSeconds);
  }

  const body = (await request.json().catch(() => null)) as
    | { email?: string; name?: string; source?: string }
    | null;

  const email = body?.email?.trim().toLowerCase() ?? "";
  const name = body?.name?.trim() ?? "";
  const source = body?.source?.trim() ?? "site";

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }

  const lead = await createMarketingLead({ email, name, source });

  try {
    if (source.includes("schools") || source.includes("institution")) {
      await sendInstitutionLeadEmail({ to: email, name });
    } else if (source.includes("teachers") || source.includes("teacher")) {
      await sendTeacherLeadEmail({ to: email, name });
    } else {
      await sendLeadMagnetEmail({ to: email, name });
    }
    if (source.includes("pricing") || source.includes("coupon") || source.includes("launch")) {
      await sendPlusTrialEmail({ to: email, name });
    }
  } catch {
    // Non-blocking: lead capture should still succeed if email delivery fails.
  }

  return NextResponse.json({ ok: true, lead });
}
