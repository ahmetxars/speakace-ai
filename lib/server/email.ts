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

export async function sendTeacherWelcomeEmail(input: { to: string; name?: string }) {
  const greeting = input.name?.trim() ? input.name.trim() : "there";
  const teacherUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://speakace.org"}/app/teacher`;
  const demoUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://speakace.org"}/teacher-demo`;

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
        <p style="color:#aaa;font-size:0.8em;margin:0">You are receiving this email because you activated teacher access on SpeakAce. <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://speakace.org"}/unsubscribe" style="color:#aaa">Unsubscribe</a></p>
      </div>
    `,
    text: `Hi ${greeting}, your SpeakAce teacher portal is ready. Open it here: ${teacherUrl} — or view a demo class: ${demoUrl}`
  });
}

export async function sendInstitutionLeadEmail(input: { to: string; name?: string }) {
  const greeting = input.name?.trim() ? input.name.trim() : "there";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://speakace.org";
  const demoUrl = `${siteUrl}/teacher-demo`;
  const institutionUrl = `${siteUrl}/app/teacher/institution`;
  const pricingUrl = `${siteUrl}/pricing`;

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
        <p style="color:#aaa;font-size:0.8em;margin:0">You are receiving this email because you requested school information on SpeakAce. <a href="${siteUrl}/unsubscribe" style="color:#aaa">Unsubscribe</a></p>
      </div>
    `,
    text: `Hi ${greeting}, thank you for your interest in SpeakAce for schools. View the teacher demo: ${demoUrl} — institution portal: ${institutionUrl} — pricing: ${pricingUrl}`
  });
}

export async function sendTeacherLeadEmail(input: { to: string; name?: string }) {
  const greeting = input.name?.trim() ? input.name.trim() : "there";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://speakace.org";
  const teacherUrl = `${siteUrl}/app/teacher`;
  const demoUrl = `${siteUrl}/teacher-demo`;
  const pricingUrl = `${siteUrl}/pricing`;

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
        <p style="color:#aaa;font-size:0.8em;margin:0">You are receiving this email because you requested teacher information on SpeakAce. <a href="${siteUrl}/unsubscribe" style="color:#aaa">Unsubscribe</a></p>
      </div>
    `,
    text: `Hi ${greeting}, here's what's in the SpeakAce teacher portal. View demo: ${demoUrl} — open teacher portal: ${teacherUrl} — pricing: ${pricingUrl}`
  });
}

export async function sendGeneratedStudyPlanEmail(input: {
  to: string;
  name?: string;
  title: string;
  plan: string;
  dueAt?: string;
}) {
  const greeting = input.name?.trim() ? input.name.trim() : "there";
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
