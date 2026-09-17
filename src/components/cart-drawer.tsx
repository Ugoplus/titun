"use client";

import Link from "next/link";
import { Minus, Plus, Trash, X } from "@phosphor-icons/react";
import { formatMoney } from "@/lib/money";
import { DialogShell } from "./dialog-shell";
import { ProductVisual } from "./product-visual";
import { useCart } from "./cart-provider";
import {
  getAdjacentPackQuantity,
  getLinePricing,
  hasPackOptions,
} from "@/lib/product-pricing";

export function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem } = useCart();
  const subtotal = items.reduce(
    (sum, item) => sum + getLinePricing(item.product, item.quantity).total,
    0,
  );
  if (!isOpen) return null;

  return (
    <DialogShell
      labelledBy="basket-title"
      onClose={() => setIsOpen(false)}
      backdropClassName="justify-end bg-ink/40 p-0"
      panelClassName="flex h-full w-full max-w-md flex-col bg-cream p-5"
    >
      <div className="flex items-center justify-between border-b border-ink/20 pb-4">
        <h2 id="basket-title" className="font-display text-3xl">
          Your basket
        </h2>
        <button
          data-autofocus
          className="flex h-11 w-11 items-center justify-center"
          onClick={() => setIsOpen(false)}
          aria-label="Close basket"
        >
          <X />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        {items.length === 0 ? (
          <div className="grid h-full place-content-center gap-3 text-center">
            <p className="font-display text-3xl">A quiet basket.</p>
            <p className="text-sm text-ink/70">Choose a ritual to begin.</p>
            <Link
              onClick={() => setIsOpen(false)}
              href="/shop"
              className="mt-3 bg-ink px-6 py-4 text-sm font-bold text-cream"
            >
              Shop towels
            </Link>
          </div>
        ) : (
          <div className="grid gap-5">
            {items.map((item, index) => (
              <div
                key={item.product.id}
                className="grid grid-cols-[88px_1fr] gap-4"
              >
                <ProductVisual
                  images={item.product.images}
                  name={item.product.name}
                  index={index}
                  className="aspect-[4/5]"
                />
                <div className="grid min-w-0 gap-2">
                  <div>
                    <p className="font-display text-xl">{item.product.name}</p>
                    <p className="text-xs text-ink/70">
                      {getLinePricing(item.product, item.quantity).label}
                    </p>
                    {item.configuration?.giftBoxContents?.length ? (
                      <p className="mt-1 text-xs leading-relaxed text-ink/70">
                        {item.configuration.giftBoxContents.join(", ")}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-ink/25">
                      <button
                        aria-label="Reduce quantity"
                        className="grid h-11 w-11 place-content-center"
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            hasPackOptions(item.product)
                              ? getAdjacentPackQuantity(
                                  item.product,
                                  item.quantity,
                                  -1,
                                )
                              : item.quantity - 1,
                          )
                        }
                      >
                        <Minus />
                      </button>
                      <span className="w-7 text-center text-sm tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        aria-label="Increase quantity"
                        className="grid h-11 w-11 place-content-center"
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            hasPackOptions(item.product)
                              ? getAdjacentPackQuantity(
                                  item.product,
                                  item.quantity,
                                  1,
                                )
                              : item.quantity + 1,
                          )
                        }
                      >
                        <Plus />
                      </button>
                    </div>
                    <button
                      className="grid h-11 w-11 place-content-center"
                      aria-label={`Remove ${item.product.name}`}
                      onClick={() => removeItem(item.product.id)}
                    >
                      <Trash />
                    </button>
                  </div>
                  <p className="text-sm font-bold">
                    {formatMoney(
                      getLinePricing(item.product, item.quantity).total,
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {items.length > 0 && (
        <div className="border-t border-ink/20 pt-4">
          <div className="mb-4 flex justify-between">
            <span>Subtotal</span>
            <strong>{formatMoney(subtotal)}</strong>
          </div>
          <Link
            onClick={() => setIsOpen(false)}
            href="/checkout"
            className="flex min-h-12 items-center justify-center bg-ink px-5 text-sm font-bold text-cream transition-colors hover:bg-leaf"
          >
            Continue to checkout
          </Link>
          <p className="mt-3 text-center text-[11px] text-ink/70">
            Delivery and discounts are calculated at checkout.
          </p>
        </div>
      )}
    </DialogShell>
  );
}
