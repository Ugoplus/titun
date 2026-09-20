export const DISCOVERY_GIFT_BOX_SLUG = "titun-discovery-gift-box";
export const GIFT_BOX_SIZES = [25, 50, 100] as const;
export const GIFT_BOX_ITEMS = [
  "Green Tea towel",
  "Lemongrass towel",
  "Sandalwood towel",
] as const;
export const GIFT_BOX_WIPE_ADD_ON_PRICE = 1_250_000;

export type GiftBoxSize = (typeof GIFT_BOX_SIZES)[number];
export type GiftBoxItem = (typeof GIFT_BOX_ITEMS)[number];
export type GiftBoxSelection = {
  item: GiftBoxItem;
  quantity: number;
};
export type GiftBoxCartConfiguration = {
  giftBoxSize?: GiftBoxSize;
  giftBoxContents?: GiftBoxSelection[];
  giftBoxWipeAddOn?: true;
};

const giftBoxPrices: Record<GiftBoxSize, number> = {
  25: 5_000_000,
  50: 10_000_000,
  100: 18_000_000,
};

const isGiftBoxItem = (value: unknown): value is GiftBoxItem =>
  typeof value === "string" && GIFT_BOX_ITEMS.includes(value as GiftBoxItem);

export const isGiftBoxSize = (value: unknown): value is GiftBoxSize =>
  GIFT_BOX_SIZES.includes(value as GiftBoxSize);

export const isDiscoveryGiftBox = (product: { slug?: string }) =>
  product.slug === DISCOVERY_GIFT_BOX_SLUG;

export const getGiftBoxPrice = (size: GiftBoxSize) => giftBoxPrices[size];

export const getGiftBoxTotal = (contents: GiftBoxSelection[]) =>
  contents.reduce((total, selection) => total + selection.quantity, 0);

export const getGiftBoxRemaining = (
  contents: GiftBoxSelection[],
  size: GiftBoxSize,
) => Math.max(0, size - getGiftBoxTotal(contents));

export const isCompleteGiftBox = (
  contents: GiftBoxSelection[] | undefined,
  size: GiftBoxSize | undefined,
) => {
  if (!contents?.length || !size) return false;
  const uniqueItems = new Set(contents.map(({ item }) => item));
  return (
    uniqueItems.size === contents.length &&
    contents.every(
      ({ item, quantity }) =>
        isGiftBoxItem(item) &&
        Number.isInteger(quantity) &&
        quantity > 0 &&
        quantity <= size,
    ) &&
    getGiftBoxTotal(contents) === size
  );
};

export function adjustGiftBoxQuantity(
  contents: GiftBoxSelection[],
  item: GiftBoxItem,
  change: -1 | 1,
  size: GiftBoxSize,
) {
  const currentQuantity =
    contents.find((selection) => selection.item === item)?.quantity ?? 0;
  if (change > 0 && getGiftBoxTotal(contents) >= size) return contents;

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

export function setGiftBoxItemQuantity(
  contents: GiftBoxSelection[],
  item: GiftBoxItem,
  requestedQuantity: number,
  size: GiftBoxSize,
) {
  const otherTotal = contents.reduce(
    (total, selection) =>
      selection.item === item ? total : total + selection.quantity,
    0,
  );
  const quantity = Math.max(
    0,
    Math.min(size - otherTotal, Math.floor(requestedQuantity || 0)),
  );
  return GIFT_BOX_ITEMS.flatMap((option) => {
    if (option === item) return quantity ? [{ item, quantity }] : [];
    const current = contents.find((selection) => selection.item === option);
    return current ? [current] : [];
  });
}

const legacyToTowel = (value: string) => {
  const candidate = value.replace(" wet wipes", " towel");
  return isGiftBoxItem(candidate) ? candidate : null;
};

export function migrateLegacyGiftBoxContents(values: string[]) {
  const items = [...new Set(values.map(legacyToTowel).filter(isGiftBoxItem))];
  if (!items.length) return [];
  const baseQuantity = Math.floor(25 / items.length);
  const remainder = 25 % items.length;
  return items.map((item, index) => ({
    item,
    quantity: baseQuantity + (index < remainder ? 1 : 0),
  }));
}

export function normalizeStoredGiftBoxContents(
  value: unknown,
  requestedSize: unknown = 25,
): GiftBoxSelection[] {
  if (!Array.isArray(value)) return [];
  if (value.every((item) => typeof item === "string"))
    return migrateLegacyGiftBoxContents(value);

  const quantities = new Map<GiftBoxItem, number>();
  for (const entry of value) {
    if (
      typeof entry !== "object" ||
      entry === null ||
      !("item" in entry) ||
      !("quantity" in entry) ||
      typeof entry.item !== "string" ||
      !Number.isInteger(entry.quantity) ||
      Number(entry.quantity) < 1
    ) continue;
    const item = legacyToTowel(entry.item);
    if (item)
      quantities.set(item, (quantities.get(item) ?? 0) + Number(entry.quantity));
  }
  const contents = GIFT_BOX_ITEMS.flatMap((item) => {
    const quantity = quantities.get(item);
    return quantity ? [{ item, quantity }] : [];
  });
  const size = isGiftBoxSize(requestedSize) ? requestedSize : 25;
  return isCompleteGiftBox(contents, size) ? contents : [];
}

export const formatGiftBoxContents = (contents: GiftBoxSelection[]) =>
  contents.map(({ item, quantity }) => `${quantity} × ${item}`).join(", ");

export function assertCompleteGiftBox(
  product: { slug?: string },
  configuration: GiftBoxCartConfiguration | undefined,
) {
  if (
    isDiscoveryGiftBox(product) &&
    !isCompleteGiftBox(
      configuration?.giftBoxContents,
      configuration?.giftBoxSize,
    )
  ) {
    throw new Error(
      "Choose exactly 25, 50 or 100 towels for your Discovery Gift Box",
    );
  }
}
