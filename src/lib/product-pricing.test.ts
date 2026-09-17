import { describe, expect, it } from "vitest";
import type { Product } from "@/lib/db/schema";
import {
  getAdjacentPackQuantity,
  getDefaultPurchaseQuantity,
  getLinePricing,
  getPackOptions,
} from "./product-pricing";

const towel = {
  category: "Refreshing towels",
  price: 180_000,
  packSize: "25, 50 or 100 individually wrapped towels",
} as Product;

const wipe = {
  category: "Refreshing wet wipes",
  price: 50_000,
  packSize: "Minimum 50 wipes",
} as Product;

describe("refreshing towel pricing", () => {
  it("uses the confirmed client pack totals", () => {
    expect(getPackOptions(towel).map(({ quantity, total }) => ({ quantity, total }))).toEqual([
      { quantity: 25, total: 5_000_000 },
      { quantity: 50, total: 10_000_000 },
      { quantity: 100, total: 18_000_000 },
    ]);
  });

  it("returns the correct unit price for checkout", () => {
    expect(getLinePricing(towel, 25)).toMatchObject({
      total: 5_000_000,
      unitPrice: 200_000,
    });
    expect(getLinePricing(towel, 100)).toMatchObject({
      total: 18_000_000,
      unitPrice: 180_000,
    });
  });

  it("rejects quantities outside the available tiers", () => {
    expect(() => getLinePricing(towel, 30)).toThrow("Choose an available pack size");
  });

  it("moves between pack choices without leaving the valid range", () => {
    expect(getDefaultPurchaseQuantity(towel)).toBe(25);
    expect(getAdjacentPackQuantity(towel, 25, -1)).toBe(25);
    expect(getAdjacentPackQuantity(towel, 25, 1)).toBe(50);
    expect(getAdjacentPackQuantity(towel, 100, 1)).toBe(100);
  });
});

describe("refreshing wipe pricing", () => {
  it("charges ₦500 per wipe with a 50-piece minimum", () => {
    expect(getDefaultPurchaseQuantity(wipe)).toBe(50);
    expect(getPackOptions(wipe).map(({ quantity, total }) => ({ quantity, total }))).toEqual([
      { quantity: 50, total: 2_500_000 },
      { quantity: 100, total: 5_000_000 },
      { quantity: 200, total: 10_000_000 },
    ]);
  });

  it("rejects an order below the minimum", () => {
    expect(() => getLinePricing(wipe, 49)).toThrow("Choose an available pack size");
  });
});
