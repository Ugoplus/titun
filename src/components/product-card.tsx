"use client";
import Link from "next/link";
import { Plus } from "@phosphor-icons/react";
import type { Product } from "@/lib/db/schema";
import { formatMoney } from "@/lib/money";
import { useCart } from "./cart-provider";
import { ProductVisual } from "./product-visual";
import {
  getDefaultPurchaseQuantity,
  getPackOptions,
} from "@/lib/product-pricing";
export function ProductCard({
  product,
  index = 0,
  headingLevel = "h3",
  priority = false,
}: {
  product: Product;
  index?: number;
  headingLevel?: "h2" | "h3";
  priority?: boolean;
}) {
  const { addItem } = useCart();
  const available = product.stockOnHand - product.stockReserved;
  const defaultQuantity = getDefaultPurchaseQuantity(product);
  const packOptions = getPackOptions(product);
  const startingPrice = packOptions[0].total;
  const hasMultiplePacks = packOptions.length > 1;
  const isConfigurableGiftBox = product.category === "Boxes and multipacks";
  const canAdd = available >= defaultQuantity;
  const Heading = headingLevel;
  return (
    <article className="group snap-start bg-white">
      <Link href={`/products/${product.slug}`}>
        <ProductVisual
          images={product.images}
          name={product.name}
          index={index}
          className="aspect-square"
          priority={priority}
        />
      </Link>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 border border-ink/15 p-4">
        <Link href={`/products/${product.slug}`} className="min-w-0">
          <Heading className="truncate whitespace-nowrap font-display text-[clamp(.9375rem,1.4vw,1.125rem)] leading-snug">
            {product.name}
          </Heading>
          <p className="mt-2 text-xs leading-relaxed text-ink/65">
            {product.scent}
          </p>
          <p className="mt-3 text-sm font-bold tabular-nums">
            {hasMultiplePacks ? "From " : ""}
            {formatMoney(startingPrice, product.currency)}
            {hasMultiplePacks ? ` · ${packOptions[0].quantity} pieces` : ""}
          </p>
        </Link>
        {isConfigurableGiftBox ? (
          <Link
            href={`/products/${product.slug}`}
            className="flex h-11 w-11 items-center justify-center bg-ink text-white transition-colors hover:bg-walnut"
            aria-label={`Choose products for ${product.name}`}
          >
            <Plus />
          </Link>
        ) : (
          <button
            disabled={!canAdd}
            onClick={() => addItem(product, defaultQuantity)}
            className="flex h-11 w-11 items-center justify-center bg-ink text-white transition-colors hover:bg-walnut disabled:cursor-not-allowed disabled:opacity-30"
            aria-label={`Add ${product.name} ${defaultQuantity}-piece pack to basket`}
          >
            <Plus />
          </button>
        )}
      </div>
    </article>
  );
}
