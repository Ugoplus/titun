import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  eventProducts,
  events,
  inventoryEvents,
  products,
} from "@/lib/db/schema";
import { protectAdminRequest } from "@/lib/rate-limit";
import { eventSchema } from "@/lib/validation";
import { isUnlimitedStock } from "@/lib/inventory";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const blocked = await protectAdminRequest(request, "admin-events-write", {
    permission: "events:manage",
  });
  if (blocked) return blocked;

  try {
    const { id } = await params;
    const input = eventSchema.parse(await request.json());
    const db = getDb();
    const updated = await db.transaction(async (tx) => {
      const [currentEvent] = await tx
        .select()
        .from(events)
        .where(eq(events.id, id))
        .limit(1);
      if (!currentEvent) throw new Error("Event not found");

      const recommendedIds = [...new Set(input.recommendedProductIds)];
      if (recommendedIds.length > 0) {
        const eligible = await tx
          .select({ id: products.id })
          .from(products)
          .where(inArray(products.id, recommendedIds));
        if (eligible.length !== recommendedIds.length)
          throw new Error("One or more recommended products no longer exist");
      }

      const [ticket] = await tx
        .select()
        .from(products)
        .where(eq(products.id, currentEvent.ticketProductId))
        .limit(1);
      if (!ticket) throw new Error("Event admission product not found");
      if (!isUnlimitedStock(input.capacity) && input.capacity < ticket.stockReserved)
        throw new Error(
          `Capacity cannot be lower than the ${ticket.stockReserved} places currently reserved`,
        );

      await tx
        .update(products)
        .set({
          slug: `${input.slug}-admission`,
          name: `${input.title} — Admission`,
          description: input.description,
          price: input.ticketPrice,
          stockOnHand: input.capacity,
          lowStockThreshold: input.lowStockThreshold,
          images: input.image ? [input.image] : [],
          updatedAt: new Date(),
        })
        .where(eq(products.id, currentEvent.ticketProductId));

      const [event] = await tx
        .update(events)
        .set({
          slug: input.slug,
          title: input.title,
          description: input.description,
          story: input.story,
          venue: input.venue,
          startsAt: new Date(input.startsAt),
          image: input.image || null,
          galleryImages: input.galleryImages,
          videoUrl: input.videoUrl || null,
          registrationUrl: input.registrationUrl || null,
          ctaLabel: input.ctaLabel || null,
          published: input.published,
          updatedAt: new Date(),
        })
        .where(eq(events.id, id))
        .returning();

      await tx.delete(eventProducts).where(eq(eventProducts.eventId, id));
      if (recommendedIds.length > 0) {
        await tx.insert(eventProducts).values(
          recommendedIds.map((productId, displayOrder) => ({
            eventId: id,
            productId,
            displayOrder,
          })),
        );
      }

      if (input.capacity !== ticket.stockOnHand) {
        await tx.insert(inventoryEvents).values({
          productId: currentEvent.ticketProductId,
          type: "adjustment",
          quantityChange: input.capacity - ticket.stockOnHand,
          stockAfter: input.capacity,
          note: "Event capacity updated",
        });
      }
      return event;
    });

    revalidatePath("/events");
    revalidatePath(`/events/${updated.slug}`);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Event could not be updated",
      },
      { status: 400 },
    );
  }
}
