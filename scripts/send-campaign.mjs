#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://speakace.org").replace(/\/$/, "");
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const EMAIL_FROM = process.env.EMAIL_FROM || "";
const EMAIL_REPLY_TO = process.env.EMAIL_REPLY_TO || "";
const DEFAULT_SUBJECT = "Practice smarter for IELTS Speaking with SpeakAce";

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;

    const key = token.slice(2);
    const next = argv[index + 1];

    if (!next || next.startsWith("--")) {
      parsed[key] = true;
      continue;
    }

    parsed[key] = next;
    index += 1;
  }

  return parsed;
}

function printUsage() {
  console.log(`
Usage:
  npm run send:campaign -- --campaign spring-practice-push --to you@example.com
  npm run send:campaign -- --campaign spring-practice-push --list ./recipients.csv --subject "Your new subject"

Options:
  --campaign   Folder name inside public/email-assets/
  --to         Single recipient email
  --list       CSV or TXT file with one email per line, or email,name per line
  --subject    Override email subject
  --name       Fallback name for single-recipient sends
  --dry-run    Print resolved payload without sending
  --help       Show this help
`);
}

function ensureConfig() {
  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is missing.");
  }

  if (!EMAIL_FROM) {
    throw new Error("EMAIL_FROM is missing.");
  }
}

function readCampaignHtml(campaign) {
  const filePath = path.join(process.cwd(), "public", "email-assets", campaign, "preview.html");
  if (!fs.existsSync(filePath)) {
    throw new Error(`Campaign preview not found: ${filePath}`);
  }

  return {
    filePath,
    html: fs.readFileSync(filePath, "utf8")
  };
}

function absolutizeAssetUrls(html) {
  return html.replace(/(["'(])\/(?!\/)/g, `$1${SITE_URL}/`);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function personalizeHtml(html, recipient) {
  const unsubscribeUrl = `${SITE_URL}/unsubscribe?email=${encodeURIComponent(recipient.email)}`;
  return html
    .replaceAll("{{FIRST_NAME}}", escapeHtml(recipient.name || "there"))
    .replaceAll("{{EMAIL}}", encodeURIComponent(recipient.email))
    .replaceAll("{{UNSUBSCRIBE_URL}}", unsubscribeUrl);
}

function htmlToText(html) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|tr|table|h1|h2|h3|li)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\n\s+\n/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function parseRecipientsFile(filePath) {
  const raw = fs.readFileSync(path.resolve(filePath), "utf8");
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith("#"));

  return lines.map((line) => {
    const [emailRaw, nameRaw] = line.split(",").map((item) => item?.trim() || "");
    return {
      email: emailRaw.toLowerCase(),
      name: nameRaw || undefined
    };
  });
}

async function sendEmail(payload) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      ...(EMAIL_REPLY_TO ? { reply_to: EMAIL_REPLY_TO } : {})
    })
  });

  if (!response.ok) {
    const raw = await response.text();
    throw new Error(`Resend send failed for ${payload.to}: ${raw || response.statusText}`);
  }

  return response.json();
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || !args.campaign || (!args.to && !args.list)) {
    printUsage();
    process.exit(args.help ? 0 : 1);
  }

  ensureConfig();

  const campaign = String(args.campaign);
  const subject = String(args.subject || DEFAULT_SUBJECT);
  const { filePath, html } = readCampaignHtml(campaign);
  const absoluteHtml = absolutizeAssetUrls(html);

  const recipients = args.to
    ? [{ email: String(args.to).toLowerCase(), name: args.name ? String(args.name) : undefined }]
    : parseRecipientsFile(String(args.list));

  if (recipients.length === 0) {
    throw new Error("No recipients found.");
  }

  console.log(`Campaign: ${campaign}`);
  console.log(`Template: ${filePath}`);
  console.log(`Recipients: ${recipients.length}`);
  console.log(`Subject: ${subject}`);

  for (const recipient of recipients) {
    const personalizedHtml = personalizeHtml(absoluteHtml, recipient);
    const payload = {
      to: recipient.email,
      subject,
      html: personalizedHtml,
      text: htmlToText(personalizedHtml)
    };

    if (args["dry-run"]) {
      console.log(`\n--- DRY RUN: ${recipient.email} ---`);
      console.log(payload.text.slice(0, 500));
      continue;
    }

    const result = await sendEmail(payload);
    console.log(`Sent to ${recipient.email}`, result);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
