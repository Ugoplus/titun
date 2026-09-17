"use client";

import Link from "next/link";
import {
  List,
  MagnifyingGlass,
  ShoppingBag,
  UserCircle,
  X,
} from "@phosphor-icons/react";
import { useState } from "react";
import { useCart } from "./cart-provider";
import { CartDrawer } from "./cart-drawer";

const navigation = [
  ["Refreshing towels", "/shop?category=Refreshing%20towels"],
  ["Wet wipes", "/shop#wipes"],
  ["Corporate orders", "/corporate"],
  ["Custom orders", "/custom-orders"],
  ["Community", "/community"],
  ["About", "/about"],
  ["Contact", "/contact"],
] as const;

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { count, setIsOpen } = useCart();

  return (
    <>
      <Link
        href="/#welcome-offer"
        className="block bg-ink px-4 py-2 text-center text-[11px] font-bold uppercase tracking-[.09em] text-white"
      >
        10% off your first order · Shop TITUN
      </Link>
      <header className="sticky top-0 z-40 border-b border-ink/15 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 md:px-8">
          <button
            onClick={() => setIsMenuOpen((open) => !open)}
            className="flex h-11 w-11 items-center justify-center lg:hidden"
            aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
          >
            {isMenuOpen ? <X /> : <List />}
          </button>
          <Link
            href="/corporate"
            className="hidden min-h-11 items-center border border-ink px-4 text-xs font-semibold lg:inline-flex"
          >
            Corporate enquiries
          </Link>
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 font-display text-[2rem] font-medium tracking-[-.03em]"
            aria-label="TITUN home"
          >
            TITUN
          </Link>
          <div className="flex items-center gap-1">
            <Link
              href="/shop#product-search"
              aria-label="Search products"
              className="flex h-11 w-11 items-center justify-center"
            >
              <MagnifyingGlass />
            </Link>
            <Link
              href="/account"
              aria-label="Order lookup"
              className="hidden h-11 w-11 items-center justify-center sm:flex"
            >
              <UserCircle />
            </Link>
            <button
              onClick={() => setIsOpen(true)}
              aria-label={`Open basket with ${count} product${count === 1 ? "" : "s"}`}
              className="relative flex h-11 w-11 items-center justify-center"
            >
              <ShoppingBag />
              <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-white">
                {count}
              </span>
            </button>
          </div>
        </div>
        <nav
          aria-label="Primary navigation"
          className="hidden min-h-11 items-center justify-center gap-8 border-t border-ink/10 px-8 text-xs font-semibold lg:flex"
        >
          {navigation.map(([label, href]) => (
            <Link key={href} href={href} className="py-3 hover:text-walnut">
              {label}
            </Link>
          ))}
        </nav>
        {isMenuOpen && (
          <nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            className="grid border-t border-ink/15 bg-white px-5 py-6 font-display text-2xl lg:hidden"
          >
            {navigation.map(([label, href]) => (
              <Link
                key={href}
                onClick={() => setIsMenuOpen(false)}
                className="border-b border-ink/10 py-3"
                href={href}
              >
                {label}
              </Link>
            ))}
          </nav>
        )}
      </header>
      <CartDrawer />
    </>
  );
}
