"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/db/schema";
import { formatMoney } from "@/lib/money";
import { getPackOptions } from "@/lib/product-pricing";
import { AddToCart } from "./add-to-cart";
import { ProductVisual } from "./product-visual";

export function ScentCollectionHero({
  name,
  products,
  initialSlug,
  story,
}: {
  name: string;
  products: Product[];
  initialSlug: string;
  story: {
    tagline: string;
    description: string;
  } | null;
}) {
  const initialProduct = products.find((product) => product.slug === initialSlug) ?? products[0];
  const [selectedId, setSelectedId] = useState(initialProduct.id);
  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedId) ?? initialProduct,
    [initialProduct, products, selectedId],
  );

  return (
    <section className="grid lg:col-span-2 lg:grid-cols-[1.05fr_.95fr]">
      <ProductVisual
        images={selectedProduct.images}
        name={selectedProduct.name}
        className="min-h-[50svh] lg:min-h-full"
        priority
      />
      <div className="flex items-center px-5 py-12 md:px-12 lg:px-[10%] lg:py-16">
        <div className="w-full max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[.1em] text-ink/70">
            {name} collection
          </p>
          <h1 className="mt-4 font-display text-5xl leading-[.92] tracking-[-.03em] md:text-6xl">
            {name}
          </h1>
          <p className="mt-5 text-sm font-bold">{selectedProduct.scent}</p>

          {story && (
            <div className="mt-6 max-w-lg border-t border-ink/15 pt-6">
              <h2 className="font-display text-2xl leading-tight tracking-[-.02em] md:text-3xl">
                {story.tagline}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-ink/70">
                {story.description}
              </p>
            </div>
          )}

          <p className="mt-5 max-w-lg text-base leading-relaxed text-ink/70">
            {selectedProduct.description}
          </p>

          <fieldset className="mt-8">
            <legend className="mb-3 text-sm font-semibold">Choose your format</legend>
            <div className="grid grid-cols-2 gap-2">
              {products.map((product) => {
                const selected = product.id === selectedProduct.id;
                const startingPrice = getPackOptions(product)[0].total;
                const isWipe = product.category === "Refreshing wet wipes";

                return (
                  <label
                    key={product.id}
                    className={`cursor-pointer border p-4 transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink ${
                      selected
                        ? "border-ink bg-ink text-white"
                        : "border-ink/20 bg-white hover:border-gold"
                    }`}
                  >
                    <input
                      type="radio"
                      name="productFormat"
                      value={product.id}
                      checked={selected}
                      onChange={() => setSelectedId(product.id)}
                      className="sr-only"
                    />
                    <span className="block text-sm font-semibold">
                      {isWipe ? "Refreshing wipes" : "Refreshing towel"}
                    </span>
                    <span className={`mt-2 block text-xs tabular-nums ${selected ? "text-white/70" : "text-ink/60"}`}>
                      From {formatMoney(startingPrice, product.currency)}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-7">
            <AddToCart key={selectedProduct.id} product={selectedProduct} compact />
          </div>
          <p className="mt-5 text-xs leading-relaxed text-ink/65">
            Secure checkout with Paystack or Stripe. Delivery updates are sent by email.
          </p>
        </div>
      </div>
    </section>
  );
}
