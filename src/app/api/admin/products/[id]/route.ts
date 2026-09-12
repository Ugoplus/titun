import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { isAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { inventoryEvents, products } from "@/lib/db/schema";
import { productSchema } from "@/lib/validation";

export async function PATCH(request: Request, { params }: RouteContext<"/api/admin/products/[id]">) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const input = productSchema.partial().parse(await request.json());
    const [updated] = await getDb().transaction(async (tx) => {
      const [before] = await tx.select().from(products).where(eq(products.id, id)).limit(1);
      if (!before) throw new Error("Product not found");
      if (input.stockOnHand !== undefined && input.stockOnHand < before.stockReserved) throw new Error("Stock cannot be lower than reserved units");
      const shouldResetAlert = input.stockOnHand !== undefined && input.stockOnHand > (input.lowStockThreshold ?? before.lowStockThreshold);
      const changed = await tx.update(products).set({ ...input, lowStockAlertedAt: shouldResetAlert ? null : before.lowStockAlertedAt, updatedAt: new Date() }).where(eq(products.id, id)).returning();
      if (input.stockOnHand !== undefined && input.stockOnHand !== before.stockOnHand) {
        await tx.insert(inventoryEvents).values({ productId: id, type: input.stockOnHand > before.stockOnHand ? "restock" : "adjustment", quantityChange: input.stockOnHand - before.stockOnHand, stockAfter: input.stockOnHand, note: "Admin stock update" });
      }
      return changed;
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Product could not be updated" }, { status: 400 });
  }
}
