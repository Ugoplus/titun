import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { createCartQuote } from "@/lib/cart";
import { getAdminRateLimitIdentity } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { events, products } from "@/lib/db/schema";
import { consumeRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { cartQuoteSchema } from "@/lib/validation";
import { getCheckoutDeliveryGroups, getDeliveryContent } from "@/lib/delivery-content";

export async function POST(request: Request) {
  const identity = await getAdminRateLimitIdentity();
  const rateLimit = await consumeRateLimit(request, {
    scope: "cart-quote",
    limit: identity ? 1000 : 120,
    windowSeconds: 5 * 60,
    identity: identity ?? undefined,
  });
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

  try {
    const input = cartQuoteSchema.parse(await request.json());
    const ids = [...new Set(input.items.map((item) => item.productId))];
    const [catalog, ticketProducts, deliveryContent] = await Promise.all([
      getDb().select().from(products).where(and(
        inArray(products.id, ids),
        eq(products.active, true),
      )),
      getDb()
        .select({ productId: events.ticketProductId })
        .from(events)
        .where(inArray(events.ticketProductId, ids)),
      getDeliveryContent(),
    ]);
    const ticketProductIds = new Set(ticketProducts.map(({ productId }) => productId));
    const requiresDelivery = ids.some((id) => !ticketProductIds.has(id));
    return NextResponse.json({
      ...createCartQuote(catalog, input.items),
      delivery: {
        required: requiresDelivery,
        groups: requiresDelivery ? getCheckoutDeliveryGroups(deliveryContent) : [],
        disclaimer: deliveryContent.disclaimer,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Your basket could not be refreshed" },
      { status: 400 },
    );
  }
}
