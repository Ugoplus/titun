import { describe, expect, it } from "vitest";
import {
  firstAllowedAdminPath,
  hasAdminPermission,
} from "./admin-permissions";
import { validateAdminPassword } from "./admin-password";
import { toAdminOrderView } from "./admin-order-view";
import type { Order } from "./db/schema";

describe("admin permissions", () => {
  it("gives the administrator every permission", () => {
    expect(hasAdminPermission("administrator", [], "orders:view_financials")).toBe(true);
    expect(hasAdminPermission("administrator", [], "team:manage")).toBe(true);
  });

  it("denies permissions that were not explicitly assigned", () => {
    expect(hasAdminPermission("order-fulfilment", ["orders:view"], "orders:manage")).toBe(false);
    expect(hasAdminPermission("order-fulfilment", ["orders:view"], "orders:view_financials")).toBe(false);
  });

  it("routes a restricted user to the first section they can access", () => {
    expect(firstAllowedAdminPath("custom", ["orders:view"])).toBe("/admin/orders");
    expect(firstAllowedAdminPath("custom", [])).toBe("/admin/no-access");
  });
});

describe("admin password policy", () => {
  it("accepts long passphrases without composition rules", () => {
    expect(validateAdminPassword("river window cedar morning").valid).toBe(true);
  });

  it("rejects short and commonly guessed passwords", () => {
    expect(validateAdminPassword("short").valid).toBe(false);
    expect(validateAdminPassword("password1234").valid).toBe(false);
  });
});

describe("order financial redaction", () => {
  it("removes every payment and money field for restricted roles", () => {
    const order = {
      id: "order-1",
      reference: "TITUN-1",
      status: "paid",
      customerName: "Customer",
      customerEmail: "customer@example.com",
      customerPhone: "+2348000000000",
      deliveryAddress: "12 Sample Street",
      deliveryCity: "Lagos",
      notes: null,
      subtotal: 100_000,
      discountAmount: 10_000,
      total: 90_000,
      currency: "NGN",
      discountCode: "WELCOME10",
      paymentProvider: "paystack",
      paymentReference: "secret-reference",
      reservationExpiresAt: new Date(),
      paidAt: new Date(),
      processingAt: null,
      shippedAt: null,
      fulfilledAt: null,
      failedAt: null,
      cancelledAt: null,
      refundedAt: null,
      courier: null,
      trackingNumber: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Order;
    const redacted = toAdminOrderView(order, false);
    expect(redacted).not.toHaveProperty("total");
    expect(redacted).not.toHaveProperty("paymentProvider");
    expect(redacted).not.toHaveProperty("paymentReference");
    expect(redacted).toMatchObject({ reference: "TITUN-1", status: "paid" });
  });
});
