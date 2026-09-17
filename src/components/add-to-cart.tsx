"use client";

import { Check } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/db/schema";
import { formatMoney } from "@/lib/money";
import {
  getDefaultPurchaseQuantity,
  getPackOptions,
} from "@/lib/product-pricing";
import { useCart } from "./cart-provider";

export function AddToCart({ product }: { product: Product }) {
  const options = useMemo(() => getPackOptions(product), [product]);
  const [quantity, setQuantity] = useState(
    getDefaultPurchaseQuantity(product),
  );
  const giftBoxScents = ["Green Tea", "Lemongrass", "Sandalwood"] as const;
  const [selectedScents, setSelectedScents] = useState<string[]>([...giftBoxScents]);
  const isGiftBox = product.category === "Boxes and multipacks";
  const { addItem } = useCart();
  const available = product.stockOnHand - product.stockReserved;
  const selected =
    options.find((option) => option.quantity === quantity) ?? options[0];
  const selectedAvailable = available >= selected.quantity;

  return (
    <div>
      {isGiftBox && (
        <fieldset className="mb-6">
          <legend className="mb-2 text-sm font-semibold">Choose the towels in your gift box</legend>
          <p className="mb-4 max-w-lg text-xs leading-relaxed text-ink/65">
            Select one or more scents. We’ll balance your chosen scents across the box.
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {giftBoxScents.map((scent) => {
              const checked = selectedScents.includes(scent);
              return (
                <label key={scent} className={`flex min-h-12 cursor-pointer items-center gap-3 border px-4 text-sm font-semibold ${checked ? "border-ink bg-ink text-white" : "border-ink/25 bg-white"}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => setSelectedScents((current) =>
                      checked ? current.filter((item) => item !== scent) : [...current, scent],
                    )}
                  />
                  {scent}
                </label>
              );
            })}
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
                  className={`relative flex min-h-32 cursor-pointer flex-col justify-between border p-4 transition-colors ${
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
                      <span className="mt-2 block text-[10px] font-bold uppercase tracking-[.08em] text-gold">
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
        disabled={!selectedAvailable || (isGiftBox && selectedScents.length === 0)}
        className="mt-4 flex min-h-14 w-full items-center justify-between bg-ink px-6 font-semibold text-white transition-colors hover:bg-walnut disabled:cursor-not-allowed disabled:opacity-40"
        onClick={() => addItem(
          product,
          quantity,
          isGiftBox ? { giftBoxScents: selectedScents } : undefined,
        )}
      >
        <span>{!selectedAvailable ? "Pack unavailable" : isGiftBox && selectedScents.length === 0 ? "Choose at least one scent" : "Add to basket"}</span>
        <span className="tabular-nums">
          {formatMoney(selected.total, product.currency)}
        </span>
      </button>
    </div>
  );
}
