import { describe, expect, it } from "vitest";
import type { Order, OrderItem } from "@/lib/db/schema";
import { toAdminOrderView } from "./admin-order-view";

const order = {
  id: "11111111-1111-4111-8111-111111111111",
  reference: "TIT-TEST",
  total: 5_000_000,
  paymentProvider: "paystack",
} as Order;

const item = {
  id: "22222222-2222-4222-8222-222222222222",
  productName: "TITUN Discovery Gift Box",
  packSize: "Custom 25-piece gift box",
  quantity: 1,
  configuration: {
    giftBoxSize: 25,
    giftBoxContents: [
      { item: "Green Tea towel", quantity: 15 },
      { item: "Sandalwood towel", quantity: 10 },
    ],
  },
} as OrderItem;

describe("admin order view", () => {
  it("includes fulfilment contents without exposing financials to restricted roles", () => {
    const view = toAdminOrderView(order, false, [item]);

    expect(view.total).toBeUndefined();
    expect(view.items[0].configuration.giftBoxContents).toHaveLength(2);
  });
});
