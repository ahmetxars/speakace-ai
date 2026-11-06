import { createHmac } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  processBillingEvent: vi.fn(),
  applyInstitutionBillingByUserId: vi.fn(),
  getMember: vi.fn(),
  getMemberByEmail: vi.fn(),
  getMemberEmailById: vi.fn(),
  sendPurchaseAccountClaimEmail: vi.fn(),
  trackAnalyticsEvent: vi.fn(),
  posthogCapture: vi.fn(),
}));
vi.mock("@/lib/store", () => ({
  processBillingEvent: mocks.processBillingEvent,
  applyInstitutionBillingByUserId: mocks.applyInstitutionBillingByUserId,
  getMember: mocks.getMember,
  getMemberByEmail: mocks.getMemberByEmail,
  getMemberEmailById: mocks.getMemberEmailById,
}));
vi.mock("@/lib/posthog-server", () => ({
  getPostHogClient: () => ({ capture: mocks.posthogCapture }),
}));
vi.mock("@/lib/analytics-store", () => ({
  trackAnalyticsEvent: mocks.trackAnalyticsEvent,
}));
vi.mock("@/lib/server/email", () => ({
  sendPurchaseAccountClaimEmail: mocks.sendPurchaseAccountClaimEmail,
}));
import { POST } from "./route";
const secret = "test-lemon-webhook-secret";
function request(payload: unknown, pretty = false) {
  const body = JSON.stringify(payload, null, pretty ? 2 : undefined);
  return new Request("https://speakace.org/api/payments/lemon/webhook", {
    method: "POST",
    headers: {
      "x-signature": createHmac("sha256", secret).update(body).digest("hex"),
    },
    body,
  });
}
function order(anonymous = false) {
  return {
    meta: {
      event_name: "order_created",
      custom_data: {
        ...(anonymous ? {} : { user_id: "user-1" }),
        checkout_id: "checkout-1",
        visitor_id: "visitor-1234567890",
        cta_path: "/pricing/plus/annual",
      },
    },
    data: {
      type: "orders",
      id: "order-1",
      attributes: {
        customer_id: 17,
        identifier: "receipt-1",
        user_email: "buyer@example.com",
        total: 4999,
        currency: "USD",
        status: "paid",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
        first_order_item: {
          product_name: "SpeakAce Plus Annual",
          variant_name: "Annual",
        },
      },
    },
  };
}
beforeEach(() => {
  process.env.LEMON_SQUEEZY_WEBHOOK_SECRET = secret;
  for (const m of Object.values(mocks)) m.mockReset();
  mocks.getMemberEmailById.mockResolvedValue("buyer@example.com");
  mocks.getMember.mockResolvedValue({
    id: "user-1",
    email: "buyer@example.com",
    plan: "free",
  });
  mocks.getMemberByEmail.mockResolvedValue({
    id: "user-1",
    email: "buyer@example.com",
    plan: "free",
  });
  mocks.processBillingEvent.mockResolvedValue(true);
});
describe("verified Lemon webhook processing", () => {
  it("delegates order audit and entitlement persistence to one atomic store operation", async () => {
    expect((await POST(request(order()))).status).toBe(200);
    expect(mocks.processBillingEvent).toHaveBeenCalledOnce();
    expect(mocks.processBillingEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "order_created",
        userId: "user-1",
        userEmail: "buyer@example.com",
        plan: "plus",
        billingStatus: "active",
        payloadJson: order(),
      }),
    );
    expect(mocks.trackAnalyticsEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "checkout_completed",
        eventId: "lemonsqueezy:order:receipt-1",
      }),
    );
  });
  it("sends an anonymous buyer a claim message only after the purchase is safely recorded", async () => {
    mocks.getMemberByEmail.mockResolvedValue(null);
    await POST(request(order(true)));
    expect(mocks.processBillingEvent).toHaveBeenCalledWith(
      expect.objectContaining({ userId: null, userEmail: "buyer@example.com" }),
    );
    expect(mocks.sendPurchaseAccountClaimEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "buyer@example.com", plan: "plus" }),
    );
    expect(mocks.processBillingEvent.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.sendPurchaseAccountClaimEmail.mock.invocationCallOrder[0],
    );
  });
  it("links an email-only checkout to an existing account without a claim message", async () => {
    await POST(request(order(true)));
    expect(mocks.processBillingEvent).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-1" }),
    );
    expect(mocks.sendPurchaseAccountClaimEmail).not.toHaveBeenCalled();
  });
  it("retains trusted plan identity for planless renewal invoices", async () => {
    mocks.getMember.mockResolvedValue({
      id: "user-1",
      email: "buyer@example.com",
      plan: "plus",
      lemonSubscriptionId: "sub-1",
    });
    const payload = {
      meta: {
        event_name: "subscription_payment_success",
        custom_data: { user_id: "user-1" },
      },
      data: {
        type: "subscription-invoices",
        id: "invoice-1",
        attributes: {
          subscription_id: "sub-1",
          user_email: "buyer@example.com",
          status: "paid",
          total: 399,
        },
      },
    };
    await POST(request(payload));
    expect(mocks.processBillingEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        plan: "plus",
        providerSubscriptionId: "sub-1",
      }),
    );
    expect(mocks.trackAnalyticsEvent).not.toHaveBeenCalled();
  });
  it("does not invent a paid plan when an invoice has no product identity or existing paid account", async () => {
    await POST(
      request({
        meta: { event_name: "subscription_payment_success" },
        data: {
          type: "subscription-invoices",
          id: "invoice",
          attributes: {
            subscription_id: "sub",
            user_email: "buyer@example.com",
            status: "paid",
            total: 399,
          },
        },
      }),
    );
    expect(mocks.processBillingEvent).toHaveBeenCalledWith(
      expect.objectContaining({ plan: "free" }),
    );
  });
  it("preserves legacy USD-subtotal reconciliation for actual subscription invoices", async () => {
    await POST(
      request({
        meta: { event_name: "subscription_payment_success" },
        data: {
          type: "subscription-invoices",
          id: "invoice",
          attributes: {
            subscription_id: "sub",
            user_email: "buyer@example.com",
            status: "paid",
            subtotal_usd: 399,
            total: 319,
          },
        },
      }),
    );
    expect(mocks.processBillingEvent).toHaveBeenCalledWith(
      expect.objectContaining({ plan: "plus" }),
    );
  });
  it("returns a retryable failure without success emails/analytics when the atomic transaction fails", async () => {
    mocks.processBillingEvent.mockRejectedValue(
      new Error("synthetic rollback"),
    );
    expect((await POST(request(order()))).status).toBe(500);
    expect(mocks.sendPurchaseAccountClaimEmail).not.toHaveBeenCalled();
    expect(mocks.trackAnalyticsEvent).not.toHaveBeenCalled();
  });
  it("does not repeat side effects for duplicate deliveries", async () => {
    mocks.processBillingEvent.mockResolvedValue(false);
    const response = await POST(request(order()));
    expect(await response.json()).toMatchObject({ duplicate: true });
    expect(mocks.trackAnalyticsEvent).not.toHaveBeenCalled();
    expect(mocks.posthogCapture).not.toHaveBeenCalled();
    expect(mocks.sendPurchaseAccountClaimEmail).not.toHaveBeenCalled();
  });
  it("uses the same event identity when a replay changes only JSON formatting", async () => {
    await POST(request(order()));
    const first = mocks.processBillingEvent.mock.calls[0][0].id;
    await POST(request(order(), true));
    expect(mocks.processBillingEvent.mock.calls[1][0].id).toBe(first);
  });
  it("rejects an account email mismatch before any entitlement write", async () => {
    mocks.getMemberEmailById.mockResolvedValue("different@example.com");
    expect((await POST(request(order()))).status).toBe(400);
    expect(mocks.processBillingEvent).not.toHaveBeenCalled();
  });
  it("does not accept a client-controlled Lifetime plan in a paid Plus order", async () => {
    const payload = order();
    Object.assign(payload.meta.custom_data, { plan: "lifetime" });
    await POST(request(payload));
    expect(mocks.processBillingEvent).toHaveBeenCalledWith(
      expect.objectContaining({ plan: "plus" }),
    );
  });
  it("rejects unsigned requests before reading account data", async () => {
    expect(
      (
        await POST(
          new Request("https://speakace.org/api/payments/lemon/webhook", {
            method: "POST",
            body: JSON.stringify(order()),
          }),
        )
      ).status,
    ).toBe(401);
    expect(mocks.processBillingEvent).not.toHaveBeenCalled();
  });
});
