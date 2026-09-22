import { describe, expect, it } from "vitest";
import type { Product } from "@/lib/db/schema";
import {
  availableStock,
  hasAvailableStock,
  isUnlimitedStock,
} from "./inventory";

const inventory = (
  stockOnHand: number,
  stockReserved = 0,
): Pick<Product, "stockOnHand" | "stockReserved"> => ({
  stockOnHand,
  stockReserved,
});

describe("inventory availability", () => {
  it("treats minus one as unlimited stock", () => {
    const product = inventory(-1, 0);

    expect(isUnlimitedStock(product.stockOnHand)).toBe(true);
    expect(availableStock(product)).toBe(Number.POSITIVE_INFINITY);
    expect(hasAvailableStock(product, 1_000_000)).toBe(true);
  });

  it("continues to enforce finite inventory", () => {
    const product = inventory(10, 3);

    expect(isUnlimitedStock(product.stockOnHand)).toBe(false);
    expect(availableStock(product)).toBe(7);
    expect(hasAvailableStock(product, 7)).toBe(true);
    expect(hasAvailableStock(product, 8)).toBe(false);
  });

  it("rejects invalid requested quantities", () => {
    const product = inventory(-1);

    expect(hasAvailableStock(product, 0)).toBe(false);
    expect(hasAvailableStock(product, -1)).toBe(false);
    expect(hasAvailableStock(product, 1.5)).toBe(false);
  });
});
