import { NextRequest, NextResponse } from "next/server";
import { isMarketingLeadPersistenceAvailable } from "@/lib/marketing-leads";
import { captureMarketingLead } from "@/lib/server/marketing-lead-nurture";
import { checkRateLimit, getRequestIp, rateLimitResponse } from "@/lib/server/rate-limit";

type LeadRequestBody = {
  email?: string;
  name?: string;
  source?: string;
  consent?: boolean;
  company?: string;
  locale?: string;
  landingPath?: string;
  referrerHost?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
};

function isValidEmail(email: string) {
  return email.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  const ip = getRequestIp(request);
  const limit = checkRateLimit({ key: `lead:${ip}`, windowMs: 1000 * 60 * 60, max: 5 });
  if (!limit.allowed) {
    return rateLimitResponse(limit.retryAfterSeconds);
  }

  if (!isMarketingLeadPersistenceAvailable()) {
    return NextResponse.json(
      { error: "Lead capture is temporarily unavailable. Please try again later." },
      { status: 503 }
    );
  }

  const body = (await request.json().catch(() => null)) as LeadRequestBody | null;

  // Honeypot submissions get a generic success so bots do not learn the rule.
  if (body?.company?.trim()) {
    return NextResponse.json({ ok: true });
  }

  const email = body?.email?.trim().toLowerCase() ?? "";
  const name = body?.name?.trim() ?? "";
  const source = body?.source?.trim() ?? "site";

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }
  if (body?.consent !== true) {
    return NextResponse.json(
      { error: "Please agree to receive the requested material and its follow-up confirmation option." },
      { status: 400 }
    );
  }

  try {
    await captureMarketingLead({
      email,
      name,
      source,
      consent: true,
      attribution: {
        locale: body.locale,
        landingPath: body.landingPath,
        referrerHost: body.referrerHost,
        utmSource: body.utmSource,
        utmMedium: body.utmMedium,
        utmCampaign: body.utmCampaign,
        utmContent: body.utmContent,
        utmTerm: body.utmTerm
      }
    });

    // Keep the public response identical for new, existing, queued, and
    // suppressed addresses so this endpoint cannot enumerate recipients.
    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { error: "We could not save your request. Please try again." },
      { status: 500 }
    );
  }
}
