import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { protectAdminRequest } from "@/lib/rate-limit";
import { adminCan, getAdminIdentity } from "@/lib/auth";
import { toAdminOrderView } from "@/lib/admin-order-view";

const updateSchema = z.object({
  status: z.enum(["processing", "shipped", "fulfilled"]),
  courier: z.string().trim().max(100).optional(),
  trackingNumber: z.string().trim().max(140).optional(),
});

const allowedTransitions: Record<string, string[]> = {
  paid: ["processing", "fulfilled"],
  processing: ["shipped", "fulfilled"],
  shipped: ["fulfilled"],
};

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const blocked = await protectAdminRequest(request, "admin-orders-write", {
    limit: 200,
    windowSeconds: 3600,
    permission: "orders:manage",
  });
  if (blocked) return blocked;
  try {
    const { id } = await params;
    const input = updateSchema.parse(await request.json());
    const db = getDb();
    const [current] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (!current) throw new Error("Order not found");
    if (!allowedTransitions[current.status]?.includes(input.status))
      throw new Error(`A ${current.status} order cannot move to ${input.status}`);
    const now = new Date();
    const timestamps = input.status === "processing"
      ? { processingAt: now }
      : input.status === "shipped"
        ? { shippedAt: now }
        : { fulfilledAt: now };
    const [updated] = await db.update(orders).set({
      status: input.status,
      ...timestamps,
      courier: input.courier || current.courier,
      trackingNumber: input.trackingNumber || current.trackingNumber,
      updatedAt: now,
    }).where(eq(orders.id, id)).returning();
    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    const identity = await getAdminIdentity();
    return NextResponse.json(
      toAdminOrderView(
        updated,
        Boolean(identity && adminCan(identity, "orders:view_financials")),
      ),
    );
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Order could not be updated" }, { status: 400 });
  }
}
