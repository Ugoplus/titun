"use client";

import { Check, Minus, Plus } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/db/schema";
import { formatMoney } from "@/lib/money";
import {
  GIFT_BOX_ITEMS,
  GIFT_BOX_SIZES,
  GIFT_BOX_WIPE_UPSELL_SIZE,
  adjustGiftBoxQuantity,
  getGiftBoxPrice,
  getGiftBoxRemaining,
  getGiftBoxTotal,
  isCompleteGiftBox,
  isDiscoveryGiftBox,
  setGiftBoxItemQuantity,
  type GiftBoxSelection,
  type GiftBoxSize,
} from "@/lib/gift-box";
import {
  getDefaultPurchaseQuantity,
  getPackOptions,
} from "@/lib/product-pricing";
import { useCart } from "./cart-provider";

export function AddToCart({
  product,
  compact = false,
  wipeAddOns = [],
}: {
  product: Product;
  compact?: boolean;
  wipeAddOns?: Product[];
}) {
  const options = useMemo(() => getPackOptions(product), [product]);
  const [quantity, setQuantity] = useState(getDefaultPurchaseQuantity(product));
  const [giftBoxSize, setGiftBoxSize] = useState<GiftBoxSize>(25);
  const [selectedContents, setSelectedContents] = useState<GiftBoxSelection[]>([]);
  const [wipeAddOnId, setWipeAddOnId] = useState("");
  const isGiftBox = isDiscoveryGiftBox(product);
  const { addItem, addItems } = useCart();
  const available = product.stockOnHand - product.stockReserved;
  const selected =
    options.find((option) => option.quantity === quantity) ?? options[0];
  const selectedAvailable = available >= (isGiftBox ? 1 : selected.quantity);
  const selectedPieceCount = getGiftBoxTotal(selectedContents);
  const remainingPieceCount = getGiftBoxRemaining(
    selectedContents,
    giftBoxSize,
  );
  const giftBoxComplete = isCompleteGiftBox(selectedContents, giftBoxSize);
  const selectedWipeAddOn = wipeAddOns.find(({ id }) => id === wipeAddOnId);
  const wipeAddOnPrice = selectedWipeAddOn
    ? selectedWipeAddOn.price * GIFT_BOX_WIPE_UPSELL_SIZE
    : 0;
  const displayedPrice = isGiftBox
    ? getGiftBoxPrice(giftBoxSize) + wipeAddOnPrice
    : selected.total;

  const addToBasket = () => {
    if (!isGiftBox) {
      addItem(product, quantity);
      return;
    }
    if (!giftBoxComplete) return;
    addItems(
      [
        {
          product,
          quantity: 1,
          configuration: {
            giftBoxSize,
            giftBoxContents: selectedContents,
          },
        },
        ...(selectedWipeAddOn
          ? [{
              product: selectedWipeAddOn,
              quantity: GIFT_BOX_WIPE_UPSELL_SIZE,
              configuration: { giftBoxUpsell: true as const },
            }]
          : []),
      ],
      true,
    );
  };

  return (
    <div>
      {isGiftBox && (
        <div className="mb-6 grid gap-7">
          <fieldset>
            <legend className="mb-3 text-sm font-semibold">Choose your box size</legend>
            <div className="grid grid-cols-3 gap-2">
              {GIFT_BOX_SIZES.map((size) => {
                const selectedSize = size === giftBoxSize;
                const price = getGiftBoxPrice(size);
                return (
                  <label
                    key={size}
                    className={`cursor-pointer border p-3 transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink ${
                      selectedSize
                        ? "border-ink bg-ink text-white"
                        : "border-ink/25 bg-white hover:border-gold"
                    }`}
                  >
                    <input
                      type="radio"
                      name="giftBoxSize"
                      value={size}
                      checked={selectedSize}
                      onChange={() => {
                        setGiftBoxSize(size);
                        setSelectedContents([]);
                      }}
                      className="sr-only"
                    />
                    <span className="block font-display text-2xl leading-none tabular-nums">
                      {size}
                    </span>
                    <span className={`mt-2 block text-xs tabular-nums ${selectedSize ? "text-white/75" : "text-ink/65"}`}>
                      {formatMoney(price, product.currency)}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-lg font-semibold">
              Choose your towel scents
            </legend>
            <p className="mb-4 max-w-lg text-xs leading-relaxed text-ink/65">
              Divide all {giftBoxSize} towels across Green Tea, Lemongrass and Sandalwood in any combination.
            </p>
            <div className="grid border-t border-ink/20">
              {GIFT_BOX_ITEMS.map((item) => {
                const itemQuantity = selectedContents.find(
                  (selection) => selection.item === item,
                )?.quantity ?? 0;
                return (
                  <div
                    key={item}
                    className="flex min-h-16 items-center justify-between gap-3 border-b border-ink/20 py-2"
                  >
                    <span className="min-w-0 text-sm font-semibold">{item.replace(" towel", "")}</span>
                    <div className="flex shrink-0 items-center border border-ink/25">
                      <button
                        type="button"
                        disabled={itemQuantity === 0}
                        aria-label={`Remove one ${item}`}
                        onClick={() => setSelectedContents((current) =>
                          adjustGiftBoxQuantity(current, item, -1, giftBoxSize)
                        )}
                        className="grid h-11 w-11 place-content-center disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Minus aria-hidden="true" />
                      </button>
                      <input
                        type="number"
                        min={0}
                        max={giftBoxSize}
                        inputMode="numeric"
                        value={itemQuantity}
                        aria-label={`${item} quantity`}
                        onChange={(event) => setSelectedContents((current) =>
                          setGiftBoxItemQuantity(
                            current,
                            item,
                            Number(event.target.value),
                            giftBoxSize,
                          )
                        )}
                        className="h-11 w-12 border-x border-ink/20 bg-transparent text-center text-sm font-bold tabular-nums outline-none focus:bg-linen"
                      />
                      <button
                        type="button"
                        disabled={selectedPieceCount >= giftBoxSize}
                        aria-label={`Add one ${item}`}
                        onClick={() => setSelectedContents((current) =>
                          adjustGiftBoxQuantity(current, item, 1, giftBoxSize)
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
                {selectedPieceCount} / {giftBoxSize} pieces selected
              </p>
              <p className={`mt-1 text-xs leading-relaxed ${giftBoxComplete ? "text-white/75" : "text-ink/65"}`}>
                {giftBoxComplete
                  ? "Your Discovery Gift Box is complete."
                  : `Please select ${remainingPieceCount} more ${remainingPieceCount === 1 ? "piece" : "pieces"} to complete your box.`}
              </p>
            </div>
          </fieldset>

          {wipeAddOns.length > 0 && (
            <fieldset>
              <legend className="mb-2 text-lg font-semibold">Add 25 wet wipes</legend>
              <p className="mb-4 max-w-lg text-xs leading-relaxed text-ink/65">
                Add one 25-piece wipe batch in a single fragrance for {formatMoney(wipeAddOns[0].price * GIFT_BOX_WIPE_UPSELL_SIZE)}.
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <label className={`cursor-pointer border p-3 text-sm font-semibold ${!wipeAddOnId ? "border-ink bg-ink text-white" : "border-ink/25 bg-white"}`}>
                  <input
                    type="radio"
                    name="wipeAddOn"
                    value=""
                    checked={!wipeAddOnId}
                    onChange={() => setWipeAddOnId("")}
                    className="sr-only"
                  />
                  No add-on
                </label>
                {wipeAddOns.map((wipe) => {
                  const inStock = wipe.stockOnHand - wipe.stockReserved >= GIFT_BOX_WIPE_UPSELL_SIZE;
                  const checked = wipe.id === wipeAddOnId;
                  return (
                    <label
                      key={wipe.id}
                      className={`cursor-pointer border p-3 text-sm font-semibold ${checked ? "border-ink bg-ink text-white" : "border-ink/25 bg-white"} ${!inStock ? "cursor-not-allowed opacity-40" : ""}`}
                    >
                      <input
                        type="radio"
                        name="wipeAddOn"
                        value={wipe.id}
                        checked={checked}
                        disabled={!inStock}
                        onChange={() => setWipeAddOnId(wipe.id)}
                        className="sr-only"
                      />
                      {wipe.name.replace(" Refreshing Wipes", "")}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}
        </div>
      )}

      {!isGiftBox && options.length > 1 && (
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
                  } ${checked ? "border-ink bg-ink text-white" : "border-ink/25 bg-white hover:border-gold"} ${!inStock ? "cursor-not-allowed opacity-45" : ""}`}
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
                    <span className="font-display text-2xl leading-none">{option.quantity}</span>
                    {checked && <Check aria-hidden="true" />}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold tabular-nums">{formatMoney(option.total, product.currency)}</span>
                    <span className={`mt-1 block text-[11px] ${checked ? "text-white/70" : "text-ink/60"}`}>
                      {formatMoney(Math.round(option.total / option.quantity), product.currency)} per piece
                    </span>
                    {option.note && (
                      <span className={`${compact ? "mt-1" : "mt-2"} block text-[10px] font-bold uppercase tracking-[.08em] text-gold`}>{option.note}</span>
                    )}
                    {!inStock && (
                      <span className="mt-2 block text-[10px] font-bold uppercase tracking-[.08em]">Low stock</span>
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
        onClick={addToBasket}
      >
        <span>
          {!selectedAvailable
            ? "Pack unavailable"
            : isGiftBox && !giftBoxComplete
              ? `Select ${remainingPieceCount} more`
              : "Add to basket"}
        </span>
        <span className="tabular-nums">{formatMoney(displayedPrice, product.currency)}</span>
      </button>
    </div>
  );
}
