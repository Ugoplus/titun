import { randomBytes } from "node:crypto";
import { and, eq, gt, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  communityMembers,
  eventAttendees,
  events,
  inventoryEvents,
  orderItems,
  orders,
  products,
} from "@/lib/db/schema";
import { sendFreeEventConfirmation } from "@/lib/email";
import { consumeRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { freeEventRegistrationSchema } from "@/lib/validation";
import { isUnlimitedStock } from "@/lib/inventory";

const makeReference = () =>
  `TIT-FREE-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const rateLimit = await consumeRateLimit(request, {
    scope: "free-event-registration",
    limit: 10,
    windowSeconds: 15 * 60,
  });
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

  try {
    const { id } = await params;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id))
      throw new Error("Event not found");
    const input = freeEventRegistrationSchema.parse(await request.json());
    const db = getDb();
    const registration = await db.transaction(async (tx) => {
      const [communityEvent] = await tx
        .select()
        .from(events)
        .where(and(
          eq(events.id, id),
          eq(events.published, true),
          gt(events.startsAt, new Date()),
        ))
        .limit(1);
      if (!communityEvent) throw new Error("This event is no longer available");

      const [ticket] = await tx
        .select()
        .from(products)
        .where(and(
          eq(products.id, communityEvent.ticketProductId),
          eq(products.active, true),
          eq(products.price, 0),
        ))
        .limit(1);
      if (!ticket) throw new Error("This event requires paid admission");

      const normalizedEmail = input.email.trim().toLowerCase();
      const [member] = await tx
        .insert(communityMembers)
        .values({
          email: normalizedEmail,
          name: input.name,
          phone: input.phone,
          lastEventAt: new Date(),
        })
        .onConflictDoUpdate({
          target: communityMembers.email,
          set: {
            name: input.name,
            phone: input.phone,
            lastEventAt: new Date(),
          },
        })
        .returning();

      const [existing] = await tx
        .select({ id: eventAttendees.id })
        .from(eventAttendees)
        .where(and(
          eq(eventAttendees.eventId, communityEvent.id),
          eq(eventAttendees.memberId, member.id),
        ))
        .limit(1);
      if (existing) throw new Error("You are already registered for this event");

      const [updatedTicket] = await tx
        .update(products)
        .set({
          stockOnHand: sql`CASE WHEN ${products.stockOnHand} = -1 THEN -1 ELSE ${products.stockOnHand} - ${input.quantity} END`,
          updatedAt: new Date(),
        })
        .where(and(
          eq(products.id, ticket.id),
          sql`${products.stockOnHand} = -1 OR ${products.stockOnHand} - ${products.stockReserved} >= ${input.quantity}`,
        ))
        .returning();
      if (!updatedTicket) throw new Error("This event does not have enough places remaining");

      const reference = makeReference();
      const now = new Date();
      const [order] = await tx
        .insert(orders)
        .values({
          reference,
          status: "fulfilled",
          customerName: input.name,
          customerEmail: normalizedEmail,
          customerPhone: input.phone,
          deliveryAddress: "Free event registration",
          deliveryCity: communityEvent.venue,
          subtotal: 0,
          discountAmount: 0,
          total: 0,
          paymentProvider: "free",
          paymentReference: reference,
          reservationExpiresAt: now,
          paidAt: now,
          fulfilledAt: now,
        })
        .returning();

      await tx.insert(orderItems).values({
        orderId: order.id,
        productId: ticket.id,
        productName: ticket.name,
        scent: ticket.scent,
        packSize: ticket.packSize,
        image: ticket.images[0],
        unitPrice: 0,
        quantity: input.quantity,
        lineTotal: 0,
        configuration: {},
      });
      await tx.insert(eventAttendees).values({
        eventId: communityEvent.id,
        memberId: member.id,
        orderId: order.id,
        ticketQuantity: input.quantity,
      });
      if (!isUnlimitedStock(updatedTicket.stockOnHand)) {
        await tx.insert(inventoryEvents).values({
          productId: ticket.id,
          orderId: order.id,
          type: "sale",
          quantityChange: -input.quantity,
          stockAfter: updatedTicket.stockOnHand,
          note: reference,
        });
      }

      return {
        reference,
        title: communityEvent.title,
        startsAt: communityEvent.startsAt,
        venue: communityEvent.venue,
        email: normalizedEmail,
        name: input.name,
        quantity: input.quantity,
      };
    });

    await sendFreeEventConfirmation(registration).catch(console.error);
    return NextResponse.json({
      reference: registration.reference,
      message: "Your place is confirmed",
    });
  } catch (error) {
    const knownMessages = [
      "Event not found",
      "This event is no longer available",
      "This event requires paid admission",
      "You are already registered for this event",
      "This event does not have enough places remaining",
    ];
    const message = error instanceof Error && knownMessages.includes(error.message)
      ? error.message
      : "Registration could not be completed. Check your details and try again.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
