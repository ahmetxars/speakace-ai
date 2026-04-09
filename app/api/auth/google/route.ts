import { NextResponse } from "next/server";

/**
 * Google OAuth initiation route.
 * Required env vars:
 *   GOOGLE_CLIENT_ID       — OAuth 2.0 client ID from Google Cloud Console
 *   GOOGLE_REDIRECT_URI    — Authorized redirect URI (e.g. https://speakace.org/api/auth/google/callback)
 */
export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_REDIRECT_URI." },
      { status: 503 }
    );
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account"
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  return NextResponse.redirect(authUrl);
}
