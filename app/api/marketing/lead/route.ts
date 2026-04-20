import { NextResponse } from "next/server";
import { createMarketingLead } from "@/lib/marketing-leads";
import { sendInstitutionLeadEmail, sendLaunchOfferEmail, sendLeadMagnetEmail, sendTeacherLeadEmail } from "@/lib/server/email";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
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
      await sendLaunchOfferEmail({ to: email, name, couponCode: "LAUNCH20" });
    }
  } catch {
    // Non-blocking: lead capture should still succeed if email delivery fails.
  }

  return NextResponse.json({ ok: true, lead });
}
