import { NextRequest, NextResponse } from "next/server";
import { hasDatabaseUrl, getSql } from "@/lib/server/db";
import { verifyUnsubscribeToken } from "@/lib/server/unsubscribe-token";
import { checkRateLimit, getRequestIp, rateLimitResponse } from "@/lib/server/rate-limit";

export async function POST(req: NextRequest) {
  const ip = getRequestIp(req);
  const limit = checkRateLimit({ key: `unsubscribe:${ip}`, windowMs: 1000 * 60 * 60, max: 10 });
  if (!limit.allowed) {
    return rateLimitResponse(limit.retryAfterSeconds);
  }

  if (!hasDatabaseUrl()) {
    return NextResponse.json({ ok: false, error: "no db" }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  const queryEmail = req.nextUrl.searchParams.get("email") ?? "";
  const queryToken = req.nextUrl.searchParams.get("token") ?? "";
  const emailValue = typeof body?.email === "string" ? body.email : queryEmail;
  const tokenValue = typeof body?.token === "string" ? body.token : queryToken;
  const email = emailValue.toLowerCase().trim();
  const token = tokenValue.trim();

  if (!email) {
    return NextResponse.json({ ok: false, error: "missing email" }, { status: 400 });
  }

  if (!verifyUnsubscribeToken(email, token)) {
    // Return ok to avoid leaking whether email exists, but do not perform the write
    return NextResponse.json({ ok: true });
  }

  const sql = getSql();
  await sql`
    update users
    set email_opt_out = true
    where email = ${email}
  `;

  return NextResponse.json({ ok: true });
}
