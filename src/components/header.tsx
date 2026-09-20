"use client";

import Link from "next/link";
import Image from "next/image";
import {
  List,
  MagnifyingGlass,
  ShoppingBag,
  UserCircle,
  X,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { useCart } from "./cart-provider";
import { CartDrawer } from "./cart-drawer";

const navigation = [
  ["Refreshing towels", "/shop?category=Refreshing%20towels"],
  ["Wet wipes", "/shop#wipes"],
  ["Corporate orders", "/corporate"],
  ["Gift boxes", "/products/titun-discovery-gift-box"],
  ["Events", "/events"],
  ["About", "/about"],
  ["Contact", "/contact"],
] as const;

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { count, setIsOpen } = useCart();

  useEffect(() => {
    if (!isMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    const menuButton = menuButtonRef.current;
    document.body.style.overflow = "hidden";
    const menu = menuRef.current;
    menu?.querySelector<HTMLElement>("a[href]")?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsMenuOpen(false);
        return;
      }
      if (event.key !== "Tab" || !menu) return;
      const focusable = Array.from(menu.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      menuButton?.focus();
    };
  }, [isMenuOpen]);

  return (
    <>
      <Link
        href="/#welcome-offer"
        className="block bg-walnut px-4 py-2 text-center text-[11px] font-bold uppercase tracking-[.09em] text-white focus-visible:outline-white"
      >
        Register your email address to receive upcoming sales promotions
      </Link>
      <header className="sticky top-0 z-40 border-b border-ink/15 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-[5.25rem] max-w-[1440px] items-center justify-between px-4 md:px-8 lg:h-[5.75rem]">
          <button
            ref={menuButtonRef}
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
            className="absolute left-1/2 flex -translate-x-1/2 items-center justify-center focus-visible:outline-offset-4"
            aria-label="TITUN home"
          >
            <Image
              src="/brand/titun-logo-gold.png"
              alt=""
              width={720}
              height={662}
              priority
              className="h-auto w-[4.5rem] md:w-[5rem]"
            />
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
          <div
            ref={menuRef}
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-navigation-title"
            className="border-t border-ink/15 bg-white px-5 py-6 lg:hidden"
          >
            <p id="mobile-navigation-title" className="sr-only">Site navigation</p>
            <nav aria-label="Mobile navigation" className="grid font-display text-2xl">
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
          </div>
        )}
      </header>
      <CartDrawer />
    </>
  );
}
