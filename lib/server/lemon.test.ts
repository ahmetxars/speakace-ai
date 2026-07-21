import { describe, expect, it } from "vitest";
import {
  getLemonCheckoutMetadata,
  getLemonPaymentDetails,
  resolveBillingStatusFromEvent
} from "@/lib/server/lemon";

describe("Lemon billing helpers", () => {
  it("keeps successful subscription renewals active", () => {
    expect(resolveBillingStatusFromEvent("subscription_payment_success", {})).toBe("active");
    expect(resolveBillingStatusFromEvent("subscription_payment_recovered", {})).toBe("active");
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
