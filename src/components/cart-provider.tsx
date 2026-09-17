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
  isRefreshingTowel,
} from "@/lib/product-pricing";

export type CartItem = { product: Product; quantity: number };
type CartContextValue = {
  items: CartItem[];
  count: number;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  addItem: (product: Product, quantity?: number) => void;
  addItems: (items: CartItem[], openDrawer?: boolean) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const stored = JSON.parse(
          localStorage.getItem("titun-cart") ?? "[]",
        ) as CartItem[];
        setItems(
          stored.map((item) => ({
            ...item,
            quantity:
              isRefreshingTowel(item.product) &&
              ![25, 50, 100].includes(item.quantity)
                ? getDefaultPurchaseQuantity(item.product)
                : item.quantity,
          })),
        );
      } catch {
        setItems([]);
      }
      setHasLoaded(true);
    });
  }, []);
  useEffect(() => {
    if (hasLoaded)
      localStorage.setItem("titun-cart", JSON.stringify(items));
  }, [items, hasLoaded]);
  const addItem = useCallback((product: Product, suppliedQuantity?: number) => {
    const quantity = suppliedQuantity ?? getDefaultPurchaseQuantity(product);
    setItems((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      return existing
        ? current.map((item) =>
            item.product.id === product.id
              ? {
                  ...item,
                  quantity: isRefreshingTowel(product)
                    ? quantity
                    : Math.min(20, item.quantity + quantity),
                }
              : item,
          )
        : [...current, { product, quantity }];
    });
    setIsOpen(true);
  }, []);
  const addItems = useCallback((newItems: CartItem[], openDrawer = false) => {
    setItems((current) => newItems.reduce((next, incoming) => {
      const incomingQuantity = isRefreshingTowel(incoming.product)
        ? getDefaultPurchaseQuantity(incoming.product)
        : incoming.quantity;
      const existing = next.find((item) => item.product.id === incoming.product.id);
      return existing
        ? next.map((item) => item.product.id === incoming.product.id ? {
            ...item,
            quantity: isRefreshingTowel(incoming.product)
              ? incomingQuantity
              : Math.min(20, item.quantity + incomingQuantity),
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
            ? { ...item, quantity: Math.max(1, Math.min(100, quantity)) }
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
