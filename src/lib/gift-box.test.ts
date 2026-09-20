import { describe, expect, it } from "vitest";
import {
  GIFT_BOX_SIZE,
  adjustGiftBoxQuantity,
  formatGiftBoxContents,
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
      { item: "Sandalwood wet wipes", quantity: 8 },
    ];

    expect(getGiftBoxTotal(contents)).toBe(18);
    expect(getGiftBoxRemaining(contents)).toBe(7);
    expect(isCompleteGiftBox(contents)).toBe(false);
  });

  it("prevents increments beyond 25 pieces", () => {
    const almostFull: GiftBoxSelection[] = [
      { item: "Green Tea towel", quantity: 24 },
    ];
    const full = adjustGiftBoxQuantity(almostFull, "Lemongrass towel", 1);

    expect(getGiftBoxTotal(full)).toBe(GIFT_BOX_SIZE);
    expect(adjustGiftBoxQuantity(full, "Sandalwood towel", 1)).toEqual(full);
    expect(isCompleteGiftBox(full)).toBe(true);
  });

  it("removes zero-quantity selections", () => {
    const contents = adjustGiftBoxQuantity(
      [{ item: "Green Tea wet wipes", quantity: 1 }],
      "Green Tea wet wipes",
      -1,
    );

    expect(contents).toEqual([]);
  });

  it("migrates the previous checkbox selection into a balanced 25-piece box", () => {
    const migrated = migrateLegacyGiftBoxContents([
      "Green Tea towel",
      "Lemongrass towel",
      "Sandalwood wet wipes",
    ]);

    expect(getGiftBoxTotal(migrated)).toBe(25);
    expect(migrated).toHaveLength(3);
  });

  it("formats quantities for basket and checkout summaries", () => {
    expect(formatGiftBoxContents([
      { item: "Green Tea towel", quantity: 15 },
      { item: "Lemongrass wet wipes", quantity: 10 },
    ])).toBe("15 × Green Tea towel, 10 × Lemongrass wet wipes");
  });
});
