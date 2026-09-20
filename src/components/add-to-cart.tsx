"use client";

import { Check, Minus, Plus } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/db/schema";
import { formatMoney } from "@/lib/money";
import {
  GIFT_BOX_ITEMS,
  GIFT_BOX_SIZE,
  adjustGiftBoxQuantity,
  getGiftBoxRemaining,
  getGiftBoxTotal,
  isCompleteGiftBox,
  isDiscoveryGiftBox,
  type GiftBoxSelection,
} from "@/lib/gift-box";
import {
  getDefaultPurchaseQuantity,
  getPackOptions,
} from "@/lib/product-pricing";
import { useCart } from "./cart-provider";

export function AddToCart({ product, compact = false }: { product: Product; compact?: boolean }) {
  const options = useMemo(() => getPackOptions(product), [product]);
  const [quantity, setQuantity] = useState(
    getDefaultPurchaseQuantity(product),
  );
  const [selectedContents, setSelectedContents] = useState<GiftBoxSelection[]>([]);
  const isGiftBox = isDiscoveryGiftBox(product);
  const { addItem } = useCart();
  const available = product.stockOnHand - product.stockReserved;
  const selected =
    options.find((option) => option.quantity === quantity) ?? options[0];
  const selectedAvailable = available >= selected.quantity;
  const selectedPieceCount = getGiftBoxTotal(selectedContents);
  const remainingPieceCount = getGiftBoxRemaining(selectedContents);
  const giftBoxComplete = isCompleteGiftBox(selectedContents);

  return (
    <div>
      {isGiftBox && (
        <fieldset className="mb-6">
          <legend className="mb-2 text-lg font-semibold">Build your 25-piece box</legend>
          <p className="mb-4 max-w-lg text-xs leading-relaxed text-ink/65">
            Choose any mix of towel and wet-wipe fragrances. Your box remains {formatMoney(selected.total, product.currency)}.
          </p>
          <div className="grid border-t border-ink/20">
            {GIFT_BOX_ITEMS.map((item) => {
              const itemQuantity = selectedContents.find(
                (selection) => selection.item === item,
              )?.quantity ?? 0;
              return (
                <div
                  key={item}
                  className="flex min-h-16 items-center justify-between gap-4 border-b border-ink/20 py-2"
                >
                  <span className="min-w-0 text-sm font-semibold">{item}</span>
                  <div className="flex shrink-0 items-center border border-ink/25">
                    <button
                      type="button"
                      disabled={itemQuantity === 0}
                      aria-label={`Remove one ${item}`}
                      onClick={() => setSelectedContents((current) =>
                        adjustGiftBoxQuantity(current, item, -1)
                      )}
                      className="grid h-11 w-11 place-content-center disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Minus aria-hidden="true" />
                    </button>
                    <output
                      aria-label={`${itemQuantity} ${item} selected`}
                      className="w-9 text-center text-sm font-bold tabular-nums"
                    >
                      {itemQuantity}
                    </output>
                    <button
                      type="button"
                      disabled={selectedPieceCount >= GIFT_BOX_SIZE}
                      aria-label={`Add one ${item}`}
                      onClick={() => setSelectedContents((current) =>
                        adjustGiftBoxQuantity(current, item, 1)
                      )}
                      className="grid h-11 w-11 place-content-center disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Plus aria-hidden="true" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div
            aria-live="polite"
            className={`mt-4 border p-4 ${giftBoxComplete ? "border-ink bg-ink text-white" : "border-ink/20 bg-linen"}`}
          >
            <p className="font-display text-2xl tabular-nums">
              {selectedPieceCount} / {GIFT_BOX_SIZE} pieces selected
            </p>
            <p className={`mt-1 text-xs leading-relaxed ${giftBoxComplete ? "text-white/75" : "text-ink/65"}`}>
              {giftBoxComplete
                ? "Your Discovery Gift Box is complete."
                : `Please select ${remainingPieceCount} more ${remainingPieceCount === 1 ? "piece" : "pieces"} to complete your box.`}
            </p>
          </div>
        </fieldset>
      )}
      {options.length > 1 && (
        <fieldset>
          <legend className="mb-3 text-sm font-semibold">Choose your pack</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {options.map((option) => {
              const checked = option.quantity === quantity;
              const inStock = available >= option.quantity;
              return (
                <label
                  key={option.quantity}
                  className={`relative flex cursor-pointer flex-col justify-between border transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink ${
                    compact ? "min-h-24 p-3" : "min-h-32 p-4"
                  } ${
                    checked
                      ? "border-ink bg-ink text-white"
                      : "border-ink/25 bg-white hover:border-gold"
                  } ${!inStock ? "cursor-not-allowed opacity-45" : ""}`}
                >
                  <input
                    type="radio"
                    name="packSize"
                    value={option.quantity}
                    checked={checked}
                    disabled={!inStock}
                    onChange={() => setQuantity(option.quantity)}
                    className="sr-only"
                  />
                  <span className="flex items-start justify-between gap-2">
                    <span className="font-display text-2xl leading-none">
                      {option.quantity}
                    </span>
                    {checked && <Check aria-hidden="true" />}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold tabular-nums">
                      {formatMoney(option.total, product.currency)}
                    </span>
                    <span
                      className={`mt-1 block text-[11px] ${
                        checked ? "text-white/70" : "text-ink/60"
                      }`}
                    >
                      {formatMoney(
                        Math.round(option.total / option.quantity),
                        product.currency,
                      )}{" "}
                      per piece
                    </span>
                    {option.note && (
                      <span className={`${compact ? "mt-1" : "mt-2"} block text-[10px] font-bold uppercase tracking-[.08em] text-gold`}>
                        {option.note}
                      </span>
                    )}
                    {!inStock && (
                      <span className="mt-2 block text-[10px] font-bold uppercase tracking-[.08em]">
                        Low stock
                      </span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}
      <button
        disabled={!selectedAvailable || (isGiftBox && !giftBoxComplete)}
        className="mt-4 flex min-h-14 w-full items-center justify-between bg-ink px-6 font-semibold text-white transition-colors hover:bg-walnut disabled:cursor-not-allowed disabled:opacity-40"
        onClick={() => addItem(
          product,
          quantity,
          isGiftBox ? { giftBoxContents: selectedContents } : undefined,
        )}
      >
        <span>{!selectedAvailable ? "Pack unavailable" : isGiftBox && !giftBoxComplete ? `Select ${remainingPieceCount} more` : "Add to basket"}</span>
        <span className="tabular-nums">
          {formatMoney(selected.total, product.currency)}
        </span>
      </button>
    </div>
  );
}
