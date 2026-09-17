import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { completePaidOrder } from "@/lib/orders/service";
import { retrieveStripeSession } from "@/lib/payments";
import { getAdminIdentity } from "@/lib/auth";
import { consumeRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const identity = await getAdminIdentity();
  const rateLimit = await consumeRateLimit(request, {
    scope: "order-verification",
    limit: identity ? 1000 : 240,
    windowSeconds: 15 * 60,
    identity: identity ?? undefined,
  });
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

  const url = new URL(request.url);
  const reference = url.searchParams.get("reference");
  const sessionId = url.searchParams.get("session_id");
  if (!reference)
    return NextResponse.json(
      { error: "Reference is required" },
      { status: 400 },
    );
  const [order] = await getDb()
    .select()
    .from(orders)
    .where(eq(orders.reference, reference))
    .limit(1);
  if (!order)
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (["paid", "processing", "shipped", "fulfilled"].includes(order.status))
    return NextResponse.json({ status: order.status });

  if (order.paymentProvider === "stripe") {
    if (!sessionId || sessionId !== order.paymentReference)
      return NextResponse.json({ status: order.status });
    const session = await retrieveStripeSession(sessionId);
    const isCorrectOrder = session.metadata?.orderReference === order.reference;
    const isCorrectAmount =
      session.amount_total === order.total &&
      session.currency === order.currency.toLowerCase();
    if (
      session.payment_status === "paid" &&
      isCorrectOrder &&
      isCorrectAmount
    ) {
      const paidOrder = await completePaidOrder(reference, session.id);
      return NextResponse.json({ status: paidOrder.status });
    }
    return NextResponse.json({ status: order.status });
  }

  if (order.paymentProvider !== "paystack" || !process.env.PAYSTACK_SECRET_KEY)
    return NextResponse.json({ status: order.status });
  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      cache: "no-store",
    },
  );
  const payload = (await response.json()) as {
    status: boolean;
    data?: { status: string; amount: number; currency: string; id: number };
  };
  if (
    payload.status &&
    payload.data?.status === "success" &&
    payload.data.amount === order.total &&
    payload.data.currency === order.currency
  ) {
    const paidOrder = await completePaidOrder(
      reference,
      String(payload.data.id),
    );
    return NextResponse.json({ status: paidOrder.status });
  }
  return NextResponse.json({ status: order.status });
}
