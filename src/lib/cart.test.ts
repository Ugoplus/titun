import { describe, expect, it } from "vitest";
import type { Product } from "@/lib/db/schema";
import { createCartQuote, getCartUnitCount, mergeCartItems } from "./cart";
import type { GiftBoxSelection } from "./gift-box";

const product = (overrides: Partial<Product> = {}): Product => ({
  id: "11111111-1111-4111-8111-111111111111",
  slug: "discovery-box",
  name: "Discovery Box",
  scent: "Signature collection",
  description: "A considered collection of TITUN essentials.",
  category: "Boxes and multipacks",
  packSize: "One gift box",
  price: 1_000,
  currency: "NGN",
  stockOnHand: 5,
  stockReserved: 0,
  lowStockThreshold: 1,
  lowStockAlertedAt: null,
  images: [],
  featured: false,
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe("cart totals", () => {
  it("counts units instead of product lines", () => {
    expect(getCartUnitCount([
      { quantity: 2 },
      { quantity: 3 },
    ])).toBe(5);
  });
});

describe("cart merging", () => {
  it("refreshes stale product data and never exceeds available stock", () => {
    const stale = product({ price: 500, stockOnHand: 20 });
    const current = product({ price: 1_000, stockOnHand: 3 });
    const merged = mergeCartItems(
      [{ product: stale, quantity: 2 }],
      [{ product: current, quantity: 2 }],
    );

    expect(merged[0].product.price).toBe(1_000);
    expect(merged[0].quantity).toBe(3);
  });

  it("does not add an unavailable recommendation", () => {
    expect(mergeCartItems([], [{ product: product({ stockOnHand: 0 }), quantity: 1 }])).toEqual([]);
  });

  it("only adds a Discovery Gift Box with a complete 25-piece configuration", () => {
    const giftBox = product({ slug: "titun-discovery-gift-box" });
    const complete: GiftBoxSelection[] = [
      { item: "Green Tea towel", quantity: 15 },
      { item: "Lemongrass towel", quantity: 10 },
    ];

    expect(mergeCartItems([], [{ product: giftBox, quantity: 1 }])).toEqual([]);
    expect(mergeCartItems([], [{
      product: giftBox,
      quantity: 1,
      configuration: { giftBoxSize: 25, giftBoxContents: complete },
    }])).toHaveLength(1);
  });

  it("adds one 25-piece wipe upsell only alongside a Discovery Gift Box", () => {
    const giftBox = product({ slug: "titun-discovery-gift-box" });
    const wipe = product({
      id: "22222222-2222-4222-8222-222222222222",
      slug: "green-tea-refreshing-wipes",
      category: "Refreshing wet wipes",
      price: 50_000,
      stockOnHand: 100,
    });
    const boxItem = {
      product: giftBox,
      quantity: 1,
      configuration: {
        giftBoxSize: 25 as const,
        giftBoxContents: [{ item: "Green Tea towel" as const, quantity: 25 }],
      },
    };
    const upsell = {
      product: wipe,
      quantity: 25,
      configuration: { giftBoxUpsell: true as const },
    };

    const boxRequest = {
      productId: boxItem.product.id,
      quantity: boxItem.quantity,
      configuration: boxItem.configuration,
    };
    const upsellRequest = {
      productId: upsell.product.id,
      quantity: upsell.quantity,
      configuration: upsell.configuration,
    };

    expect(() => createCartQuote([wipe], [upsellRequest])).toThrow("Discovery Gift Box");
    expect(createCartQuote([giftBox, wipe], [boxRequest, upsellRequest]).subtotal).toBe(6_250_000);
  });
});

describe("canonical cart quote", () => {
  it("uses current server product prices", () => {
    const current = product({ price: 2_500 });
    const quote = createCartQuote([current], [{ productId: current.id, quantity: 2 }]);

    expect(quote.subtotal).toBe(5_000);
    expect(quote.items[0].product.price).toBe(2_500);
  });

  it("rejects unavailable quantities", () => {
    const current = product({ stockOnHand: 1 });
    expect(() => createCartQuote([current], [{ productId: current.id, quantity: 2 }]))
      .toThrow("does not have enough stock");
  });

  it("rejects an incomplete Discovery Gift Box before checkout", () => {
    const giftBox = product({ slug: "titun-discovery-gift-box" });
    expect(() => createCartQuote([giftBox], [{
      productId: giftBox.id,
      quantity: 1,
      configuration: {
        giftBoxSize: 25,
        giftBoxContents: [{ item: "Green Tea towel", quantity: 24 }],
      },
    }])).toThrow("exactly 25, 50 or 100 towels");
  });
});
