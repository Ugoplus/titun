import { NextResponse } from "next/server";
import { asc, inArray } from "drizzle-orm";
import { isAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { eventProducts, events, inventoryEvents, products } from "@/lib/db/schema";
import { eventSchema } from "@/lib/validation";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  const records = await db.select().from(events).orderBy(asc(events.startsAt));
  return NextResponse.json(records);
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const input = eventSchema.parse(await request.json());
    const db = getDb();
    const created = await db.transaction(async (tx) => {
      const recommendedIds = [...new Set(input.recommendedProductIds)];
      if (recommendedIds.length > 0) {
        const eligible = await tx.select({ id: products.id }).from(products).where(inArray(products.id, recommendedIds));
        if (eligible.length !== recommendedIds.length) throw new Error("One or more recommended products no longer exist");
      }

      const [ticket] = await tx.insert(products).values({
        slug: `${input.slug}-admission`,
        name: `${input.title} — Admission`,
        scent: "Community experience",
        description: input.description,
        category: "Community event",
        packSize: "1 guest admission",
        price: input.ticketPrice,
        stockOnHand: input.capacity,
        lowStockThreshold: input.lowStockThreshold,
        images: input.image ? [input.image] : [],
        featured: false,
        active: true,
      }).returning();

      const [communityEvent] = await tx.insert(events).values({
        slug: input.slug,
        title: input.title,
        description: input.description,
        venue: input.venue,
        startsAt: new Date(input.startsAt),
        image: input.image || null,
        ticketProductId: ticket.id,
        published: input.published,
      }).returning();

      if (recommendedIds.length > 0) {
        await tx.insert(eventProducts).values(recommendedIds.map((productId, displayOrder) => ({
          eventId: communityEvent.id,
          productId,
          displayOrder,
        })));
      }
      await tx.insert(inventoryEvents).values({
        productId: ticket.id,
        type: "restock",
        quantityChange: input.capacity,
        stockAfter: input.capacity,
        note: "Event capacity",
      });
      return communityEvent;
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Event could not be created" }, { status: 400 });
  }
}
