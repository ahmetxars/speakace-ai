import { NextResponse } from "next/server";
import { getPostHogClient } from "@/lib/posthog-server";
import {
  applyBillingPlanByEmail,
  applyBillingPlanByUserId,
  applyInstitutionBillingByUserId,
  getMember,
  getMemberByEmail,
  getMemberEmailById,
  recordBillingEvent
} from "@/lib/store";
import {
  getLemonCheckoutMetadata,
  getLemonCustomerId,
  getLemonEmail,
  getLemonEventName,
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

function getInstitutionType(payload: LemonPayload): string | null {
  const customData = payload.meta?.custom_data ?? {};
  const type = customData.type;
  return typeof type === "string" ? type : null;
}

function getInstitutionPlan(payload: LemonPayload): "starter" | "team" | "campus" | null {
  const customData = payload.meta?.custom_data ?? {};
  const plan = customData.plan;
  if (plan === "starter" || plan === "team" || plan === "campus") return plan;
  return null;
}

function getInstitutionSeatCount(payload: LemonPayload): number | undefined {
  const customData = payload.meta?.custom_data ?? {};
  const seats = customData.seat_count;
  const n = typeof seats === "string" ? parseInt(seats, 10) : typeof seats === "number" ? seats : NaN;
  return isNaN(n) ? undefined : n;
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

  const eventName = getLemonEventName(payload);
  const email = getLemonEmail(payload);
  const userId = getLemonUserId(payload);
  const providerCustomerId = getLemonCustomerId(payload);
  const providerSubscriptionId = getLemonSubscriptionId(payload);
  const trialEndsAt = getLemonTrialEndsAt(payload);
  const status = resolveBillingStatusFromEvent(eventName, payload);
  const basePlan = resolvePlanFromLemonPayload(payload);
  const institutionType = getInstitutionType(payload);
  const checkoutMetadata = getLemonCheckoutMetadata(payload);
  const paymentDetails = getLemonPaymentDetails(payload);
  const posthog = getPostHogClient();

  if (!status) {
    return NextResponse.json({ received: true, ignored: true });
  }

  // Cross-check: if both userId and email are present, confirm they belong to the same account
  let matchedUserId = userId;
  if (userId) {
    const storedEmail = await getMemberEmailById(userId).catch(() => null);
    if (!storedEmail) {
      matchedUserId = null;
    } else if (email && storedEmail.trim().toLowerCase() !== email.trim().toLowerCase()) {
      console.error(`Lemon webhook userId/email mismatch: userId=${userId} payload_email=${email} stored_email=${storedEmail}`);
      return NextResponse.json({ error: "User identity mismatch." }, { status: 400 });
    }
  }

  const existingMember = basePlan
    ? null
    : matchedUserId
      ? await getMember(matchedUserId).catch(() => null)
      : email
        ? await getMemberByEmail(email).catch(() => null)
        : null;
  const retainedPlan = existingMember?.plan && existingMember.plan !== "free" ? existingMember.plan : null;
  const resolvedPlan = basePlan ?? retainedPlan;
  const nextPlan = resolvedPlan ? resolvePlanForStatus(resolvedPlan, status) : null;
  const eventPlan = nextPlan ?? retainedPlan ?? "free";
  const distinctId = matchedUserId ?? email ?? providerCustomerId ?? providerSubscriptionId ?? `billing:${eventName}`;

  try {
    if (institutionType === "institution" && matchedUserId) {
      // Institution subscription — update institution_billing table instead of user plan
      const institutionPlan = getInstitutionPlan(payload);
      if (institutionPlan) {
        await applyInstitutionBillingByUserId({
          userId: matchedUserId,
          plan: institutionPlan,
          billingStatus: status,
          providerCustomerId,
          providerSubscriptionId,
          seatCount: getInstitutionSeatCount(payload)
        });
      }
    } else if (nextPlan) {
      // Individual subscription — prefer the authenticated user id captured at checkout,
      // then fall back to email to support older checkout links.
      const updatedByUserId = matchedUserId
        ? await applyBillingPlanByUserId({
            userId: matchedUserId,
            plan: nextPlan,
            billingStatus: status,
            providerCustomerId,
            providerSubscriptionId,
            trialEndsAt
          })
        : null;

      if (!updatedByUserId && email) {
        await applyBillingPlanByEmail({
          email,
          plan: nextPlan,
          billingStatus: status,
          providerCustomerId,
          providerSubscriptionId,
          trialEndsAt
        });
      }
    }

    // Entitlements are applied first so an audit-table outage never leaves a paying user on Free.
    await recordBillingEvent({
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
  } catch (err) {
    console.error("Lemon webhook DB error:", err);
    return NextResponse.json({ error: "Internal error processing webhook." }, { status: 500 });
  }

  posthog.capture({
    distinctId,
    event: "billing_status_updated",
    properties: {
      event_name: eventName,
      billing_status: status,
      plan: eventPlan,
      provider: "lemonsqueezy",
      institution_type: institutionType,
      trial_ends_at: trialEndsAt
    }
  });

  // Lemon sends order_created alongside subscription_created for the same initial sale.
  // Count only the order event so revenue and checkout conversion are not duplicated.
  if (eventName === "order_created") {
    posthog.capture({
      distinctId,
      event: "checkout_completed",
      properties: {
        plan: eventPlan,
        billing_status: status,
        provider: "lemonsqueezy",
        institution_type: institutionType,
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
        institution_type: institutionType
      }
    });
  }

  return NextResponse.json({ received: true });
}
