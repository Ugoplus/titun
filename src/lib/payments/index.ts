import Stripe from "stripe";
import type { Order } from "@/lib/db/schema";

export type PaymentProvider = "paystack" | "stripe";
export type PaymentSession = { checkoutUrl: string; externalReference: string };

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("Stripe is not configured yet");
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

const initializePaystack = async (order: Order, siteUrl: string): Promise<PaymentSession> => {
  if (!process.env.PAYSTACK_SECRET_KEY) throw new Error("Paystack is not configured yet");
  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      email: order.customerEmail,
      amount: order.total,
      currency: order.currency,
      reference: order.reference,
      callback_url: `${siteUrl}/checkout/verify?reference=${order.reference}`,
      metadata: { orderId: order.id, customerName: order.customerName },
    }),
  });
  const payload = await response.json() as { status: boolean; data?: { authorization_url: string; reference: string }; message?: string };
  if (!response.ok || !payload.status || !payload.data) throw new Error(payload.message ?? "Paystack payment could not be started");
  return { checkoutUrl: payload.data.authorization_url, externalReference: payload.data.reference };
};

const initializeStripe = async (order: Order, siteUrl: string): Promise<PaymentSession> => {
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: order.customerEmail,
    client_reference_id: order.id,
    success_url: `${siteUrl}/checkout/verify?reference=${order.reference}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/checkout?payment=cancelled`,
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    metadata: { orderReference: order.reference, orderId: order.id },
    line_items: [{
      quantity: 1,
      price_data: {
        currency: order.currency.toLowerCase(),
        unit_amount: order.total,
        product_data: { name: `TITUN order ${order.reference}` },
      },
    }],
  });
  if (!session.url) throw new Error("Stripe payment could not be started");
  return { checkoutUrl: session.url, externalReference: session.id };
};

export const initializePayment = (provider: PaymentProvider, order: Order, siteUrl: string) =>
  provider === "stripe" ? initializeStripe(order, siteUrl) : initializePaystack(order, siteUrl);

export const retrieveStripeSession = (sessionId: string) => getStripe().checkout.sessions.retrieve(sessionId);

export const constructStripeEvent = (body: string, signature: string) => {
  if (!process.env.STRIPE_WEBHOOK_SECRET) throw new Error("Stripe webhook is not configured");
  return getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
};
