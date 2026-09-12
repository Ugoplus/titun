"use client";
import { Minus, Plus } from "@phosphor-icons/react";
import { useState } from "react";
import type { Product } from "@/lib/db/schema";
import { useCart } from "./cart-provider";
export function AddToCart({ product }: { product: Product }) { const [quantity, setQuantity] = useState(1); const { addItem } = useCart(); const available = product.stockOnHand - product.stockReserved; return <div className="grid grid-cols-[120px_1fr] gap-3"><div className="flex min-h-12 items-center justify-between border border-ink/30"><button className="grid h-12 w-10 place-content-center" aria-label="Reduce quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus /></button><span className="tabular-nums">{quantity}</span><button className="grid h-12 w-10 place-content-center" aria-label="Increase quantity" onClick={() => setQuantity(Math.min(20, available, quantity + 1))}><Plus /></button></div><button disabled={available < 1} className="min-h-12 bg-ink px-5 font-bold text-cream hover:bg-leaf disabled:opacity-40" onClick={() => addItem(product, quantity)}>{available < 1 ? "Sold out" : "Add to basket"}</button></div>; }
