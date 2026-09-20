"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Storefront route failed", error.digest ?? error.name);
  }, [error]);

  return (
    <main className="grid min-h-[65svh] place-content-center px-5 py-16 text-center">
      <p className="text-xs font-bold uppercase tracking-[.09em] text-ink/65">
        A brief pause
      </p>
      <h1 className="mt-3 text-balance font-display text-5xl leading-[.94] tracking-[-.03em] md:text-6xl">
        This page needs another moment.
      </h1>
      <p className="mx-auto mt-5 max-w-[52ch] text-base leading-relaxed text-ink/65">
        Your basket is safe. Try loading this page again, or return to the collection.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="min-h-12 bg-ink px-6 font-semibold text-white">
          Try again
        </button>
        <Link href="/shop" className="inline-flex min-h-12 items-center border border-ink px-6 font-semibold">
          Return to the shop
        </Link>
      </div>
    </main>
  );
}
