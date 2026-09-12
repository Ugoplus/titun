import { notFound } from "next/navigation";
import { AddToCart } from "@/components/add-to-cart";
import { ProductVisual } from "@/components/product-visual";
import { getProductBySlug } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";

export default async function ProductPage({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const available = product.stockOnHand - product.stockReserved;

  return (
    <div className="grid min-h-[75svh] lg:grid-cols-[1.1fr_.9fr]">
      <ProductVisual
        images={product.images}
        name={product.name}
        className="min-h-[55svh] lg:min-h-full"
        priority
      />
      <div className="flex items-center px-5 py-12 md:px-12 lg:px-[10%]">
        <div className="w-full max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[.1em] text-ink/70">
            {product.category}
          </p>
          <h1 className="mt-4 font-display text-[clamp(4rem,7vw,7.5rem)] leading-[.82] tracking-[-.04em]">
            {product.name}
          </h1>
          <p className="mt-6 text-sm font-bold">{product.scent}</p>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-ink/70">
            {product.description}
          </p>
          <dl className="my-8 grid grid-cols-2 border-y border-ink/20 py-5 text-sm">
            <div>
              <dt className="text-xs text-ink/70">Pack size</dt>
              <dd className="mt-1 font-bold">{product.packSize}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink/70">Availability</dt>
              <dd className="mt-1 font-bold">
                {available > 0 ? "In stock" : "Sold out"}
              </dd>
            </div>
          </dl>
          <p className="mb-6 text-xl font-bold">
            {formatMoney(product.price, product.currency)}
          </p>
          <AddToCart product={product} />
          <div className="mt-8 grid gap-2 text-xs text-ink/70">
            <p>✓ Secure checkout with Paystack or Stripe</p>
            <p>✓ Delivery updates by email</p>
            <p>✓ Individually sealed for freshness</p>
          </div>
        </div>
      </div>
    </div>
  );
}
