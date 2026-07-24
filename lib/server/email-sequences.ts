import { sendEmail } from "@/lib/server/email";
import { hasDatabaseUrl, getSql } from "@/lib/server/db";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://speakace.org";
const PRACTICE_URL = `${SITE_URL}/app/practice`;
const FIRST_SCORE_URL = `${SITE_URL}/app/practice?quickStart=1&runMode=interview&activation=email_first_score`;
const DAY_ONE_RETURN_URL = `${SITE_URL}/app/practice?quickStart=1&runMode=interview&activation=email_day_one_return`;
const PRICING_URL = `${SITE_URL}/pricing`;
const BILLING_URL = `${SITE_URL}/app/billing`;
const CHECKOUT_URL = `${SITE_URL}/api/payments/lemon/checkout?plan=plus&billing=annual&campaign=onboarding_email`;
const EMAIL_QUOTA_RECOVERY_TEMPLATE = "quota_recovery_probe";
let emailSequenceSchemaEnsured = false;

export type PracticeLimitRecoveryReason = "practice_limit_hit" | "result_retry_locked";
export type EmailQuotaKind = "daily" | "monthly";

export const ONBOARDING_EMAIL_SCHEDULE: Array<{ dayOffset: number; emailNumber: number }> = [
  { dayOffset: 0, emailNumber: 1 },
  { dayOffset: 1, emailNumber: 2 },
  { dayOffset: 4, emailNumber: 3 },
  { dayOffset: 10, emailNumber: 4 },
  { dayOffset: 21, emailNumber: 5 }
];

export function resolveEmailQuotaKind(errorMessage: string | null | undefined): EmailQuotaKind | null {
  if (errorMessage?.includes("monthly_quota_exceeded")) return "monthly";
  if (errorMessage?.includes("daily_quota_exceeded")) return "daily";
  return null;
}

export function isEmailQuotaFailureRecovered(
  failureAt: string | Date,
  recoveryAt: string | Date | null | undefined
) {
  if (!recoveryAt) return false;

  const failureTime = new Date(failureAt).getTime();
  const recoveryTime = new Date(recoveryAt).getTime();
  return Number.isFinite(failureTime) && Number.isFinite(recoveryTime) && recoveryTime > failureTime;
}

export function resolveEmailLifecycleDailyBudget(value = process.env.EMAIL_LIFECYCLE_DAILY_BUDGET) {
  const parsed = Number(value ?? "20");
  if (!Number.isFinite(parsed)) return 20;
  return Math.min(Math.max(Math.floor(parsed), 0), 200);
}

async function ensureEmailSequenceSchema() {
  if (!hasDatabaseUrl() || emailSequenceSchemaEnsured) return;

  const sql = getSql();
  const onboardingColumn = await sql<Array<{ exists: boolean }>>`
    select exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'users'
        and column_name = 'onboarding_emails_sent'
    ) as exists
  `;
  const hadOnboardingColumn = Boolean(onboardingColumn[0]?.exists);

  await sql`
    alter table users
    add column if not exists onboarding_emails_sent integer not null default 0
  `;

  await sql`
    create table if not exists email_log (
      id bigserial primary key,
      user_id text references users(id) on delete set null,
      user_email text not null,
      template text not null,
      subject text not null,
      status text not null,
      error_message text,
      sent_at timestamptz not null default now()
    )
  `;

  await sql`
    create index if not exists idx_email_log_user_id
    on email_log(user_id, sent_at desc)
  `;

  if (!hadOnboardingColumn) {
    await sql`
      update users
      set onboarding_emails_sent = 1
      where coalesce(onboarding_emails_sent, 0) = 0
        and created_at < now() - interval '1 hour'
        and email not like '%@example.com'
        and email not like '%@speakace.local'
    `;

    await sql`
      update users
      set email_opt_out = true
      where email like '%@example.com'
         or email like '%@speakace.local'
    `;
  }

  emailSequenceSchemaEnsured = true;
}

export async function getCurrentEmailQuotaBlock(): Promise<{
  kind: EmailQuotaKind;
  detectedAt: string;
} | null> {
  if (!hasDatabaseUrl() || process.env.IGNORE_EMAIL_QUOTA_BLOCK === "true") return null;

  await ensureEmailSequenceSchema();
  const sql = getSql();
  const rows = await sql<Array<{
    error_message: string | null;
    sent_at: string | Date;
    recovered_at: string | Date | null;
  }>>`
    with current_quota_failures as (
      select
        error_message,
        sent_at,
        case
          when error_message like '%monthly_quota_exceeded%' then 'monthly'
          else 'daily'
        end as quota_kind,
        row_number() over (
          partition by case
            when error_message like '%monthly_quota_exceeded%' then 'monthly'
            else 'daily'
          end
          order by sent_at desc
        ) as quota_recency
      from email_log
      where status = 'failed'
        and (
          (
            error_message like '%monthly_quota_exceeded%'
            and sent_at >= date_trunc('month', now())
          )
          or (
            error_message like '%daily_quota_exceeded%'
            and sent_at >= date_trunc('day', now())
          )
        )
    ),
    latest_recovery as (
      select max(sent_at) as recovered_at
      from email_log
      where status = 'sent'
        and template = ${EMAIL_QUOTA_RECOVERY_TEMPLATE}
    )
    select
      failure.error_message,
      failure.sent_at,
      recovery.recovered_at
    from current_quota_failures failure
    cross join latest_recovery recovery
    where failure.quota_recency = 1
    order by
      case when failure.quota_kind = 'monthly' then 0 else 1 end
  `;
  const row = rows.find((candidate) => (
    !isEmailQuotaFailureRecovered(candidate.sent_at, candidate.recovered_at)
  ));
  const kind = resolveEmailQuotaKind(row?.error_message);
  if (!row || !kind) return null;

  return {
    kind,
    detectedAt: row.sent_at instanceof Date ? row.sent_at.toISOString() : new Date(row.sent_at).toISOString()
  };
}

export async function recordEmailQuotaRecoveryProbe(userEmail: string): Promise<boolean> {
  const normalizedEmail = userEmail.trim().toLowerCase();
  if (!hasDatabaseUrl() || !normalizedEmail) return false;

  await ensureEmailSequenceSchema();
  const sql = getSql();

  try {
    await sql`
      insert into email_log (user_id, user_email, template, subject, status, error_message)
      values (
        ${null},
        ${normalizedEmail},
        ${EMAIL_QUOTA_RECOVERY_TEMPLATE},
        ${"SpeakAce email quota recovery probe"},
        ${"sent"},
        ${null}
      )
    `;
    return true;
  } catch {
    return false;
  }
}

export async function getEmailLifecycleBudgetStatus(): Promise<{
  limit: number;
  sentToday: number;
  remaining: number;
}> {
  const limit = resolveEmailLifecycleDailyBudget();
  if (!hasDatabaseUrl()) {
    return { limit, sentToday: 0, remaining: limit };
  }

  await ensureEmailSequenceSchema();
  const sql = getSql();
  const rows = await sql<Array<{ count: number }>>`
    select count(*)::int as count
    from email_log
    where status = 'sent'
      and sent_at >= date_trunc('day', now())
  `;
  const sentToday = rows[0]?.count ?? 0;

  return {
    limit,
    sentToday,
    remaining: Math.max(0, limit - sentToday)
  };
}

// ─── Email layout helper ───────────────────────────────────────────────────────

function layout(body: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#fdf6f0">
      <div style="background:#fdf6f0;padding:36px 16px 48px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
        <div style="max-width:560px;margin:0 auto">

          <!-- Brand header -->
          <div style="text-align:center;padding-bottom:28px">
            <span style="font-size:26px;font-weight:900;color:#d95d39;letter-spacing:-0.5px">SpeakAce</span>
          </div>

          <!-- Card -->
          <div style="background:#ffffff;border-radius:20px;padding:40px 40px 36px;border:1px solid #ead8cc;box-shadow:0 2px 12px rgba(0,0,0,0.06)">
            ${body}
          </div>

          <!-- Footer -->
          <div style="text-align:center;padding:28px 0 0">
            <p style="margin:0;color:#b8a499;font-size:0.75em;line-height:1.8">
              SpeakAce · IELTS Speaking Practice<br>
              <a href="${SITE_URL}/unsubscribe" style="color:#b8a499;text-decoration:underline">Unsubscribe</a>
            </p>
          </div>

        </div>
      </div>
    </body>
    </html>
  `;
}

// Reusable style fragments
const primaryBtn = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;background:#d95d39;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:700;font-size:0.95em;letter-spacing:0.01em">${label}</a>`;

const secondaryBtn = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;background:#1d6f75;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:700;font-size:0.95em;letter-spacing:0.01em">${label}</a>`;

const highlight = (text: string) =>
  `<div style="background:#fff3ec;border-left:4px solid #d95d39;border-radius:0 10px 10px 0;padding:14px 18px;margin:20px 0;color:#4a2c1a;font-size:0.95em;line-height:1.7">${text}</div>`;

const checkItem = (text: string) =>
  `<div style="display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid #f5ece6">
    <span style="color:#d95d39;font-size:1.1em;margin-top:1px;flex-shrink:0">✓</span>
    <span style="color:#3a2218;font-size:0.93em;line-height:1.6">${text}</span>
  </div>`;

function buildEmail1(name: string) {
  const greeting = name.trim() || "there";
  const html = layout(`
    <h1 style="margin:0 0 8px;font-size:1.5em;color:#1b120d;font-weight:800">Welcome to SpeakAce, ${greeting}!</h1>
    <p style="margin:0 0 24px;color:#7a5c4a;font-size:0.9em">Your IELTS speaking practice starts right now</p>

    <p style="color:#3a2218;line-height:1.75;margin:0 0 20px">Your account is ready. Here is how to turn the first answer into a useful baseline from day one:</p>

    <div style="margin:0 0 28px">
      ${checkItem("<strong>Practice daily</strong> — even 10 minutes a day compounds fast")}
      ${checkItem("<strong>Read your transcript</strong> — spot patterns in your own speech")}
      ${checkItem("<strong>Retry the same prompt</strong> — your second attempt is always better")}
      ${checkItem("<strong>Track your score</strong> — watch your band score climb over time")}
    </div>

    <div style="margin:28px 0">
      ${primaryBtn(FIRST_SCORE_URL, "Get your first AI score &rarr;")}
    </div>

    <p style="margin:24px 0 0;color:#9a7060;font-size:0.85em;line-height:1.7">Over the next few days we'll send you targeted tips to accelerate your progress. Keep an eye on your inbox.</p>
  `);
  return {
    subject: "Welcome to SpeakAce — let's get your band score moving",
    html,
    text: `Hi ${greeting}, welcome to SpeakAce! Record one answer and get your first AI score here: ${FIRST_SCORE_URL}`
  };
}

function buildEmail2(name: string) {
  const greeting = name.trim() || "there";
  const html = layout(`
    <p style="margin:0 0 6px;color:#9a7060;font-size:0.82em;font-weight:600;text-transform:uppercase;letter-spacing:0.08em">Day 1</p>
    <h1 style="margin:0 0 24px;font-size:1.45em;color:#1b120d;font-weight:800">Have you tried your first practice yet?</h1>

    <p style="color:#3a2218;line-height:1.75;margin:0 0 16px">Hi ${greeting}, the best IELTS candidates don't wait until they feel ready. They practice, listen back, and improve one sentence at a time.</p>

    <p style="color:#3a2218;line-height:1.75;margin:0 0 20px">Here's a formula that can push your fluency score from Band 5.5 to 6.5 on its own — the <strong>answer–reason–example</strong> structure:</p>

    ${highlight(`
      <strong style="display:block;margin-bottom:10px;font-size:1em;color:#d95d39">Try this in your next answer:</strong>
      <span style="display:block;margin-bottom:6px">1. <strong>Answer directly</strong> — "Yes, I enjoy cooking…"</span>
      <span style="display:block;margin-bottom:6px">2. <strong>Give a reason</strong> — "…because it helps me relax after work."</span>
      <span style="display:block">3. <strong>Add an example</strong> — "Last weekend I made a Thai curry from scratch."</span>
    `)}

    <p style="color:#3a2218;line-height:1.75;margin:20px 0 28px">Open SpeakAce, pick any Part 1 question, and apply this structure. It only takes a few minutes.</p>

    <div style="margin:0 0 8px">
      ${primaryBtn(FIRST_SCORE_URL, "Try it and get your first score &rarr;")}
    </div>
  `);
  return {
    subject: "IELTS tip that moves your score — try it today",
    html,
    text: `Hi ${greeting}, day 2! Use the answer-reason-example formula in your IELTS Part 1. Get your first score here: ${FIRST_SCORE_URL}`
  };
}

function buildDayOneReturnEmail(name: string) {
  const greeting = name.trim() || "there";
  const html = layout(`
    <p style="margin:0 0 6px;color:#1d6f75;font-size:0.82em;font-weight:700;text-transform:uppercase;letter-spacing:0.08em">Day 1 · Keep the loop alive</p>
    <h1 style="margin:0 0 12px;font-size:1.45em;color:#1b120d;font-weight:800">Your second-day speaking round is ready.</h1>
    <p style="margin:0 0 24px;color:#7a5c4a;font-size:0.9em">Return while yesterday's feedback is still easy to apply.</p>

    <p style="color:#3a2218;line-height:1.75;margin:0 0 20px">Hi ${greeting}, you already completed the hardest step: giving SpeakAce a real answer to work with. A short return today helps turn that first result into a repeatable habit.</p>

    ${highlight(`
      <strong style="display:block;margin-bottom:8px;color:#d95d39">Your 5-minute day-two loop</strong>
      <span style="display:block;margin-bottom:5px">1. Open the ready-made interview prompt</span>
      <span style="display:block;margin-bottom:5px">2. Apply one correction from your last result</span>
      <span style="display:block">3. Finish one natural answer and stop</span>
    `)}

    <p style="color:#3a2218;line-height:1.75;margin:20px 0 28px">One focused answer today is enough. There is no plan change or checkout step in this return session.</p>

    <div style="margin:0 0 8px">
      ${secondaryBtn(DAY_ONE_RETURN_URL, "Start my 5-minute return &rarr;")}
    </div>
  `);

  return {
    subject: "Your second-day speaking round is ready",
    html,
    text: `Hi ${greeting}, keep yesterday's feedback moving with one 5-minute return session. No checkout step: ${DAY_ONE_RETURN_URL}`
  };
}

function buildEmail3(name: string) {
  const greeting = name.trim() || "there";
  const html = layout(`
    <p style="margin:0 0 6px;color:#9a7060;font-size:0.82em;font-weight:600;text-transform:uppercase;letter-spacing:0.08em">Day 5</p>
    <h1 style="margin:0 0 24px;font-size:1.45em;color:#1b120d;font-weight:800">Your Week 1 IELTS Speaking Checklist</h1>

    <p style="color:#3a2218;line-height:1.75;margin:0 0 20px">Hi ${greeting}, use these five steps to build a complete feedback loop during your first week.</p>

    <div style="margin:0 0 28px">
      ${checkItem("<strong>Answer at least one Part 1 prompt</strong> — familiar topics, natural speech")}
      ${checkItem("<strong>Listen to your own recording</strong> — identify one filler word to eliminate")}
      ${checkItem("<strong>Complete one Part 2 long turn</strong> — aim for a full 2 minutes without stopping")}
      ${checkItem("<strong>Read your AI feedback</strong> — focus on the single top-priority improvement")}
      ${checkItem("<strong>Retry the same prompt</strong> — apply the feedback and compare both attempts")}
    </div>

    ${highlight("Progress tip: you don't need to be perfect. Each attempt is data. The candidates who improve fastest are the ones who keep going even when they stumble.")}

    <div style="margin:28px 0 8px">
      ${primaryBtn(FIRST_SCORE_URL, "Start the first-score session &rarr;")}
    </div>
  `);
  return {
    subject: "5-item checklist for your first week of IELTS practice",
    html,
    text: `Hi ${greeting}, your Week 1 checklist starts with one answer and one AI score. Begin here: ${FIRST_SCORE_URL}`
  };
}

function buildFirstScoreRecoveryEmail(name: string, emailNumber: number) {
  const greeting = name.trim() || "there";
  const dayLabel = emailNumber === 4 ? "Day 7" : "Day 10";
  const html = layout(`
    <p style="margin:0 0 6px;color:#9a7060;font-size:0.82em;font-weight:600;text-transform:uppercase;letter-spacing:0.08em">${dayLabel} · Your first score</p>
    <h1 style="margin:0 0 12px;font-size:1.45em;color:#1b120d;font-weight:800">Your free AI speaking score is still waiting.</h1>
    <p style="margin:0 0 24px;color:#7a5c4a;font-size:0.9em">One answer is enough to reveal your first improvement target.</p>

    <p style="color:#3a2218;line-height:1.75;margin:0 0 20px">Hi ${greeting}, you do not need a study plan or a perfect answer to begin. SpeakAce will open a short IELTS-style prompt, then show the patterns to work on next.</p>

    ${highlight(`
      <strong style="display:block;margin-bottom:8px;color:#d95d39">Your 5-minute first-score path</strong>
      <span style="display:block;margin-bottom:5px">1. Open the ready-made prompt</span>
      <span style="display:block;margin-bottom:5px">2. Record one natural answer</span>
      <span style="display:block">3. Read your score and first correction</span>
    `)}

    <p style="color:#3a2218;line-height:1.75;margin:20px 0 28px">The first session is free. There is no upgrade decision to make before you see your result.</p>

    <div style="margin:0 0 8px">
      ${primaryBtn(FIRST_SCORE_URL, "Get my first score &rarr;")}
    </div>
  `);

  return {
    subject: emailNumber === 4 ? "Your first SpeakAce score takes one answer" : "Still no score? Start with this 5-minute session",
    html,
    text: `Hi ${greeting}, your first SpeakAce score takes one answer and about 5 minutes. Start free: ${FIRST_SCORE_URL}`
  };
}

function buildEmail4(name: string) {
  const greeting = name.trim() || "there";
  const html = layout(`
    <p style="margin:0 0 6px;color:#9a7060;font-size:0.82em;font-weight:600;text-transform:uppercase;letter-spacing:0.08em">Day 7 Milestone</p>
    <h1 style="margin:0 0 8px;font-size:1.45em;color:#1b120d;font-weight:800">One week in — you're already ahead.</h1>
    <p style="margin:0 0 24px;color:#7a5c4a;font-size:0.9em">Most people quit before day 7. You didn't.</p>

    <p style="color:#3a2218;line-height:1.75;margin:0 0 20px">Hi ${greeting}, a week of consistent practice is real momentum. If you want to keep improving the same day instead of stopping at the free cap, here's what SpeakAce Plus adds:</p>

    <div style="margin:0 0 28px">
      ${checkItem("<strong>Keep practicing today</strong> — do not stop when the free daily cap ends")}
      ${checkItem("<strong>35 minutes of daily speaking</strong> — vs 8 minutes on the free plan")}
      ${checkItem("<strong>Deeper AI feedback</strong> — better correction and stronger retry suggestions")}
      ${checkItem("<strong>Full score history</strong> — track your band score arc over weeks and months")}
    </div>

    <div style="margin:28px 0;display:flex;gap:12px;flex-wrap:wrap">
      ${primaryBtn(CHECKOUT_URL, "Unlock full feedback &rarr;")}
      &nbsp;&nbsp;
      ${secondaryBtn(PRACTICE_URL, "Keep practicing free")}
    </div>

    <p style="margin:20px 0 0;color:#9a7060;font-size:0.85em;line-height:1.7">Either way — every session brings you closer to your target score. Keep going.</p>
  `);
  return {
    subject: "Keep practicing today, not tomorrow",
    html,
    text: `Hi ${greeting}, one week of practice! Upgrade to Plus for more daily volume: ${CHECKOUT_URL} — or keep going free: ${PRACTICE_URL}`
  };
}

function buildEmail5(name: string) {
  const greeting = name.trim() || "there";
  const html = layout(`
    <p style="margin:0 0 6px;color:#9a7060;font-size:0.82em;font-weight:600;text-transform:uppercase;letter-spacing:0.08em">Day 10</p>
    <h1 style="margin:0 0 24px;font-size:1.45em;color:#1b120d;font-weight:800">Turn one practice into a useful retry loop</h1>

    <p style="color:#3a2218;line-height:1.75;margin:0 0 20px">Hi ${greeting}, you have already completed at least one speaking session. The next useful step is not a random new question — it is applying one correction and trying again.</p>

    <div style="margin:0 0 28px">
      ${checkItem("<strong>Open your latest feedback</strong> — choose one improvement, not all of them")}
      ${checkItem("<strong>Retry the same prompt</strong> — keep the topic constant while changing the answer")}
      ${checkItem("<strong>Compare one category</strong> — fluency, vocabulary, grammar, or delivery")}
    </div>

    <p style="color:#3a2218;line-height:1.75;margin:20px 0 28px">SpeakAce Plus adds more same-day practice time and deeper feedback when the free limit interrupts that loop.</p>

    <div style="margin:0 0 8px">
      ${primaryBtn(CHECKOUT_URL, "Continue today with Plus &rarr;")}
    </div>
    <p style="margin:12px 0 0;font-size:0.83em;color:#9a7060">
      <a href="${PRICING_URL}" style="color:#9a7060;text-decoration:underline">Compare all plans</a>
    </p>
  `);
  return {
    subject: "Use your last correction in the next answer",
    html,
    text: `Hi ${greeting}, open your latest feedback, choose one correction, and retry the same prompt. Continue with Plus if the free limit interrupts the loop: ${CHECKOUT_URL}`
  };
}

function buildEmail6(name: string) {
  const greeting = name.trim() || "there";
  const html = layout(`
    <p style="margin:0 0 6px;color:#9a7060;font-size:0.82em;font-weight:600;text-transform:uppercase;letter-spacing:0.08em">Day 14</p>
    <h1 style="margin:0 0 24px;font-size:1.45em;color:#1b120d;font-weight:800">Two weeks in — are you still practicing?</h1>

    <p style="color:#3a2218;line-height:1.75;margin:0 0 16px">Hi ${greeting}, life gets busy. That's completely normal.</p>

    <p style="color:#3a2218;line-height:1.75;margin:0 0 20px">The good news: your account is still here, your progress is saved, and you can restart today. IELTS speaking skills come back fast once you pick up again.</p>

    ${highlight("<strong>Today's challenge:</strong> Answer just one Part 1 question. It takes under 60 seconds. That's all — one question, one attempt, and you're back in the habit.")}

    <p style="color:#3a2218;line-height:1.75;margin:20px 0 20px">The candidates who reach Band 7+ aren't the ones who never miss a day — they're the ones who restart quickly when they do.</p>

    ${highlight("<strong>If you hit the free cap often:</strong> Plus keeps the same account and unlocks more same-day attempts, fuller correction, and a stronger retry loop.")}

    <div style="margin:0 0 8px;display:flex;gap:12px;flex-wrap:wrap">
      ${primaryBtn(PRACTICE_URL, "Take the 60-second challenge &rarr;")}
      &nbsp;&nbsp;
      ${secondaryBtn(CHECKOUT_URL, "Unlock full feedback")}
    </div>
  `);
  return {
    subject: "A 60-second challenge to get you back on track",
    html,
    text: `Hi ${greeting}, two weeks in. Take a 60-second challenge — one Part 1 question: ${PRACTICE_URL}`
  };
}

function buildEmail7(name: string) {
  const greeting = name.trim() || "there";
  const html = layout(`
    <p style="margin:0 0 6px;color:#9a7060;font-size:0.82em;font-weight:600;text-transform:uppercase;letter-spacing:0.08em">Day 21</p>
    <h1 style="margin:0 0 24px;font-size:1.45em;color:#1b120d;font-weight:800">A common reason IELTS answers sound underdeveloped</h1>

    <p style="color:#3a2218;line-height:1.75;margin:0 0 20px">Hi ${greeting}, one common pattern keeps IELTS answers from sounding complete:</p>

    ${highlight("<strong>They answer the question — but they don't develop the answer.</strong>")}

    <p style="color:#3a2218;line-height:1.75;margin:20px 0 8px"><strong style="color:#c0392b">Band 5.5 answer:</strong></p>
    <div style="background:#fef2f0;border-radius:8px;padding:14px 18px;margin:0 0 16px;color:#5a3e32;font-size:0.93em;line-height:1.7">"Yes, I like technology because it is useful."</div>

    <p style="color:#3a2218;line-height:1.75;margin:0 0 8px"><strong style="color:#1d6f75">Band 7 answer:</strong></p>
    <div style="background:#f0f8f8;border-radius:8px;padding:14px 18px;margin:0 0 20px;color:#1a3d40;font-size:0.93em;line-height:1.7">"I'd say technology has become pretty essential to my daily routine — I use it for everything from staying connected with colleagues to learning new skills on the go. What I find most interesting is how quickly it's changed the way we work, even compared to five years ago."</div>

    <p style="color:#3a2218;line-height:1.75;margin:0 0 28px">Same idea. Completely different score. The difference: <strong>a reason, an example, and a reflection</strong>. Apply this in your next session and watch your AI feedback change.</p>

    <div style="margin:0 0 8px">
      ${primaryBtn(PRACTICE_URL, "Practice with AI feedback &rarr;")}
    </div>
  `);
  return {
    subject: "Why some IELTS answers sound underdeveloped",
    html,
    text: `Hi ${greeting}, a common IELTS issue is answering without developing the idea. Practise the fix: ${PRACTICE_URL}`
  };
}

function buildEmail8(name: string) {
  const greeting = name.trim() || "there";
  const html = layout(`
    <p style="margin:0 0 6px;color:#9a7060;font-size:0.82em;font-weight:600;text-transform:uppercase;letter-spacing:0.08em">Day 30 Milestone</p>
    <h1 style="margin:0 0 24px;font-size:1.45em;color:#1b120d;font-weight:800">One month with SpeakAce — build a repeatable practice loop</h1>

    <p style="color:#3a2218;line-height:1.75;margin:0 0 20px">Hi ${greeting}, you've had your account for 30 days. Here is a simple rhythm you can use for the next month:</p>

    <div style="margin:0 0 28px">
      ${checkItem("Choose <strong>4 short practice days</strong> — a schedule is easier to follow than waiting for spare time")}
      ${checkItem("<strong>Retry the same question</strong> after reading feedback — use the second attempt to apply one correction")}
      ${checkItem("Pick <strong>one focus area per week</strong> — keep the next action clear and manageable")}
    </div>

    <p style="color:#3a2218;line-height:1.75;margin:0 0 28px">On the free plan you get 4 sessions per day — enough for a solid daily habit. If you want more volume and deeper analysis, the strongest-value move is annual Plus at about $4.08/month with the launch code.</p>

    <div style="margin:0 0 8px;display:flex;gap:12px;flex-wrap:wrap">
      ${primaryBtn(PRACTICE_URL, "Practice today &rarr;")}
      &nbsp;&nbsp;
      ${secondaryBtn(CHECKOUT_URL, "See annual Plus value")}
    </div>
  `);
  return {
    subject: "A simple practice rhythm for your second month",
    html,
    text: `Hi ${greeting}, choose four short practice days, retry after feedback, and focus on one area at a time: ${PRACTICE_URL}`
  };
}

function buildEmail9(name: string) {
  const greeting = name.trim() || "there";
  const html = layout(`
    <p style="margin:0 0 6px;color:#9a7060;font-size:0.82em;font-weight:600;text-transform:uppercase;letter-spacing:0.08em">Day 45</p>
    <h1 style="margin:0 0 24px;font-size:1.45em;color:#1b120d;font-weight:800">Use your transcript to find one repeated habit</h1>

    <p style="color:#3a2218;line-height:1.75;margin:0 0 20px">Hi ${greeting}, your transcript is most useful when you look for one repeatable pattern instead of trying to rewrite every sentence.</p>

    ${highlight("<strong>Try this:</strong> open one completed answer, find a filler or phrase you repeated, then record a new answer while replacing only that habit.")}

    <div style="margin:28px 0 8px">
      ${primaryBtn(PRACTICE_URL, "Record and review your transcript &rarr;")}
    </div>
  `);
  return {
    subject: "Find one repeated habit in your transcript",
    html,
    text: `Hi ${greeting}, open one completed answer, find a phrase you repeated, and replace that one habit in your next recording: ${PRACTICE_URL}`
  };
}

function buildEmail10(name: string) {
  const greeting = name.trim() || "there";
  const html = layout(`
    <p style="margin:0 0 6px;color:#9a7060;font-size:0.82em;font-weight:600;text-transform:uppercase;letter-spacing:0.08em">Day 60</p>
    <h1 style="margin:0 0 24px;font-size:1.45em;color:#1b120d;font-weight:800">Your final 2-week IELTS speaking plan</h1>

    <p style="color:#3a2218;line-height:1.75;margin:0 0 20px">Hi ${greeting}, whether your test is 2 weeks away or 2 months, this is the preparation pattern that works:</p>

    <div style="margin:0 0 28px">
      <div style="padding:12px 0;border-bottom:1px solid #f0e6df">
        <p style="margin:0 0 4px;font-weight:700;color:#1b120d;font-size:0.93em">Week before last</p>
        <p style="margin:0;color:#5a3e32;font-size:0.9em;line-height:1.6">Focus entirely on your <em>one weakest area</em> — Part 1 fluency, Part 2 length, or Part 3 development. One weakness only.</p>
      </div>
      <div style="padding:12px 0;border-bottom:1px solid #f0e6df">
        <p style="margin:0 0 4px;font-weight:700;color:#1b120d;font-size:0.93em">Final week</p>
        <p style="margin:0;color:#5a3e32;font-size:0.9em;line-height:1.6">Full mock sessions — all three parts, timed. Record everything. Listen back at normal speed.</p>
      </div>
      <div style="padding:12px 0;border-bottom:1px solid #f0e6df">
        <p style="margin:0 0 4px;font-weight:700;color:#1b120d;font-size:0.93em">Night before</p>
        <p style="margin:0;color:#5a3e32;font-size:0.9em;line-height:1.6">Review your phrase bank and 3 strong example answers. No more than 20 minutes of practice — rest your voice.</p>
      </div>
      <div style="padding:12px 0">
        <p style="margin:0 0 4px;font-weight:700;color:#1b120d;font-size:0.93em">Morning of the test</p>
        <p style="margin:0;color:#5a3e32;font-size:0.9em;line-height:1.6">Speak for 10 minutes on any topic. Warm up your voice and get your brain into English mode.</p>
      </div>
    </div>

    <div style="margin:0 0 8px">
      ${primaryBtn(PRACTICE_URL, "Start a mock session &rarr;")}
    </div>
  `);
  return {
    subject: "The exact 2-week plan before your IELTS speaking test",
    html,
    text: `Hi ${greeting}, your 2-week IELTS speaking plan: week before — weakest area. Final week — full mocks. Night before — phrase bank. Morning — warm up. Start: ${PRACTICE_URL}`
  };
}

function buildEmail11(name: string) {
  const greeting = name.trim() || "there";
  const html = layout(`
    <p style="margin:0 0 6px;color:#9a7060;font-size:0.82em;font-weight:600;text-transform:uppercase;letter-spacing:0.08em">Day 75</p>
    <h1 style="margin:0 0 24px;font-size:1.45em;color:#1b120d;font-weight:800">We miss you — and your band score is still waiting.</h1>

    <p style="color:#3a2218;line-height:1.75;margin:0 0 16px">Hi ${greeting}, it's been a while since you practiced on SpeakAce.</p>

    <p style="color:#3a2218;line-height:1.75;margin:0 0 20px">IELTS speaking skills fade without consistent practice — but the good news is they also come back fast. One session is all it takes to restart the habit.</p>

    ${highlight("<strong>Come back offer:</strong> For the next 48 hours your account has no daily session limit. Practice as much as you want, completely free. No strings attached.")}

    <p style="color:#3a2218;line-height:1.75;margin:20px 0 28px">Just open SpeakAce and start speaking. Your progress is still here.</p>

    <div style="margin:0 0 8px">
      ${primaryBtn(PRACTICE_URL, "Restart your practice &rarr;")}
    </div>

    <p style="margin:24px 0 0;color:#9a7060;font-size:0.82em;line-height:1.6">Already taken your IELTS test? Just ignore this — we'll stop the reminders after this email.</p>
  `);
  return {
    subject: "We saved your spot — unlimited practice for 48 hours",
    html,
    text: `Hi ${greeting}, it's been a while. Unlimited practice for 48 hours — come back: ${PRACTICE_URL}`
  };
}

function buildEmail12(name: string) {
  const greeting = name.trim() || "there";
  const html = layout(`
    <p style="margin:0 0 6px;color:#9a7060;font-size:0.82em;font-weight:600;text-transform:uppercase;letter-spacing:0.08em">Day 90 · Last Email</p>
    <h1 style="margin:0 0 24px;font-size:1.45em;color:#1b120d;font-weight:800">One last thing before we go quiet.</h1>

    <p style="color:#3a2218;line-height:1.75;margin:0 0 16px">Hi ${greeting}, this is our last check-in. We don't want to fill your inbox if IELTS speaking isn't your focus right now — after this, we'll only contact you for account messages.</p>

    <p style="color:#3a2218;line-height:1.75;margin:0 0 20px">If you do want to improve your speaking score before a future test, here's what SpeakAce Plus gives you:</p>

    <div style="margin:0 0 28px">
      ${checkItem("<strong>35 minutes of daily speaking</strong> — vs 8 minutes on the free plan")}
      ${checkItem("<strong>18 practice sessions per day</strong> — maximum variety and reps")}
      ${checkItem("<strong>Deeper AI analysis</strong> — stronger, more specific improvement suggestions")}
      ${checkItem("<strong>Full score history and trend tracking</strong> — watch your band arc over time")}
    </div>

    ${highlight("<strong>Start with the free plan if you are not ready to upgrade.</strong> Plus is available whenever you need more daily speaking and deeper feedback.")}

    <div style="margin:28px 0;display:flex;gap:12px;flex-wrap:wrap">
      ${primaryBtn(CHECKOUT_URL, "See Plus annual &rarr;")}
      &nbsp;&nbsp;
      ${secondaryBtn(PRACTICE_URL, "Stay on free plan")}
    </div>

    <p style="margin:20px 0 0;color:#9a7060;font-size:0.85em;line-height:1.7">Good luck with your IELTS preparation, whatever path you choose.</p>
  `);
  return {
    subject: "Last email from SpeakAce — your practice is still here",
    html,
    text: `Hi ${greeting}, last email from SpeakAce. See Plus annual: ${CHECKOUT_URL} — or stay free: ${PRACTICE_URL}`
  };
}

async function logEmail(params: {
  userId: string;
  userEmail: string;
  template: string;
  subject: string;
  status: "sent" | "failed";
  errorMessage?: string;
}): Promise<void> {
  if (!hasDatabaseUrl()) return;
  const sql = getSql();
  await sql`
    insert into email_log (user_id, user_email, template, subject, status, error_message)
    values (${params.userId}, ${params.userEmail}, ${params.template}, ${params.subject}, ${params.status}, ${params.errorMessage ?? null})
  `.catch(() => { /* non-blocking */ });
}

type LifecycleEmailContent = { subject: string; html: string; text: string };

export function buildOnboardingEmailContent(input: {
  name: string;
  emailNumber: number;
  speakingSessionCount: number;
}): LifecycleEmailContent | null {
  if (input.emailNumber === 2 && input.speakingSessionCount > 0) {
    return buildDayOneReturnEmail(input.name);
  }

  if (input.speakingSessionCount === 0 && (input.emailNumber === 4 || input.emailNumber === 5)) {
    return buildFirstScoreRecoveryEmail(input.name, input.emailNumber);
  }

  if (input.emailNumber === 1) return buildEmail1(input.name);
  if (input.emailNumber === 2) return buildEmail2(input.name);
  if (input.emailNumber === 3) return buildEmail3(input.name);
  if (input.emailNumber === 4) return buildEmail4(input.name);
  if (input.emailNumber === 5) return buildEmail5(input.name);
  if (input.emailNumber === 6) return buildEmail6(input.name);
  if (input.emailNumber === 7) return buildEmail7(input.name);
  if (input.emailNumber === 8) return buildEmail8(input.name);
  if (input.emailNumber === 9) return buildEmail9(input.name);
  if (input.emailNumber === 10) return buildEmail10(input.name);
  if (input.emailNumber === 11) return buildEmail11(input.name);
  if (input.emailNumber === 12) return buildEmail12(input.name);
  return null;
}

export async function sendOnboardingEmail(
  userId: string,
  emailNumber: number
): Promise<{ ok: boolean; skipped?: boolean }> {
  if (!hasDatabaseUrl()) {
    return { ok: false, skipped: true };
  }

  await ensureEmailSequenceSchema();
  const sql = getSql();
  const rows = await sql<Array<{
    email: string;
    name: string;
    email_opt_out: boolean;
    email_verified: boolean;
    speaking_session_count: number;
  }>>`
    select
      u.email,
      u.name,
      u.email_opt_out,
      u.email_verified,
      (select count(*)::int from speaking_sessions s where s.user_id = u.id) as speaking_session_count
    from users u
    where u.id = ${userId}
    limit 1
  `;
  const user = rows[0];
  if (!user) return { ok: false };
  if (user.email_opt_out || !user.email_verified) return { ok: false, skipped: true };

  let emailContent = buildOnboardingEmailContent({
    name: user.name,
    emailNumber,
    speakingSessionCount: user.speaking_session_count
  });
  if (!emailContent) return { ok: false };

  // Inject user-specific unsubscribe link
  const unsubscribeUrl = `${SITE_URL}/unsubscribe?email=${encodeURIComponent(user.email)}`;
  emailContent = {
    ...emailContent,
    html: emailContent.html.replace(`${SITE_URL}/unsubscribe"`, `${unsubscribeUrl}"`)
  };

  const templateName = `onboarding_${emailNumber}`;
  try {
    const result = await sendEmail({ to: user.email, ...emailContent });
    await logEmail({
      userId,
      userEmail: user.email,
      template: templateName,
      subject: emailContent.subject,
      status: result.ok ? "sent" : "failed",
      errorMessage: result.ok ? undefined : "send skipped (no transport)"
    });
    return result;
  } catch (err) {
    await logEmail({
      userId,
      userEmail: user.email,
      template: templateName,
      subject: emailContent.subject,
      status: "failed",
      errorMessage: err instanceof Error ? err.message : "unknown error"
    });
    return { ok: false };
  }
}

export async function getUsersForOnboardingEmail(dayOffset: number): Promise<Array<{ id: string; onboardingEmailsSent: number }>> {
  if (!hasDatabaseUrl()) return [];

  await ensureEmailSequenceSchema();
  const sql = getSql();
  // Get users whose account was created ~dayOffset days ago (between dayOffset-0.5 and dayOffset+0.5 days)
  const rows = await sql<Array<{ id: string; onboarding_emails_sent: number }>>`
    select u.id, coalesce(u.onboarding_emails_sent, 0) as onboarding_emails_sent
    from users u
    where u.created_at >= now() - (${dayOffset} || ' days')::interval - interval '12 hours'
      and u.created_at <  now() - (${dayOffset} || ' days')::interval + interval '12 hours'
      and u.email_verified = true
  `;

  return rows.map((row) => ({
    id: row.id,
    onboardingEmailsSent: row.onboarding_emails_sent
  }));
}

export function getNextOnboardingStep(onboardingEmailsSent: number) {
  return ONBOARDING_EMAIL_SCHEDULE.find((step) => step.emailNumber === onboardingEmailsSent + 1) ?? null;
}

export async function getUsersDueForNextOnboardingEmail(limit = 100): Promise<
  Array<{
    id: string;
    email: string;
    name: string;
    onboardingEmailsSent: number;
    nextEmailNumber: number;
    nextDayOffset: number;
  }>
> {
  if (!hasDatabaseUrl()) return [];

  await ensureEmailSequenceSchema();
  const sql = getSql();
  const maxEmailNumber = ONBOARDING_EMAIL_SCHEDULE[ONBOARDING_EMAIL_SCHEDULE.length - 1]?.emailNumber ?? 0;
  const rows = await sql<
    Array<{
      id: string;
      email: string;
      name: string;
      onboarding_emails_sent: number;
      email_opt_out: boolean;
      created_at: string;
    }>
  >`
    select
      u.id,
      u.email,
      u.name,
      coalesce(u.onboarding_emails_sent, 0) as onboarding_emails_sent,
      u.email_opt_out,
      u.created_at
    from users u
    where coalesce(u.onboarding_emails_sent, 0) < ${maxEmailNumber}
      and u.email_verified = true
      and u.billing_status not in ('active', 'on_trial')
      and not exists (
        select 1
        from email_log recent_email
        where recent_email.user_id = u.id
          and recent_email.status = 'sent'
          and recent_email.sent_at >= now() - interval '24 hours'
      )
    order by u.created_at asc
    limit ${Math.max(limit * 3, limit)}
  `;

  const dueUsers = rows
    .filter((row) => !row.email_opt_out)
    .map((row) => {
      const nextStep = getNextOnboardingStep(row.onboarding_emails_sent);
      if (!nextStep) return null;

      const dueAt = new Date(row.created_at);
      dueAt.setUTCDate(dueAt.getUTCDate() + nextStep.dayOffset);

      if (dueAt.getTime() > Date.now()) {
        return null;
      }

      return {
        id: row.id,
        email: row.email,
        name: row.name,
        onboardingEmailsSent: row.onboarding_emails_sent,
        nextEmailNumber: nextStep.emailNumber,
        nextDayOffset: nextStep.dayOffset,
        dueAt: dueAt.toISOString()
      };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row))
    .sort((a, b) => {
      if (a.nextEmailNumber !== b.nextEmailNumber) {
        return a.nextEmailNumber - b.nextEmailNumber;
      }

      return a.dueAt.localeCompare(b.dueAt);
    })
    .slice(0, limit);

  return dueUsers.map((row) => ({
    id: row.id,
    email: row.email,
    name: row.name,
    onboardingEmailsSent: row.onboardingEmailsSent,
    nextEmailNumber: row.nextEmailNumber,
    nextDayOffset: row.nextDayOffset
  }));
}

export async function markOnboardingEmailSent(userId: string, emailNumber: number): Promise<void> {
  if (!hasDatabaseUrl()) return;

  await ensureEmailSequenceSchema();
  const sql = getSql();
  await sql`
    update users
    set onboarding_emails_sent = ${emailNumber}
    where id = ${userId}
      and coalesce(onboarding_emails_sent, 0) < ${emailNumber}
  `;
}

export function resolvePracticeLimitRecoveryReason(path: string | null | undefined): PracticeLimitRecoveryReason {
  return path?.includes("result_retry_locked") ? "result_retry_locked" : "practice_limit_hit";
}

function buildPracticeLimitRecoveryCheckoutUrl(reason: PracticeLimitRecoveryReason) {
  const params = new URLSearchParams({
    plan: "plus",
    billing: "weekly",
    campaign: `practice_limit_recovery_${reason}`,
    cta: `/email/practice_limit_recovery/${reason}`,
    cta_event: "checkout_initiated"
  });
  return `${SITE_URL}/api/payments/lemon/checkout?${params.toString()}`;
}

export function buildPracticeLimitRecoveryEmailContent(input: {
  name: string;
  reason: PracticeLimitRecoveryReason;
}): LifecycleEmailContent {
  const greeting = input.name.trim() || "there";
  const checkoutUrl = buildPracticeLimitRecoveryCheckoutUrl(input.reason);
  const retryLocked = input.reason === "result_retry_locked";
  const heading = retryLocked
    ? "Turn the feedback you just received into a stronger second answer"
    : "Keep practising while today's momentum is still fresh";
  const context = retryLocked
    ? "You reached the most useful part of practice: applying fresh feedback to the same prompt. Plus lets you make that second attempt today instead of restarting the learning loop tomorrow."
    : "You reached today's free practice limit after doing the hard part: showing up and speaking. Plus reopens practice now so you can keep the same focused session moving.";

  const html = layout(`
    <p style="margin:0 0 6px;color:#d95d39;font-size:0.82em;font-weight:700;text-transform:uppercase;letter-spacing:0.08em">Your SpeakAce practice</p>
    <h1 style="margin:0 0 20px;font-size:1.45em;color:#1b120d;font-weight:800">${heading}</h1>
    <p style="color:#3a2218;line-height:1.75;margin:0 0 18px">Hi ${greeting}, ${context}</p>

    <div style="margin:0 0 22px">
      ${checkItem("Continue speaking today with up to <strong>35 daily minutes</strong>")}
      ${checkItem("Use up to <strong>18 daily sessions</strong> for focused retries")}
      ${checkItem("Keep the full transcript and AI feedback loop moving")}
    </div>

    ${highlight("<strong>3-day Plus trial: $0 today.</strong> Unless cancelled before the trial ends, the plan renews at $3.99/week. Checkout shows the exact terms before you confirm.")}

    <div style="margin:24px 0 10px">
      ${primaryBtn(checkoutUrl, "Continue now for $0 today &rarr;")}
    </div>
    <p style="margin:12px 0 0;color:#7a5c4a;font-size:0.86em;line-height:1.65">Prefer to stay free? No problem — your free practice resets automatically. You can return from the <a href="${PRACTICE_URL}" style="color:#1d6f75;font-weight:700">practice page</a>.</p>
  `);

  return {
    subject: retryLocked
      ? "Continue the answer you just improved"
      : "Continue the practice you started today",
    html,
    text: `Hi ${greeting}, ${context} Start a 3-day Plus trial for $0 today. Unless cancelled before the trial ends, it renews at $3.99/week. Checkout shows the exact terms before confirmation: ${checkoutUrl}. Prefer free? Return when your limit resets: ${PRACTICE_URL}`
  };
}

export async function getUsersDueForPracticeLimitRecoveryEmail(limit = 50): Promise<
  Array<{ id: string; email: string; name: string; reason: PracticeLimitRecoveryReason; limitHitAt: string }>
> {
  if (!hasDatabaseUrl()) return [];

  await ensureEmailSequenceSchema();
  const sql = getSql();
  const rows = await sql<
    Array<{ id: string; email: string; name: string; path: string | null; limit_hit_at: string | Date }>
  >`
    with latest_limit as (
      select distinct on (ae.user_id)
        ae.user_id,
        ae.path,
        ae.created_at
      from analytics_events ae
      where ae.event = 'practice_limit_hit'
        and ae.created_at >= now() - interval '36 hours'
        and ae.created_at <= now() - interval '20 minutes'
      order by ae.user_id, ae.created_at desc
    )
    select
      u.id,
      u.email,
      u.name,
      latest_limit.path,
      latest_limit.created_at as limit_hit_at
    from latest_limit
    join users u on u.id = latest_limit.user_id
    where u.plan = 'free'
      and coalesce(u.billing_status, 'free') not in ('active', 'on_trial')
      and u.email_verified = true
      and u.email_opt_out = false
      and u.role <> 'guest'
      and not exists (
        select 1 from analytics_events checkout_event
        where checkout_event.user_id = u.id
          and checkout_event.event = 'checkout_initiated'
          and checkout_event.created_at >= now() - interval '14 days'
      )
      and not exists (
        select 1 from email_log recovery_log
        where recovery_log.user_id = u.id
          and recovery_log.template = 'practice_limit_recovery'
          and recovery_log.status = 'sent'
          and recovery_log.sent_at >= now() - interval '14 days'
      )
      and not exists (
        select 1 from email_log recent_email
        where recent_email.user_id = u.id
          and recent_email.status = 'sent'
          and recent_email.sent_at >= now() - interval '24 hours'
      )
    order by latest_limit.created_at desc
    limit ${Math.min(Math.max(limit, 1), 50)}
  `;

  return rows.map((row) => ({
    id: row.id,
    email: row.email,
    name: row.name,
    reason: resolvePracticeLimitRecoveryReason(row.path),
    limitHitAt: row.limit_hit_at instanceof Date
      ? row.limit_hit_at.toISOString()
      : new Date(row.limit_hit_at).toISOString()
  }));
}

export async function sendPracticeLimitRecoveryEmail(
  userId: string
): Promise<{ ok: boolean; skipped?: boolean }> {
  if (!hasDatabaseUrl()) return { ok: false, skipped: true };

  await ensureEmailSequenceSchema();
  const sql = getSql();
  const rows = await sql<
    Array<{
      email: string;
      name: string;
      path: string | null;
      email_opt_out: boolean;
      email_verified: boolean;
      plan: string;
      billing_status: string;
      recent_checkout: boolean;
      recently_sent: boolean;
    }>
  >`
    select
      u.email,
      u.name,
      latest_limit.path,
      u.email_opt_out,
      u.email_verified,
      u.plan,
      u.billing_status,
      exists (
        select 1 from analytics_events checkout_event
        where checkout_event.user_id = u.id
          and checkout_event.event = 'checkout_initiated'
          and checkout_event.created_at >= now() - interval '14 days'
      ) as recent_checkout,
      exists (
        select 1 from email_log recovery_log
        where recovery_log.user_id = u.id
          and recovery_log.template = 'practice_limit_recovery'
          and recovery_log.status = 'sent'
          and recovery_log.sent_at >= now() - interval '14 days'
      ) as recently_sent
    from users u
    join lateral (
      select ae.path
      from analytics_events ae
      where ae.user_id = u.id
        and ae.event = 'practice_limit_hit'
        and ae.created_at >= now() - interval '36 hours'
        and ae.created_at <= now() - interval '20 minutes'
      order by ae.created_at desc
      limit 1
    ) latest_limit on true
    where u.id = ${userId}
    limit 1
  `;
  const user = rows[0];
  if (
    !user ||
    user.email_opt_out ||
    !user.email_verified ||
    user.plan !== "free" ||
    ["active", "on_trial"].includes(user.billing_status) ||
    user.recent_checkout ||
    user.recently_sent
  ) {
    return { ok: false, skipped: true };
  }

  const reason = resolvePracticeLimitRecoveryReason(user.path);
  let emailContent = buildPracticeLimitRecoveryEmailContent({ name: user.name, reason });
  const unsubscribeUrl = `${SITE_URL}/unsubscribe?email=${encodeURIComponent(user.email)}`;
  emailContent = {
    ...emailContent,
    html: emailContent.html.replace(`${SITE_URL}/unsubscribe"`, `${unsubscribeUrl}"`)
  };

  try {
    const result = await sendEmail({ to: user.email, ...emailContent });
    await logEmail({
      userId,
      userEmail: user.email,
      template: "practice_limit_recovery",
      subject: emailContent.subject,
      status: result.ok ? "sent" : "failed",
      errorMessage: result.ok ? undefined : "send skipped (no transport)"
    });
    return result;
  } catch (err) {
    await logEmail({
      userId,
      userEmail: user.email,
      template: "practice_limit_recovery",
      subject: emailContent.subject,
      status: "failed",
      errorMessage: err instanceof Error ? err.message : "unknown error"
    });
    return { ok: false };
  }
}

function buildCheckoutRecoveryUrl() {
  const params = new URLSearchParams({
    plan: "plus",
    billing: "weekly",
    campaign: "checkout_recovery",
    cta: "/email/checkout_recovery",
    cta_event: "checkout_initiated"
  });
  return `${SITE_URL}/api/payments/lemon/checkout?${params.toString()}`;
}

export function buildCheckoutRecoveryEmailContent(name: string): LifecycleEmailContent {
  const greeting = name.trim() || "there";
  const checkoutUrl = buildCheckoutRecoveryUrl();
  const html = layout(`
    <p style="margin:0 0 6px;color:#d95d39;font-size:0.82em;font-weight:700;text-transform:uppercase;letter-spacing:0.08em">Your SpeakAce plan</p>
    <h1 style="margin:0 0 20px;font-size:1.45em;color:#1b120d;font-weight:800">Your Plus checkout was not completed</h1>
    <p style="color:#3a2218;line-height:1.75;margin:0 0 18px">Hi ${greeting}, you opened the Plus checkout but did not finish it. Nothing was charged.</p>
    ${highlight("<strong>Weekly Plus starts with a 3-day trial at $0 today.</strong> Unless cancelled before the trial ends, it renews at $3.99/week. The final checkout screen shows the exact terms before you confirm.")}
    <div style="margin:24px 0 10px">
      ${primaryBtn(checkoutUrl, "Return to secure checkout &rarr;")}
    </div>
    <p style="margin:12px 0 0;color:#7a5c4a;font-size:0.86em;line-height:1.65">Not ready? Your Free plan remains active and no action is required. You can continue from the <a href="${PRACTICE_URL}" style="color:#1d6f75;font-weight:700">practice page</a>.</p>
  `);

  return {
    subject: "Your SpeakAce Plus checkout is still available",
    html,
    text: `Hi ${greeting}, your Plus checkout was not completed and nothing was charged. Weekly Plus starts with a 3-day trial at $0 today, then renews at $3.99/week unless cancelled before the trial ends. Return to checkout: ${checkoutUrl}. Keep using Free: ${PRACTICE_URL}`
  };
}

export async function getUsersDueForCheckoutRecoveryEmail(
  limit = 50
): Promise<Array<{ id: string; checkoutAt: string }>> {
  if (!hasDatabaseUrl()) return [];

  await ensureEmailSequenceSchema();
  const sql = getSql();
  const rows = await sql<Array<{ id: string; checkout_at: string | Date }>>`
    with latest_checkout as (
      select distinct on (ae.user_id)
        ae.user_id,
        ae.created_at
      from analytics_events ae
      where ae.event = 'checkout_initiated'
        and ae.user_id is not null
        and ae.created_at >= now() - interval '72 hours'
        and ae.created_at <= now() - interval '45 minutes'
      order by ae.user_id, ae.created_at desc
    )
    select
      u.id,
      latest_checkout.created_at as checkout_at
    from latest_checkout
    join users u on u.id = latest_checkout.user_id
    where u.plan = 'free'
      and coalesce(u.billing_status, 'free') not in ('active', 'on_trial')
      and u.email_verified = true
      and u.email_opt_out = false
      and u.role <> 'guest'
      and not exists (
        select 1
        from analytics_events completed
        where completed.user_id = u.id
          and completed.event = 'checkout_completed'
          and completed.created_at >= latest_checkout.created_at
      )
      and not exists (
        select 1
        from billing_events billing
        where billing.user_id = u.id
          and billing.billing_status in ('active', 'on_trial')
          and billing.created_at >= latest_checkout.created_at
      )
      and not exists (
        select 1
        from email_log recovery
        where recovery.user_id = u.id
          and recovery.template = 'checkout_recovery'
          and recovery.status = 'sent'
          and recovery.sent_at >= now() - interval '14 days'
      )
      and not exists (
        select 1
        from email_log recent_email
        where recent_email.user_id = u.id
          and recent_email.status = 'sent'
          and recent_email.sent_at >= now() - interval '24 hours'
      )
    order by latest_checkout.created_at desc
    limit ${Math.min(Math.max(limit, 1), 50)}
  `;

  return rows.map((row) => ({
    id: row.id,
    checkoutAt:
      row.checkout_at instanceof Date
        ? row.checkout_at.toISOString()
        : new Date(row.checkout_at).toISOString()
  }));
}

export async function sendCheckoutRecoveryEmail(
  userId: string
): Promise<{ ok: boolean; skipped?: boolean }> {
  if (!hasDatabaseUrl()) return { ok: false, skipped: true };

  await ensureEmailSequenceSchema();
  const sql = getSql();
  const rows = await sql<
    Array<{
      email: string;
      name: string;
      email_opt_out: boolean;
      email_verified: boolean;
      plan: string;
      billing_status: string;
      checkout_at: string | Date;
      completed: boolean;
      recently_sent: boolean;
      recent_email: boolean;
    }>
  >`
    select
      u.email,
      u.name,
      u.email_opt_out,
      u.email_verified,
      u.plan,
      u.billing_status,
      latest_checkout.created_at as checkout_at,
      exists (
        select 1
        from analytics_events completed
        where completed.user_id = u.id
          and completed.event = 'checkout_completed'
          and completed.created_at >= latest_checkout.created_at
      ) as completed,
      exists (
        select 1
        from email_log recovery
        where recovery.user_id = u.id
          and recovery.template = 'checkout_recovery'
          and recovery.status = 'sent'
          and recovery.sent_at >= now() - interval '14 days'
      ) as recently_sent,
      exists (
        select 1
        from email_log recent_email
        where recent_email.user_id = u.id
          and recent_email.status = 'sent'
          and recent_email.sent_at >= now() - interval '24 hours'
      ) as recent_email
    from users u
    join lateral (
      select ae.created_at
      from analytics_events ae
      where ae.user_id = u.id
        and ae.event = 'checkout_initiated'
        and ae.created_at >= now() - interval '72 hours'
        and ae.created_at <= now() - interval '45 minutes'
      order by ae.created_at desc
      limit 1
    ) latest_checkout on true
    where u.id = ${userId}
    limit 1
  `;
  const user = rows[0];
  if (
    !user ||
    user.email_opt_out ||
    !user.email_verified ||
    user.plan !== "free" ||
    ["active", "on_trial"].includes(user.billing_status) ||
    user.completed ||
    user.recently_sent ||
    user.recent_email
  ) {
    return { ok: false, skipped: true };
  }

  let emailContent = buildCheckoutRecoveryEmailContent(user.name);
  const unsubscribeUrl = `${SITE_URL}/unsubscribe?email=${encodeURIComponent(user.email)}`;
  emailContent = {
    ...emailContent,
    html: emailContent.html.replace(`${SITE_URL}/unsubscribe"`, `${unsubscribeUrl}"`)
  };

  try {
    const result = await sendEmail({ to: user.email, ...emailContent });
    await logEmail({
      userId,
      userEmail: user.email,
      template: "checkout_recovery",
      subject: emailContent.subject,
      status: result.ok ? "sent" : "failed",
      errorMessage: result.ok ? undefined : "send skipped (no transport)"
    });
    return result;
  } catch (err) {
    await logEmail({
      userId,
      userEmail: user.email,
      template: "checkout_recovery",
      subject: emailContent.subject,
      status: "failed",
      errorMessage: err instanceof Error ? err.message : "unknown error"
    });
    return { ok: false };
  }
}

export type TrialLifecycleStage = "activation" | "ending";

export function resolveTrialLifecycleStage(input: {
  trialEndsAt: string | Date;
  now?: Date;
}): TrialLifecycleStage | null {
  const now = input.now ?? new Date();
  const trialEndsAt = input.trialEndsAt instanceof Date ? input.trialEndsAt : new Date(input.trialEndsAt);
  const hoursRemaining = (trialEndsAt.getTime() - now.getTime()) / (60 * 60 * 1000);

  if (!Number.isFinite(hoursRemaining) || hoursRemaining <= 0 || hoursRemaining > 72) return null;
  return hoursRemaining <= 24 ? "ending" : "activation";
}

function buildTrialLifecycleEmail(name: string, trialEndsAt: string | Date, stage: TrialLifecycleStage) {
  const greeting = name.trim() || "there";
  const trialEndDate = trialEndsAt instanceof Date ? trialEndsAt : new Date(trialEndsAt);
  const chargeDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short"
  }).format(trialEndDate);

  if (stage === "ending") {
    const html = layout(`
      <p style="margin:0 0 6px;color:#9a7060;font-size:0.82em;font-weight:600;text-transform:uppercase;letter-spacing:0.08em">Plus trial · final day</p>
      <h1 style="margin:0 0 20px;font-size:1.45em;color:#1b120d;font-weight:800">Your Plus trial continues at $3.99/week after ${chargeDate}</h1>
      <p style="color:#3a2218;line-height:1.75;margin:0 0 18px">Hi ${greeting}, use the final trial day to make a clear decision with real progress, not guesswork.</p>
      ${highlight("Complete one speaking answer, read the AI feedback, then retry the same prompt. That two-attempt loop is the fastest way to feel the value of Plus.")}
      <p style="color:#3a2218;line-height:1.75;margin:18px 0 24px">Your trial will continue automatically at <strong>$3.99 per week</strong>. You can review your plan before the trial ends from the billing page.</p>
      <div style="margin:0 0 8px">
        ${primaryBtn(PRACTICE_URL, "Run the two-attempt test &rarr;")}
        &nbsp;&nbsp;
        ${secondaryBtn(BILLING_URL, "Review billing")}
      </div>
    `);
    return {
      subject: "Your SpeakAce Plus trial ends within 24 hours",
      html,
      text: `Hi ${greeting}, your Plus trial continues at $3.99/week after ${chargeDate}. Complete one answer and retry it before deciding: ${PRACTICE_URL}. Review billing: ${BILLING_URL}`
    };
  }

  const html = layout(`
    <p style="margin:0 0 6px;color:#9a7060;font-size:0.82em;font-weight:600;text-transform:uppercase;letter-spacing:0.08em">Plus trial · active</p>
    <h1 style="margin:0 0 20px;font-size:1.45em;color:#1b120d;font-weight:800">Turn your 3-day trial into one measurable improvement</h1>
    <p style="color:#3a2218;line-height:1.75;margin:0 0 18px">Hi ${greeting}, your Plus access is active until ${chargeDate}. The best test is not browsing every feature; it is improving one answer.</p>
    <div style="margin:0 0 22px">
      ${checkItem("Record one IELTS or TOEFL speaking answer")}
      ${checkItem("Read the transcript and full AI feedback")}
      ${checkItem("Retry the same prompt and compare the second score")}
    </div>
    ${highlight("Aim for two focused sessions before the trial ends. Users who reach the retry moment have a much clearer reason to keep Plus.")}
    <div style="margin:24px 0 8px">
      ${primaryBtn(PRACTICE_URL, "Start the first answer &rarr;")}
    </div>
  `);
  return {
    subject: "Your SpeakAce Plus trial is active — start here",
    html,
    text: `Hi ${greeting}, your Plus trial is active until ${chargeDate}. Record one answer, review the feedback, and retry the same prompt: ${PRACTICE_URL}`
  };
}

export async function getUsersDueForTrialLifecycleEmail(limit = 100): Promise<
  Array<{ id: string; email: string; name: string; trialEndsAt: string; stage: TrialLifecycleStage }>
> {
  if (!hasDatabaseUrl()) return [];

  await ensureEmailSequenceSchema();
  const sql = getSql();
  const rows = await sql<
    Array<{
      id: string;
      email: string;
      name: string;
      trial_ends_at: string | Date;
      activation_sent: boolean;
      ending_sent: boolean;
    }>
  >`
    select
      u.id,
      u.email,
      u.name,
      u.trial_ends_at,
      exists (
        select 1 from email_log el
        where el.user_id = u.id and el.template = 'trial_activation' and el.status = 'sent'
      ) as activation_sent,
      exists (
        select 1 from email_log el
        where el.user_id = u.id and el.template = 'trial_ending' and el.status = 'sent'
      ) as ending_sent
    from users u
    where u.plan = 'plus'
      and u.billing_status = 'on_trial'
      and u.trial_ends_at > now()
      and u.trial_ends_at <= now() + interval '72 hours'
      and u.email_opt_out = false
    order by u.trial_ends_at asc
    limit ${Math.max(limit * 3, limit)}
  `;

  return rows
    .map((row) => {
      const stage = resolveTrialLifecycleStage({ trialEndsAt: row.trial_ends_at });
      if (!stage) return null;
      if (stage === "activation" && row.activation_sent) return null;
      if (stage === "ending" && row.ending_sent) return null;
      const trialEndsAt = row.trial_ends_at instanceof Date
        ? row.trial_ends_at.toISOString()
        : new Date(row.trial_ends_at).toISOString();
      return { id: row.id, email: row.email, name: row.name, trialEndsAt, stage };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row))
    .slice(0, limit);
}

export async function sendTrialLifecycleEmail(
  userId: string,
  stage: TrialLifecycleStage
): Promise<{ ok: boolean; skipped?: boolean }> {
  if (!hasDatabaseUrl()) return { ok: false, skipped: true };

  await ensureEmailSequenceSchema();
  const sql = getSql();
  const rows = await sql<
    Array<{
      email: string;
      name: string;
      plan: string;
      email_opt_out: boolean;
      billing_status: string;
      trial_ends_at: string | Date | null;
    }>
  >`
    select email, name, plan, email_opt_out, billing_status, trial_ends_at
    from users
    where id = ${userId}
    limit 1
  `;
  const user = rows[0];
  if (
    !user ||
    user.email_opt_out ||
    user.plan !== "plus" ||
    user.billing_status !== "on_trial" ||
    !user.trial_ends_at
  ) {
    return { ok: false, skipped: true };
  }

  const currentStage = resolveTrialLifecycleStage({ trialEndsAt: user.trial_ends_at });
  if (currentStage !== stage) return { ok: false, skipped: true };

  const templateName = `trial_${stage}`;
  const alreadySent = await sql<Array<{ exists: boolean }>>`
    select exists (
      select 1 from email_log
      where user_id = ${userId} and template = ${templateName} and status = 'sent'
    ) as exists
  `;
  if (alreadySent[0]?.exists) return { ok: false, skipped: true };

  let emailContent = buildTrialLifecycleEmail(user.name, user.trial_ends_at, stage);
  const unsubscribeUrl = `${SITE_URL}/unsubscribe?email=${encodeURIComponent(user.email)}`;
  emailContent = {
    ...emailContent,
    html: emailContent.html.replace(`${SITE_URL}/unsubscribe"`, `${unsubscribeUrl}"`)
  };

  try {
    const result = await sendEmail({ to: user.email, ...emailContent });
    await logEmail({
      userId,
      userEmail: user.email,
      template: templateName,
      subject: emailContent.subject,
      status: result.ok ? "sent" : "failed",
      errorMessage: result.ok ? undefined : "send skipped (no transport)"
    });
    return result;
  } catch (err) {
    await logEmail({
      userId,
      userEmail: user.email,
      template: templateName,
      subject: emailContent.subject,
      status: "failed",
      errorMessage: err instanceof Error ? err.message : "unknown error"
    });
    return { ok: false };
  }
}

// ─── Daily Speaking Tips ───────────────────────────────────────────────────────

interface DailyTip {
  subject: string;
  headline: string;
  body: string;
  example: string;
}

const DAILY_TIPS: DailyTip[] = [
  {
    subject: "Speaking tip: Answer in 3 parts for a higher band score",
    headline: "Use the answer–reason–example formula",
    body: "Every strong IELTS Part 1 answer follows this pattern: give a direct answer, explain your reason, then add a specific example. It signals fluency and coherence to the examiner.",
    example: "\"I enjoy cooking (answer) because it helps me unwind after work (reason). Last weekend I made a Thai curry from scratch (example).\""
  },
  {
    subject: "Speaking tip: Discourse markers that impress IELTS examiners",
    headline: "Structure your answers with discourse markers",
    body: "Words like \"firstly\", \"on the other hand\", \"having said that\" and \"what I mean is\" signal organised thinking. They score well under Coherence & Cohesion — one of the four IELTS speaking criteria.",
    example: "\"I prefer cities, firstly because of the career opportunities, and also because there's so much more to do in the evenings.\""
  },
  {
    subject: "Speaking tip: Vary your sentence openers today",
    headline: "Stop starting every sentence with \"I think\"",
    body: "Over-relying on one opener is a fluency trap. Native speakers constantly vary how they begin sentences. Try openers like \"From my point of view\", \"What I've noticed is\", \"Personally speaking\" or \"It seems to me that\".",
    example: "Instead of: \"I think cities are better.\" → \"Personally speaking, I've always preferred city life.\""
  },
  {
    subject: "Speaking tip: How to buy thinking time without fillers",
    headline: "Pause naturally — don't fill silence with \"um\"",
    body: "Filler words like \"um\", \"uh\" and \"you know\" hurt your fluency score. Instead, use thinking phrases that sound natural: \"That's an interesting question\", \"Let me think about that for a moment\" or simply a short pause.",
    example: "\"That's an interesting question. I'd say the biggest change I've seen is...\""
  },
  {
    subject: "Speaking tip: Upgrade your vocabulary — avoid \"good\" and \"nice\"",
    headline: "Replace weak adjectives with specific, vivid ones",
    body: "Words like \"good\", \"nice\" and \"bad\" are overused and score poorly for Lexical Resource. Challenge yourself today to replace them. \"Good\" → beneficial, rewarding, worthwhile. \"Bad\" → detrimental, challenging, concerning.",
    example: "Instead of: \"It was a good experience.\" → \"It was an incredibly rewarding experience.\""
  },
  {
    subject: "Speaking tip: Part 2 tip — don't stop early",
    headline: "Fill the full 2 minutes in Part 2",
    body: "Most candidates stop at 60–70 seconds in Part 2. The examiner wants 2 full minutes of continuous speech. If you finish your points early, add a reflection: how you felt about it, what you learned, or how it compared to a similar experience.",
    example: "\"…and looking back, it was one of the most memorable experiences I've had, mainly because it changed the way I think about [topic].\""
  },
  {
    subject: "Speaking tip: Listen to your own recording today",
    headline: "Catch the one filler word you overuse",
    body: "After your practice session, replay your recording with one goal: spot the filler word you say most — \"basically\", \"like\", \"right\", \"actually\". Eliminating just one overused word can raise your fluency score by 0.5 bands.",
    example: "If you hear \"basically\" five times in two minutes, replace it with silence or a short thinking phrase in your next attempt."
  },
  {
    subject: "Speaking tip: Use conditionals in Part 3 to sound academic",
    headline: "Conditionals signal high grammatical range",
    body: "Part 3 asks for opinions and hypotheticals — perfect for conditional structures. Using them naturally shows grammatical range, which is directly scored by the examiner.",
    example: "\"If governments invested more in public transport, traffic congestion would decrease significantly. Were that to happen, air quality in cities would improve dramatically.\""
  },
  {
    subject: "Speaking tip: Paraphrase the question before you answer",
    headline: "Rephrase the question — it buys time and impresses examiners",
    body: "Paraphrasing shows comprehension and gives you a second to organise your thoughts. It also demonstrates Lexical Resource because you use different words to express the same idea. Aim for one natural paraphrase at the start of your answer.",
    example: "Q: \"Do you think people read enough these days?\" → A: \"Whether people engage with books and written content as often as they used to is an interesting point...\""
  },
  {
    subject: "Speaking tip: Add specific numbers to sound more fluent",
    headline: "Use numbers and statistics — real or approximate",
    body: "Fluent speakers naturally use rough figures to support their points. You don't need exact data — approximate numbers work perfectly and make your answer feel grounded and confident.",
    example: "Instead of: \"Many people use social media.\" → \"I'd say roughly 70–80% of people I know check social media at least once a day.\""
  },
  {
    subject: "Speaking tip: Never memorise your IELTS answers",
    headline: "Memorised answers are a band score killer",
    body: "Examiners are trained to spot scripted responses — they'll cut you off and redirect. Instead, memorise useful phrases, vocabulary chunks and structures. Then apply them flexibly. Spontaneity is what separates Band 6 from Band 7.",
    example: "Memorise the structure: [Paraphrase question] + [Main point] + [Reason] + [Example] + [Reflection]. Apply it to any topic."
  },
  {
    subject: "Speaking tip: Land your answers with a clear final sentence",
    headline: "End strongly — don't trail off",
    body: "Many candidates lose marks by fading out at the end of their answers. A strong closing sentence signals that you've completed your thought. It also gives the examiner a natural handoff moment.",
    example: "\"…so all things considered, I think technology has had an overwhelmingly positive impact on how we learn new skills.\""
  },
  {
    subject: "Speaking tip: How to describe trends fluently",
    headline: "Practice trend language for Part 3 discussions",
    body: "IELTS Part 3 frequently asks about changes in society. Having trend vocabulary ready — for rises, falls, and shifts — lets you respond instantly and fluently without pausing to search for words.",
    example: "\"There's been a dramatic rise in remote work over the past five years.\" / \"Interest in traditional crafts has declined steadily.\" / \"It's shifted from something niche to a mainstream activity.\""
  },
  {
    subject: "Speaking tip: Mix active and passive voice for grammatical range",
    headline: "Use passive voice to vary your grammar",
    body: "One of the four IELTS speaking criteria is Grammatical Range & Accuracy. Using only active sentences limits your range. Passive structures sound natural in discussions about society, trends and general facts.",
    example: "Active: \"People widely believe that education is the key to success.\" → Passive: \"It is widely believed that education is the key to success.\" Both are correct — vary between them."
  }
];

export function getTodaysTip(): DailyTip {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86_400_000);
  return DAILY_TIPS[dayOfYear % DAILY_TIPS.length];
}

function buildDailyTipEmail(name: string, tip: DailyTip) {
  const greeting = name.trim() || "there";
  const html = layout(`
    <p style="margin:0 0 6px;color:#d95d39;font-size:0.82em;font-weight:700;text-transform:uppercase;letter-spacing:0.08em">Daily Speaking Tip</p>
    <h1 style="margin:0 0 24px;font-size:1.4em;color:#1b120d;font-weight:800;line-height:1.3">${tip.headline}</h1>

    <p style="color:#3a2218;line-height:1.75;margin:0 0 20px">Hi ${greeting},</p>
    <p style="color:#3a2218;line-height:1.75;margin:0 0 20px">${tip.body}</p>

    <div style="background:#f9f4f0;border-radius:12px;padding:20px 24px;margin:0 0 24px">
      <p style="margin:0 0 8px;font-size:0.8em;font-weight:700;color:#9a7060;text-transform:uppercase;letter-spacing:0.06em">Example</p>
      <p style="margin:0;color:#3a2218;font-size:0.93em;line-height:1.75;font-style:italic">${tip.example}</p>
    </div>

    <p style="color:#3a2218;line-height:1.75;margin:0 0 28px">Open SpeakAce, try this in your next answer, and see how it changes your AI score.</p>

    <div style="margin:0 0 8px">
      ${primaryBtn(PRACTICE_URL, "Let's try &rarr;")}
    </div>
  `);
  return {
    subject: tip.subject,
    html,
    text: `Hi ${greeting}, today's IELTS speaking tip — ${tip.headline}.\n\n${tip.body}\n\nExample: ${tip.example}\n\nLet's try it: ${PRACTICE_URL}`
  };
}

export async function getUsersForDailyTip(limit = 200): Promise<Array<{ id: string; email: string; name: string }>> {
  if (!hasDatabaseUrl()) return [];

  await ensureEmailSequenceSchema();
  const sql = getSql();

  const rows = await sql<Array<{ id: string; email: string; name: string }>>`
    select u.id, u.email, u.name
    from users u
    where u.email_opt_out = false
      and u.email_verified = true
      and u.role != 'guest'
      and coalesce(u.billing_status, 'free') <> 'on_trial'
      and exists (
        select 1 from speaking_sessions s
        where s.user_id = u.id
          and s.created_at >= now() - interval '30 days'
      )
      and not exists (
        select 1 from email_log el
        where el.user_id = u.id
          and el.template = 'daily_tip'
          and el.sent_at >= now() - interval '7 days'
      )
      and not exists (
        select 1 from email_log el
        where el.user_id = u.id
          and el.status = 'sent'
          and el.sent_at >= now() - interval '24 hours'
      )
    order by (
      select max(s.created_at) from speaking_sessions s where s.user_id = u.id
    ) desc
    limit ${limit}
  `;

  return rows;
}

export async function sendDailyTipEmail(userId: string): Promise<{ ok: boolean; skipped?: boolean }> {
  if (!hasDatabaseUrl()) return { ok: false, skipped: true };

  await ensureEmailSequenceSchema();
  const sql = getSql();
  const rows = await sql<Array<{ email: string; name: string; email_opt_out: boolean; billing_status: string }>>`
    select email, name, email_opt_out, billing_status from users where id = ${userId} limit 1
  `;
  const user = rows[0];
  if (!user) return { ok: false };
  if (user.email_opt_out || user.billing_status === "on_trial") return { ok: false, skipped: true };

  const tip = getTodaysTip();
  let emailContent = buildDailyTipEmail(user.name, tip);

  const unsubscribeUrl = `${SITE_URL}/unsubscribe?email=${encodeURIComponent(user.email)}`;
  emailContent = {
    ...emailContent,
    html: emailContent.html.replace(`${SITE_URL}/unsubscribe"`, `${unsubscribeUrl}"`)
  };

  try {
    const result = await sendEmail({ to: user.email, ...emailContent });
    await logEmail({
      userId,
      userEmail: user.email,
      template: "daily_tip",
      subject: emailContent.subject,
      status: result.ok ? "sent" : "failed",
      errorMessage: result.ok ? undefined : "send skipped (no transport)"
    });
    return result;
  } catch (err) {
    await logEmail({
      userId,
      userEmail: user.email,
      template: "daily_tip",
      subject: emailContent.subject,
      status: "failed",
      errorMessage: err instanceof Error ? err.message : "unknown error"
    });
    return { ok: false };
  }
}
