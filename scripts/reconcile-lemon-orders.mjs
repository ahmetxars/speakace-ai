import fs from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

const cwd = process.cwd();
const envPath = path.join(cwd, ".env.local");
const applyChanges = process.argv.includes("--apply");
const includeTestOrders = process.argv.includes("--include-test");
const apiBaseUrl = "https://api.lemonsqueezy.com/v1";

async function loadEnvFile() {
  try {
    const contents = await fs.readFile(envPath, "utf8");
    for (const line of contents.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) continue;

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");
      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env.local is optional when variables are already provided by the shell.
  }
}

function asRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function asNumber(value) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function resolvePlan(attributes) {
  const firstOrderItem = asRecord(attributes.first_order_item);
  const sourceText = [
    firstOrderItem.product_name,
    firstOrderItem.variant_name,
    attributes.product_name,
    attributes.variant_name
  ]
    .filter((value) => typeof value === "string")
    .join(" ")
    .toLowerCase();

  if (sourceText.includes("lifetime")) return "lifetime";
  if (sourceText.includes("pro")) return "pro";
  if (sourceText.includes("plus")) return "plus";

  const subtotalUsd = asNumber(attributes.subtotal_usd);
  const subtotal = asNumber(attributes.subtotal);
  const currency = typeof attributes.currency === "string" ? attributes.currency.toUpperCase() : "";
  const cents = subtotalUsd ?? (currency === "USD" ? subtotal : null);

  if (cents === null) return null;
  const rounded = Math.round(cents);
  if ([399, 4900, 4999].includes(rounded)) return "plus";
  if ([1200, 9900].includes(rounded)) return "pro";
  if ([12999, 14900].includes(rounded)) return "lifetime";
  return null;
}

async function lemonRequest(apiKey, url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${apiKey}`
    }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Lemon Squeezy API returned ${response.status}: ${body.slice(0, 300)}`);
  }

  return response.json();
}

async function resolveStoreId(apiKey) {
  const configuredStoreId = process.env.LEMON_SQUEEZY_STORE_ID?.trim();
  if (configuredStoreId) return configuredStoreId;

  const payload = await lemonRequest(apiKey, `${apiBaseUrl}/stores?page[size]=10`);
  const stores = Array.isArray(payload.data) ? payload.data : [];
  if (stores.length !== 1 || typeof stores[0]?.id !== "string") {
    throw new Error(
      "LEMON_SQUEEZY_STORE_ID is required when the API key can access zero or multiple stores."
    );
  }

  return stores[0].id;
}

async function fetchOrders(apiKey, storeId) {
  const orders = [];
  let nextUrl =
    `${apiBaseUrl}/orders?filter[store_id]=${encodeURIComponent(storeId)}` +
    "&page[size]=100&sort=createdAt";

  while (nextUrl) {
    const payload = await lemonRequest(apiKey, nextUrl);
    if (Array.isArray(payload.data)) {
      orders.push(...payload.data);
    }
    nextUrl = typeof payload.links?.next === "string" ? payload.links.next : "";
  }

  return orders;
}

function emptySummary(totalOrders) {
  return {
    totalOrders,
    eligible: 0,
    matched: 0,
    alreadyReconciled: 0,
    updated: 0,
    missingUser: 0,
    unknownPlan: 0,
    skippedStatus: 0,
    skippedTest: 0
  };
}

async function reconcileOrder(sql, order, summary) {
  const attributes = asRecord(order.attributes);
  const status = String(attributes.status ?? "").toLowerCase();
  const refunded = attributes.refunded === true;
  const testMode = attributes.test_mode === true;

  if (status !== "paid" || refunded) {
    summary.skippedStatus += 1;
    return;
  }
  if (testMode && !includeTestOrders) {
    summary.skippedTest += 1;
    return;
  }

  summary.eligible += 1;
  const plan = resolvePlan(attributes);
  if (!plan) {
    summary.unknownPlan += 1;
    return;
  }

  const email = typeof attributes.user_email === "string" ? attributes.user_email.trim().toLowerCase() : "";
  if (!email) {
    summary.missingUser += 1;
    return;
  }

  const users = await sql`
    select id, plan
    from users
    where lower(email) = ${email}
    limit 1
  `;
  const user = users[0];
  if (!user) {
    summary.missingUser += 1;
    return;
  }

  summary.matched += 1;
  const orderId = String(order.id ?? attributes.identifier ?? "");
  if (!orderId) {
    summary.unknownPlan += 1;
    return;
  }

  const eventId = `lemonsqueezy:reconcile:order:${orderId}`;
  const existing = await sql`
    select id
    from billing_events
    where id = ${eventId}
    limit 1
  `;
  if (existing.length > 0) {
    summary.alreadyReconciled += 1;
    return;
  }

  if (!applyChanges) return;

  const customerId =
    typeof attributes.customer_id === "number" || typeof attributes.customer_id === "string"
      ? String(attributes.customer_id)
      : null;
  const firstOrderItem = asRecord(attributes.first_order_item);
  const createdAt =
    typeof attributes.created_at === "string" && !Number.isNaN(Date.parse(attributes.created_at))
      ? attributes.created_at
      : new Date().toISOString();
  const payload = {
    orderId,
    productId: firstOrderItem.product_id ?? null,
    variantId: firstOrderItem.variant_id ?? null,
    totalUsdCents: asNumber(attributes.total_usd),
    currency: typeof attributes.currency === "string" ? attributes.currency.toUpperCase() : null,
    createdAt,
    testMode
  };

  await sql.begin(async (transaction) => {
    const inserted = await transaction`
      insert into billing_events (
        id, provider, event_name, user_email, user_id, plan, billing_status,
        provider_customer_id, provider_subscription_id, payload_json, created_at
      ) values (
        ${eventId}, 'lemonsqueezy', 'order_reconciled', ${email}, ${user.id}, ${plan}, 'active',
        ${customerId}, null, ${transaction.json(payload)}, ${createdAt}
      )
      on conflict (id) do nothing
      returning id
    `;
    if (inserted.length === 0) return;

    await transaction`
      update users
      set
        plan = case
          when plan = 'lifetime' then 'lifetime'
          when ${plan} = 'lifetime' then 'lifetime'
          when plan = 'pro' and ${plan} = 'plus' then 'pro'
          else ${plan}
        end,
        billing_status = 'active',
        lemon_customer_id = coalesce(${customerId}, lemon_customer_id),
        trial_ends_at = null
      where id = ${user.id}
    `;

    await transaction`
      insert into analytics_events (
        id, user_id, visitor_id, event, path, event_id, source, plan, locale, occurred_at, created_at
      ) values (
        ${crypto.randomUUID()}, ${user.id}, null, 'checkout_completed', '/app/billing',
        ${`reconcile:purchase:${orderId}`}, 'lemon_reconciliation', ${plan}, null, ${createdAt}, ${createdAt}
      )
      on conflict (event_id) do nothing
    `;
  });

  summary.updated += 1;
}

async function main() {
  await loadEnvFile();

  const apiKey = process.env.LEMON_SQUEEZY_API_KEY?.trim();
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!apiKey) {
    throw new Error("LEMON_SQUEEZY_API_KEY is missing.");
  }
  if (!connectionString) {
    throw new Error("DATABASE_URL is missing.");
  }

  const storeId = await resolveStoreId(apiKey);
  const orders = await fetchOrders(apiKey, storeId);
  const summary = emptySummary(orders.length);
  const sql = postgres(connectionString, {
    ssl: "require",
    prepare: false,
    max: 1
  });

  try {
    if (applyChanges) {
      await sql`alter table analytics_events add column if not exists event_id text`;
      await sql`alter table analytics_events add column if not exists source text`;
      await sql`alter table analytics_events add column if not exists plan text`;
      await sql`alter table analytics_events add column if not exists locale text`;
      await sql`alter table analytics_events add column if not exists occurred_at timestamptz`;
      await sql`create unique index if not exists idx_analytics_events_event_id on analytics_events(event_id)`;
    }
    for (const order of orders) {
      await reconcileOrder(sql, order, summary);
    }
  } finally {
    await sql.end();
  }

  console.log(
    JSON.stringify(
      {
        mode: applyChanges ? "apply" : "dry-run",
        includeTestOrders,
        ...summary,
        eligibleForUpdate: summary.matched - summary.alreadyReconciled
      },
      null,
      2
    )
  );
  if (!applyChanges && summary.matched > summary.alreadyReconciled) {
    console.log("Dry-run only. Re-run with --apply after reviewing the aggregate summary.");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
