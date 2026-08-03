import { NextRequest, NextResponse } from "next/server";
import {
  isMarketingLeadPersistenceAvailable,
  revokeMarketingConsentEverywhere
} from "@/lib/marketing-leads";
import { checkRateLimit, getRequestIp, rateLimitResponse } from "@/lib/server/rate-limit";
import { verifyUnsubscribeToken } from "@/lib/server/unsubscribe-token";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const queryEmail = req.nextUrl.searchParams.get("email") ?? "";
  const queryToken = req.nextUrl.searchParams.get("token") ?? "";
  const emailValue = typeof body?.email === "string" ? body.email : queryEmail;
  const tokenValue = typeof body?.token === "string" ? body.token : queryToken;
  const email = emailValue.toLowerCase().trim().slice(0, 320);
  const token = tokenValue.trim().slice(0, 500);

  // A valid HMAC is already a high-entropy authorization credential. It must
  // not be blocked by shared-IP limits (schools, VPNs, carrier NAT, etc.).
  if (!email || !verifyUnsubscribeToken(email, token)) {
    const ip = getRequestIp(req);
    const limit = checkRateLimit({
      key: `unsubscribe-invalid:${ip}`,
      windowMs: 1000 * 60 * 60,
      max: 300
    });
    if (!limit.allowed) {
      return rateLimitResponse(limit.retryAfterSeconds);
    }
    return NextResponse.json({ ok: false, error: "Invalid unsubscribe link." }, { status: 400 });
  }

  if (!isMarketingLeadPersistenceAvailable()) {
    return NextResponse.json(
      { ok: false, error: "Unsubscribe is temporarily unavailable. Please try again." },
      { status: 503 }
    );
  }

  try {
    await revokeMarketingConsentEverywhere(email);
    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unsubscribe is temporarily unavailable. Please try again." },
      { status: 503 }
    );
  }
}
