import { createHmac } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  applyBillingPlanByEmail: vi.fn(),
  applyBillingPlanByUserId: vi.fn(),
  applyInstitutionBillingByUserId: vi.fn(),
  getMember: vi.fn(),
  getMemberByEmail: vi.fn(),
  getMemberEmailById: vi.fn(),
  recordBillingEvent: vi.fn(),
  trackAnalyticsEvent: vi.fn(),
  posthogCapture: vi.fn()
}));

vi.mock("@/lib/store", () => ({
  applyBillingPlanByEmail: mocks.applyBillingPlanByEmail,
  applyBillingPlanByUserId: mocks.applyBillingPlanByUserId,
  applyInstitutionBillingByUserId: mocks.applyInstitutionBillingByUserId,
  getMember: mocks.getMember,
  getMemberByEmail: mocks.getMemberByEmail,
  getMemberEmailById: mocks.getMemberEmailById,
  recordBillingEvent: mocks.recordBillingEvent
}));

vi.mock("@/lib/posthog-server", () => ({
  getPostHogClient: () => ({ capture: mocks.posthogCapture })
}));

vi.mock("@/lib/analytics-store", () => ({
  trackAnalyticsEvent: mocks.trackAnalyticsEvent
}));

import { POST } from "@/app/api/payments/lemon/webhook/route";

const webhookSecret = "test-lemon-webhook-secret";

function signedRequest(payload: unknown) {
  const body = JSON.stringify(payload);
  const signature = createHmac("sha256", webhookSecret).update(body).digest("hex");
  return new Request("https://speakace.org/api/payments/lemon/webhook", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-signature": signature
    },
    body
  });
}

function plusOrderPayload() {
  return {
    meta: {
      event_name: "order_created",
      custom_data: {
        user_id: "user-1",
        checkout_id: "checkout-1",
        visitor_id: "visitor-1234567890",
        cta_path: "/pricing/plus/weekly"
      }
    },
    data: {
      type: "orders",
      id: "order-1",
      attributes: {
        customer_id: 17,
        identifier: "receipt-1",
        user_email: "buyer@example.com",
        total: 399,
        currency: "USD",
        status: "paid",
        first_order_item: {
          product_name: "SpeakAce Plus",
          variant_name: "Weekly"
        }
      }
    }
  };
}

describe("Lemon webhook entitlement sync", () => {
  beforeEach(() => {
    process.env.LEMON_SQUEEZY_WEBHOOK_SECRET = webhookSecret;
    for (const mock of Object.values(mocks)) mock.mockReset();

    mocks.getMemberEmailById.mockResolvedValue("buyer@example.com");
    mocks.getMember.mockResolvedValue({ id: "user-1", email: "buyer@example.com", plan: "free" });
    mocks.getMemberByEmail.mockResolvedValue({ id: "user-1", email: "buyer@example.com", plan: "free" });
    mocks.applyBillingPlanByUserId.mockResolvedValue({ id: "user-1", plan: "plus" });
    mocks.applyBillingPlanByEmail.mockResolvedValue({ id: "user-1", plan: "plus" });
    mocks.recordBillingEvent.mockResolvedValue(true);
  });

  it("grants Plus from the nested order item before writing the audit event", async () => {
    const response = await POST(signedRequest(plusOrderPayload()));

    expect(response.status).toBe(200);
    expect(mocks.applyBillingPlanByUserId).toHaveBeenCalledWith({
      userId: "user-1",
      plan: "plus",
      billingStatus: "active",
      providerCustomerId: "17",
      providerSubscriptionId: null,
      trialEndsAt: null
    });
    expect(mocks.recordBillingEvent).toHaveBeenCalledWith(expect.objectContaining({
      eventName: "order_created",
      userId: "user-1",
      plan: "plus",
      billingStatus: "active"
    }));
    expect(mocks.applyBillingPlanByUserId.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.recordBillingEvent.mock.invocationCallOrder[0]
    );
    expect(mocks.trackAnalyticsEvent).toHaveBeenCalledWith(expect.objectContaining({
      userId: "user-1",
      visitorId: "visitor-1234567890",
      event: "checkout_completed",
      path: "/pricing/plus/weekly",
      eventId: "lemonsqueezy:order:receipt-1",
      source: null,
      plan: "plus"
    }));
  });

  it("preserves the current paid plan for a planless renewal invoice", async () => {
    mocks.getMember.mockResolvedValue({ id: "user-1", email: "buyer@example.com", plan: "plus" });
    const payload = {
      meta: {
        event_name: "subscription_payment_success",
        custom_data: { user_id: "user-1" }
      },
      data: {
        type: "subscription-invoices",
        id: "invoice-1",
        attributes: {
          subscription_id: "subscription-22",
          customer_id: 17,
          user_email: "buyer@example.com",
          billing_reason: "renewal",
          status: "paid",
          total: 399,
          currency: "USD"
        }
      }
    };

    const response = await POST(signedRequest(payload));

    expect(response.status).toBe(200);
    expect(mocks.applyBillingPlanByUserId).toHaveBeenCalledWith(expect.objectContaining({
      userId: "user-1",
      plan: "plus",
      billingStatus: "active",
      providerSubscriptionId: "subscription-22"
    }));
    expect(mocks.recordBillingEvent).toHaveBeenCalledWith(expect.objectContaining({
      plan: "plus",
      providerSubscriptionId: "subscription-22"
    }));
    expect(mocks.trackAnalyticsEvent).not.toHaveBeenCalled();
  });

  it("does not downgrade a Free member when an invoice contains no plan identity", async () => {
    const payload = {
      meta: {
        event_name: "subscription_payment_success",
        custom_data: { user_id: "user-1" }
      },
      data: {
        type: "subscription-invoices",
        id: "invoice-2",
        attributes: {
          subscription_id: "subscription-23",
          user_email: "buyer@example.com",
          status: "paid",
          total: 399,
          currency: "USD"
        }
      }
    };

    const response = await POST(signedRequest(payload));

    expect(response.status).toBe(200);
    expect(mocks.applyBillingPlanByUserId).not.toHaveBeenCalled();
    expect(mocks.applyBillingPlanByEmail).not.toHaveBeenCalled();
    expect(mocks.recordBillingEvent).toHaveBeenCalledWith(expect.objectContaining({ plan: "free" }));
  });

  it("restores a legacy Free member when the renewal subtotal identifies Plus", async () => {
    const payload = {
      meta: {
        event_name: "subscription_payment_success",
        custom_data: { user_id: "user-1" }
      },
      data: {
        type: "subscription-invoices",
        id: "invoice-legacy",
        attributes: {
          subscription_id: "subscription-legacy",
          user_email: "buyer@example.com",
          status: "paid",
          subtotal_usd: 399,
          discount_total_usd: 80,
          total_usd: 319,
          total: 319,
          currency: "USD"
        }
      }
    };

    const response = await POST(signedRequest(payload));

    expect(response.status).toBe(200);
    expect(mocks.applyBillingPlanByUserId).toHaveBeenCalledWith(expect.objectContaining({
      userId: "user-1",
      plan: "plus",
      billingStatus: "active",
      providerSubscriptionId: "subscription-legacy"
    }));
  });

  it("still grants paid access before returning an audit-storage failure", async () => {
    mocks.recordBillingEvent.mockRejectedValueOnce(new Error("billing_events unavailable"));

    const response = await POST(signedRequest(plusOrderPayload()));

    expect(response.status).toBe(500);
    expect(mocks.applyBillingPlanByUserId).toHaveBeenCalledWith(expect.objectContaining({ plan: "plus" }));
    expect(mocks.applyBillingPlanByUserId.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.recordBillingEvent.mock.invocationCallOrder[0]
    );
  });

  it("does not emit conversion analytics twice for a duplicate delivery", async () => {
    mocks.recordBillingEvent.mockResolvedValueOnce(false);

    const response = await POST(signedRequest(plusOrderPayload()));
    const body = (await response.json()) as { duplicate?: boolean };

    expect(response.status).toBe(200);
    expect(body.duplicate).toBe(true);
    expect(mocks.applyBillingPlanByUserId).toHaveBeenCalledWith(expect.objectContaining({ plan: "plus" }));
    expect(mocks.trackAnalyticsEvent).not.toHaveBeenCalled();
    expect(mocks.posthogCapture).not.toHaveBeenCalled();
  });
});
