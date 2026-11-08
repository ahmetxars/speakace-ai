import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { trackAnalyticsEvent } from "@/lib/analytics-store";
import { getPostHogClient } from "@/lib/posthog-server";
import { sendPurchaseAccountClaimEmail } from "@/lib/server/email";
import { getOrgForAdmin } from "@/lib/server/org-store";
import {
  processBillingEvent,
  applyInstitutionBillingByUserId,
  getMember,
  getMemberByEmail,
  getMemberEmailById,
} from "@/lib/store";
import {
  getLemonCheckoutMetadata,
  getLemonCustomerId,
  getLemonEmail,
  getLemonEventName,
  getLemonEventId,
  getLemonPaymentDetails,
  getLemonSubscriptionId,
  getLemonTrialEndsAt,
  getLemonUserId,
  resolveBillingStatusFromEvent,
  resolvePlanForStatus,
  resolvePlanFromLemonPayload,
  verifyLemonSignature
} from "@/lib/server/lemon";

type LemonPayload = {
  meta?: {
    event_name?: string;
    custom_data?: Record<string, unknown>;
  };
  data?: {
    id?: string;
    attributes?: Record<string, unknown>;
  };
};

function getVerifiedInstitutionPlan(payload: LemonPayload) {
  const attributes = payload.data?.attributes;
  const firstOrderItem = attributes?.first_order_item;
  const variantId = firstOrderItem && typeof firstOrderItem === "object"
    ? (firstOrderItem as Record<string, unknown>).variant_id
    : attributes?.variant_id;
  const id = String(variantId ?? "");
  if (!/^\d+$/.test(id)) return null;

  const tiers = [
    ["starter", process.env.LEMON_SQUEEZY_INSTITUTION_STARTER_VARIANT_ID],
    ["team", process.env.LEMON_SQUEEZY_INSTITUTION_TEAM_VARIANT_ID],
    ["campus", process.env.LEMON_SQUEEZY_INSTITUTION_CAMPUS_VARIANT_ID]
  ] as const;
  return tiers.find(([, configuredId]) => configuredId?.trim() === id)?.[0] ?? null;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-signature");

  if (!verifyLemonSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  let payload: LemonPayload;
  try {
    payload = JSON.parse(rawBody) as LemonPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (process.env.NODE_ENV === "production" && payload.data?.attributes?.test_mode === true) return NextResponse.json({received:true,ignored:true});
  if (!payload.data?.id) return NextResponse.json({error:"Missing provider object identity."},{status:400});
  const eventName = getLemonEventName(payload);
  const email = getLemonEmail(payload);
  const userId = getLemonUserId(payload);
  const providerCustomerId = getLemonCustomerId(payload);
  const providerSubscriptionId = getLemonSubscriptionId(payload);
  const trialEndsAt = getLemonTrialEndsAt(payload);
  const status = resolveBillingStatusFromEvent(eventName, payload);
  const basePlan = resolvePlanFromLemonPayload(payload);
  const institutionPlan = getVerifiedInstitutionPlan(payload);
  const checkoutMetadata = getLemonCheckoutMetadata(payload);
  const paymentDetails = getLemonPaymentDetails(payload);
  const posthog = getPostHogClient();
  const providerEventId = getLemonEventId(payload);
  const legacyEventId = `lemonsqueezy:${createHash("sha256").update(rawBody).digest("hex")}`;

  if (!status) {
    return NextResponse.json({ received: true, ignored: true });
  }

  if (!email) return NextResponse.json({error:"Missing merchant customer email."},{status:400});

  // Cross-check: if both userId and email are present, confirm they belong to the same account
  let matchedUserId = userId;
  if (userId) {
    const storedEmail = await getMemberEmailById(userId).catch(() => null);
    if (!storedEmail) {
      matchedUserId = null;
    } else if (email && storedEmail.trim().toLowerCase() !== email.trim().toLowerCase()) {
      console.error("Lemon webhook userId/email mismatch");
      return NextResponse.json({ error: "User identity mismatch." }, { status: 400 });
    }
  }

  if (!matchedUserId && email) {
    const memberByEmail = await getMemberByEmail(email).catch(() => null);
    matchedUserId = memberByEmail?.id ?? null;
  }

  const existingMember = matchedUserId
      ? await getMember(matchedUserId).catch(() => null)
      : email
        ? await getMemberByEmail(email).catch(() => null)
        : null;
  const retainedPlan = providerSubscriptionId && existingMember?.lemonSubscriptionId === providerSubscriptionId && existingMember.plan !== "free" ? existingMember.plan : null;
  const resolvedPlan = basePlan ?? retainedPlan;
  const nextPlan = resolvedPlan ? resolvePlanForStatus(resolvedPlan, status) : null;
  const eventPlan = nextPlan ?? retainedPlan ?? "free";
  const claimablePlan = nextPlan === "plus" || nextPlan === "pro" || nextPlan === "lifetime"
    ? nextPlan
    : null;
  const needsAccountClaim = eventName === "order_created"
    && Boolean(email)
    && !matchedUserId
    && Boolean(claimablePlan);
  const distinctId = matchedUserId
    ?? checkoutMetadata.visitorId
    ?? checkoutMetadata.checkoutId
    ?? providerCustomerId
    ?? providerSubscriptionId
    ?? `billing:${eventName}`;

  try {
    if (institutionPlan) {
      if (matchedUserId && await getOrgForAdmin(matchedUserId)) {
        await applyInstitutionBillingByUserId({
          userId: matchedUserId,
          plan: institutionPlan,
          billingStatus: status,
          providerCustomerId,
          providerSubscriptionId
        });
      }
      return NextResponse.json({ received: true, institution: true });
    }

    // The ledger and cached entitlement are one atomic operation. No duplicate can reapply old access.
    const inserted = await processBillingEvent({
      id: providerEventId,
      legacyId: legacyEventId,
      provider: "lemonsqueezy",
      eventName,
      userEmail: email,
      userId: matchedUserId,
      plan: eventPlan,
      billingStatus: status,
      providerCustomerId,
      providerSubscriptionId,
      payloadJson: payload
    });
    if (!inserted) {
      return NextResponse.json({ received: true, duplicate: true });
    }
  } catch (err) {
    console.error("Lemon webhook DB error:", err);
    return NextResponse.json({ error: "Internal error processing webhook." }, { status: 500 });
  }

  if (needsAccountClaim && email && claimablePlan) {
    try {
      await sendPurchaseAccountClaimEmail({
        to: email,
        plan: claimablePlan,
        idempotencyKey: `purchase-account-claim:${providerEventId}`
      });
    } catch (error) {
      console.error("Purchase account claim email delivery failed:", error);
    }
  }

  posthog.capture({
    distinctId,
    event: "billing_status_updated",
    properties: {
      event_name: eventName,
      billing_status: status,
      plan: eventPlan,
      provider: "lemonsqueezy",
      trial_ends_at: trialEndsAt
    }
  });

  // Lemon sends order_created alongside subscription_created for the same initial sale.
  // Count only the order event so revenue and checkout conversion are not duplicated.
  if (eventName === "order_created") {
    try {
      await trackAnalyticsEvent({
        userId: matchedUserId,
        visitorId: checkoutMetadata.visitorId ?? checkoutMetadata.checkoutId,
        event: "checkout_completed",
        path: checkoutMetadata.ctaPath ?? undefined,
        eventId: paymentDetails.orderId
          ? `lemonsqueezy:order:${paymentDetails.orderId}`
          : providerEventId,
        source: checkoutMetadata.campaign,
        plan: eventPlan,
        occurredAt: new Date().toISOString()
      });
    } catch {
      // Revenue analytics must never make a valid billing webhook retry.
    }

    posthog.capture({
      distinctId,
      event: "checkout_completed",
      properties: {
        plan: eventPlan,
        billing_status: status,
        provider: "lemonsqueezy",
        order_id: paymentDetails.orderId,
        checkout_id: checkoutMetadata.checkoutId,
        revenue: paymentDetails.value,
        value: paymentDetails.value,
        currency: paymentDetails.currency,
        campaign: checkoutMetadata.campaign,
        cta_path: checkoutMetadata.ctaPath,
        cta_event: checkoutMetadata.ctaEvent
      }
    });
  }

  if (["subscription_payment_success", "subscription_payment_recovered"].includes(eventName)) {
    posthog.capture({
      distinctId,
      event: "subscription_revenue_received",
      properties: {
        plan: eventPlan,
        provider: "lemonsqueezy",
        invoice_id: paymentDetails.orderId,
        revenue: paymentDetails.value,
        value: paymentDetails.value,
        currency: paymentDetails.currency,
        billing_reason: payload.data?.attributes?.billing_reason ?? null
      }
    });
  }

  if (eventName === "subscription_payment_failed") {
    posthog.capture({
      distinctId,
      event: "payment_failed",
      properties: {
        plan: eventPlan,
        billing_status: status,
        provider: "lemonsqueezy",
      }
    });
  }

  return NextResponse.json({ received: true });
}
