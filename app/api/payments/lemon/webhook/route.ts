import { NextResponse } from "next/server";
import { applyBillingPlanByEmail, recordBillingEvent } from "@/lib/store";
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

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-signature");

  if (!verifyLemonSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
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

  if (email) {
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
