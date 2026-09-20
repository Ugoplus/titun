export const DISCOVERY_GIFT_BOX_SLUG = "titun-discovery-gift-box";
export const GIFT_BOX_SIZE = 25;
export const GIFT_BOX_ITEMS = [
  "Green Tea towel",
  "Lemongrass towel",
  "Sandalwood towel",
  "Green Tea wet wipes",
  "Lemongrass wet wipes",
  "Sandalwood wet wipes",
] as const;

export type GiftBoxItem = (typeof GIFT_BOX_ITEMS)[number];
export type GiftBoxSelection = {
  item: GiftBoxItem;
  quantity: number;
};

const isGiftBoxItem = (value: unknown): value is GiftBoxItem =>
  typeof value === "string" &&
  GIFT_BOX_ITEMS.includes(value as GiftBoxItem);

export const isDiscoveryGiftBox = (product: { slug: string }) =>
  product.slug === DISCOVERY_GIFT_BOX_SLUG;

export const getGiftBoxTotal = (contents: GiftBoxSelection[]) =>
  contents.reduce((total, selection) => total + selection.quantity, 0);

export const getGiftBoxRemaining = (contents: GiftBoxSelection[]) =>
  Math.max(0, GIFT_BOX_SIZE - getGiftBoxTotal(contents));

export const isCompleteGiftBox = (contents: GiftBoxSelection[] | undefined) => {
  if (!contents?.length) return false;
  const uniqueItems = new Set(contents.map(({ item }) => item));
  return (
    uniqueItems.size === contents.length &&
    contents.every(
      ({ item, quantity }) =>
        isGiftBoxItem(item) &&
        Number.isInteger(quantity) &&
        quantity > 0 &&
        quantity <= GIFT_BOX_SIZE,
    ) &&
    getGiftBoxTotal(contents) === GIFT_BOX_SIZE
  );
};

export function adjustGiftBoxQuantity(
  contents: GiftBoxSelection[],
  item: GiftBoxItem,
  change: -1 | 1,
) {
  const currentQuantity =
    contents.find((selection) => selection.item === item)?.quantity ?? 0;
  if (change > 0 && getGiftBoxTotal(contents) >= GIFT_BOX_SIZE)
    return contents;

  const nextQuantity = Math.max(0, currentQuantity + change);
  const quantities = new Map(
    contents.map((selection) => [selection.item, selection.quantity]),
  );
  if (nextQuantity === 0) quantities.delete(item);
  else quantities.set(item, nextQuantity);

  return GIFT_BOX_ITEMS.flatMap((option) => {
    const quantity = quantities.get(option);
    return quantity ? [{ item: option, quantity }] : [];
  });
}

export function migrateLegacyGiftBoxContents(values: string[]) {
  const items = [...new Set(values.filter(isGiftBoxItem))];
  if (!items.length) return [];
  const baseQuantity = Math.floor(GIFT_BOX_SIZE / items.length);
  const remainder = GIFT_BOX_SIZE % items.length;
  return items.map((item, index) => ({
    item,
    quantity: baseQuantity + (index < remainder ? 1 : 0),
  }));
}

export function normalizeStoredGiftBoxContents(
  value: unknown,
): GiftBoxSelection[] {
  if (!Array.isArray(value)) return [];
  if (value.every((item) => typeof item === "string"))
    return migrateLegacyGiftBoxContents(value);
  const contents = value.flatMap((entry): GiftBoxSelection[] => {
    if (
      typeof entry !== "object" ||
      entry === null ||
      !("item" in entry) ||
      !("quantity" in entry) ||
      !isGiftBoxItem(entry.item) ||
      !Number.isInteger(entry.quantity) ||
      Number(entry.quantity) < 1
    ) return [];
    return [{ item: entry.item, quantity: Number(entry.quantity) }];
  });
  return isCompleteGiftBox(contents) ? contents : [];
}

export const formatGiftBoxContents = (contents: GiftBoxSelection[]) =>
  contents
    .map(({ item, quantity }) => `${quantity} × ${item}`)
    .join(", ");

export function assertCompleteGiftBox(
  product: { slug: string },
  contents: GiftBoxSelection[] | undefined,
) {
  if (isDiscoveryGiftBox(product) && !isCompleteGiftBox(contents))
    throw new Error("Choose exactly 25 pieces for your Discovery Gift Box");
}
