import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { inventoryEvents, products } from "@/lib/db/schema";
import { productSchema } from "@/lib/validation";
import { protectAdminRequest } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const blocked = await protectAdminRequest(request, "admin-products-read");
  if (blocked) return blocked;
  return NextResponse.json(
    await getDb().select().from(products).orderBy(desc(products.updatedAt)),
  );
}

export async function POST(request: Request) {
  const blocked = await protectAdminRequest(request, "admin-products-write");
  if (blocked) return blocked;
  try {
    const input = productSchema.parse(await request.json());
    const [product] = await getDb().transaction(async (tx) => {
      const created = await tx.insert(products).values(input).returning();
      await tx.insert(inventoryEvents).values({
        productId: created[0].id,
        type: "restock",
        quantityChange: input.stockOnHand,
        stockAfter: input.stockOnHand,
        note: "Opening stock",
      });
      return created;
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Product could not be created",
      },
      { status: 400 },
    );
  }
}
