import type { Order, OrderItem } from "@/lib/db/schema";

export type AdminOrderItemView = Pick<
  OrderItem,
  "id" | "productName" | "packSize" | "quantity" | "configuration"
>;

export type AdminOrderView = Omit<
  Order,
  | "subtotal"
  | "discountAmount"
  | "deliveryFee"
  | "total"
  | "currency"
  | "discountCode"
  | "paymentProvider"
  | "paymentReference"
> & {
  subtotal?: number;
  discountAmount?: number;
  deliveryFee?: number;
  total?: number;
  currency?: string;
  discountCode?: string | null;
  paymentProvider?: string;
  paymentReference?: string | null;
  items: AdminOrderItemView[];
};

export function toAdminOrderView(
  order: Order,
  canViewFinancials: boolean,
  items: OrderItem[] = [],
): AdminOrderView {
  const visibleItems = items.map((item) => ({
    id: item.id,
    productName: item.productName,
    packSize: item.packSize,
    quantity: item.quantity,
    configuration: item.configuration,
  }));
  if (canViewFinancials) return { ...order, items: visibleItems };
  return {
    id: order.id,
    reference: order.reference,
    status: order.status,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    deliveryAddress: order.deliveryAddress,
    deliveryCity: order.deliveryCity,
    deliveryOptionId: order.deliveryOptionId,
    deliveryMethod: order.deliveryMethod,
    deliveryTimeframe: order.deliveryTimeframe,
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
    items: visibleItems,
  };
}
