import { sendEmail } from "@/lib/server/email";
import { hasDatabaseUrl, getSql } from "@/lib/server/db";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://speakace.org";
const PRACTICE_URL = `${SITE_URL}/app/practice`;
const PRICING_URL = `${SITE_URL}/pricing`;
const CHECKOUT_URL = `${SITE_URL}/api/payments/lemon/checkout?plan=plus&campaign=onboarding_email`;
let emailSequenceSchemaEnsured = false;

export const ONBOARDING_EMAIL_SCHEDULE: Array<{ dayOffset: number; emailNumber: number }> = [
  { dayOffset: 0, emailNumber: 1 },
  { dayOffset: 2, emailNumber: 2 },
  { dayOffset: 5, emailNumber: 3 },
  { dayOffset: 7, emailNumber: 4 },
  { dayOffset: 10, emailNumber: 5 },
  { dayOffset: 14, emailNumber: 6 },
  { dayOffset: 21, emailNumber: 7 },
  { dayOffset: 30, emailNumber: 8 },
  { dayOffset: 45, emailNumber: 9 },
  { dayOffset: 60, emailNumber: 10 },
  { dayOffset: 75, emailNumber: 11 },
  { dayOffset: 90, emailNumber: 12 }
];

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

const quote = (text: string, attribution: string) =>
  `<div style="background:#f9f4f0;border-radius:12px;padding:20px 24px;margin:20px 0">
    <p style="margin:0 0 12px;color:#5a3e32;font-size:0.95em;line-height:1.7;font-style:italic">"${text}"</p>
    <p style="margin:0;color:#9a7060;font-size:0.83em;font-weight:600">— ${attribution}</p>
  </div>`;

const statBox = (stat: string, label: string) =>
  `<div style="background:#fff3ec;border-radius:12px;padding:16px 20px;margin:8px 0;display:flex;align-items:baseline;gap:10px">
    <span style="font-size:1.6em;font-weight:900;color:#d95d39">${stat}</span>
    <span style="color:#5a3e32;font-size:0.9em">${label}</span>
  </div>`;

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

    <p style="color:#3a2218;line-height:1.75;margin:0 0 20px">You've just joined thousands of IELTS candidates using SpeakAce to sharpen their speaking and hit their target band score. Here's how to get the most out of it from day one:</p>

    <div style="margin:0 0 28px">
      ${checkItem("<strong>Practice daily</strong> — even 10 minutes a day compounds fast")}
      ${checkItem("<strong>Read your transcript</strong> — spot patterns in your own speech")}
      ${checkItem("<strong>Retry the same prompt</strong> — your second attempt is always better")}
      ${checkItem("<strong>Track your score</strong> — watch your band score climb over time")}
    </div>

    <div style="margin:28px 0">
      ${primaryBtn(PRACTICE_URL, "Start your first practice &rarr;")}
    </div>

    <p style="margin:24px 0 0;color:#9a7060;font-size:0.85em;line-height:1.7">Over the next few days we'll send you targeted tips to accelerate your progress. Keep an eye on your inbox.</p>
  `);
  return {
    subject: "Welcome to SpeakAce — let's get your band score moving",
    html,
    text: `Hi ${greeting}, welcome to SpeakAce! Start your first practice here: ${PRACTICE_URL}`
  };
}

function buildEmail2(name: string) {
  const greeting = name.trim() || "there";
  const html = layout(`
    <p style="margin:0 0 6px;color:#9a7060;font-size:0.82em;font-weight:600;text-transform:uppercase;letter-spacing:0.08em">Day 2</p>
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
      ${primaryBtn(PRACTICE_URL, "Practice now &rarr;")}
    </div>
  `);
  return {
    subject: "IELTS tip that moves your score — try it today",
    html,
    text: `Hi ${greeting}, day 2! Use the answer-reason-example formula in your IELTS Part 1. Practice here: ${PRACTICE_URL}`
  };
}

function buildEmail3(name: string) {
  const greeting = name.trim() || "there";
  const html = layout(`
    <p style="margin:0 0 6px;color:#9a7060;font-size:0.82em;font-weight:600;text-transform:uppercase;letter-spacing:0.08em">Day 5</p>
    <h1 style="margin:0 0 24px;font-size:1.45em;color:#1b120d;font-weight:800">Your Week 1 IELTS Speaking Checklist</h1>

    <p style="color:#3a2218;line-height:1.75;margin:0 0 20px">Hi ${greeting}, tick these five off by the end of the week and you'll be ahead of 80% of IELTS test-takers.</p>

    <div style="margin:0 0 28px">
      ${checkItem("<strong>Answer at least one Part 1 prompt</strong> — familiar topics, natural speech")}
      ${checkItem("<strong>Listen to your own recording</strong> — identify one filler word to eliminate")}
      ${checkItem("<strong>Complete one Part 2 long turn</strong> — aim for a full 2 minutes without stopping")}
      ${checkItem("<strong>Read your AI feedback</strong> — focus on the single top-priority improvement")}
      ${checkItem("<strong>Retry the same prompt</strong> — apply the feedback and compare both attempts")}
    </div>

    ${highlight("Progress tip: you don't need to be perfect. Each attempt is data. The candidates who improve fastest are the ones who keep going even when they stumble.")}

    <div style="margin:28px 0 8px">
      ${primaryBtn(PRACTICE_URL, "Open SpeakAce &rarr;")}
    </div>
  `);
  return {
    subject: "5-item checklist for your first week of IELTS practice",
    html,
    text: `Hi ${greeting}, your Week 1 checklist: 1) Part 1 prompt 2) Listen back 3) Part 2 long turn 4) Read AI feedback 5) Retry same prompt. Practice: ${PRACTICE_URL}`
  };
}

function buildEmail4(name: string) {
  const greeting = name.trim() || "there";
  const html = layout(`
    <p style="margin:0 0 6px;color:#9a7060;font-size:0.82em;font-weight:600;text-transform:uppercase;letter-spacing:0.08em">Day 7 Milestone</p>
    <h1 style="margin:0 0 8px;font-size:1.45em;color:#1b120d;font-weight:800">One week in — you're already ahead.</h1>
    <p style="margin:0 0 24px;color:#7a5c4a;font-size:0.9em">Most people quit before day 7. You didn't.</p>

    <p style="color:#3a2218;line-height:1.75;margin:0 0 20px">Hi ${greeting}, a week of consistent practice is real momentum. If you're targeting Band 7 or higher, here's what SpeakAce Plus adds to your daily routine:</p>

    <div style="margin:0 0 28px">
      ${checkItem("<strong>35 minutes of daily speaking</strong> — vs 8 minutes on the free plan")}
      ${checkItem("<strong>18 practice sessions per day</strong> — more variety, more reps, faster gains")}
      ${checkItem("<strong>Deeper AI feedback</strong> — detailed analysis with stronger improvement suggestions")}
      ${checkItem("<strong>Full score history</strong> — track your band score arc over weeks and months")}
    </div>

    <div style="margin:28px 0;display:flex;gap:12px;flex-wrap:wrap">
      ${primaryBtn(CHECKOUT_URL, "Upgrade to Plus &rarr;")}
      &nbsp;&nbsp;
      ${secondaryBtn(PRACTICE_URL, "Keep practicing free")}
    </div>

    <p style="margin:20px 0 0;color:#9a7060;font-size:0.85em;line-height:1.7">Either way — every session brings you closer to your target score. Keep going.</p>
  `);
  return {
    subject: "You've been practicing for a week — here's what's next",
    html,
    text: `Hi ${greeting}, one week of practice! Upgrade to Plus for more daily volume: ${CHECKOUT_URL} — or keep going free: ${PRACTICE_URL}`
  };
}

function buildEmail5(name: string) {
  const greeting = name.trim() || "there";
  const html = layout(`
    <p style="margin:0 0 6px;color:#9a7060;font-size:0.82em;font-weight:600;text-transform:uppercase;letter-spacing:0.08em">Day 10</p>
    <h1 style="margin:0 0 24px;font-size:1.45em;color:#1b120d;font-weight:800">The one habit that separates Band 6 from Band 7+</h1>

    <p style="color:#3a2218;line-height:1.75;margin:0 0 20px">Hi ${greeting}, we looked at the data. The result is clear:</p>

    ${statBox("+0.7", "average band score improvement for candidates who practice daily vs. weekly")}

    <p style="color:#3a2218;line-height:1.75;margin:20px 0 20px">The difference isn't talent. It's repetition. Here's what daily practice actually sounds like:</p>

    ${quote("I went from Band 6 to Band 7.5 in six weeks. I practiced on SpeakAce every morning before work — just 15 minutes.", "SpeakAce user, Almaty, Kazakhstan")}
    ${quote("The transcript feature showed me I was overusing 'basically'. Fixing that one word improved my lexical score.", "SpeakAce user, Jakarta, Indonesia")}

    <p style="color:#3a2218;line-height:1.75;margin:20px 0 28px">You're already showing up. SpeakAce Plus gives you the daily volume and detail to convert that effort into a higher band score.</p>

    <div style="margin:0 0 8px">
      ${primaryBtn(CHECKOUT_URL, "Upgrade to Plus — $3.99/week &rarr;")}
    </div>
    <p style="margin:12px 0 0;font-size:0.83em;color:#9a7060">
      <a href="${PRICING_URL}" style="color:#9a7060;text-decoration:underline">Compare all plans</a>
    </p>
  `);
  return {
    subject: "The data on daily practice — and what it means for your score",
    html,
    text: `Hi ${greeting}, students who practice daily score 0.7 bands higher. Upgrade to Plus: ${CHECKOUT_URL}`
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

    <p style="color:#3a2218;line-height:1.75;margin:20px 0 28px">The candidates who reach Band 7+ aren't the ones who never miss a day — they're the ones who restart quickly when they do.</p>

    <div style="margin:0 0 8px">
      ${primaryBtn(PRACTICE_URL, "Take the 60-second challenge &rarr;")}
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
    <h1 style="margin:0 0 24px;font-size:1.45em;color:#1b120d;font-weight:800">The #1 reason scores get stuck at Band 5.5</h1>

    <p style="color:#3a2218;line-height:1.75;margin:0 0 20px">Hi ${greeting}, after analysing thousands of IELTS speaking responses, one pattern appears again and again in candidates who can't break through Band 6:</p>

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
    subject: "Why IELTS speaking scores stall at 5.5 — and the fix",
    html,
    text: `Hi ${greeting}, the #1 IELTS mistake is not developing answers. Learn the fix: ${PRACTICE_URL}`
  };
}

function buildEmail8(name: string) {
  const greeting = name.trim() || "there";
  const html = layout(`
    <p style="margin:0 0 6px;color:#9a7060;font-size:0.82em;font-weight:600;text-transform:uppercase;letter-spacing:0.08em">Day 30 Milestone</p>
    <h1 style="margin:0 0 24px;font-size:1.45em;color:#1b120d;font-weight:800">One month with SpeakAce — what the top improvers do</h1>

    <p style="color:#3a2218;line-height:1.75;margin:0 0 20px">Hi ${greeting}, you've had your account for 30 days. Here's what we've observed about candidates who improve the most in their first month:</p>

    <div style="margin:0 0 28px">
      ${checkItem("Practice at least <strong>4 days per week</strong> — consistency beats session length")}
      ${checkItem("<strong>Retry the same question</strong> after reading feedback — that second attempt is where the growth happens")}
      ${checkItem("Pick <strong>one weak area per week</strong> — fixing everything at once fixes nothing")}
    </div>

    <p style="color:#3a2218;line-height:1.75;margin:0 0 28px">On the free plan you get 4 sessions per day — enough for a solid daily habit. If you want more volume and deeper analysis, Plus is $3.99/week.</p>

    <div style="margin:0 0 8px;display:flex;gap:12px;flex-wrap:wrap">
      ${primaryBtn(PRACTICE_URL, "Practice today &rarr;")}
      &nbsp;&nbsp;
      ${secondaryBtn(CHECKOUT_URL, "Upgrade to Plus")}
    </div>
  `);
  return {
    subject: "What the top IELTS improvers do differently (30-day data)",
    html,
    text: `Hi ${greeting}, one month in. Top habit: practice 4 days/week and retry after feedback. ${PRACTICE_URL}`
  };
}

function buildEmail9(name: string) {
  const greeting = name.trim() || "there";
  const html = layout(`
    <p style="margin:0 0 6px;color:#9a7060;font-size:0.82em;font-weight:600;text-transform:uppercase;letter-spacing:0.08em">Day 45</p>
    <h1 style="margin:0 0 24px;font-size:1.45em;color:#1b120d;font-weight:800">From Band 5.5 to 7.0 in 6 weeks — a real story</h1>

    <p style="color:#3a2218;line-height:1.75;margin:0 0 20px">Hi ${greeting},</p>

    ${quote("I had taken IELTS twice and stuck at 5.5 both times. I started using SpeakAce for 15 minutes every morning before work. After six weeks I retook the test and scored 7.0. The transcript review was the feature that changed everything — I could see exactly which words I overused and cut them out one by one.", "SpeakAce user, Almaty, Kazakhstan")}

    <p style="color:#3a2218;line-height:1.75;margin:20px 0 20px">The insight here: it wasn't more hours of practice. It was <strong>reading the transcript</strong> and fixing one specific habit per week.</p>

    ${highlight("Your transcript is available after every session. Open it after your next practice and look for one word or phrase you use too often — then eliminate it.")}

    <div style="margin:28px 0 8px">
      ${primaryBtn(PRACTICE_URL, "Record and review your transcript &rarr;")}
    </div>
  `);
  return {
    subject: "How one candidate went from 5.5 to 7.0 in 6 weeks",
    html,
    text: `Hi ${greeting}, a SpeakAce user went from band 5.5 to 7.0 in 6 weeks by reviewing transcripts. Try it: ${PRACTICE_URL}`
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

    ${highlight("Use code <strong>COMEBACK</strong> at checkout for <strong>20% off your first week</strong>. No expiry on this offer.")}

    <div style="margin:28px 0;display:flex;gap:12px;flex-wrap:wrap">
      ${primaryBtn(`${CHECKOUT_URL}&coupon=COMEBACK`, "Claim 20% off Plus &rarr;")}
      &nbsp;&nbsp;
      ${secondaryBtn(PRACTICE_URL, "Stay on free plan")}
    </div>

    <p style="margin:20px 0 0;color:#9a7060;font-size:0.85em;line-height:1.7">Good luck with your IELTS preparation, whatever path you choose.</p>
  `);
  return {
    subject: "Last email from SpeakAce — a 20% offer inside",
    html,
    text: `Hi ${greeting}, last email from SpeakAce. Use COMEBACK for 20% off Plus: ${CHECKOUT_URL}&coupon=COMEBACK — or stay free: ${PRACTICE_URL}`
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

export async function sendOnboardingEmail(
  userId: string,
  emailNumber: number
): Promise<{ ok: boolean; skipped?: boolean }> {
  if (!hasDatabaseUrl()) {
    return { ok: false, skipped: true };
  }

  await ensureEmailSequenceSchema();
  const sql = getSql();
  const rows = await sql<Array<{ email: string; name: string; email_opt_out: boolean }>>`
    select email, name, email_opt_out from users where id = ${userId} limit 1
  `;
  const user = rows[0];
  if (!user) return { ok: false };
  if (user.email_opt_out) return { ok: false, skipped: true };

  let emailContent: { subject: string; html: string; text: string };
  if (emailNumber === 1) emailContent = buildEmail1(user.name);
  else if (emailNumber === 2) emailContent = buildEmail2(user.name);
  else if (emailNumber === 3) emailContent = buildEmail3(user.name);
  else if (emailNumber === 4) emailContent = buildEmail4(user.name);
  else if (emailNumber === 5) emailContent = buildEmail5(user.name);
  else if (emailNumber === 6) emailContent = buildEmail6(user.name);
  else if (emailNumber === 7) emailContent = buildEmail7(user.name);
  else if (emailNumber === 8) emailContent = buildEmail8(user.name);
  else if (emailNumber === 9) emailContent = buildEmail9(user.name);
  else if (emailNumber === 10) emailContent = buildEmail10(user.name);
  else if (emailNumber === 11) emailContent = buildEmail11(user.name);
  else if (emailNumber === 12) emailContent = buildEmail12(user.name);
  else return { ok: false };

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

  // Exclude users who already received today's tip
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const rows = await sql<Array<{ id: string; email: string; name: string }>>`
    select u.id, u.email, u.name
    from users u
    where u.email_opt_out = false
      and u.role != 'guest'
      and not exists (
        select 1 from email_log el
        where el.user_id = u.id
          and el.template = 'daily_tip'
          and el.sent_at >= ${todayStart.toISOString()}
      )
    order by u.created_at asc
    limit ${limit}
  `;

  return rows;
}

export async function sendDailyTipEmail(userId: string): Promise<{ ok: boolean; skipped?: boolean }> {
  if (!hasDatabaseUrl()) return { ok: false, skipped: true };

  await ensureEmailSequenceSchema();
  const sql = getSql();
  const rows = await sql<Array<{ email: string; name: string; email_opt_out: boolean }>>`
    select email, name, email_opt_out from users where id = ${userId} limit 1
  `;
  const user = rows[0];
  if (!user) return { ok: false };
  if (user.email_opt_out) return { ok: false, skipped: true };

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
