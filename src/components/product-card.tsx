"use client";
import Link from "next/link";
import { Plus } from "@phosphor-icons/react";
import type { Product } from "@/lib/db/schema";
import { formatMoney } from "@/lib/money";
import { useCart } from "./cart-provider";
import { ProductVisual } from "./product-visual";
export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) { const { addItem } = useCart(); const available = product.stockOnHand - product.stockReserved; return <article className="group"><Link href={`/products/${product.slug}`}><ProductVisual images={product.images} name={product.name} index={index} className="aspect-[4/5]" /></Link><div className="grid grid-cols-[1fr_auto] gap-4 border-t border-ink/15 py-4"><Link href={`/products/${product.slug}`}><h3 className="font-display text-2xl leading-none">{product.name}</h3><p className="mt-2 text-xs text-ink/60">{product.scent} · {product.packSize}</p><p className="mt-3 text-sm font-bold">{formatMoney(product.price, product.currency)}</p></Link><button disabled={available < 1} onClick={() => addItem(product)} className="flex h-11 w-11 items-center justify-center border border-ink transition-colors hover:bg-citron disabled:cursor-not-allowed disabled:opacity-30" aria-label={`Add ${product.name} to basket`}><Plus /></button></div></article>; }
