import { generateUnsubscribeToken } from "./unsubscribe-token";
import { siteConfig } from "@/lib/site";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
  unsubscribeUrl?: string;
  idempotencyKey?: string;
};

export function resolveEmailReplyTo(configuredValue = process.env.EMAIL_REPLY_TO) {
  const candidate = configuredValue?.trim();
  if (!candidate || candidate.toLowerCase() === "info@speakace.org") {
    return siteConfig.contactEmail;
  }
  return candidate;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function getResendConfig() {
  return {
    apiKey: process.env.RESEND_API_KEY ?? "",
    from: process.env.EMAIL_FROM?.trim() || "SpeakAce <info@mail.speakace.org>",
    replyTo: resolveEmailReplyTo()
  };
}

export function hasEmailTransport() {
  const config = getResendConfig();
  return Boolean(config.apiKey && config.from);
}

function getConfiguredCommercialIdentity() {
  return {
    legalName: process.env.COMPANY_LEGAL_NAME?.replace(/\s+/g, " ").trim().slice(0, 160) ?? "",
    postalAddress: process.env.COMPANY_POSTAL_ADDRESS?.replace(/\s+/g, " ").trim().slice(0, 300) ?? ""
  };
}

export function getCommercialEmailConfigurationStatus() {
  const { legalName, postalAddress } = getConfiguredCommercialIdentity();
  const transportConfigured = hasEmailTransport();
  const legalIdentityConfigured = Boolean(legalName && postalAddress);

  return {
    transportConfigured,
    legalIdentityConfigured,
    ready: transportConfigured && legalIdentityConfigured
  };
}

export function isEmailSuppressionError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  const normalized = message.toLowerCase();
  return ["suppressed", "suppression", "complaint", "hard_bounce", "hard bounce"].some((value) => (
    normalized.includes(value)
  ));
}

export function isDefiniteEmailRejection(error: unknown) {
  return error instanceof Error && (
    error.message.startsWith("Email send failed:") ||
    error.message.startsWith("Email configuration error:")
  );
}

export function getCommercialSenderIdentity() {
  const { legalName, postalAddress } = getConfiguredCommercialIdentity();

  if (hasEmailTransport() && (!legalName || !postalAddress)) {
    throw new Error(
      "Email configuration error: COMPANY_LEGAL_NAME and COMPANY_POSTAL_ADDRESS are required for commercial email."
    );
  }

  return {
    legalName: legalName || "SpeakAce AI",
    postalAddress: postalAddress || "Postal address required before production sending"
  };
}

function commercialIdentityHtml(identity: ReturnType<typeof getCommercialSenderIdentity>) {
  return `${escapeHtml(identity.legalName)} · ${escapeHtml(identity.postalAddress)}`;
}

function normalizeEmailLocale(locale?: string) {
  const normalized = locale?.trim().toLowerCase().split("-")[0];
  return normalized === "tr" || normalized === "de" || normalized === "es" || normalized === "fr"
    ? normalized
    : "en";
}

export async function sendEmail(payload: EmailPayload) {
  const config = getResendConfig();
  if (!config.apiKey || !config.from) {
    return { ok: false as const, skipped: true as const };
  }

  const request: RequestInit = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
      ...(payload.idempotencyKey ? { "Idempotency-Key": payload.idempotencyKey.slice(0, 256) } : {})
    },
    body: JSON.stringify({
      from: config.from,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      ...(payload.unsubscribeUrl
        ? {
            headers: {
              "List-Unsubscribe": `<${payload.unsubscribeUrl}>`,
              "List-Unsubscribe-Post": "List-Unsubscribe=One-Click"
            }
          }
        : {}),
      ...(config.replyTo ? { reply_to: config.replyTo } : {})
    })
  };

  const maxAttempts = payload.idempotencyKey ? 3 : 1;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    let response: Response;
    try {
      response = await fetch("https://api.resend.com/emails", request);
    } catch (error) {
      if (attempt < maxAttempts) continue;
      throw error;
    }

    if (response.ok) return { ok: true as const };

    const raw = await response.text();
    const idempotencyConflict = response.status === 409 && Boolean(payload.idempotencyKey);
    const concurrentIdempotentRequest = idempotencyConflict
      && raw.toLowerCase().includes("concurrent_idempotent_requests");
    if (concurrentIdempotentRequest && attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 200));
      continue;
    }
    if (concurrentIdempotentRequest) {
      throw new Error("Email send ambiguous: Resend is still processing the idempotent request.");
    }
    if (idempotencyConflict) {
      throw new Error("Email send ambiguous: Resend reported a conflict for an existing idempotency key.");
    }

    throw new Error(`Email send failed: ${raw || response.statusText}`);
  }

  throw new Error("Email send ambiguous: retry attempts exhausted.");
}

export async function sendVerificationEmail(input: { to: string; name?: string; verificationUrl: string }) {
  const greeting = escapeHtml(input.name?.trim() ? input.name.trim() : "there");
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
  const greeting = escapeHtml(input.name?.trim() ? input.name.trim() : "there");
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

export async function sendPurchaseAccountClaimEmail(input: {
  to: string;
  plan: "plus" | "pro" | "lifetime";
  idempotencyKey: string;
}) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://speakace.org").replace(/\/+$/, "");
  const successPath = `/app/billing/success?plan=${encodeURIComponent(input.plan)}&source=purchase_account_claim`;
  const accountUrl = `${siteUrl}/auth?mode=signup&intent=purchase_claim&next=${encodeURIComponent(successPath)}&cta=purchase_account_claim`;
  const safeAccountUrl = escapeHtml(accountUrl);
  const planName = input.plan === "lifetime" ? "Lifetime" : input.plan === "pro" ? "Pro" : "Plus";

  return sendEmail({
    to: input.to,
    subject: `Your SpeakAce ${planName} access is ready`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1b120d;max-width:600px">
        <h2 style="margin:0 0 12px">Your ${planName} access is ready</h2>
        <p>Your SpeakAce purchase was successful.</p>
        <p>Create your account with <strong>the same email address this message was sent to</strong>. After you verify that email, SpeakAce will match your purchase and activate ${planName} automatically.</p>
        <p style="margin:24px 0">
          <a href="${safeAccountUrl}" style="background:#d95d39;color:#fff8f2;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700;display:inline-block">Activate my SpeakAce access</a>
        </p>
        <p>Already have a SpeakAce account with this email? Choose <strong>Sign in</strong> on the account page instead.</p>
        <p style="color:#6f6259;font-size:0.9em">If the button does not work, open this link:<br><a href="${safeAccountUrl}">${safeAccountUrl}</a></p>
      </div>
    `,
    text: `Your SpeakAce ${planName} purchase was successful. Create your account using the same email address this message was sent to, then verify it. SpeakAce will match your purchase and activate ${planName} automatically. Already have an account with this email? Sign in instead. Activate access: ${accountUrl}`,
    idempotencyKey: input.idempotencyKey
  });
}

export async function sendLeadMagnetEmail(input: {
  to: string;
  name?: string;
  locale?: string;
  confirmationUrl: string;
  idempotencyKey: string;
}) {
  const greeting = escapeHtml(input.name?.trim() ? input.name.trim() : "there");
  const senderIdentity = getCommercialSenderIdentity();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://speakace.org";
  const locale = normalizeEmailLocale(input.locale);
  const resourcesUrl = `${siteUrl}/resources?utm_source=email&utm_medium=lead_magnet&utm_campaign=score_diagnostic`;
  const practiceUrl = `${siteUrl}/auth?mode=signup&cta=score_diagnostic_guide`;
  const unsubToken = generateUnsubscribeToken(input.to);
  const unsubscribePageUrl = `${siteUrl}/unsubscribe?email=${encodeURIComponent(input.to)}&token=${unsubToken}&lang=${locale}`;
  const unsubscribeApiUrl = `${siteUrl}/api/unsubscribe?email=${encodeURIComponent(input.to)}&token=${unsubToken}`;

  return sendEmail({
    to: input.to,
    subject: "Your IELTS Speaking score diagnostic guide",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1b120d;max-width:600px">
        <h2 style="margin:0 0 12px">Your IELTS Speaking score diagnostic</h2>
        <p>Hi ${greeting},</p>
        <p>Use this four-part check on one recorded answer. It is a practice diagnostic, not an official IELTS score.</p>
        <div style="background:#fff8f2;border:1px solid #e9d9ca;border-radius:16px;padding:18px 20px;margin:20px 0">
          <p style="margin:0 0 10px"><strong>1. Fluency:</strong> mark every pause longer than two seconds. Retry while keeping the same ideas.</p>
          <p style="margin:0 0 10px"><strong>2. Vocabulary:</strong> circle repeated general words. Replace only two with more precise choices.</p>
          <p style="margin:0 0 10px"><strong>3. Grammar:</strong> find one sentence you abandoned or repaired. Say it again as two clean sentences.</p>
          <p style="margin:0"><strong>4. Pronunciation:</strong> underline the words carrying your meaning. Stress those words on the retry.</p>
        </div>
        <p><strong>Your 10-minute retry:</strong> record once, review the transcript, choose the weakest category, then retry the same prompt with one change.</p>
        <p style="margin:24px 0">
          <a href="${practiceUrl}" style="background:#d95d39;color:#fff8f2;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700;display:inline-block">Create a free account and score an answer</a>
        </p>
        <p>Keep the guide with the full resource hub: <a href="${resourcesUrl}">${resourcesUrl}</a></p>
        <div style="background:#eef8f7;border:1px solid #b9ddda;border-radius:16px;padding:18px 20px;margin:24px 0">
          <p style="margin:0 0 12px"><strong>Want the three short follow-up emails, including a Plus offer?</strong></p>
          <p style="margin:0 0 16px">Confirm that you own this email address. Until you confirm, this guide is the only practice email we will send for this request.</p>
          <a href="${input.confirmationUrl}" style="background:#1d6f75;color:#fff8f2;text-decoration:none;padding:11px 16px;border-radius:999px;font-weight:700;display:inline-block">Confirm follow-up emails</a>
        </div>
        <hr style="border:none;border-top:1px solid #e9d9ca;margin:32px 0 16px">
        <p style="color:#777;font-size:0.8em;margin:0">Commercial practice email from ${commercialIdentityHtml(senderIdentity)}. You requested this guide from SpeakAce. <a href="${unsubscribePageUrl}" style="color:#777">Unsubscribe</a></p>
      </div>
    `,
    text: `Hi ${greeting}, your IELTS Speaking score diagnostic is ready. Check fluency (long pauses), vocabulary (repeated general words), grammar (abandoned sentences), and pronunciation (meaning-carrying stress). Then retry the same prompt with one change. Create a free account and score an answer: ${practiceUrl}. Resources: ${resourcesUrl}. To receive three short follow-up emails, including a Plus offer in the final message, confirm your email here: ${input.confirmationUrl}. Until confirmation, this is the only practice email we will send for this request. Commercial practice email from ${senderIdentity.legalName}, ${senderIdentity.postalAddress}. Unsubscribe: ${unsubscribePageUrl}`,
    unsubscribeUrl: unsubscribeApiUrl,
    idempotencyKey: input.idempotencyKey
  });
}

export type MarketingLeadNurtureStep = 1 | 2 | 3;

export async function sendMarketingLeadNurtureEmail(input: {
  to: string;
  name?: string;
  locale?: string;
  step: MarketingLeadNurtureStep;
  idempotencyKey: string;
}) {
  const greeting = escapeHtml(input.name?.trim() ? input.name.trim() : "there");
  const senderIdentity = getCommercialSenderIdentity();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://speakace.org";
  const locale = normalizeEmailLocale(input.locale);
  const signupUrl = `${siteUrl}/auth?mode=signup&cta=lead_diagnostic_nurture_${input.step}`;
  const practiceUrl = `${siteUrl}/app/practice?quickStart=1&runMode=interview&activation=lead_diagnostic_nurture_${input.step}`;
  const annualCheckoutUrl = `${siteUrl}/api/payments/lemon/checkout?plan=plus&billing=annual&campaign=lead_diagnostic_nurture`;
  const pricingUrl = `${siteUrl}/pricing?billing=annual&utm_source=email&utm_medium=nurture&utm_campaign=lead_diagnostic`;
  const unsubToken = generateUnsubscribeToken(input.to);
  const unsubscribePageUrl = `${siteUrl}/unsubscribe?email=${encodeURIComponent(input.to)}&token=${unsubToken}&lang=${locale}`;
  const unsubscribeApiUrl = `${siteUrl}/api/unsubscribe?email=${encodeURIComponent(input.to)}&token=${unsubToken}`;

  const content: Record<MarketingLeadNurtureStep, { subject: string; body: string; text: string }> = {
    1: {
      subject: "Use your transcript as a score map",
      body: `
        <p>A transcript is useful when it points to one change—not when it becomes another page to study.</p>
        <ol>
          <li>Highlight repeated words and unfinished sentences.</li>
          <li>Choose the one pattern that most affects clarity.</li>
          <li>Retry the same prompt while fixing only that pattern.</li>
        </ol>
        <p>Your free SpeakAce account keeps the answer, transcript, feedback, and retry together.</p>
        <p style="margin:24px 0"><a href="${signupUrl}" style="background:#d95d39;color:#fff8f2;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700;display:inline-block">Score one answer for free</a></p>
      `,
      text: `Use your transcript as a score map: mark repeated words and unfinished sentences, choose one pattern, then retry the same prompt. Score one answer for free: ${signupUrl}`
    },
    2: {
      subject: "The Band 7 retry rule: change one thing",
      body: `
        <p>Trying to fix fluency, vocabulary, grammar, and pronunciation at once usually makes the second answer less natural.</p>
        <p><strong>The retry rule:</strong> keep the question and ideas, then improve one scoring category. If pauses are the main issue, shorten pauses. If development is thin, add one reason and one example.</p>
        <p>That gives you a fair before-and-after comparison instead of two unrelated answers.</p>
        <p style="margin:24px 0"><a href="${practiceUrl}" style="background:#d95d39;color:#fff8f2;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700;display:inline-block">Run a free score-and-retry</a></p>
      `,
      text: `The Band 7 retry rule: keep the prompt and ideas, improve only one scoring category, and compare the attempts. Run a free score-and-retry: ${practiceUrl}`
    },
    3: {
      subject: "Make score-and-retry your weekly system",
      body: `
        <p>If the diagnostic and retry loop helped, the next step is consistency: several focused answers each week, with feedback kept beside every attempt.</p>
        <p>SpeakAce Plus annual is built for that longer preparation rhythm. Review the annual option when you are ready; your free practice remains available either way.</p>
        <p style="margin:24px 0"><a href="${annualCheckoutUrl}" style="background:#d95d39;color:#fff8f2;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700;display:inline-block">Choose Plus annual</a></p>
        <p style="font-size:0.9em">Prefer to compare first? <a href="${pricingUrl}">See every plan</a> or <a href="${practiceUrl}">keep practicing free</a>.</p>
      `,
      text: `Make score-and-retry your weekly system. Review SpeakAce Plus annual: ${annualCheckoutUrl}. Compare plans: ${pricingUrl}. Keep practicing free: ${practiceUrl}`
    }
  };
  const selected = content[input.step];

  return sendEmail({
    to: input.to,
    subject: selected.subject,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1b120d;max-width:600px">
        <h2 style="margin:0 0 12px">${selected.subject}</h2>
        <p>Hi ${greeting},</p>
        ${selected.body}
        <hr style="border:none;border-top:1px solid #e9d9ca;margin:32px 0 16px">
        <p style="color:#777;font-size:0.8em;margin:0">Commercial practice email from ${commercialIdentityHtml(senderIdentity)}. You requested the IELTS Speaking score diagnostic from SpeakAce. <a href="${unsubscribePageUrl}" style="color:#777">Unsubscribe</a></p>
      </div>
    `,
    text: `Hi ${greeting}, ${selected.text}. Commercial practice email from ${senderIdentity.legalName}, ${senderIdentity.postalAddress}. Unsubscribe: ${unsubscribePageUrl}`,
    unsubscribeUrl: unsubscribeApiUrl,
    idempotencyKey: input.idempotencyKey
  });
}

export async function sendWelcomePracticeEmail(input: { to: string; name?: string }) {
  const greeting = escapeHtml(input.name?.trim() ? input.name.trim() : "there");
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

export async function sendPlusTrialEmail(input: { to: string; name?: string }) {
  const greeting = escapeHtml(input.name?.trim() ? input.name.trim() : "there");
  const pricingUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://speakace.org"}/pricing`;
  const checkoutUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://speakace.org"}/api/payments/lemon/checkout?plan=plus&billing=weekly&campaign=email_trial`;

  return sendEmail({
    to: input.to,
    subject: "Try SpeakAce Plus for 3 days",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1b120d">
        <h2 style="margin:0 0 12px">Your SpeakAce Plus trial is ready</h2>
        <p>Hi ${greeting},</p>
        <p>Start with 3 days of Plus for $0 today. Unless you cancel before the trial ends, the plan renews at $3.99 per week.</p>
        <ul>
          <li>More daily speaking minutes</li>
          <li>Deeper transcript and score review</li>
          <li>Stronger retry and progress workflow</li>
        </ul>
        <p style="margin:24px 0">
          <a href="${checkoutUrl}" style="background:#d95d39;color:#fff8f2;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700;display:inline-block">Start the 3-day trial</a>
        </p>
        <p>If you want to compare plans first, open <a href="${pricingUrl}">${pricingUrl}</a>.</p>
      </div>
    `,
    text: `Hi ${greeting}, start SpeakAce Plus for $0 today. Unless cancelled before the 3-day trial ends, it renews at $3.99/week: ${checkoutUrl}`
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
  const greeting = escapeHtml(input.name?.trim() ? input.name.trim() : "there");
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

export async function sendTeacherWelcomeEmail(input: { to: string; name?: string }) {
  const greeting = escapeHtml(input.name?.trim() ? input.name.trim() : "there");
  const teacherUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://speakace.org"}/app/teacher`;
  const demoUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://speakace.org"}/teacher-demo`;
  const unsubToken = generateUnsubscribeToken(input.to);

  return sendEmail({
    to: input.to,
    subject: "Your SpeakAce teacher portal is ready",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1b120d;max-width:600px">
        <h2 style="margin:0 0 12px">Welcome to the SpeakAce teacher portal</h2>
        <p>Hi ${greeting},</p>
        <p>Your teacher access is now active. Here's how to get your first class running in the next five minutes:</p>
        <ol style="padding-left:1.2rem">
          <li style="margin-bottom:8px"><strong>Create a class</strong> — open the teacher portal and hit "Create class". Give it a name (e.g. "IELTS Evening Group").</li>
          <li style="margin-bottom:8px"><strong>Share the join code</strong> — copy the 6-character code and send it to students via WhatsApp, email, or your LMS.</li>
          <li style="margin-bottom:8px"><strong>Approve or auto-approve students</strong> — when students enter the code, they appear in your roster. You control who gets in.</li>
          <li style="margin-bottom:8px"><strong>Assign homework</strong> — go to the Homework tab inside your class and assign tasks to the whole class in one click.</li>
          <li style="margin-bottom:8px"><strong>Track practice and spot at-risk students</strong> — the Overview tab shows scores, weak skills, and who hasn't practiced recently.</li>
        </ol>
        <p style="margin:24px 0">
          <a href="${teacherUrl}" style="background:#d95d39;color:#fff8f2;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700;display:inline-block">Open teacher portal</a>
          &nbsp;&nbsp;
          <a href="${demoUrl}" style="background:#1d6f75;color:#fff8f2;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700;display:inline-block">View demo class</a>
        </p>
        <p style="color:#888;font-size:0.9em">If you have questions about class setup, homework, or student tracking, reply to this email — we'll get back to you within one business day.</p>
        <hr style="border:none;border-top:1px solid #e9d9ca;margin:32px 0 16px">
        <p style="color:#aaa;font-size:0.8em;margin:0">You are receiving this email because you activated teacher access on SpeakAce. <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://speakace.org"}/unsubscribe?email=${encodeURIComponent(input.to)}&token=${unsubToken}" style="color:#aaa">Unsubscribe</a></p>
      </div>
    `,
    text: `Hi ${greeting}, your SpeakAce teacher portal is ready. Open it here: ${teacherUrl} — or view a demo class: ${demoUrl}`
  });
}

export async function sendInstitutionLeadEmail(input: { to: string; name?: string; locale?: string; idempotencyKey?: string }) {
  const greeting = escapeHtml(input.name?.trim() ? input.name.trim() : "there");
  const senderIdentity = getCommercialSenderIdentity();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://speakace.org";
  const locale = normalizeEmailLocale(input.locale);
  const unsubToken = generateUnsubscribeToken(input.to);
  const demoUrl = `${siteUrl}/teacher-demo`;
  const institutionUrl = `${siteUrl}/app/teacher/institution`;
  const pricingUrl = `${siteUrl}/pricing`;
  const unsubscribeApiUrl = `${siteUrl}/api/unsubscribe?email=${encodeURIComponent(input.to)}&token=${unsubToken}`;
  const unsubscribePageUrl = `${siteUrl}/unsubscribe?email=${encodeURIComponent(input.to)}&token=${unsubToken}&lang=${locale}`;

  return sendEmail({
    to: input.to,
    subject: "SpeakAce for your school — what to look at next",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1b120d;max-width:600px">
        <h2 style="margin:0 0 12px">Thank you for your interest in SpeakAce for schools</h2>
        <p>Hi ${greeting},</p>
        <p>We received your request. Here are the three best places to start evaluating SpeakAce for your institution:</p>

        <div style="background:#fff8f2;border:1px solid #e9d9ca;border-radius:16px;padding:20px 22px;margin:20px 0;display:grid;gap:14px">
          <div>
            <strong style="display:block;margin-bottom:4px">1. Teacher demo class</strong>
            <p style="margin:0;color:#555;font-size:0.95em">A pre-filled class with example students, scores, and homework. Walk your coordinator or department head through the full workflow without any setup. <a href="${demoUrl}" style="color:#d95d39">Open demo →</a></p>
          </div>
          <div>
            <strong style="display:block;margin-bottom:4px">2. Institution analytics portal</strong>
            <p style="margin:0;color:#555;font-size:0.95em">The institution admin view shows class-level performance, at-risk students, and teacher activity across your school. <a href="${institutionUrl}" style="color:#d95d39">View institution portal →</a></p>
          </div>
          <div>
            <strong style="display:block;margin-bottom:4px">3. Pricing and package options</strong>
            <p style="margin:0;color:#555;font-size:0.95em">Starter cohorts, growth programmes, and full institution rollouts. Individual teachers can start on Plus — school-scale pricing is available on request. <a href="${pricingUrl}" style="color:#d95d39">See pricing →</a></p>
          </div>
        </div>

        <p><strong>What SpeakAce gives your institution:</strong></p>
        <ul>
          <li>Student speaking practice with AI scoring — no live teacher time required</li>
          <li>Teacher panel for homework, study lists, announcements, and student risk tracking</li>
          <li>Institution analytics dashboard across all classes and teachers</li>
          <li>Browser-based — no app install, works on any device</li>
          <li>Supports both IELTS and TOEFL programmes</li>
        </ul>

        <p>If you'd like a live walkthrough tailored to your school's setup, reply to this email with a few available times and we'll arrange it.</p>

        <p style="margin:24px 0">
          <a href="${demoUrl}" style="background:#d95d39;color:#fff8f2;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700;display:inline-block">Open teacher demo</a>
          &nbsp;&nbsp;
          <a href="${pricingUrl}" style="background:#1d6f75;color:#fff8f2;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700;display:inline-block">See pricing</a>
        </p>
        <hr style="border:none;border-top:1px solid #e9d9ca;margin:32px 0 16px">
        <p style="color:#aaa;font-size:0.8em;margin:0">Commercial email from ${commercialIdentityHtml(senderIdentity)}. You requested school information on SpeakAce. <a href="${unsubscribePageUrl}" style="color:#aaa">Unsubscribe</a></p>
      </div>
    `,
    text: `Hi ${greeting}, thank you for your interest in SpeakAce for schools. View the teacher demo: ${demoUrl} — institution portal: ${institutionUrl} — pricing: ${pricingUrl}. Commercial email from ${senderIdentity.legalName}, ${senderIdentity.postalAddress}. Unsubscribe: ${unsubscribePageUrl}`,
    unsubscribeUrl: unsubscribeApiUrl,
    idempotencyKey: input.idempotencyKey
  });
}

export async function sendTeacherLeadEmail(input: { to: string; name?: string; locale?: string; idempotencyKey?: string }) {
  const greeting = escapeHtml(input.name?.trim() ? input.name.trim() : "there");
  const senderIdentity = getCommercialSenderIdentity();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://speakace.org";
  const locale = normalizeEmailLocale(input.locale);
  const unsubToken = generateUnsubscribeToken(input.to);
  const teacherUrl = `${siteUrl}/app/teacher`;
  const demoUrl = `${siteUrl}/teacher-demo`;
  const pricingUrl = `${siteUrl}/pricing`;
  const unsubscribeApiUrl = `${siteUrl}/api/unsubscribe?email=${encodeURIComponent(input.to)}&token=${unsubToken}`;
  const unsubscribePageUrl = `${siteUrl}/unsubscribe?email=${encodeURIComponent(input.to)}&token=${unsubToken}&lang=${locale}`;

  return sendEmail({
    to: input.to,
    subject: "SpeakAce teacher tools — here's what's included",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1b120d;max-width:600px">
        <h2 style="margin:0 0 12px">Your guide to the SpeakAce teacher panel</h2>
        <p>Hi ${greeting},</p>
        <p>Here's a quick overview of everything available to you in the SpeakAce teacher portal:</p>
        <ul>
          <li style="margin-bottom:8px"><strong>Class management</strong> — create classes, share join codes, approve students, and manage class membership</li>
          <li style="margin-bottom:8px"><strong>Student progress tracking</strong> — see each student's band score, weak skill, attempt count, and trend direction in one view</li>
          <li style="margin-bottom:8px"><strong>Homework assignment</strong> — assign tasks to individual students or the whole class, with due dates and instructions</li>
          <li style="margin-bottom:8px"><strong>Auto-assign rules</strong> — set a score threshold and SpeakAce automatically generates homework for students who fall below it</li>
          <li style="margin-bottom:8px"><strong>At-risk alerts</strong> — automatically flags students who haven't practiced recently or whose scores are declining</li>
          <li style="margin-bottom:8px"><strong>Shared study lists</strong> — push specific prompts to your class's practice queue with guidance notes</li>
          <li style="margin-bottom:8px"><strong>Class announcements</strong> — send messages to all students in a class directly from the portal</li>
          <li style="margin-bottom:8px"><strong>Score leaderboards</strong> — top scorers and most improved, updated in real time</li>
          <li style="margin-bottom:8px"><strong>CSV export</strong> — download class-level reports for coordinators or your own records</li>
        </ul>
        <p>All teacher tools are included in the SpeakAce Plus plan — no separate teacher licence required.</p>
        <p style="margin:24px 0">
          <a href="${demoUrl}" style="background:#d95d39;color:#fff8f2;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700;display:inline-block">View demo class</a>
          &nbsp;&nbsp;
          <a href="${teacherUrl}" style="background:#1d6f75;color:#fff8f2;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700;display:inline-block">Open teacher portal</a>
        </p>
        <p>Compare plans and pricing: <a href="${pricingUrl}" style="color:#d95d39">${pricingUrl}</a></p>
        <hr style="border:none;border-top:1px solid #e9d9ca;margin:32px 0 16px">
        <p style="color:#aaa;font-size:0.8em;margin:0">Commercial email from ${commercialIdentityHtml(senderIdentity)}. You requested teacher information on SpeakAce. <a href="${unsubscribePageUrl}" style="color:#aaa">Unsubscribe</a></p>
      </div>
    `,
    text: `Hi ${greeting}, here's what's in the SpeakAce teacher portal. View demo: ${demoUrl} — open teacher portal: ${teacherUrl} — pricing: ${pricingUrl}. Commercial email from ${senderIdentity.legalName}, ${senderIdentity.postalAddress}. Unsubscribe: ${unsubscribePageUrl}`,
    unsubscribeUrl: unsubscribeApiUrl,
    idempotencyKey: input.idempotencyKey
  });
}

export async function sendGeneratedStudyPlanEmail(input: {
  to: string;
  name?: string;
  title: string;
  plan: string;
  dueAt?: string;
}) {
  const greeting = escapeHtml(input.name?.trim() ? input.name.trim() : "there");
  const studyUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://speakace.org"}/app/study-lists`;
  const dueText = input.dueAt
    ? new Date(input.dueAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
      })
    : null;

  return sendEmail({
    to: input.to,
    subject: `${input.title} is ready in SpeakAce`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1b120d">
        <h2 style="margin:0 0 12px">${input.title}</h2>
        <p>Hi ${greeting},</p>
        <p>Your study plan was generated successfully and saved to your SpeakAce study list.</p>
        <div style="background:#fff8f2;border:1px solid #e9d9ca;border-radius:16px;padding:16px 18px;margin:20px 0">
          <p style="margin:0 0 8px;font-weight:700">Plan summary</p>
          <p style="margin:0">${input.plan}</p>
        </div>
        ${dueText ? `<p>Suggested deadline: <strong>${dueText}</strong></p>` : ""}
        <p style="margin:24px 0">
          <a href="${studyUrl}" style="background:#d95d39;color:#fff8f2;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700;display:inline-block">Open study list</a>
        </p>
        <p>You can review the plan, edit the due date, and keep building your next speaking routine inside SpeakAce.</p>
      </div>
    `,
    text: `Hi ${greeting}, your study plan "${input.title}" is ready. ${input.plan}${dueText ? ` Deadline: ${dueText}.` : ""} Open it here: ${studyUrl}`
  });
}
