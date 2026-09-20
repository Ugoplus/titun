import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { createCartQuote } from "@/lib/cart";
import { getAdminRateLimitIdentity } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { consumeRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { cartQuoteSchema } from "@/lib/validation";

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
    const catalog = await getDb().select().from(products).where(and(
      inArray(products.id, ids),
      eq(products.active, true),
    ));
    return NextResponse.json(createCartQuote(catalog, input.items));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Your basket could not be refreshed" },
      { status: 400 },
    );
  }
}
