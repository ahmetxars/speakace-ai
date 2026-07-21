import { describe, expect, it } from "vitest";
import {
  getLemonCheckoutMetadata,
  getLemonPaymentDetails,
  getLemonTrialEndsAt,
  resolveBillingStatusFromEvent
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
});
