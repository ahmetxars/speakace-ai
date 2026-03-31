import { NextResponse } from "next/server";
import { createMarketingLead } from "@/lib/marketing-leads";
import { sendLeadMagnetEmail } from "@/lib/server/email";

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
    await sendLeadMagnetEmail({ to: email, name });
  } catch {
    // Non-blocking: lead capture should still succeed if email delivery fails.
  }

  return NextResponse.json({ ok: true, lead });
}
