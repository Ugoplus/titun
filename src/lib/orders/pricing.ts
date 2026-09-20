export type PricedItem = {
  productId: string;
  unitPrice: number;
  quantity: number;
};

export type Discount = {
  type: "percentage" | "fixed";
  value: number;
};

export const assertExpectedTotal = (actual: number, expected: number) => {
  if (actual !== expected)
    throw new Error("Your basket total changed. Review the updated amount and try again.");
};

export const calculateOrder = (
  items: PricedItem[],
  discount?: Discount | null,
  deliveryFee = 0,
) => {
  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) {
      throw new Error("Quantity must be between 1 and 100");
    }
  }
  if (!Number.isInteger(deliveryFee) || deliveryFee < 0) {
    throw new Error("Delivery fee must be a non-negative whole number");
  }

  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const rawDiscount = discount
    ? discount.type === "percentage"
      ? Math.round(subtotal * (discount.value / 100))
      : discount.value
    : 0;
  const discountAmount = Math.min(Math.max(rawDiscount, 0), subtotal);

  return {
    subtotal,
    discount: discountAmount,
    deliveryFee,
    total: subtotal - discountAmount + deliveryFee,
  };
};
