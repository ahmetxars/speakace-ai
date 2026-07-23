import { describe, expect, it } from "vitest";
import {
  getLemonCheckoutMetadata,
  getLemonPaymentDetails,
  getLemonSubscriptionId,
  getLemonTrialEndsAt,
  resolveBillingStatusFromEvent,
  resolvePlanFromLemonPayload
} from "@/lib/server/lemon";

describe("Lemon billing helpers", () => {
  it("keeps successful subscription renewals active", () => {
    expect(resolveBillingStatusFromEvent("subscription_payment_success", {})).toBe("active");
    expect(resolveBillingStatusFromEvent("subscription_payment_recovered", {})).toBe("active");
  });

  it("preserves Lemon trial state and expiration", () => {
    const payload = {
      data: {
        attributes: {
          status: "on_trial",
          trial_ends_at: "2026-07-25T12:00:00.000Z"
        }
      }
    };

    expect(resolveBillingStatusFromEvent("subscription_created", payload)).toBe("on_trial");
    expect(getLemonTrialEndsAt(payload)).toBe("2026-07-25T12:00:00.000Z");
  });

  it("extracts real payment value and checkout attribution", () => {
    const payload = {
      meta: {
        custom_data: {
          checkout_id: "checkout-123",
          visitor_id: "visitor-1234567890",
          campaign: "billing_decision_annual",
          cta_path: "/app/billing"
        }
      },
      data: {
        id: "42",
        attributes: {
          identifier: "order-abc",
          total: 336,
          currency: "usd"
        }
      }
    };

    expect(getLemonCheckoutMetadata(payload)).toEqual({
      checkoutId: "checkout-123",
      visitorId: "visitor-1234567890",
      campaign: "billing_decision_annual",
      ctaPath: "/app/billing",
      ctaEvent: null
    });
    expect(getLemonPaymentDetails(payload)).toEqual({
      orderId: "order-abc",
      value: 3.36,
      currency: "USD"
    });
  });

  it("resolves the purchased plan from an order's nested first item", () => {
    const payload = {
      data: {
        type: "orders",
        id: "order-1",
        attributes: {
          first_order_item: {
            product_name: "SpeakAce Plus",
            variant_name: "Weekly"
          }
        }
      }
    };

    expect(resolvePlanFromLemonPayload(payload)).toBe("plus");
    expect(getLemonSubscriptionId(payload)).toBeNull();
  });

  it("never invents a Free plan for planless subscription invoices", () => {
    const payload = {
      data: {
        type: "subscription-invoices",
        id: "invoice-1",
        attributes: {
          subscription_id: 42,
          status: "paid"
        }
      }
    };

    expect(resolvePlanFromLemonPayload(payload)).toBeNull();
    expect(getLemonSubscriptionId(payload)).toBe("42");
    expect(resolveBillingStatusFromEvent("subscription_payment_success", payload)).toBe("active");
  });

  it("recovers legacy subscription plans from their undiscounted USD subtotal", () => {
    expect(resolvePlanFromLemonPayload({
      data: {
        type: "subscription-invoices",
        attributes: { subtotal_usd: 399, total: 319, currency: "USD" }
      }
    })).toBe("plus");

    expect(resolvePlanFromLemonPayload({
      data: {
        type: "subscription-invoices",
        attributes: { subtotal: "1200", currency: "usd" }
      }
    })).toBe("pro");

    expect(resolvePlanFromLemonPayload({
      data: {
        type: "orders",
        attributes: { subtotal: "12999", currency: "usd" }
      }
    })).toBe("lifetime");

    expect(resolvePlanFromLemonPayload({
      data: {
        type: "orders",
        attributes: { subtotal: "14900", currency: "usd" }
      }
    })).toBe("lifetime");
  });

  it("ignores webhook event types that cannot change billing state", () => {
    expect(resolveBillingStatusFromEvent("customer_updated", {})).toBeNull();
  });
});
