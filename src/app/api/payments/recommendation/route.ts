import { NextResponse } from "next/server";
import { getRecommendedPaymentProvider } from "@/lib/payment-recommendation";
import { consumeRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const rateLimit = await consumeRateLimit(request, {
    scope: "payment-recommendation",
    limit: 300,
    windowSeconds: 5 * 60,
  });
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

  const provider = getRecommendedPaymentProvider(
    request.headers.get("cf-ipcountry"),
  );

  return NextResponse.json(
    { provider },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
