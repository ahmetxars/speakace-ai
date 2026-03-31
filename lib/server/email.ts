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

export async function sendLeadMagnetEmail(input: { to: string; name?: string }) {
  const greeting = input.name?.trim() ? input.name.trim() : "there";
  const resourcesUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://speakace.org"}/resources`;
  const practiceUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://speakace.org"}/app/practice`;

  return sendEmail({
    to: input.to,
    subject: "Your SpeakAce IELTS speaking checklist",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1b120d">
        <h2 style="margin:0 0 12px">Your free speaking checklist is ready</h2>
        <p>Hi ${greeting},</p>
        <p>Here is the simple routine we recommend for faster IELTS speaking improvement:</p>
        <ul>
          <li>Answer one timed speaking prompt every day</li>
          <li>Review the transcript before you retry</li>
          <li>Add one clear reason and one example to each answer</li>
          <li>Repeat weak prompts instead of always switching topics</li>
        </ul>
        <p style="margin:24px 0">
          <a href="${practiceUrl}" style="background:#d95d39;color:#fff8f2;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700;display:inline-block">Start free practice</a>
        </p>
        <p>You can also open the full resource hub here:</p>
        <p><a href="${resourcesUrl}">${resourcesUrl}</a></p>
      </div>
    `,
    text: `Hi ${greeting}, your free speaking checklist is ready. Start free practice here: ${practiceUrl} or open the resource hub: ${resourcesUrl}`
  });
}

export async function sendWelcomePracticeEmail(input: { to: string; name?: string }) {
  const greeting = input.name?.trim() ? input.name.trim() : "there";
  const appUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://speakace.org"}/app`;
  const practiceUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://speakace.org"}/app/practice`;

  return sendEmail({
    to: input.to,
    subject: "Welcome to SpeakAce",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1b120d">
        <h2 style="margin:0 0 12px">Welcome to SpeakAce</h2>
        <p>Hi ${greeting},</p>
        <p>Your account is ready. The fastest way to feel improvement is to record one timed answer, read the transcript, and retry the same prompt once.</p>
        <ul>
          <li>Start with one short speaking attempt</li>
          <li>Check the transcript and weak points</li>
          <li>Retry the same idea with one stronger example</li>
        </ul>
        <p style="margin:24px 0">
          <a href="${practiceUrl}" style="background:#d95d39;color:#fff8f2;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700;display:inline-block">Start your first practice</a>
        </p>
        <p>You can also open your dashboard here: <a href="${appUrl}">${appUrl}</a></p>
      </div>
    `,
    text: `Hi ${greeting}, welcome to SpeakAce. Start your first practice here: ${practiceUrl}`
  });
}

export async function sendLaunchOfferEmail(input: { to: string; name?: string; couponCode: string }) {
  const greeting = input.name?.trim() ? input.name.trim() : "there";
  const pricingUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://speakace.org"}/pricing`;
  const checkoutUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://speakace.org"}/api/payments/lemon/checkout?plan=plus&coupon=${encodeURIComponent(input.couponCode)}&campaign=email_coupon`;

  return sendEmail({
    to: input.to,
    subject: `${input.couponCode} is active for SpeakAce Plus`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1b120d">
        <h2 style="margin:0 0 12px">Your SpeakAce offer is ready</h2>
        <p>Hi ${greeting},</p>
        <p>You can use <strong>${input.couponCode}</strong> to unlock SpeakAce Plus at a lower launch price.</p>
        <ul>
          <li>More daily speaking minutes</li>
          <li>Deeper transcript and score review</li>
          <li>Stronger retry and progress workflow</li>
        </ul>
        <p style="margin:24px 0">
          <a href="${checkoutUrl}" style="background:#d95d39;color:#fff8f2;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700;display:inline-block">Use ${input.couponCode}</a>
        </p>
        <p>If you want to compare plans first, open <a href="${pricingUrl}">${pricingUrl}</a>.</p>
      </div>
    `,
    text: `Hi ${greeting}, your SpeakAce offer is ready. Use ${input.couponCode} here: ${checkoutUrl}`
  });
}

export async function sendStudyTaskReminderEmail(input: {
  to: string;
  name?: string;
  taskTitle: string;
  folderName: string;
  dueAt?: string;
  milestonePercent: number;
}) {
  const greeting = input.name?.trim() ? input.name.trim() : "there";
  const appUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://speakace.org"}/app/study-lists`;
  const remainingPercent = Math.max(0, 100 - input.milestonePercent);
  const dueText = input.dueAt
    ? new Date(input.dueAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
      })
    : "";
  const subject =
    input.milestonePercent >= 100
      ? `Study task deadline reached: ${input.taskTitle}`
      : `${remainingPercent}% of your task time is left`;

  return sendEmail({
    to: input.to,
    subject,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1b120d">
        <h2 style="margin:0 0 12px">${subject}</h2>
        <p>Hi ${greeting},</p>
        <p>
          ${
            input.milestonePercent >= 100
              ? `Your study task <strong>${input.taskTitle}</strong> has reached its deadline.`
              : `Your study task <strong>${input.taskTitle}</strong> in <strong>${input.folderName}</strong> has used ${input.milestonePercent}% of its timeline.`
          }
        </p>
        ${dueText ? `<p>Due date: <strong>${dueText}</strong></p>` : ""}
        <p style="margin:24px 0">
          <a href="${appUrl}" style="background:#d95d39;color:#fff8f2;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700;display:inline-block">Open study list</a>
        </p>
        <p>You can review the task, update the end date, or mark it complete from your study list workspace.</p>
      </div>
    `,
    text:
      input.milestonePercent >= 100
        ? `Hi ${greeting}, your study task "${input.taskTitle}" reached its deadline${dueText ? ` (${dueText})` : ""}. Open it here: ${appUrl}`
        : `Hi ${greeting}, your study task "${input.taskTitle}" has used ${input.milestonePercent}% of its timeline. ${remainingPercent}% is left${dueText ? ` before ${dueText}` : ""}. Open it here: ${appUrl}`
  });
}
