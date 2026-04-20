import { NextResponse } from "next/server";
import { hasEmailTransport, sendEmail } from "@/lib/server/email";
import { getAdminPanelSession, getAdminSessionCookieName } from "@/lib/server/admin-panel";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = await getAdminPanelSession(cookieStore.get(getAdminSessionCookieName())?.value);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const configured = hasEmailTransport();
  if (!configured) {
    return NextResponse.json({
      ok: false,
      configured: false,
      error: "RESEND_API_KEY or EMAIL_FROM environment variable is not set. Configure both in Vercel environment variables."
    });
  }

  const body = await request.json().catch(() => ({})) as { to?: string };
  const to = body.to ?? process.env.EMAIL_REPLY_TO ?? process.env.EMAIL_FROM ?? "";
  if (!to) {
    return NextResponse.json({ ok: false, error: "No recipient address. Pass { to: 'your@email.com' } in the request body." });
  }

  try {
    const result = await sendEmail({
      to,
      subject: "SpeakAce email configuration test",
      html: `<p>This is a test email sent from the SpeakAce admin panel. If you received it, your Resend configuration is working correctly.</p>`,
      text: "This is a test email from SpeakAce admin. Resend is configured correctly."
    });

    return NextResponse.json({ ok: result.ok, configured: true, sentTo: to });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      configured: true,
      error: err instanceof Error ? err.message : "Unknown send error — check RESEND_API_KEY and that the EMAIL_FROM domain is verified in Resend."
    });
  }
}
