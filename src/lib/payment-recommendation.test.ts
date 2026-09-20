import { describe, expect, it } from "vitest";
import {
  getAlternativePaymentProvider,
  getRecommendedPaymentProvider,
} from "./payment-recommendation";

describe("payment provider recommendations", () => {
  it("recommends Paystack for Nigeria", () => {
    expect(getRecommendedPaymentProvider("NG")).toBe("paystack");
    expect(getRecommendedPaymentProvider(" ng ")).toBe("paystack");
  });

  it("recommends Stripe outside Nigeria", () => {
    expect(getRecommendedPaymentProvider("GB")).toBe("stripe");
    expect(getRecommendedPaymentProvider("US")).toBe("stripe");
  });

  it("falls back to Stripe when location is unavailable", () => {
    expect(getRecommendedPaymentProvider(null)).toBe("stripe");
    expect(getRecommendedPaymentProvider(undefined)).toBe("stripe");
  });

  it("returns the other provider when a customer wants to switch", () => {
    expect(getAlternativePaymentProvider("stripe")).toBe("paystack");
    expect(getAlternativePaymentProvider("paystack")).toBe("stripe");
  });
});
