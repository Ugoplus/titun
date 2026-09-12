import Link from "next/link";
export function Footer() {
  return (
    <footer className="bg-ink px-5 py-14 text-cream md:px-8 md:py-20">
      <div className="mx-auto grid max-w-[1440px] gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <p className="font-display text-5xl tracking-[-.04em]">TITUN</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream/70">
            A small, considered ritual for feeling fresh wherever the day takes
            you.
          </p>
        </div>
        <div className="grid content-start gap-3 text-sm">
          <p className="mb-2 text-xs font-bold uppercase tracking-[.08em] text-cream/70">
            Explore
          </p>
          <Link href="/shop">Shop all</Link>
          <Link href="/shop?category=Corporate%20and%20bulk">
            Corporate orders
          </Link>
        </div>
        <div className="grid content-start gap-3 text-sm">
          <p className="mb-2 text-xs font-bold uppercase tracking-[.08em] text-cream/70">
            Talk to us
          </p>
          <a href="https://instagram.com">Instagram</a>
          <a href="https://wa.me/2340000000000">WhatsApp</a>
          <a href="mailto:hello@titun.co">hello@titun.co</a>
        </div>
      </div>
      <div className="mx-auto mt-16 flex max-w-[1440px] flex-wrap justify-between gap-4 border-t border-cream/20 pt-6 text-[11px] text-cream/70">
        <span>© {new Date().getFullYear()} TITUN</span>
        <span>Made for everyday renewal.</span>
      </div>
    </footer>
  );
}
