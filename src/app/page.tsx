import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { getFeaturedProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";

const categories = [
  { name: "Individual towels", copy: "A fresh start, wherever you are.", tone: "bg-[#d8ff3e]" },
  { name: "Boxes and multipacks", copy: "Keep the ritual close at hand.", tone: "bg-[#d8c8ef]" },
  { name: "Scent collections", copy: "Choose the mood you want to carry.", tone: "bg-[#b6e6dc]" },
  { name: "Corporate and bulk", copy: "Hospitality, made memorable.", tone: "bg-[#f1c6a8]" },
];

export default async function Home() {
  const featured = await getFeaturedProducts();
  return <>
    <section className="grid min-h-[calc(100svh-104px)] bg-ink text-cream lg:grid-cols-[.88fr_1.12fr]">
      <div className="reveal flex flex-col justify-between gap-16 px-5 py-12 md:px-10 md:py-16 lg:px-14">
        <p className="text-xs font-bold uppercase tracking-[.1em] text-[#c9a84c]">The art of renewal</p>
        <div><h1 className="max-w-xl font-display text-[clamp(4.1rem,9vw,9.5rem)] leading-[.76] tracking-[-.065em]">Carry<br/><em className="font-normal text-[#d7b85c]">freshness.</em></h1><p className="mt-9 max-w-md text-base leading-relaxed text-cream/75">Premium, individually wrapped towels made for movement, travel, hospitality and the heat of everyday life.</p><Link href="/shop" className="mt-8 inline-flex min-h-12 items-center gap-5 border-b border-cream pb-2 text-sm font-bold">Shop the collection <ArrowRight /></Link></div>
        <p className="text-[11px] uppercase tracking-[.09em] text-cream/50">Designed to turn a practical moment into a considered ritual.</p>
      </div>
      <div className="relative min-h-[58svh] overflow-hidden"><Image src="/images/titun/hero-lounge.jpg" alt="TITUN refreshing towels presented during an elegant restaurant experience" fill priority sizes="(max-width: 1024px) 100vw, 56vw" className="object-cover object-center"/><div className="absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent"/><div className="absolute bottom-7 left-6 rounded-full bg-cream px-5 py-3 text-xs font-bold uppercase tracking-[.08em] text-ink">Open · unfold · reset</div></div>
    </section>

    <section className="px-5 py-20 md:px-8 md:py-28"><div className="mx-auto max-w-[1440px]">
      <div className="mb-10 flex items-end justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[.1em] text-ink/55">Find your fresh</p><h2 className="mt-3 max-w-2xl font-display text-[clamp(3rem,6vw,6.2rem)] leading-[.9] tracking-[-.055em]">A ritual for every rhythm.</h2></div><Link href="/shop" className="hidden text-sm font-bold md:block">Shop all →</Link></div>
      <div className="grid border-l border-t border-ink/20 sm:grid-cols-2 lg:grid-cols-4">{categories.map((category, index) => <Link key={category.name} href={`/shop?category=${encodeURIComponent(category.name)}`} className={`group relative flex aspect-[4/5] flex-col justify-between overflow-hidden border-b border-r border-ink/20 p-5 ${category.tone}`}><span className="text-xs font-bold tabular-nums">0{index + 1}</span><div><h3 className="max-w-[9ch] font-display text-4xl leading-[.92] tracking-[-.04em]">{category.name}</h3><p className="mt-4 max-w-[22ch] text-sm text-ink/65">{category.copy}</p></div><ArrowRight className="transition-transform group-hover:translate-x-2" /></Link>)}</div>
    </div></section>

    <section className="bg-[#e8e2d7] px-5 py-20 md:px-8 md:py-28"><div className="mx-auto max-w-[1440px]">
      <div className="mb-10 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[.1em] text-ink/55">Most reached for</p><h2 className="mt-2 font-display text-5xl tracking-[-.045em] md:text-7xl">The essentials</h2></div><Link href="/shop" className="text-sm font-bold">View all →</Link></div>
      <div className="grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">{featured.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div>
    </div></section>

    <section className="grid bg-[#efe9df] lg:grid-cols-2"><div className="relative min-h-[55svh]"><Image src="/images/titun/movement-kit.jpg" alt="TITUN refreshing towels packed in a sports bag" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover"/></div><div className="flex flex-col justify-center px-5 py-20 md:px-14"><p className="text-xs font-bold uppercase tracking-[.1em] text-ink/55">Made to move</p><h2 className="mt-5 max-w-lg font-display text-6xl leading-[.88] tracking-[-.055em]">Freshness belongs in the bag.</h2><p className="mt-7 max-w-md text-sm leading-relaxed text-ink/65">From early training to long flights, TITUN brings a quiet touch of care to the moments between destinations.</p><Link href="/shop" className="mt-8 inline-flex w-fit items-center gap-5 border-b border-ink pb-2 text-sm font-bold">Explore individual towels <ArrowRight/></Link></div></section>

    <section id="ritual" className="grid bg-ink text-cream lg:grid-cols-2">
      <div className="relative min-h-[62svh]"><Image src="/images/titun/ritual-spa.jpg" alt="TITUN refreshing towels arranged in a warm spa setting" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover"/><p className="absolute bottom-6 left-5 max-w-[12ch] font-display text-5xl leading-[.92] tracking-[-.04em] text-white drop-shadow-md">Cool on skin. Quiet in mind.</p></div>
      <div className="flex flex-col justify-center px-5 py-20 md:px-14"><p className="text-xs font-bold uppercase tracking-[.1em] text-[#d7b85c]">The TITUN ritual</p><h2 className="mt-6 max-w-lg font-display text-5xl leading-[.95] tracking-[-.045em] md:text-7xl">A pause you can carry.</h2><ol className="mt-12 grid border-t border-cream/20">{[["01", "Open", "Tear the individually sealed packet."], ["02", "Unfold", "Let the soft towel release its scent."], ["03", "Reset", "Refresh hands, face and neck—then return renewed."]].map(([number, title, copy]) => <li key={number} className="grid grid-cols-[48px_1fr] gap-4 border-b border-cream/20 py-6"><span className="text-xs text-[#d7b85c]">{number}</span><div><h3 className="font-display text-2xl">{title}</h3><p className="mt-2 text-sm text-cream/60">{copy}</p></div></li>)}</ol></div>
    </section>
  </>;
}
