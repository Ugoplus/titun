import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { constructStripeEvent } from "@/lib/payments";
import { completePaidOrder } from "@/lib/orders/service";
import { getDb } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("stripe-signature");
    if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    const event = constructStripeEvent(rawBody, signature);
    if (event.type !== "checkout.session.completed" && event.type !== "checkout.session.async_payment_succeeded") {
      return NextResponse.json({ received: true });
    }
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status !== "paid") return NextResponse.json({ received: true });
    const reference = session.metadata?.orderReference;
    if (!reference) return NextResponse.json({ error: "Order reference is missing" }, { status: 400 });
    const [order] = await getDb().select().from(orders).where(eq(orders.reference, reference)).limit(1);
    if (!order || order.paymentProvider !== "stripe") return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (order.total !== session.amount_total || order.currency.toLowerCase() !== session.currency) {
      return NextResponse.json({ error: "Payment amount mismatch" }, { status: 400 });
    }
    await completePaidOrder(reference, session.id);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook rejected", error);
    return NextResponse.json({ error: "Invalid Stripe event" }, { status: 400 });
  }
}
