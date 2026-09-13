import { NextResponse } from "next/server";
import { getProducts } from "@/lib/catalog";
import { getAdminIdentity } from "@/lib/auth";
import { consumeRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const identity = await getAdminIdentity();
  const rateLimit = await consumeRateLimit(request, {
    scope: "recommendations",
    limit: identity ? 1000 : 120,
    windowSeconds: 5 * 60,
    identity: identity ?? undefined,
  });
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

  const exclude = new Set(
    new URL(request.url).searchParams
      .get("exclude")
      ?.split(",")
      .filter(Boolean) ?? [],
  );
  const catalog = await getProducts();
  const recommendations = catalog
    .filter(
      (product) =>
        !exclude.has(product.id) &&
        product.stockOnHand - product.stockReserved > 0,
    )
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .slice(0, 2);
  return NextResponse.json(recommendations);
}
