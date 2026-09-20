"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Product } from "@/lib/db/schema";
import {
  getCartUnitCount,
  mergeCartItems,
  type CartConfiguration,
  type CartItem,
} from "@/lib/cart";
import {
  getDefaultPurchaseQuantity,
  getPackOptions,
  hasPackOptions,
} from "@/lib/product-pricing";

export type { CartConfiguration, CartItem } from "@/lib/cart";
type CartContextValue = {
  items: CartItem[];
  count: number;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  addItem: (
    product: Product,
    quantity?: number,
    configuration?: CartConfiguration,
  ) => void;
  addItems: (items: CartItem[], openDrawer?: boolean) => void;
  replaceItems: (items: CartItem[]) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};
const CartContext = createContext<CartContextValue | null>(null);
const CART_STORAGE_KEY = "titun-cart-v2";
const LEGACY_CART_STORAGE_KEY = "titun-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const stored = JSON.parse(
          localStorage.getItem(CART_STORAGE_KEY) ?? "[]",
        ) as Array<CartItem & {
          configuration?: CartConfiguration & { giftBoxScents?: string[] };
        }>;
        setItems(
          stored.map((item) => ({
            ...item,
            configuration: item.configuration?.giftBoxContents
              ? { giftBoxContents: item.configuration.giftBoxContents }
              : item.configuration?.giftBoxScents?.length
                ? { giftBoxContents: item.configuration.giftBoxScents.map((scent) => `${scent} towel`) }
                : undefined,
            quantity:
              hasPackOptions(item.product) &&
              !getPackOptions(item.product).some((option) => option.quantity === item.quantity)
                ? getDefaultPurchaseQuantity(item.product)
                : item.quantity,
          })),
        );
        localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
      } catch {
        setItems([]);
      }
      setHasLoaded(true);
    });
  }, []);
  useEffect(() => {
    if (hasLoaded)
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items, hasLoaded]);
  const addItem = useCallback((product: Product, suppliedQuantity?: number, configuration?: CartConfiguration) => {
    const quantity = suppliedQuantity ?? getDefaultPurchaseQuantity(product);
    setItems((current) => mergeCartItems(current, [{ product, quantity, configuration }]));
    setIsOpen(true);
  }, []);
  const addItems = useCallback((newItems: CartItem[], openDrawer = false) => {
    setItems((current) => mergeCartItems(current, newItems));
    setIsOpen(openDrawer);
  }, []);
  const replaceItems = useCallback((nextItems: CartItem[]) => setItems(nextItems), []);
  const updateQuantity = useCallback(
    (productId: string, quantity: number) =>
      setItems((current) =>
        current.map((item) =>
          item.product.id === productId
            ? {
                ...item,
                quantity: Math.max(
                  1,
                  Math.min(
                    200,
                    item.product.stockOnHand - item.product.stockReserved,
                    quantity,
                  ),
                ),
              }
            : item,
        ),
      ),
    [],
  );
  const removeItem = useCallback((productId: string) => setItems((current) => current.filter((item) => item.product.id !== productId)), []);
  const clear = useCallback(() => setItems([]), []);
  const value = useMemo<CartContextValue>(() => ({
    items,
    count: getCartUnitCount(items),
    isOpen,
    setIsOpen,
    addItem,
    addItems,
    replaceItems,
    updateQuantity,
    removeItem,
    clear,
  }), [items, isOpen, addItem, addItems, replaceItems, updateQuantity, removeItem, clear]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export const useCart = () => {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used within CartProvider");
  return value;
};
