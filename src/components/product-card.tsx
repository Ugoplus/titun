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
  const Heading = headingLevel;
  return (
    <article className="group bg-white">
      <Link href={`/products/${product.slug}`}>
        <ProductVisual
          images={product.images}
          name={product.name}
          index={index}
          className="aspect-square"
          priority={priority}
        />
      </Link>
      <div className="grid grid-cols-[1fr_auto] gap-4 border border-ink/15 p-4">
        <Link href={`/products/${product.slug}`}>
          <Heading className="font-display text-xl leading-tight">
            {product.name}
          </Heading>
          <p className="mt-2 text-xs leading-relaxed text-ink/65">
            {product.scent}
          </p>
          <p className="mt-3 text-sm font-bold tabular-nums">
            {packOptions.length > 1 ? "From " : ""}
            {formatMoney(startingPrice, product.currency)}
          </p>
        </Link>
        <button
          disabled={available < 1}
          onClick={() => addItem(product, defaultQuantity)}
          className="flex h-11 w-11 items-center justify-center bg-ink text-white transition-colors hover:bg-walnut disabled:cursor-not-allowed disabled:opacity-30"
          aria-label={`Add ${product.name} ${defaultQuantity}-piece pack to basket`}
        >
          <Plus />
        </button>
      </div>
    </article>
  );
}
