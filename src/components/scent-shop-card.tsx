"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/db/schema";
import { formatMoney } from "@/lib/money";
import { getDefaultPurchaseQuantity, getPackOptions } from "@/lib/product-pricing";
import { useCart } from "./cart-provider";

type ScentShopCardProps = {
  name: string;
  image: string;
  towel?: Product;
  wipe?: Product;
};

export function ScentShopCard({ name, image, towel, wipe }: ScentShopCardProps) {
  const { addItem } = useCart();
  const products = [towel, wipe].filter((product): product is Product => Boolean(product));

  return (
    <article className="snap-start overflow-hidden bg-white">
      <Link
        href={towel ? `/products/${towel.slug}` : "/shop"}
        className="group relative block aspect-[944/1080] overflow-hidden bg-ink"
        aria-label={`Discover the ${name} collection`}
      >
        <Image
          src={image}
          alt={`${name} scent story for TITUN refreshing towels and wipes`}
          fill
          sizes="(max-width: 640px) 82vw, (max-width: 1024px) 46vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02] group-focus-visible:scale-[1.02] motion-reduce:transition-none"
        />
      </Link>
      <div className="border border-t-0 border-ink/15 p-5">
        <h4 className="font-display text-2xl leading-none tracking-[-.02em]">{name}</h4>
        <p className="mt-2 text-xs leading-relaxed text-ink/65">
          Choose your format and add the minimum pack straight to your basket.
        </p>
        <div className="mt-5 border-t border-ink/15">
          {products.map((product) => {
            const quantity = getDefaultPurchaseQuantity(product);
            const option = getPackOptions(product).find((pack) => pack.quantity === quantity)!;
            const available = product.stockOnHand - product.stockReserved >= quantity;
            const format = product.category === "Refreshing wet wipes"
              ? "Refreshing wipes"
              : "Refreshing towel";

            return (
              <div key={product.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-ink/15 py-4">
                <Link href={`/products/${product.slug}`} className="min-w-0">
                  <span className="block text-sm font-semibold">{format}</span>
                  <span className="mt-1 block text-xs tabular-nums text-ink/65">
                    {formatMoney(option.total, product.currency)} · {option.label}
                  </span>
                </Link>
                <button
                  type="button"
                  disabled={!available}
                  onClick={() => addItem(product, quantity)}
                  className="min-h-11 bg-ink px-4 text-xs font-semibold text-white transition-colors hover:bg-walnut disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={`Add ${product.name}, ${option.label}, to basket`}
                >
                  {available ? "Add to basket" : "Unavailable"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}
