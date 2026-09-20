import type { Product } from "@/lib/db/schema";
import { getLinePricing, getPackOptions, hasPackOptions } from "@/lib/product-pricing";

export type CartConfiguration = { giftBoxContents?: string[] };
export type CartItem = {
  product: Product;
  quantity: number;
  configuration?: CartConfiguration;
};
export type CartRequestItem = {
  productId: string;
  quantity: number;
  configuration?: CartConfiguration;
};

const availableStock = (product: Product) =>
  Math.max(0, product.stockOnHand - product.stockReserved);

const acceptedQuantity = (product: Product, quantity: number) => {
  if (!Number.isInteger(quantity) || quantity < 1) return null;
  const available = availableStock(product);
  if (hasPackOptions(product)) {
    const valid = getPackOptions(product).some((option) => option.quantity === quantity);
    return valid && quantity <= available ? quantity : null;
  }
  return Math.min(20, available, quantity) || null;
};

export const getCartUnitCount = (items: Pick<CartItem, "quantity">[]) =>
  items.reduce((total, item) => total + item.quantity, 0);

export function mergeCartItems(current: CartItem[], incomingItems: CartItem[]) {
  return incomingItems.reduce<CartItem[]>((next, incoming) => {
    const existing = next.find((item) => item.product.id === incoming.product.id);
    const requested = hasPackOptions(incoming.product)
      ? incoming.quantity
      : (existing?.quantity ?? 0) + incoming.quantity;
    const quantity = acceptedQuantity(incoming.product, requested);
    if (quantity === null) return next;
    if (!existing) return [...next, { ...incoming, quantity }];
    return next.map((item) =>
      item.product.id === incoming.product.id
        ? {
            ...item,
            product: incoming.product,
            quantity,
            configuration: incoming.configuration ?? item.configuration,
          }
        : item,
    );
  }, current);
}

export function createCartQuote(
  catalog: Product[],
  requestedItems: CartRequestItem[],
) {
  const requestedIds = new Set(requestedItems.map((item) => item.productId));
  if (requestedIds.size !== requestedItems.length)
    throw new Error("Each product can appear only once in your basket");

  const byId = new Map(catalog.map((product) => [product.id, product]));
  const items = requestedItems.map((requested) => {
    const product = byId.get(requested.productId);
    if (!product?.active) throw new Error("One or more products are unavailable");
    const pricing = getLinePricing(product, requested.quantity);
    if (availableStock(product) < requested.quantity)
      throw new Error(`${product.name} does not have enough stock`);
    return {
      product,
      quantity: requested.quantity,
      configuration: requested.configuration,
      lineTotal: pricing.total,
      label: pricing.label,
    };
  });

  return {
    items,
    subtotal: items.reduce((total, item) => total + item.lineTotal, 0),
  };
}
