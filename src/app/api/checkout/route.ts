import { NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/validation";
import {
  attachPaymentReference,
  createPendingOrder,
  releasePendingOrder,
} from "@/lib/orders/service";
import { initializePayment } from "@/lib/payments";
import { getAdminIdentity } from "@/lib/auth";
import { consumeRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const identity = await getAdminIdentity();
  const rateLimit = await consumeRateLimit(request, {
    scope: "checkout",
    limit: identity ? 300 : 30,
    windowSeconds: 15 * 60,
    identity: identity ?? undefined,
  });
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

  let orderReference: string | null = null;
  try {
    const input = checkoutSchema.parse(await request.json());
    const order = await createPendingOrder(input);
    orderReference = order.reference;
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
    const payment = await initializePayment(
      input.paymentProvider,
      order,
      siteUrl,
    );
    await attachPaymentReference(order.reference, payment.externalReference);
    return NextResponse.json({
      checkoutUrl: payment.checkoutUrl,
      reference: order.reference,
      paymentProvider: input.paymentProvider,
    });
  } catch (error) {
    if (orderReference)
      await releasePendingOrder(orderReference).catch(console.error);
    const message =
      error instanceof Error ? error.message : "Checkout could not be started";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
