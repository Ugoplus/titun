import { describe, expect, it } from "vitest";
import {
  GIFT_BOX_SIZES,
  adjustGiftBoxQuantity,
  formatGiftBoxContents,
  getGiftBoxPrice,
  getGiftBoxRemaining,
  getGiftBoxTotal,
  isCompleteGiftBox,
  migrateLegacyGiftBoxContents,
  type GiftBoxSelection,
} from "./gift-box";

describe("Discovery Gift Box configuration", () => {
  it("tracks the selected and remaining piece counts", () => {
    const contents: GiftBoxSelection[] = [
      { item: "Green Tea towel", quantity: 10 },
      { item: "Sandalwood towel", quantity: 8 },
    ];

    expect(getGiftBoxTotal(contents)).toBe(18);
    expect(getGiftBoxRemaining(contents, 50)).toBe(32);
    expect(isCompleteGiftBox(contents, 50)).toBe(false);
  });

  it("prevents increments beyond the selected box size", () => {
    const almostFull: GiftBoxSelection[] = [
      { item: "Green Tea towel", quantity: 49 },
    ];
    const full = adjustGiftBoxQuantity(almostFull, "Lemongrass towel", 1, 50);

    expect(getGiftBoxTotal(full)).toBe(50);
    expect(adjustGiftBoxQuantity(full, "Sandalwood towel", 1, 50)).toEqual(full);
    expect(isCompleteGiftBox(full, 50)).toBe(true);
  });

  it("removes zero-quantity selections", () => {
    const contents = adjustGiftBoxQuantity(
      [{ item: "Green Tea towel", quantity: 1 }],
      "Green Tea towel",
      -1,
      25,
    );

    expect(contents).toEqual([]);
  });

  it("migrates previous towel and wipe choices into a towel-only box", () => {
    const migrated = migrateLegacyGiftBoxContents([
      "Green Tea towel",
      "Lemongrass towel",
      "Sandalwood wet wipes",
    ]);

    expect(getGiftBoxTotal(migrated)).toBe(25);
    expect(migrated).toHaveLength(3);
    expect(migrated.every(({ item }) => item.endsWith("towel"))).toBe(true);
  });

  it("formats quantities for basket and checkout summaries", () => {
    expect(formatGiftBoxContents([
      { item: "Green Tea towel", quantity: 15 },
      { item: "Lemongrass towel", quantity: 10 },
    ])).toBe("15 × Green Tea towel, 10 × Lemongrass towel");
  });

  it("uses the established 25, 50 and 100-piece towel prices", () => {
    expect(GIFT_BOX_SIZES).toEqual([25, 50, 100]);
    expect(GIFT_BOX_SIZES.map(getGiftBoxPrice)).toEqual([
      5_000_000,
      10_000_000,
      18_000_000,
    ]);
  });
});
