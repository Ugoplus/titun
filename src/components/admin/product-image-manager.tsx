"use client";

import Image from "next/image";
import { ImageSquare } from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "@/lib/db/schema";

type ProductImageRecord = Pick<Product, "id" | "name" | "images">;

export function ProductImageManager({
  initialProducts,
}: {
  initialProducts: ProductImageRecord[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [uploadingProductId, setUploadingProductId] = useState<string | null>(null);

  const replaceImage = async (product: ProductImageRecord, file?: File) => {
    if (!file) return;
    setUploadingProductId(product.id);
    try {
      const body = new FormData();
      body.set("file", file);
      const uploadResponse = await fetch("/api/admin/uploads", {
        method: "POST",
        body,
      });
      const upload = await uploadResponse.json();
      if (!uploadResponse.ok) throw new Error(upload.error);

      const updateResponse = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: [upload.url] }),
      });
      const updated = await updateResponse.json();
      if (!updateResponse.ok) throw new Error(updated.error);

      setProducts((current) => current.map((item) => (
        item.id === product.id ? { ...item, images: updated.images } : item
      )));
      toast.success(`${product.name} image published across the catalogue`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Product image could not be replaced");
    } finally {
      setUploadingProductId(null);
    }
  };

  return (
    <section id="product-images" className="mt-16 scroll-mt-6 border-t border-ink/20 pt-10">
      <h2 className="font-display text-4xl tracking-[-.025em] md:text-5xl">Product images</h2>
      <p className="mt-3 max-w-[68ch] text-sm leading-relaxed text-ink/70">
        Replace the Gift Box, refreshing towel and wet-wipe photographs here. A new image publishes immediately across product cards, the shop, the wet-wipe section and the product page. Collection-tile artwork remains under Other website images.
      </p>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => {
          const imageUrl = product.images[0];
          const uploading = uploadingProductId === product.id;

          return (
            <article key={product.id} className="border border-ink/20 bg-white p-3">
              <div className="relative aspect-square overflow-hidden bg-oat">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={`${product.name} product packaging`}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center px-6 text-center text-sm text-ink/60">
                    No product image uploaded
                  </div>
                )}
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                <p className="text-sm font-semibold">{product.name}</p>
                <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 border border-ink px-3 text-xs font-bold focus-within:outline focus-within:outline-2 focus-within:outline-offset-2">
                  <ImageSquare aria-hidden="true" />
                  {uploading ? "Replacing…" : "Replace and publish"}
                  <input
                    type="file"
                    className="sr-only"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    disabled={uploadingProductId !== null}
                    onChange={(event) => {
                      const input = event.currentTarget;
                      void replaceImage(product, input.files?.[0]).finally(() => {
                        input.value = "";
                      });
                    }}
                  />
                </label>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
