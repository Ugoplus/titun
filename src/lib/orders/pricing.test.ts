import { describe, expect, it } from "vitest";
import { assertExpectedTotal, calculateOrder } from "./pricing";

describe("calculateOrder", () => {
  it("uses server prices and applies a percentage discount", () => {
    const result = calculateOrder(
      [
        { productId: "a", unitPrice: 2500, quantity: 2 },
        { productId: "b", unitPrice: 4000, quantity: 1 },
      ],
      { type: "percentage", value: 10 },
    );

    expect(result).toEqual({ subtotal: 9000, discount: 900, deliveryFee: 0, total: 8100 });
  });

  it("never lets a fixed discount make the total negative", () => {
    expect(
      calculateOrder(
        [{ productId: "a", unitPrice: 1000, quantity: 1 }],
        { type: "fixed", value: 5000 },
      ).total,
    ).toBe(0);
  });

  it("adds delivery after applying the product discount", () => {
    expect(
      calculateOrder(
        [{ productId: "a", unitPrice: 10_000, quantity: 1 }],
        { type: "percentage", value: 10 },
        2_500,
      ),
    ).toEqual({
      subtotal: 10_000,
      discount: 1_000,
      deliveryFee: 2_500,
      total: 11_500,
    });
  });

  it("rejects invalid delivery fees", () => {
    expect(() =>
      calculateOrder(
        [{ productId: "a", unitPrice: 1000, quantity: 1 }],
        null,
        -1,
      ),
    ).toThrow("Delivery fee");
  });

  it("rejects invalid quantities", () => {
    expect(() =>
      calculateOrder([{ productId: "a", unitPrice: 1000, quantity: 0 }]),
    ).toThrow("Quantity must be between 1 and 100");
  });

  it("stops checkout when the displayed total is stale", () => {
    expect(() => assertExpectedTotal(12_000, 10_000)).toThrow(
      "Your basket total changed",
    );
    expect(() => assertExpectedTotal(12_000, 12_000)).not.toThrow();
  });
});
