import type { Order } from "@/lib/db/schema";

export type AdminOrderView = Omit<
  Order,
  | "subtotal"
  | "discountAmount"
  | "total"
  | "currency"
  | "discountCode"
  | "paymentProvider"
  | "paymentReference"
> & {
  subtotal?: number;
  discountAmount?: number;
  total?: number;
  currency?: string;
  discountCode?: string | null;
  paymentProvider?: string;
  paymentReference?: string | null;
};

export function toAdminOrderView(
  order: Order,
  canViewFinancials: boolean,
): AdminOrderView {
  if (canViewFinancials) return order;
  return {
    id: order.id,
    reference: order.reference,
    status: order.status,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    deliveryAddress: order.deliveryAddress,
    deliveryCity: order.deliveryCity,
    notes: order.notes,
    reservationExpiresAt: order.reservationExpiresAt,
    paidAt: order.paidAt,
    processingAt: order.processingAt,
    shippedAt: order.shippedAt,
    fulfilledAt: order.fulfilledAt,
    failedAt: order.failedAt,
    cancelledAt: order.cancelledAt,
    refundedAt: order.refundedAt,
    courier: order.courier,
    trackingNumber: order.trackingNumber,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}
