"use client";

import Link from "next/link";
import { List, MagnifyingGlass, ShoppingBag, X } from "@phosphor-icons/react";
import { useState } from "react";
import { useCart } from "./cart-provider";
import { CartDrawer } from "./cart-drawer";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { count, setIsOpen } = useCart();
  const closeMenu = () => setIsMenuOpen(false);

  return <>
    <div className="bg-ink px-4 py-2 text-center text-[11px] font-bold uppercase tracking-[.09em] text-cream">Complimentary delivery on orders over ₦50,000</div>
    <header className="sticky top-0 z-40 border-b border-ink/15 bg-cream/95 backdrop-blur-sm">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-4 md:px-8">
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex h-11 w-11 items-center justify-center md:hidden" aria-label="Open navigation">{isMenuOpen ? <X /> : <List />}</button>
        <nav className="hidden items-center gap-7 text-xs font-bold uppercase tracking-[.08em] md:flex">
          <Link href="/shop">Shop</Link>
          <Link href="/community">Community</Link>
          <Link href="/#ritual">The ritual</Link>
          <Link href="/shop?category=Corporate%20and%20bulk">Corporate</Link>
        </nav>
        <Link href="/" className="absolute left-1/2 -translate-x-1/2 font-display text-[2rem] font-medium tracking-[-.04em]">TITUN</Link>
        <div className="flex items-center gap-1">
          <Link href="/shop" aria-label="Search products" className="flex h-11 w-11 items-center justify-center"><MagnifyingGlass /></Link>
          <button onClick={() => setIsOpen(true)} aria-label={`Open basket with ${count} items`} className="relative flex h-11 w-11 items-center justify-center"><ShoppingBag /><span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-citron px-1 text-[10px] font-bold">{count}</span></button>
        </div>
      </div>
      {isMenuOpen && <nav className="grid border-t border-ink/15 px-5 py-6 font-display text-2xl md:hidden">
        <Link onClick={closeMenu} className="py-3" href="/shop">Shop all</Link>
        <Link onClick={closeMenu} className="py-3" href="/community">Community</Link>
        <Link onClick={closeMenu} className="py-3" href="/#ritual">The ritual</Link>
        <Link onClick={closeMenu} className="py-3" href="/shop?category=Corporate%20and%20bulk">Corporate</Link>
        <a className="py-3" href="https://wa.me/2340000000000">WhatsApp</a>
      </nav>}
    </header>
    <CartDrawer />
  </>;
}
