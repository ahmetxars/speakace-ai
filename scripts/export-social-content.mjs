import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_QUEUE_PATH = resolve(PROJECT_ROOT, "content/social-content-queue.json");
const PLATFORMS = ["instagram", "linkedin", "tiktok"];
const DAY_OFFSETS = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
  sunday: 6
};

function usage() {
  return [
    "Validate only:",
    "  npm run export:social -- --validate-only",
    "",
    "Export a deterministic scheduler CSV (campaign start must be a Monday):",
    "  npm run export:social -- --start 2026-08-10 --format csv --out exports/social-2026-08-10.csv",
    "",
    "Export JSON:",
    "  npm run --silent export:social -- --start 2026-08-10 --format json",
    "",
    "This command never connects to or posts on a social platform. Existing output files are not overwritten unless --force is passed."
  ].join("\n");
}

function parseArgs(argv) {
  const options = {
    queue: DEFAULT_QUEUE_PATH,
    start: "",
    format: "csv",
    out: "",
    force: false,
    validateOnly: false
  };

  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      process.stdout.write(`${usage()}\n`);
      process.exit(0);
    }
    if (arg === "--force") {
      options.force = true;
      continue;
    }
    if (arg === "--validate-only") {
      options.validateOnly = true;
      continue;
    }
    if (["--queue", "--start", "--format", "--out"].includes(arg)) {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`Missing value for ${arg}.`);
      }
      options[arg.slice(2)] = value;
      index++;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  options.queue = resolve(PROJECT_ROOT, options.queue);
  if (options.out) options.out = resolve(PROJECT_ROOT, options.out);
  return options;
}

function requireText(value, field, postId) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${postId}: ${field} must be a non-empty string.`);
  }
}

function validateQueue(queue) {
  if (!queue || typeof queue !== "object" || !Array.isArray(queue.posts)) {
    throw new Error("Queue must be an object with a posts array.");
  }
  if (queue.version !== "1.0") throw new Error("Queue version must be 1.0.");
  if (queue.timezone !== "Europe/Amsterdam") {
    throw new Error("Queue timezone must be Europe/Amsterdam.");
  }
  if (queue.publishingMode !== "draft_export_only") {
    throw new Error("Queue publishingMode must remain draft_export_only.");
  }
  if (queue.posts.length !== 24) {
    throw new Error(`Expected exactly 24 posts (2 per platform per week); found ${queue.posts.length}.`);
  }

  const ids = new Set();
  const platformCounts = new Map(PLATFORMS.map((platform) => [platform, 0]));
  const weekPlatformCounts = new Map();
  for (const post of queue.posts) {
    const postId = typeof post.id === "string" ? post.id : "unknown-post";
    requireText(post.id, "id", postId);
    if (ids.has(post.id)) throw new Error(`Duplicate post id: ${post.id}.`);
    ids.add(post.id);

    if (!Number.isInteger(post.week) || post.week < 1 || post.week > 4) {
      throw new Error(`${postId}: week must be an integer from 1 to 4.`);
    }
    if (!(post.dayOfWeek in DAY_OFFSETS)) {
      throw new Error(`${postId}: invalid dayOfWeek.`);
    }
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(post.localTime)) {
      throw new Error(`${postId}: localTime must use 24-hour HH:MM format.`);
    }
    if (!PLATFORMS.includes(post.platform)) {
      throw new Error(`${postId}: unsupported platform ${post.platform}.`);
    }
    platformCounts.set(post.platform, platformCounts.get(post.platform) + 1);
    const weekPlatformKey = `${post.week}:${post.platform}`;
    weekPlatformCounts.set(weekPlatformKey, (weekPlatformCounts.get(weekPlatformKey) ?? 0) + 1);

    for (const field of [
      "format",
      "pillar",
      "assetSourceType",
      "sourceConsentRequirement",
      "disclosure",
      "hook",
      "caption",
      "cta",
      "destinationPath",
      "assetBrief"
    ]) {
      requireText(post[field], field, postId);
    }
    if (!["illustrative_demo", "original_editorial"].includes(post.assetSourceType)) {
      throw new Error(`${postId}: assetSourceType must be illustrative_demo or original_editorial.`);
    }
    if (post.assetSourceType === "illustrative_demo") {
      if (!/written[^.]{0,48}consent/i.test(post.sourceConsentRequirement)) {
        throw new Error(`${postId}: illustrative demos must state the written-consent requirement for real source material.`);
      }
      if (!/(illustrative|scripted)/i.test(post.disclosure)) {
        throw new Error(`${postId}: illustrative demos must include a visible illustrative/scripted disclosure.`);
      }
      if (/\breal (student|learner|candidate)\b/i.test(`${post.hook} ${post.caption}`)) {
        throw new Error(`${postId}: illustrative content cannot be described as a real learner story.`);
      }
    }
    if (!post.destinationPath.startsWith("/") || post.destinationPath.startsWith("//")) {
      throw new Error(`${postId}: destinationPath must be a same-site absolute path.`);
    }
    if (/\bguarantee(?:d|s)?\s+(?:an?\s+|your\s+)?(?:ielts\s+)?(?:band|score)/i.test(`${post.hook} ${post.caption}`)) {
      throw new Error(`${postId}: guaranteed score claims are prohibited.`);
    }
    if (!Array.isArray(post.hashtags) || post.hashtags.length < 2 || post.hashtags.some((tag) => !/^#[A-Za-z0-9]+$/.test(tag))) {
      throw new Error(`${postId}: hashtags must contain at least two simple #tags.`);
    }
    if (post.approvalRequired !== true || post.status !== "draft") {
      throw new Error(`${postId}: every post must remain draft with approvalRequired=true.`);
    }
  }

  for (const platform of PLATFORMS) {
    if (platformCounts.get(platform) !== 8) {
      throw new Error(`${platform}: expected 8 posts, found ${platformCounts.get(platform)}.`);
    }
    for (let week = 1; week <= 4; week++) {
      const count = weekPlatformCounts.get(`${week}:${platform}`) ?? 0;
      if (count !== 2) {
        throw new Error(`Week ${week} ${platform}: expected 2 posts, found ${count}.`);
      }
    }
  }
}

function parseCampaignStart(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("--start must use YYYY-MM-DD.");
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error("--start is not a valid calendar date.");
  }
  if (date.getUTCDay() !== 1) {
    throw new Error("--start must be a Monday so the four-week cadence stays deterministic.");
  }
  return date;
}

function resolveSiteBase() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://speakace.org";
  const siteBase = new URL(configured);
  if (!["http:", "https:"].includes(siteBase.protocol)) {
    throw new Error("NEXT_PUBLIC_SITE_URL must use http or https.");
  }
  return siteBase;
}

function buildTrackingUrl(post, siteBase) {
  const url = new URL(post.destinationPath, siteBase);
  url.searchParams.set("utm_source", post.platform);
  url.searchParams.set("utm_medium", "organic_social");
  url.searchParams.set("utm_campaign", "speaking_score_retry_4w");
  url.searchParams.set("utm_content", post.id);
  return url.toString();
}

function schedulePosts(queue, campaignStart, siteBase) {
  return queue.posts
    .map((post) => {
      const scheduledDate = new Date(campaignStart);
      const offset = (post.week - 1) * 7 + DAY_OFFSETS[post.dayOfWeek];
      scheduledDate.setUTCDate(scheduledDate.getUTCDate() + offset);
      return {
        ...post,
        scheduledLocalDate: scheduledDate.toISOString().slice(0, 10),
        timezone: queue.timezone,
        trackingUrl: buildTrackingUrl(post, siteBase)
      };
    })
    .sort((left, right) => (
      left.scheduledLocalDate.localeCompare(right.scheduledLocalDate) ||
      left.localTime.localeCompare(right.localTime) ||
      left.platform.localeCompare(right.platform) ||
      left.id.localeCompare(right.id)
    ));
}

function csvCell(value) {
  const text = Array.isArray(value) ? value.join(" ") : String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function toCsv(posts) {
  const fields = [
    "id",
    "scheduledLocalDate",
    "localTime",
    "timezone",
    "platform",
    "format",
    "pillar",
    "status",
    "approvalRequired",
    "assetSourceType",
    "sourceConsentRequirement",
    "disclosure",
    "hook",
    "caption",
    "cta",
    "destinationPath",
    "trackingUrl",
    "assetBrief",
    "hashtags"
  ];
  return [
    fields.map(csvCell).join(","),
    ...posts.map((post) => fields.map((field) => csvCell(post[field])).join(","))
  ].join("\n") + "\n";
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const queue = JSON.parse(readFileSync(options.queue, "utf8"));
  validateQueue(queue);

  if (options.validateOnly) {
    process.stdout.write(`Validated ${queue.posts.length} draft posts across 4 weeks and 3 platforms.\n`);
    return;
  }
  if (!options.start) {
    throw new Error("--start is required for export. Use --validate-only to check the queue without scheduling.");
  }
  if (!["csv", "json"].includes(options.format)) {
    throw new Error("--format must be csv or json.");
  }

  const campaignStart = parseCampaignStart(options.start);
  const posts = schedulePosts(queue, campaignStart, resolveSiteBase());
  const output = options.format === "json"
    ? `${JSON.stringify({
        version: queue.version,
        campaignStart: options.start,
        timezone: queue.timezone,
        publishingMode: queue.publishingMode,
        posts
      }, null, 2)}\n`
    : toCsv(posts);

  if (!options.out) {
    process.stdout.write(output);
    return;
  }
  if (existsSync(options.out) && !options.force) {
    throw new Error(`Refusing to overwrite existing file: ${options.out}. Pass --force to replace it.`);
  }
  mkdirSync(dirname(options.out), { recursive: true });
  writeFileSync(options.out, output, "utf8");
  process.stdout.write(`Exported ${posts.length} draft posts to ${options.out}. No platform connection was made.\n`);
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Social export failed: ${message}\n\n${usage()}\n`);
  process.exitCode = 1;
}
