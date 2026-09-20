import type { PaymentProvider } from "@/lib/payments";

export function getRecommendedPaymentProvider(
  countryCode: string | null | undefined,
): PaymentProvider {
  return countryCode?.trim().toUpperCase() === "NG" ? "paystack" : "stripe";
}

export function getAlternativePaymentProvider(
  provider: PaymentProvider,
): PaymentProvider {
  return provider === "stripe" ? "paystack" : "stripe";
}
