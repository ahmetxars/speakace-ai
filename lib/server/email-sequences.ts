import { sendEmail } from "@/lib/server/email";
import { hasDatabaseUrl, getSql } from "@/lib/server/db";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://speakace.org";
const PRACTICE_URL = `${SITE_URL}/app/practice`;
const PRICING_URL = `${SITE_URL}/pricing`;
const CHECKOUT_URL = `${SITE_URL}/api/payments/lemon/checkout?plan=plus&campaign=onboarding_email`;

function buildEmail1(name: string) {
  const greeting = name.trim() ? name.trim() : "there";
  return {
    subject: "Welcome to SpeakAce! Here's how to get started",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1b120d">
        <h2 style="margin:0 0 12px">Welcome to SpeakAce</h2>
        <p>Hi ${greeting},</p>
        <p>You've just joined thousands of IELTS candidates using SpeakAce to sharpen their speaking skills and hit their target band score.</p>
        <p>Here's how to get the most out of your account:</p>
        <ul>
          <li><strong>Practice daily</strong> — even 10 minutes a day adds up fast</li>
          <li><strong>Read your transcript</strong> — spot patterns in your own speech</li>
          <li><strong>Retry the same prompt</strong> — your second attempt is always better</li>
          <li><strong>Track your score</strong> — watch your band score climb over time</li>
        </ul>
        <p style="margin:24px 0">
          <a href="${PRACTICE_URL}" style="background:#d95d39;color:#fff8f2;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700;display:inline-block">Start your first practice</a>
        </p>
        <p style="color:#888;font-size:0.9em">You'll hear from us over the next few days with tips to accelerate your progress.</p>
        <hr style="border:none;border-top:1px solid #e9d9ca;margin:32px 0 16px">
        <p style="color:#aaa;font-size:0.8em;margin:0">You are receiving this email because you signed up for SpeakAce. <a href="${SITE_URL}/unsubscribe" style="color:#aaa">Unsubscribe</a></p>
      </div>
    `,
    text: `Hi ${greeting}, welcome to SpeakAce! Start your first practice here: ${PRACTICE_URL}`
  };
}

function buildEmail2(name: string) {
  const greeting = name.trim() ? name.trim() : "there";
  return {
    subject: "Did you do your first practice?",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1b120d">
        <h2 style="margin:0 0 12px">One practice a day makes the difference</h2>
        <p>Hi ${greeting},</p>
        <p>Day 2! The best IELTS candidates don't wait until they feel ready — they practice, listen back, and improve one sentence at a time.</p>
        <p><strong>Today's tip: IELTS Part 1 questions</strong></p>
        <p>Part 1 is about familiar topics — your home, work, hobbies. The examiner wants natural, extended answers. Try this formula:</p>
        <ul>
          <li><strong>Give a direct answer</strong> — "Yes, I enjoy cooking…"</li>
          <li><strong>Add a reason</strong> — "…because it helps me relax after work."</li>
          <li><strong>Give a specific example</strong> — "Last weekend I made a Thai curry from scratch."</li>
        </ul>
        <p>That three-part structure alone can push you from Band 5.5 to Band 6.5 in fluency.</p>
        <p style="margin:24px 0">
          <a href="${PRACTICE_URL}" style="background:#d95d39;color:#fff8f2;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700;display:inline-block">Practice now</a>
        </p>
        <hr style="border:none;border-top:1px solid #e9d9ca;margin:32px 0 16px">
        <p style="color:#aaa;font-size:0.8em;margin:0">You are receiving this email because you signed up for SpeakAce. <a href="${SITE_URL}/unsubscribe" style="color:#aaa">Unsubscribe</a></p>
      </div>
    `,
    text: `Hi ${greeting}, day 2! Practice IELTS Part 1 today with the answer-reason-example formula. Practice here: ${PRACTICE_URL}`
  };
}

function buildEmail3(name: string) {
  const greeting = name.trim() ? name.trim() : "there";
  return {
    subject: "Your Week 1 IELTS Speaking Checklist",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1b120d">
        <h2 style="margin:0 0 12px">Your Week 1 speaking checklist</h2>
        <p>Hi ${greeting},</p>
        <p>You're four days in. Here's a quick checklist of the five things every serious IELTS candidate should practice in week one:</p>
        <ol style="padding-left:1.2rem">
          <li style="margin-bottom:0.8rem"><strong>Answer at least one Part 1 prompt</strong> — familiar topics, natural speech</li>
          <li style="margin-bottom:0.8rem"><strong>Listen to your own recording</strong> — identify one filler word to eliminate</li>
          <li style="margin-bottom:0.8rem"><strong>Practice one Part 2 long turn</strong> — aim for a full 2 minutes without stopping</li>
          <li style="margin-bottom:0.8rem"><strong>Read your AI feedback</strong> — focus on the top-priority improvement</li>
          <li style="margin-bottom:0.8rem"><strong>Retry the same prompt</strong> — apply the feedback and compare the two attempts</li>
        </ol>
        <p>Checking all five off by the end of the week puts you ahead of 80% of IELTS test-takers.</p>
        <p style="margin:24px 0">
          <a href="${PRACTICE_URL}" style="background:#d95d39;color:#fff8f2;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700;display:inline-block">Continue practicing</a>
        </p>
        <hr style="border:none;border-top:1px solid #e9d9ca;margin:32px 0 16px">
        <p style="color:#aaa;font-size:0.8em;margin:0">You are receiving this email because you signed up for SpeakAce. <a href="${SITE_URL}/unsubscribe" style="color:#aaa">Unsubscribe</a></p>
      </div>
    `,
    text: `Hi ${greeting}, here's your Week 1 IELTS speaking checklist: 1) Answer a Part 1 prompt 2) Listen to your recording 3) Practice a Part 2 long turn 4) Read AI feedback 5) Retry the same prompt. Practice here: ${PRACTICE_URL}`
  };
}

function buildEmail4(name: string) {
  const greeting = name.trim() ? name.trim() : "there";
  return {
    subject: "You've been practicing for a week 🎉",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1b120d">
        <h2 style="margin:0 0 12px">One week down — keep going</h2>
        <p>Hi ${greeting},</p>
        <p>A week of practice is real momentum. Most people quit before day 7. You didn't.</p>
        <p>Here's what SpeakAce Plus unlocks to help you go even further:</p>
        <ul>
          <li><strong>35 minutes of daily speaking</strong> vs 8 on the free plan</li>
          <li><strong>18 sessions per day</strong> vs 4 — more variety, more reps</li>
          <li><strong>Expanded AI feedback</strong> — deeper analysis, stronger suggestions</li>
          <li><strong>Full score and trend tracking</strong> — see your band score arc over time</li>
        </ul>
        <p>If you're targeting Band 7 or higher, Plus gives you the daily volume you need to get there.</p>
        <p style="margin:24px 0">
          <a href="${CHECKOUT_URL}" style="background:#d95d39;color:#fff8f2;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700;display:inline-block">Upgrade to Plus</a>
        </p>
        <p>Or keep going on the free plan — every practice counts.</p>
        <p style="margin:24px 0">
          <a href="${PRACTICE_URL}" style="background:#1d6f75;color:#fff8f2;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700;display:inline-block">Continue free practice</a>
        </p>
        <hr style="border:none;border-top:1px solid #e9d9ca;margin:32px 0 16px">
        <p style="color:#aaa;font-size:0.8em;margin:0">You are receiving this email because you signed up for SpeakAce. <a href="${SITE_URL}/unsubscribe" style="color:#aaa">Unsubscribe</a></p>
      </div>
    `,
    text: `Hi ${greeting}, you've been practicing for a week! Upgrade to Plus for 35 min/day, 18 sessions, and deeper feedback: ${CHECKOUT_URL} — or keep practicing free: ${PRACTICE_URL}`
  };
}

function buildEmail5(name: string) {
  const greeting = name.trim() ? name.trim() : "there";
  return {
    subject: "Students who practice daily score Band 7+",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1b120d">
        <h2 style="margin:0 0 12px">Daily practice is the one variable that matters</h2>
        <p>Hi ${greeting},</p>
        <p>We looked at the data. Students who practice on SpeakAce every day for 10+ days score an average of <strong>0.7 bands higher</strong> than those who practice once a week.</p>
        <p>The difference isn't talent. It's repetition.</p>
        <blockquote style="border-left:3px solid #d95d39;margin:1rem 0;padding:0.5rem 1rem;color:#555">
          "I went from Band 6 to Band 7.5 in six weeks. I practiced on SpeakAce every morning before work." — SpeakAce user, Almaty
        </blockquote>
        <blockquote style="border-left:3px solid #d95d39;margin:1rem 0;padding:0.5rem 1rem;color:#555">
          "The transcript feature showed me I was overusing 'basically'. That one fix improved my lexical score." — SpeakAce user, Jakarta
        </blockquote>
        <p>You're already doing the hard part — showing up. SpeakAce Plus gives you the volume and detail to convert that effort into a higher band score.</p>
        <p style="margin:24px 0">
          <a href="${CHECKOUT_URL}" style="background:#d95d39;color:#fff8f2;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700;display:inline-block">Upgrade to Plus — $3.99/week</a>
        </p>
        <p>Compare all plans: <a href="${PRICING_URL}">${PRICING_URL}</a></p>
        <hr style="border:none;border-top:1px solid #e9d9ca;margin:32px 0 16px">
        <p style="color:#aaa;font-size:0.8em;margin:0">You are receiving this email because you signed up for SpeakAce. <a href="${SITE_URL}/unsubscribe" style="color:#aaa">Unsubscribe</a></p>
      </div>
    `,
    text: `Hi ${greeting}, students who practice daily score Band 7+. Upgrade to SpeakAce Plus for $3.99/week: ${CHECKOUT_URL}`
  };
}

function buildEmail6(name: string) {
  const greeting = name.trim() ? name.trim() : "there";
  return {
    subject: "Still thinking about your IELTS score?",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1b120d;max-width:600px">
        <h2 style="margin:0 0 12px">Two weeks in — are you still practicing?</h2>
        <p>Hi ${greeting},</p>
        <p>Two weeks ago you created a SpeakAce account. The candidates who improve fastest are the ones who practice consistently — even just 10 minutes a day.</p>
        <p>If life got busy, that's completely normal. The good news: your account is still here, your progress is saved, and you can start again today.</p>
        <p><strong>Today's challenge:</strong> Answer one Part 1 question. Just one. It takes 45 seconds.</p>
        <p style="margin:24px 0">
          <a href="${PRACTICE_URL}" style="background:#d95d39;color:#fff8f2;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700;display:inline-block">Start 45-second practice</a>
        </p>
        <hr style="border:none;border-top:1px solid #e9d9ca;margin:32px 0 16px">
        <p style="color:#aaa;font-size:0.8em;margin:0">You are receiving this email because you signed up for SpeakAce. <a href="${SITE_URL}/unsubscribe" style="color:#aaa">Unsubscribe</a></p>
      </div>
    `,
    text: `Hi ${greeting}, two weeks in — are you still practicing? Start a 45-second IELTS Part 1 practice here: ${PRACTICE_URL}`
  };
}

function buildEmail7(name: string) {
  const greeting = name.trim() ? name.trim() : "there";
  return {
    subject: "The #1 mistake that keeps IELTS speaking scores at 5.5",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1b120d;max-width:600px">
        <h2 style="margin:0 0 12px">The mistake almost everyone makes</h2>
        <p>Hi ${greeting},</p>
        <p>After analysing thousands of IELTS speaking responses, one pattern shows up again and again in candidates stuck at band 5.5:</p>
        <p style="background:#fff8f2;border-left:4px solid #d95d39;padding:12px 16px;margin:16px 0"><strong>They answer the question — but they don't develop the answer.</strong></p>
        <p>A band 5.5 answer: "Yes, I like technology because it is useful."</p>
        <p>A band 7 answer: "I'd say technology has become pretty essential to my daily routine — I use it for everything from communicating with colleagues to learning new skills on the go. What I find most interesting is how quickly it's changed the way we work, even compared to five years ago."</p>
        <p>The second answer uses the same idea. The difference is development: a reason, an example, and a reflection.</p>
        <p>Try this formula in your next practice session and see what your AI score says.</p>
        <p style="margin:24px 0">
          <a href="${PRACTICE_URL}" style="background:#d95d39;color:#fff8f2;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700;display:inline-block">Practice with feedback</a>
        </p>
        <hr style="border:none;border-top:1px solid #e9d9ca;margin:32px 0 16px">
        <p style="color:#aaa;font-size:0.8em;margin:0">You are receiving this email because you signed up for SpeakAce. <a href="${SITE_URL}/unsubscribe" style="color:#aaa">Unsubscribe</a></p>
      </div>
    `,
    text: `Hi ${greeting}, the #1 IELTS mistake: not developing your answers. Learn the fix and practice with AI feedback: ${PRACTICE_URL}`
  };
}

function buildEmail8(name: string) {
  const greeting = name.trim() ? name.trim() : "there";
  return {
    subject: "30 days with SpeakAce — here's what works",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1b120d;max-width:600px">
        <h2 style="margin:0 0 12px">One month in</h2>
        <p>Hi ${greeting},</p>
        <p>You've had your SpeakAce account for a month. Here's what we know about candidates who improve the most in 30 days:</p>
        <ul>
          <li>They practice at least 4 days per week — not necessarily long sessions</li>
          <li>They retry the same question at least once after reading feedback</li>
          <li>They focus on one weak area per week instead of trying to fix everything at once</li>
        </ul>
        <p>If you're on the free plan, you get 4 sessions per day — enough for a solid daily habit. If you want more volume, Plus gives you 18 sessions and 35 minutes of daily speaking.</p>
        <p style="margin:24px 0">
          <a href="${PRACTICE_URL}" style="background:#d95d39;color:#fff8f2;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700;display:inline-block">Practice today</a>
          &nbsp;&nbsp;
          <a href="${CHECKOUT_URL}" style="background:#1d6f75;color:#fff8f2;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700;display:inline-block">Upgrade to Plus</a>
        </p>
        <hr style="border:none;border-top:1px solid #e9d9ca;margin:32px 0 16px">
        <p style="color:#aaa;font-size:0.8em;margin:0">You are receiving this email because you signed up for SpeakAce. <a href="${SITE_URL}/unsubscribe" style="color:#aaa">Unsubscribe</a></p>
      </div>
    `,
    text: `Hi ${greeting}, one month with SpeakAce. Practice today: ${PRACTICE_URL} — or upgrade to Plus: ${CHECKOUT_URL}`
  };
}

function buildEmail9(name: string) {
  const greeting = name.trim() ? name.trim() : "there";
  return {
    subject: "How a student went from band 5.5 to 7.0 in 6 weeks",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1b120d;max-width:600px">
        <h2 style="margin:0 0 12px">A real improvement story</h2>
        <p>Hi ${greeting},</p>
        <blockquote style="border-left:3px solid #d95d39;margin:16px 0;padding:12px 16px;color:#555;background:#fff8f2">
          "I had taken IELTS twice and stuck at 5.5 both times. I started using SpeakAce daily for 15 minutes before work. After six weeks I retook the test and scored 7.0. The transcript review was the feature that changed everything — I could see exactly which words I overused."
          <br><br><strong>— SpeakAce user, Almaty, Kazakhstan</strong>
        </blockquote>
        <p>The key insight from this story: it wasn't more practice hours that made the difference. It was reading the transcript and targeting one specific habit per week.</p>
        <p>Your transcript is available after every session. Have you been reading it?</p>
        <p style="margin:24px 0">
          <a href="${PRACTICE_URL}" style="background:#d95d39;color:#fff8f2;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700;display:inline-block">Record and review your transcript</a>
        </p>
        <hr style="border:none;border-top:1px solid #e9d9ca;margin:32px 0 16px">
        <p style="color:#aaa;font-size:0.8em;margin:0">You are receiving this email because you signed up for SpeakAce. <a href="${SITE_URL}/unsubscribe" style="color:#aaa">Unsubscribe</a></p>
      </div>
    `,
    text: `Hi ${greeting}, a SpeakAce user went from band 5.5 to 7.0 in 6 weeks using transcript review. Try it here: ${PRACTICE_URL}`
  };
}

function buildEmail10(name: string) {
  const greeting = name.trim() ? name.trim() : "there";
  return {
    subject: "IELTS speaking: what to do in the last 2 weeks before your test",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1b120d;max-width:600px">
        <h2 style="margin:0 0 12px">Your final 2-week speaking plan</h2>
        <p>Hi ${greeting},</p>
        <p>Whether your test is in two weeks or two months, this is the preparation pattern that works best:</p>
        <ol style="padding-left:1.2rem">
          <li style="margin-bottom:8px"><strong>Week before last:</strong> Focus on your weakest part (Part 1 fluency, Part 2 length, or Part 3 development). One weakness only.</li>
          <li style="margin-bottom:8px"><strong>Final week:</strong> Full mock sessions — all three parts, timed. Record everything. Listen back at normal speed.</li>
          <li style="margin-bottom:8px"><strong>Night before:</strong> Review your phrase bank and 3 example answers. Do NOT practice for more than 20 minutes.</li>
          <li style="margin-bottom:8px"><strong>Day of test:</strong> Speak for 10 minutes on any topic in the morning. Warm up your voice and your brain.</li>
        </ol>
        <p style="margin:24px 0">
          <a href="${PRACTICE_URL}" style="background:#d95d39;color:#fff8f2;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700;display:inline-block">Start your mock session</a>
        </p>
        <hr style="border:none;border-top:1px solid #e9d9ca;margin:32px 0 16px">
        <p style="color:#aaa;font-size:0.8em;margin:0">You are receiving this email because you signed up for SpeakAce. <a href="${SITE_URL}/unsubscribe" style="color:#aaa">Unsubscribe</a></p>
      </div>
    `,
    text: `Hi ${greeting}, your final 2-week IELTS speaking plan is here. Start a mock session: ${PRACTICE_URL}`
  };
}

function buildEmail11(name: string) {
  const greeting = name.trim() ? name.trim() : "there";
  return {
    subject: "We noticed you haven't practiced in a while",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1b120d;max-width:600px">
        <h2 style="margin:0 0 12px">Your speaking score is waiting</h2>
        <p>Hi ${greeting},</p>
        <p>It's been a while since your last SpeakAce session. IELTS speaking skills can fade quickly without consistent practice — but they also come back fast once you restart.</p>
        <p>We want to help you get back on track. For the next 48 hours, your account has no daily session limit — practice as much as you want, completely free.</p>
        <p>No strings attached. Just open the app and start speaking.</p>
        <p style="margin:24px 0">
          <a href="${PRACTICE_URL}" style="background:#d95d39;color:#fff8f2;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700;display:inline-block">Restart your practice now</a>
        </p>
        <p style="color:#888;font-size:0.88em">If you've already taken your IELTS test and no longer need practice, just ignore this email. We'll stop sending reminders after this.</p>
        <hr style="border:none;border-top:1px solid #e9d9ca;margin:32px 0 16px">
        <p style="color:#aaa;font-size:0.8em;margin:0">You are receiving this email because you signed up for SpeakAce. <a href="${SITE_URL}/unsubscribe" style="color:#aaa">Unsubscribe</a></p>
      </div>
    `,
    text: `Hi ${greeting}, it's been a while. Come back and practice IELTS speaking — your score is waiting: ${PRACTICE_URL}`
  };
}

function buildEmail12(name: string) {
  const greeting = name.trim() ? name.trim() : "there";
  return {
    subject: "Last message from SpeakAce — a special offer inside",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1b120d;max-width:600px">
        <h2 style="margin:0 0 12px">One last thing before we go quiet</h2>
        <p>Hi ${greeting},</p>
        <p>This is our last check-in. We don't want to fill your inbox if speaking practice isn't your priority right now — so after this email, we'll only contact you for account-related messages.</p>
        <p>If you do want to improve your IELTS speaking before a future test, here's what SpeakAce Plus gives you for $3.99/week:</p>
        <ul>
          <li>35 minutes of speaking practice per day (vs 8 on free)</li>
          <li>18 sessions per day for maximum variety</li>
          <li>Deeper AI analysis and stronger improvement suggestions</li>
          <li>Full score history and trend tracking</li>
        </ul>
        <p>Use code <strong>COMEBACK</strong> at checkout for 20% off your first week.</p>
        <p style="margin:24px 0">
          <a href="${CHECKOUT_URL}&coupon=COMEBACK" style="background:#d95d39;color:#fff8f2;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700;display:inline-block">Claim 20% off Plus</a>
          &nbsp;&nbsp;
          <a href="${PRACTICE_URL}" style="background:#1d6f75;color:#fff8f2;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700;display:inline-block">Stay on free plan</a>
        </p>
        <p style="color:#888;font-size:0.88em">Good luck with your IELTS preparation, whatever path you choose.</p>
        <hr style="border:none;border-top:1px solid #e9d9ca;margin:32px 0 16px">
        <p style="color:#aaa;font-size:0.8em;margin:0">You are receiving this email because you signed up for SpeakAce. <a href="${SITE_URL}/unsubscribe" style="color:#aaa">Unsubscribe</a></p>
      </div>
    `,
    text: `Hi ${greeting}, last message from SpeakAce. Use COMEBACK for 20% off Plus: ${CHECKOUT_URL}&coupon=COMEBACK — or keep practicing free: ${PRACTICE_URL}`
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

export async function markOnboardingEmailSent(userId: string, emailNumber: number): Promise<void> {
  if (!hasDatabaseUrl()) return;

  const sql = getSql();
  await sql`
    update users
    set onboarding_emails_sent = ${emailNumber}
    where id = ${userId}
      and coalesce(onboarding_emails_sent, 0) < ${emailNumber}
  `;
}
