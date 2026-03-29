type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

function getResendConfig() {
  return {
    apiKey: process.env.RESEND_API_KEY ?? "",
    from: process.env.EMAIL_FROM ?? "",
    replyTo: process.env.EMAIL_REPLY_TO ?? ""
  };
}

export function hasEmailTransport() {
  const config = getResendConfig();
  return Boolean(config.apiKey && config.from);
}

export async function sendEmail(payload: EmailPayload) {
  const config = getResendConfig();
  if (!config.apiKey || !config.from) {
    return { ok: false as const, skipped: true as const };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: config.from,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      ...(config.replyTo ? { reply_to: config.replyTo } : {})
    })
  });

  if (!response.ok) {
    const raw = await response.text();
    throw new Error(`Email send failed: ${raw || response.statusText}`);
  }

  return { ok: true as const };
}

export async function sendVerificationEmail(input: { to: string; name?: string; verificationUrl: string }) {
  const greeting = input.name?.trim() ? input.name.trim() : "there";
  return sendEmail({
    to: input.to,
    subject: "Verify your SpeakAce account",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1b120d">
        <h2 style="margin:0 0 12px">Verify your email</h2>
        <p>Hi ${greeting},</p>
        <p>Welcome to SpeakAce. Click the button below to verify your email and activate your speaking dashboard.</p>
        <p style="margin:24px 0">
          <a href="${input.verificationUrl}" style="background:#d95d39;color:#fff8f2;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700;display:inline-block">Verify email</a>
        </p>
        <p>If the button does not work, open this link:</p>
        <p><a href="${input.verificationUrl}">${input.verificationUrl}</a></p>
      </div>
    `,
    text: `Hi ${greeting}, verify your SpeakAce account here: ${input.verificationUrl}`
  });
}

export async function sendPasswordResetEmail(input: { to: string; name?: string; resetUrl: string }) {
  const greeting = input.name?.trim() ? input.name.trim() : "there";
  return sendEmail({
    to: input.to,
    subject: "Reset your SpeakAce password",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1b120d">
        <h2 style="margin:0 0 12px">Reset your password</h2>
        <p>Hi ${greeting},</p>
        <p>We received a request to reset your SpeakAce password. Use the button below to choose a new password.</p>
        <p style="margin:24px 0">
          <a href="${input.resetUrl}" style="background:#1d6f75;color:#fff8f2;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700;display:inline-block">Reset password</a>
        </p>
        <p>If the button does not work, open this link:</p>
        <p><a href="${input.resetUrl}">${input.resetUrl}</a></p>
      </div>
    `,
    text: `Hi ${greeting}, reset your SpeakAce password here: ${input.resetUrl}`
  });
}
