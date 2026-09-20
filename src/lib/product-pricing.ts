import type { Product } from "@/lib/db/schema";
import {
  GIFT_BOX_WIPE_ADD_ON_PRICE,
  getGiftBoxPrice,
  isCompleteGiftBox,
  isDiscoveryGiftBox,
  type GiftBoxCartConfiguration,
} from "@/lib/gift-box";

export type PackOption = {
  quantity: number;
  total: number;
  label: string;
  note?: string;
};

export function isRefreshingTowel(product: Pick<Product, "category">) {
  return product.category === "Refreshing towels" || product.category === "Individual towels";
}

export function isRefreshingWipe(product: Pick<Product, "category">) {
  return product.category === "Refreshing wet wipes";
}

export function hasPackOptions(product: Pick<Product, "category">) {
  return isRefreshingTowel(product) || isRefreshingWipe(product);
}

export function getTowelPackOptions(bestValueUnitPrice: number): PackOption[] {
  const standardUnitPrice = Math.round(bestValueUnitPrice / 0.9 / 100) * 100;
  const fullPrice = standardUnitPrice * 100;
  const bestValueTotal = bestValueUnitPrice * 100;
  const saving = fullPrice - bestValueTotal;

  return [
    { quantity: 25, total: standardUnitPrice * 25, label: "25 pieces" },
    { quantity: 50, total: standardUnitPrice * 50, label: "50 pieces" },
    {
      quantity: 100,
      total: bestValueTotal,
      label: "100 pieces",
      note: `Best value · Save ₦${Math.round(saving / 100).toLocaleString("en-NG")}`,
    },
  ];
}

export function getPackOptions(product: Pick<Product, "category" | "price" | "packSize">) {
  if (isRefreshingTowel(product)) return getTowelPackOptions(product.price);
  if (isRefreshingWipe(product)) {
    return [50, 100, 200].map((quantity) => ({
      quantity,
      total: product.price * quantity,
      label: `${quantity} wipes`,
      note: quantity === 50 ? "Minimum order" : undefined,
    }));
  }
  return [{ quantity: 1, total: product.price, label: product.packSize }];
}

export function getDefaultPurchaseQuantity(product: Pick<Product, "category">) {
  if (isRefreshingTowel(product)) return 25;
  if (isRefreshingWipe(product)) return 50;
  return 1;
}

export function getLinePricing(
  product: Pick<Product, "category" | "price" | "packSize">,
  quantity: number,
) {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Choose a valid quantity");
  }

  if (!hasPackOptions(product)) {
    return {
      total: product.price * quantity,
      unitPrice: product.price,
      label: quantity === 1 ? product.packSize : `${quantity} × ${product.packSize}`,
    };
  }

  const option = getPackOptions(product).find((candidate) => candidate.quantity === quantity);
  if (!option) throw new Error("Choose an available pack size");
  return {
    total: option.total,
    unitPrice: Math.round(option.total / option.quantity),
    label: option.label,
  };
}

export function getConfiguredLinePricing(
  product: Pick<Product, "slug" | "category" | "price" | "packSize">,
  quantity: number,
  configuration?: GiftBoxCartConfiguration,
) {
  if (isDiscoveryGiftBox(product)) {
    const size = configuration?.giftBoxSize;
    if (!size || !isCompleteGiftBox(configuration.giftBoxContents, size))
      throw new Error("Complete your Discovery Gift Box before checkout");
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20)
      throw new Error("Choose a valid quantity");
    const boxPrice =
      getGiftBoxPrice(size) +
      (configuration.giftBoxWipeAddOn ? GIFT_BOX_WIPE_ADD_ON_PRICE : 0);
    return {
      total: boxPrice * quantity,
      unitPrice: boxPrice,
      label: configuration.giftBoxWipeAddOn
        ? `${size}-piece custom gift box + 25 matching wet wipes`
        : `${size}-piece custom gift box`,
    };
  }

  return getLinePricing(product, quantity);
}

export function getAdjacentPackQuantity(
  product: Pick<Product, "category" | "price" | "packSize">,
  quantity: number,
  direction: -1 | 1,
) {
  const options = getPackOptions(product);
  const index = Math.max(0, options.findIndex((option) => option.quantity === quantity));
  return options[Math.max(0, Math.min(options.length - 1, index + direction))].quantity;
}
