import type { Product } from "@/lib/db/schema";
import {
  assertCompleteGiftBox,
  isCompleteGiftBox,
  isDiscoveryGiftBox,
  type GiftBoxCartConfiguration,
} from "@/lib/gift-box";
import {
  getConfiguredLinePricing,
  getPackOptions,
  hasPackOptions,
} from "@/lib/product-pricing";

export type CartConfiguration = GiftBoxCartConfiguration;
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

const acceptedQuantity = (
  product: Product,
  quantity: number,
) => {
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

export const removeCartItem = (items: CartItem[], productId: string) =>
  items.filter((item) => item.product.id !== productId);

export function mergeCartItems(current: CartItem[], incomingItems: CartItem[]) {
  const replacesGiftBox = incomingItems.some(({ product }) =>
    isDiscoveryGiftBox(product)
  );
  const startingItems = replacesGiftBox
    ? current.filter((item) => !isDiscoveryGiftBox(item.product))
    : current;
  return incomingItems.reduce<CartItem[]>((next, incoming) => {
    if (
      isDiscoveryGiftBox(incoming.product) &&
      !isCompleteGiftBox(
        incoming.configuration?.giftBoxContents,
        incoming.configuration?.giftBoxSize,
      )
    ) return next;
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
            configuration: incoming.configuration,
          }
        : item,
    );
  }, startingItems);
}

function assertCartRelationships(
  catalog: Product[],
  requestedItems: CartRequestItem[],
) {
  const byId = new Map(catalog.map((product) => [product.id, product]));
  for (const requested of requestedItems) {
    const product = byId.get(requested.productId);
    if (!product) throw new Error("One or more products are unavailable");
    assertCompleteGiftBox(product, requested.configuration);
    if (
      !isDiscoveryGiftBox(product) &&
      (requested.configuration?.giftBoxSize ||
        requested.configuration?.giftBoxContents ||
        requested.configuration?.giftBoxWipeAddOn)
    ) throw new Error("Choose a valid Discovery Gift Box configuration");
  }
}

export function createCartQuote(
  catalog: Product[],
  requestedItems: CartRequestItem[],
) {
  const requestedIds = new Set(requestedItems.map((item) => item.productId));
  if (requestedIds.size !== requestedItems.length)
    throw new Error("Each product can appear only once in your basket");

  const byId = new Map(catalog.map((product) => [product.id, product]));
  assertCartRelationships(catalog, requestedItems);
  const items = requestedItems.map((requested) => {
    const product = byId.get(requested.productId);
    if (!product?.active) throw new Error("One or more products are unavailable");
    const pricing = getConfiguredLinePricing(
      product,
      requested.quantity,
      requested.configuration,
    );
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
