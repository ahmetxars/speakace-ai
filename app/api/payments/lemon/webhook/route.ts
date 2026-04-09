import { NextResponse } from "next/server";
import { applyBillingPlanByEmail, applyInstitutionBillingByUserId, recordBillingEvent } from "@/lib/store";
import {
  getLemonCustomerId,
  getLemonEmail,
  getLemonEventName,
  getLemonSubscriptionId,
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
  const status = resolveBillingStatusFromEvent(eventName, payload);
  const basePlan = resolvePlanFromLemonPayload(payload);
  const nextPlan = resolvePlanForStatus(basePlan, status);
  const institutionType = getInstitutionType(payload);

  await recordBillingEvent({
    provider: "lemonsqueezy",
    eventName,
    userEmail: email,
    userId,
    plan: nextPlan,
    billingStatus: status,
    providerCustomerId,
    providerSubscriptionId,
    payloadJson: payload
  });

  if (institutionType === "institution" && userId) {
    // Institution subscription — update institution_billing table instead of user plan
    const institutionPlan = getInstitutionPlan(payload);
    if (institutionPlan) {
      await applyInstitutionBillingByUserId({
        userId,
        plan: institutionPlan,
        billingStatus: status,
        providerCustomerId,
        providerSubscriptionId,
        seatCount: getInstitutionSeatCount(payload)
      });
    }
  } else if (email) {
    // Regular individual subscription
    await applyBillingPlanByEmail({
      email,
      plan: nextPlan,
      billingStatus: status,
      providerCustomerId,
      providerSubscriptionId
    });
  }

  return NextResponse.json({ received: true });
}
