import fs from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

const STALE_AFTER_HOURS = 23;
const RESERVATION_KEY_PATTERN = /^speakace-marketing-[a-f0-9]{64}$/;

function usage() {
  return [
    "List reservations that require provider reconciliation:",
    "  npm run reconcile:email -- --list",
    "",
    "After checking the exact recipient, subject, and time in Resend:",
    "  npm run reconcile:email -- --mark-sent <reservation-key> --confirm <reservation-key>",
    "  npm run reconcile:email -- --release <reservation-key> --confirm <reservation-key>",
    "",
    "Use --mark-sent only when Resend accepted the message. Use --release only when Resend did not accept it.",
    "The command refuses to mutate reservations newer than 23 hours."
  ].join("\n");
}

function parseArgs(argv) {
  if (argv.includes("--help") || argv.includes("-h")) {
    return { action: "help", key: "", confirmation: "" };
  }

  let action = "list";
  let key = "";
  let confirmation = "";
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--list") {
      action = "list";
      continue;
    }
    if (arg === "--mark-sent" || arg === "--release" || arg === "--confirm") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) throw new Error(`Missing value for ${arg}.`);
      if (arg === "--confirm") confirmation = value;
      else {
        if (key) throw new Error("Choose only one mutation action.");
        action = arg === "--mark-sent" ? "mark-sent" : "release";
        key = value;
      }
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  if (action !== "list") {
    if (!RESERVATION_KEY_PATTERN.test(key)) throw new Error("Reservation key format is invalid.");
    if (confirmation !== key) {
      throw new Error("Mutation requires --confirm with the exact same reservation key.");
    }
  }
  return { action, key, confirmation };
}

async function loadLocalEnvironment() {
  try {
    const contents = await fs.readFile(path.join(process.cwd(), ".env.local"), "utf8");
    for (const line of contents.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) continue;
      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // Production operators may provide DATABASE_URL directly instead.
  }
}

async function listStaleReservations(sql) {
  return sql`
    select
      r.reservation_key,
      r.reserved_at,
      r.last_attempt_at,
      r.budget_day,
      latest.user_email,
      latest.template,
      latest.subject,
      latest.error_message,
      latest.sent_at as last_logged_at
    from email_lifecycle_reservations r
    left join lateral (
      select user_email, template, subject, error_message, sent_at
      from email_log
      where reservation_key = r.reservation_key
      order by sent_at desc
      limit 1
    ) latest on true
    where r.status = 'reserved'
      and r.reserved_at <= now() - make_interval(hours => ${STALE_AFTER_HOURS})
    order by r.reserved_at asc
  `;
}

async function markSent(sql, reservationKey) {
  const rows = await sql`
    update email_lifecycle_reservations
    set status = 'sent', sent_at = now(), last_attempt_at = now()
    where reservation_key = ${reservationKey}
      and status = 'reserved'
      and reserved_at <= now() - make_interval(hours => ${STALE_AFTER_HOURS})
    returning reservation_key
  `;
  if (!rows[0]) throw new Error("No stale reserved row matched that key.");
  return rows[0];
}

async function release(sql, reservationKey) {
  return sql.begin(async (transaction) => {
    const rows = await transaction`
      delete from email_lifecycle_reservations
      where reservation_key = ${reservationKey}
        and status = 'reserved'
        and reserved_at <= now() - make_interval(hours => ${STALE_AFTER_HOURS})
      returning reservation_key, budget_day
    `;
    if (!rows[0]) throw new Error("No stale reserved row matched that key.");
    await transaction`
      update email_lifecycle_daily_budget
      set reserved_count = greatest(0, reserved_count - 1), updated_at = now()
      where budget_day = ${rows[0].budget_day}
    `;
    return rows[0];
  });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.action === "help") {
    console.log(usage());
    return;
  }

  await loadLocalEnvironment();
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
  const sql = postgres(process.env.DATABASE_URL, { ssl: "require", prepare: false, max: 1 });
  try {
    if (options.action === "list") {
      const rows = await listStaleReservations(sql);
      if (rows.length === 0) console.log("No stale email reservations require reconciliation.");
      else console.table(rows);
      return;
    }

    const result = options.action === "mark-sent"
      ? await markSent(sql, options.key)
      : await release(sql, options.key);
    console.log(`${options.action} completed for ${result.reservation_key}.`);
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  console.error(usage());
  process.exit(1);
});
