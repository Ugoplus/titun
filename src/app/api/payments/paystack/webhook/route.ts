import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { completePaidOrder } from "@/lib/orders/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature") ?? "";
  const expected = createHmac("sha512", secret).update(rawBody).digest("hex");
  const isValid = signature.length === expected.length && timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!isValid) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

  const event = JSON.parse(rawBody) as { event: string; data: { reference: string; amount: number; currency: string; status: string; id: number } };
  if (event.event !== "charge.success" || event.data.status !== "success") return NextResponse.json({ received: true });
  const [order] = await getDb().select().from(orders).where(eq(orders.reference, event.data.reference)).limit(1);
  if (!order || order.paymentProvider !== "paystack") return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.total !== event.data.amount || order.currency !== event.data.currency) return NextResponse.json({ error: "Payment amount mismatch" }, { status: 400 });
  await completePaidOrder(order.reference, String(event.data.id));
  return NextResponse.json({ received: true });
}
