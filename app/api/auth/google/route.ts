import { createHmac, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";

/**
 * Google OAuth initiation route.
 * Required env vars:
 *   GOOGLE_CLIENT_ID       — OAuth 2.0 client ID from Google Cloud Console
 *   GOOGLE_REDIRECT_URI    — Authorized redirect URI (e.g. https://speakace.org/api/auth/google/callback)
 */
const GOOGLE_OAUTH_STATE_COOKIE = "speakace_google_oauth_state";
const GOOGLE_OAUTH_STATE_TTL_SECONDS = 60 * 10;

function signGoogleState(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !redirectUri || !clientSecret) {
    return NextResponse.json(
      { error: "Google OAuth is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI." },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const cta = searchParams.get("cta");
  const ctaEvent = searchParams.get("cta_event");
  const invite = searchParams.get("invite");
  const nonce = randomBytes(24).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({ nonce, cta: cta ?? null, ctaEvent: ctaEvent ?? null, invite: invite ?? null }),
    "utf8"
  ).toString("base64url");
  const state = `${payload}.${signGoogleState(payload, clientSecret)}`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account"
  });
  params.set("state", state);

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  const response = NextResponse.redirect(authUrl);
  response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, nonce, {
    httpOnly: true,
    secure: process.env.APP_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: GOOGLE_OAUTH_STATE_TTL_SECONDS
  });
  return response;
}
