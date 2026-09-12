import { NextResponse } from "next/server";
import { getProducts } from "@/lib/catalog";

export async function GET(request: Request) {
  const exclude = new Set(new URL(request.url).searchParams.get("exclude")?.split(",").filter(Boolean) ?? []);
  const catalog = await getProducts();
  const recommendations = catalog
    .filter((product) => !exclude.has(product.id) && product.stockOnHand - product.stockReserved > 0)
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .slice(0, 2);
  return NextResponse.json(recommendations);
}
