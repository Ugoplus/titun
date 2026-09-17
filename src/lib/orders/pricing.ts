export type PricedItem = {
  productId: string;
  unitPrice: number;
  quantity: number;
};

export type Discount = {
  type: "percentage" | "fixed";
  value: number;
};

export const calculateOrder = (items: PricedItem[], discount?: Discount | null) => {
  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) {
      throw new Error("Quantity must be between 1 and 100");
    }
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
    total: subtotal - discountAmount,
  };
};
