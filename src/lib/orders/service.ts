import { randomBytes } from "node:crypto";
import { and, eq, gt, inArray, isNull, lte, or, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  communityMembers,
  discounts,
  eventAttendees,
  events,
  inventoryEvents,
  orderItems,
  orders,
  products,
} from "@/lib/db/schema";
import { assertExpectedTotal, calculateOrder } from "./pricing";
import { sendLowStockAlert, sendOrderConfirmation } from "@/lib/email";
import type { PaymentProvider } from "@/lib/payments";
import { getConfiguredLinePricing } from "@/lib/product-pricing";
import { createCartQuote, type CartConfiguration } from "@/lib/cart";
import { findDeliveryOption, getDeliveryContent } from "@/lib/delivery-content";
import { isUnlimitedStock } from "@/lib/inventory";

export type CheckoutInput = {
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    notes?: string;
  };
  items: {
    productId: string;
    quantity: number;
    configuration?: CartConfiguration;
  }[];
  expectedSubtotal: number;
  deliveryOptionId: string;
  expectedDeliveryFee: number;
  discountCode?: string;
  paymentProvider: PaymentProvider;
};

const makeReference = () =>
  `TIT-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;

export const createPendingOrder = async (input: CheckoutInput) => {
  const deliveryContent = await getDeliveryContent();
  const db = getDb();
  return db.transaction(async (tx) => {
    const requestedIds = [...new Set(input.items.map((item) => item.productId))];
    const catalog = await tx.select().from(products).where(and(inArray(products.id, requestedIds), eq(products.active, true)));
    if (catalog.length !== requestedIds.length) throw new Error("One or more products are unavailable");
    const ticketProducts = await tx
      .select({ productId: events.ticketProductId })
      .from(events)
      .where(inArray(events.ticketProductId, requestedIds));
    const ticketProductIds = new Set(ticketProducts.map(({ productId }) => productId));
    const requiresDelivery = requestedIds.some((id) => !ticketProductIds.has(id));
    const deliveryOption = requiresDelivery
      ? findDeliveryOption(deliveryContent, input.deliveryOptionId)
      : {
          id: "event-ticket-email",
          name: "Event ticket",
          timeframe: "Confirmation by email",
          price: 0,
        };
    if (!deliveryOption) throw new Error("Choose an available delivery destination");
    if (deliveryOption.id !== input.deliveryOptionId || deliveryOption.price !== input.expectedDeliveryFee) {
      throw new Error("The delivery price changed. Review the updated amount and try again.");
    }
    const quote = createCartQuote(catalog, input.items);

    const quantityById = new Map(input.items.map((item) => [item.productId, item.quantity]));
    const configurationById = new Map(input.items.map((item) => [item.productId, item.configuration]));
    const pricedItems = quote.items.map(({ product, quantity, configuration }) => {
      const pricing = getConfiguredLinePricing(product, quantity, configuration);
      return { productId: product.id, unitPrice: pricing.unitPrice, quantity };
    });

    let appliedDiscount: { type: "percentage" | "fixed"; value: number } | null = null;
    let discountCode: string | null = null;
    if (input.discountCode) {
      const normalizedCode = input.discountCode.trim().toUpperCase();
      const [discount] = await tx.select().from(discounts).where(and(
        eq(discounts.code, normalizedCode),
        eq(discounts.active, true),
        or(isNull(discounts.expiresAt), gt(discounts.expiresAt, new Date())),
      )).limit(1);
      const canUse = discount && (discount.maxUses === null || discount.usedCount < discount.maxUses);
      if (!canUse) throw new Error("That discount code is invalid or has expired");
      appliedDiscount = { type: discount.type, value: discount.value };
      discountCode = discount.code;
    }

    const totals = calculateOrder(pricedItems, appliedDiscount, deliveryOption.price);
    assertExpectedTotal(totals.subtotal, input.expectedSubtotal);
    const reference = makeReference();
    const [order] = await tx.insert(orders).values({
      reference,
      customerName: input.customer.name,
      customerEmail: input.customer.email,
      customerPhone: input.customer.phone,
      deliveryAddress: input.customer.address,
      deliveryCity: input.customer.city,
      deliveryOptionId: deliveryOption.id,
      deliveryMethod: deliveryOption.name,
      deliveryTimeframe: deliveryOption.timeframe,
      deliveryFee: totals.deliveryFee,
      notes: input.customer.notes,
      subtotal: totals.subtotal,
      discountAmount: totals.discount,
      total: totals.total,
      discountCode,
      paymentProvider: input.paymentProvider,
      reservationExpiresAt: new Date(Date.now() + 35 * 60 * 1000),
    }).returning();

    for (const product of catalog) {
      const quantity = quantityById.get(product.id) ?? 0;
      const [reserved] = await tx.update(products)
        .set({
          stockReserved: sql`CASE WHEN ${products.stockOnHand} = -1 THEN ${products.stockReserved} ELSE ${products.stockReserved} + ${quantity} END`,
          updatedAt: new Date(),
        })
        .where(and(
          eq(products.id, product.id),
          sql`${products.stockOnHand} = -1 OR ${products.stockOnHand} - ${products.stockReserved} >= ${quantity}`,
        ))
        .returning({ id: products.id });
      if (!reserved) throw new Error(`${product.name} does not have enough stock`);
    }

    await tx.insert(orderItems).values(catalog.map((product) => {
      const quantity = quantityById.get(product.id) ?? 0;
      const pricing = getConfiguredLinePricing(
        product,
        quantity,
        configurationById.get(product.id),
      );
      return {
        orderId: order.id,
        productId: product.id,
        productName: product.name,
        scent: product.scent,
        packSize: pricing.label,
        image: product.images[0],
        unitPrice: pricing.unitPrice,
        quantity,
        lineTotal: pricing.total,
        configuration: configurationById.get(product.id) ?? {},
      };
    }));

    return order;
  });
};

export const attachPaymentReference = async (reference: string, paymentReference: string) => {
  await getDb().update(orders).set({ paymentReference, updatedAt: new Date() }).where(and(eq(orders.reference, reference), eq(orders.status, "pending")));
};

export const releasePendingOrder = async (reference: string, status: "failed" | "cancelled" = "failed") => {
  const db = getDb();
  await db.transaction(async (tx) => {
    const now = new Date();
    const [order] = await tx.update(orders).set({
      status,
      ...(status === "failed" ? { failedAt: now } : { cancelledAt: now }),
      updatedAt: now,
    }).where(and(
      eq(orders.reference, reference),
      eq(orders.status, "pending"),
    )).returning();
    if (!order) return;
    const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    for (const item of items) {
      const [product] = await tx.update(products)
        .set({
          stockReserved: sql`CASE WHEN ${products.stockOnHand} = -1 THEN ${products.stockReserved} ELSE GREATEST(0, ${products.stockReserved} - ${item.quantity}) END`,
          updatedAt: new Date(),
        })
        .where(eq(products.id, item.productId))
        .returning();
      if (!product) continue;
      if (isUnlimitedStock(product.stockOnHand)) continue;
      await tx.insert(inventoryEvents).values({ productId: item.productId, orderId: order.id, type: "reservation_release", quantityChange: 0, stockAfter: product.stockOnHand, note: `Released ${item.quantity} reserved units` });
    }
  });
};

export const completePaidOrder = async (reference: string, paymentReference: string) => {
  const db = getDb();
  const completed = await db.transaction(async (tx) => {
    const now = new Date();
    const [claimedOrder] = await tx.update(orders).set({
      status: "paid",
      paymentReference,
      paidAt: now,
      updatedAt: now,
    }).where(and(
      eq(orders.reference, reference),
      eq(orders.status, "pending"),
    )).returning();
    if (!claimedOrder) {
      const [existing] = await tx.select().from(orders).where(eq(orders.reference, reference)).limit(1);
      if (!existing) throw new Error("Order not found");
      if (["paid", "processing", "shipped", "fulfilled"].includes(existing.status))
        return { order: existing, changed: false, lowStock: [] };
      throw new Error("Order cannot be paid in its current state");
    }
    const order = claimedOrder;
    const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    const lowStock: { id: string; name: string; stock: number; threshold: number }[] = [];
    for (const item of items) {
      const [product] = await tx.update(products).set({
        stockOnHand: sql`CASE WHEN ${products.stockOnHand} = -1 THEN -1 ELSE ${products.stockOnHand} - ${item.quantity} END`,
        stockReserved: sql`CASE WHEN ${products.stockOnHand} = -1 THEN ${products.stockReserved} ELSE GREATEST(0, ${products.stockReserved} - ${item.quantity}) END`,
        updatedAt: new Date(),
      }).where(and(
        eq(products.id, item.productId),
        sql`${products.stockOnHand} = -1 OR ${products.stockOnHand} >= ${item.quantity}`,
      )).returning();
      if (!product) throw new Error("Inventory reconciliation failed");
      if (isUnlimitedStock(product.stockOnHand)) continue;
      await tx.insert(inventoryEvents).values({ productId: product.id, orderId: order.id, type: "sale", quantityChange: -item.quantity, stockAfter: product.stockOnHand, note: reference });
      if (product.stockOnHand <= product.lowStockThreshold && !product.lowStockAlertedAt) {
        lowStock.push({ id: product.id, name: product.name, stock: product.stockOnHand, threshold: product.lowStockThreshold });
        await tx.update(products).set({ lowStockAlertedAt: new Date() }).where(eq(products.id, product.id));
      }
    }

    const ticketEvents = items.length
      ? await tx.select().from(events).where(inArray(events.ticketProductId, items.map((item) => item.productId)))
      : [];
    if (ticketEvents.length > 0) {
      const normalizedEmail = order.customerEmail.trim().toLowerCase();
      const [member] = await tx.insert(communityMembers).values({
        email: normalizedEmail,
        name: order.customerName,
        phone: order.customerPhone,
        lastEventAt: new Date(),
      }).onConflictDoUpdate({
        target: communityMembers.email,
        set: {
          name: order.customerName,
          phone: order.customerPhone,
          lastEventAt: new Date(),
        },
      }).returning();

      for (const communityEvent of ticketEvents) {
        const ticketItem = items.find((item) => item.productId === communityEvent.ticketProductId);
        if (!ticketItem) continue;
        await tx.insert(eventAttendees).values({
          eventId: communityEvent.id,
          memberId: member.id,
          orderId: order.id,
          ticketQuantity: ticketItem.quantity,
        }).onConflictDoNothing();
      }
    }
    if (order.discountCode) await tx.update(discounts).set({ usedCount: sql`${discounts.usedCount} + 1` }).where(eq(discounts.code, order.discountCode));
    return { order, changed: true, lowStock };
  });

  if (completed.changed) {
    await Promise.allSettled([
      sendOrderConfirmation(completed.order),
      ...completed.lowStock.map((product) => sendLowStockAlert(product.name, product.stock, product.threshold)),
    ]);
  }
  return completed.order;
};

export const expireReservations = async () => {
  const db = getDb();
  const expired = await db.select({ reference: orders.reference }).from(orders).where(and(eq(orders.status, "pending"), lte(orders.reservationExpiresAt, new Date())));
  for (const order of expired) await releasePendingOrder(order.reference, "cancelled");
  return expired.length;
};
