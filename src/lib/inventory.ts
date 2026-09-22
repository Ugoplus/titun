export const UNLIMITED_STOCK = -1;

type InventoryRecord = {
  stockOnHand: number;
  stockReserved: number;
};

export const isUnlimitedStock = (stockOnHand: number) =>
  stockOnHand === UNLIMITED_STOCK;

export const availableStock = (inventory: InventoryRecord) =>
  isUnlimitedStock(inventory.stockOnHand)
    ? Number.POSITIVE_INFINITY
    : Math.max(0, inventory.stockOnHand - inventory.stockReserved);

export const hasAvailableStock = (
  inventory: InventoryRecord,
  requestedQuantity: number,
) =>
  Number.isInteger(requestedQuantity) &&
  requestedQuantity > 0 &&
  availableStock(inventory) >= requestedQuantity;

export const isLowStock = (
  inventory: InventoryRecord & { lowStockThreshold: number },
) =>
  !isUnlimitedStock(inventory.stockOnHand) &&
  availableStock(inventory) <= inventory.lowStockThreshold;
