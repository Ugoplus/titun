import { describe, expect, it } from "vitest";
import { checkoutSchema, eventSchema } from "./validation";

const validCheckout = {
  customer: { name: "TITUN Customer", email: "customer@example.com", phone: "+2348000000000", address: "12 Sample Street", city: "Lagos" },
  items: [{ productId: "11111111-1111-4111-8111-111111111111", quantity: 1 }],
  expectedSubtotal: 100_000,
};

describe("checkoutSchema payment providers", () => {
  it.each(["paystack", "stripe"])("accepts %s", (paymentProvider) => {
    expect(checkoutSchema.safeParse({ ...validCheckout, paymentProvider }).success).toBe(true);
  });

  it("rejects an unknown payment provider", () => {
    expect(checkoutSchema.safeParse({ ...validCheckout, paymentProvider: "other" }).success).toBe(false);
  });

  it("requires a positive displayed total", () => {
    expect(checkoutSchema.safeParse({ ...validCheckout, paymentProvider: "stripe", expectedSubtotal: 100_000 }).success).toBe(true);
    expect(checkoutSchema.safeParse({ ...validCheckout, paymentProvider: "stripe", expectedSubtotal: 0 }).success).toBe(false);
  });

  it("accepts a Discovery Gift Box containing exactly 25 pieces", () => {
    const result = checkoutSchema.safeParse({
      ...validCheckout,
      paymentProvider: "paystack",
      items: [{
        productId: "11111111-1111-4111-8111-111111111111",
        quantity: 1,
        configuration: {
          giftBoxContents: [
            { item: "Green Tea towel", quantity: 15 },
            { item: "Sandalwood wet wipes", quantity: 10 },
          ],
        },
      }],
    });

    expect(result.success).toBe(true);
  });

  it("rejects incomplete or duplicate gift-box selections", () => {
    const parse = (giftBoxContents: unknown[]) => checkoutSchema.safeParse({
      ...validCheckout,
      paymentProvider: "stripe",
      items: [{
        productId: "11111111-1111-4111-8111-111111111111",
        quantity: 1,
        configuration: { giftBoxContents },
      }],
    }).success;

    expect(parse([{ item: "Green Tea towel", quantity: 24 }])).toBe(false);
    expect(parse([
      { item: "Green Tea towel", quantity: 10 },
      { item: "Green Tea towel", quantity: 15 },
    ])).toBe(false);
  });
});

describe("eventSchema", () => {
  const validEvent = {
    title: "The Renewal Table",
    slug: "the-renewal-table",
    description: "A considered afternoon of conversation, dining and everyday renewal.",
    venue: "Lagos",
    startsAt: "2026-10-24T13:00:00+01:00",
    ticketPrice: 3500000,
    capacity: 40,
    lowStockThreshold: 5,
    recommendedProductIds: ["11111111-1111-4111-8111-111111111111"],
    published: true,
  };

  it("accepts a complete community event", () => {
    expect(eventSchema.safeParse(validEvent).success).toBe(true);
  });

  it("rejects an invalid event capacity", () => {
    expect(eventSchema.safeParse({ ...validEvent, capacity: 0 }).success).toBe(false);
  });
});
