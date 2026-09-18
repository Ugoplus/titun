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
  getDefaultPurchaseQuantity,
  getPackOptions,
  hasPackOptions,
} from "@/lib/product-pricing";

export type CartConfiguration = { giftBoxContents?: string[] };
export type CartItem = {
  product: Product;
  quantity: number;
  configuration?: CartConfiguration;
};
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
    const available = Math.max(0, product.stockOnHand - product.stockReserved);
    setItems((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      return existing
        ? current.map((item) =>
            item.product.id === product.id
              ? {
                  ...item,
                  product,
                  quantity: hasPackOptions(product)
                    ? quantity
                    : Math.min(20, available, item.quantity + quantity),
                  configuration: configuration ?? item.configuration,
                }
              : item,
          )
        : [...current, {
            product,
            quantity: hasPackOptions(product)
              ? quantity
              : Math.min(available, quantity),
            configuration,
          }];
    });
    setIsOpen(true);
  }, []);
  const addItems = useCallback((newItems: CartItem[], openDrawer = false) => {
    setItems((current) => newItems.reduce((next, incoming) => {
      const incomingQuantity = hasPackOptions(incoming.product)
        ? getDefaultPurchaseQuantity(incoming.product)
        : incoming.quantity;
      const existing = next.find((item) => item.product.id === incoming.product.id);
      return existing
        ? next.map((item) => item.product.id === incoming.product.id ? {
            ...item,
            quantity: hasPackOptions(incoming.product)
              ? incomingQuantity
              : Math.min(20, item.quantity + incomingQuantity),
            configuration: incoming.configuration ?? item.configuration,
          } : item)
        : [...next, { ...incoming, quantity: incomingQuantity }];
    }, current));
    setIsOpen(openDrawer);
  }, []);
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
    count: items.length,
    isOpen,
    setIsOpen,
    addItem,
    addItems,
    updateQuantity,
    removeItem,
    clear,
  }), [items, isOpen, addItem, addItems, updateQuantity, removeItem, clear]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export const useCart = () => {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used within CartProvider");
  return value;
};
