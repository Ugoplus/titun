import { describe, expect, it } from "vitest";
import {
  checkoutSchema,
  eventSchema,
  freeEventRegistrationSchema,
} from "./validation";

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

  it("accepts a Discovery Gift Box matching its selected size", () => {
    const result = checkoutSchema.safeParse({
      ...validCheckout,
      paymentProvider: "paystack",
      items: [{
        productId: "11111111-1111-4111-8111-111111111111",
        quantity: 1,
        configuration: {
          giftBoxSize: 50,
          giftBoxContents: [
            { item: "Green Tea towel", quantity: 30 },
            { item: "Sandalwood towel", quantity: 20 },
          ],
        },
      }],
    });

    expect(result.success).toBe(true);
  });

  it("rejects incomplete or duplicate gift-box selections", () => {
    const parse = (giftBoxContents: unknown[], giftBoxSize: number = 25) => checkoutSchema.safeParse({
      ...validCheckout,
      paymentProvider: "stripe",
      items: [{
        productId: "11111111-1111-4111-8111-111111111111",
        quantity: 1,
        configuration: { giftBoxSize, giftBoxContents },
      }],
    }).success;

    expect(parse([{ item: "Green Tea towel", quantity: 24 }])).toBe(false);
    expect(parse([
      { item: "Green Tea towel", quantity: 10 },
      { item: "Green Tea towel", quantity: 15 },
    ])).toBe(false);
    expect(parse([{ item: "Green Tea towel", quantity: 25 }], 30)).toBe(false);
    expect(parse([{ item: "Green Tea wet wipes", quantity: 25 }])).toBe(false);
  });

  it("accepts the matching-wipes add-on inside a complete gift box", () => {
    const result = checkoutSchema.safeParse({
      ...validCheckout,
      paymentProvider: "paystack",
      items: [{
        productId: "11111111-1111-4111-8111-111111111111",
        quantity: 1,
        configuration: {
          giftBoxSize: 25,
          giftBoxContents: [{ item: "Green Tea towel", quantity: 25 }],
          giftBoxWipeAddOn: true,
        },
      }],
    });

    expect(result.success).toBe(true);
  });
});

describe("eventSchema", () => {
  const validEvent = {
    title: "The Renewal Table",
    slug: "the-renewal-table",
    description: "A considered afternoon of conversation, dining and everyday renewal.",
    story: "A longer editorial account of the gathering, the intention behind it and what guests can expect when they arrive.\n\nThe afternoon makes room for conversation, food and an unhurried ritual of renewal.",
    venue: "Lagos",
    startsAt: "2026-10-24T13:00:00+01:00",
    image: "/uploads/event-cover.jpg",
    galleryImages: ["/uploads/event-one.jpg", "/uploads/event-two.jpg"],
    videoUrl: "/uploads/event-film.mp4",
    registrationUrl: "https://tickets.example.com/titun",
    ctaLabel: "Join us",
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

  it("supports both free and paid events", () => {
    expect(eventSchema.safeParse({ ...validEvent, ticketPrice: 0 }).success).toBe(true);
    expect(eventSchema.safeParse({ ...validEvent, ticketPrice: 3_500_000 }).success).toBe(true);
  });

  it("requires a substantial event story", () => {
    expect(eventSchema.safeParse({ ...validEvent, story: "Too short." }).success).toBe(false);
  });

  it("accepts optional event archive media and registration details", () => {
    expect(eventSchema.safeParse(validEvent).success).toBe(true);
  });

  it("rejects unsafe registration URLs and oversized galleries", () => {
    expect(eventSchema.safeParse({ ...validEvent, registrationUrl: "javascript:alert(1)" }).success).toBe(false);
    expect(eventSchema.safeParse({
      ...validEvent,
      galleryImages: Array.from({ length: 13 }, (_, index) => `/uploads/${index}.jpg`),
    }).success).toBe(false);
  });
});

describe("freeEventRegistrationSchema", () => {
  it("accepts a complete free-event registration", () => {
    expect(freeEventRegistrationSchema.safeParse({
      name: "TITUN Guest",
      email: "guest@example.com",
      phone: "+2348000000000",
      quantity: 2,
    }).success).toBe(true);
  });

  it("rejects excessive quantities and invalid contact details", () => {
    expect(freeEventRegistrationSchema.safeParse({
      name: "T",
      email: "not-an-email",
      phone: "12",
      quantity: 21,
    }).success).toBe(false);
  });
});
