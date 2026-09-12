import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { isAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { inventoryEvents, products } from "@/lib/db/schema";
import { productSchema } from "@/lib/validation";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getDb().select().from(products).orderBy(desc(products.updatedAt)));
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const input = productSchema.parse(await request.json());
    const [product] = await getDb().transaction(async (tx) => {
      const created = await tx.insert(products).values(input).returning();
      await tx.insert(inventoryEvents).values({ productId: created[0].id, type: "restock", quantityChange: input.stockOnHand, stockAfter: input.stockOnHand, note: "Opening stock" });
      return created;
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Product could not be created" }, { status: 400 });
  }
}
