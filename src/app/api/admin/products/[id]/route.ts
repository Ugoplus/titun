import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { inventoryEvents, products } from "@/lib/db/schema";
import { productSchema } from "@/lib/validation";
import { protectAdminRequest } from "@/lib/rate-limit";
import { isUnlimitedStock } from "@/lib/inventory";

export async function PATCH(
  request: Request,
  { params }: RouteContext<"/api/admin/products/[id]">,
) {
  const blocked = await protectAdminRequest(request, "admin-products-write", {
    permission: "products:manage",
  });
  if (blocked) return blocked;
  try {
    const { id } = await params;
    const input = productSchema.partial().parse(await request.json());
    const [updated] = await getDb().transaction(async (tx) => {
      const [before] = await tx
        .select()
        .from(products)
        .where(eq(products.id, id))
        .limit(1);
      if (!before) throw new Error("Product not found");
      if (
        input.stockOnHand !== undefined &&
        !isUnlimitedStock(input.stockOnHand) &&
        input.stockOnHand < before.stockReserved
      )
        throw new Error("Stock cannot be lower than reserved units");
      const shouldResetAlert =
        input.stockOnHand !== undefined &&
        (isUnlimitedStock(input.stockOnHand) ||
          input.stockOnHand >
            (input.lowStockThreshold ?? before.lowStockThreshold));
      const changed = await tx
        .update(products)
        .set({
          ...input,
          lowStockAlertedAt: shouldResetAlert ? null : before.lowStockAlertedAt,
          updatedAt: new Date(),
        })
        .where(eq(products.id, id))
        .returning();
      if (
        input.stockOnHand !== undefined &&
        input.stockOnHand !== before.stockOnHand
      ) {
        await tx.insert(inventoryEvents).values({
          productId: id,
          type:
            input.stockOnHand > before.stockOnHand ? "restock" : "adjustment",
          quantityChange: input.stockOnHand - before.stockOnHand,
          stockAfter: input.stockOnHand,
          note: "Admin stock update",
        });
      }
      return changed;
    });
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/products/${updated.slug}`);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Product could not be updated",
      },
      { status: 400 },
    );
  }
}
