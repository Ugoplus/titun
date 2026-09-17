"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ImageSquare, Plus, X } from "@phosphor-icons/react";
import { toast } from "sonner";
import type { Product } from "@/lib/db/schema";
import { formatMoney } from "@/lib/money";
import { ProductVisual } from "@/components/product-visual";
import { DialogShell } from "@/components/dialog-shell";
import { isRefreshingTowel } from "@/lib/product-pricing";

export function ProductManager({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const [catalog, setCatalog] = useState(initialProducts);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [savingProductId, setSavingProductId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [replacementImages, setReplacementImages] = useState<Record<string, string>>({});
  const field =
    "h-11 w-full border-b border-ink/35 bg-transparent text-base outline-none focus:border-ink";

  const handleUpload = async (file?: File) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const body = new FormData();
      body.set("file", file);
      const response = await fetch("/api/admin/uploads", {
        method: "POST",
        body,
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setImageUrl(payload.url);
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Image could not be uploaded",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    const form = new FormData(event.currentTarget);
    const input = {
      name: form.get("name"),
      slug: form.get("slug"),
      scent: form.get("scent"),
      description: form.get("description"),
      category: form.get("category"),
      packSize: form.get("packSize"),
      price: Math.round(Number(form.get("price")) * 100),
      stockOnHand: Number(form.get("stockOnHand")),
      lowStockThreshold: Number(form.get("lowStockThreshold")),
      images: imageUrl ? [imageUrl] : [],
      featured: form.get("featured") === "on",
      active: true,
    };
    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const product = await response.json();
      if (!response.ok) throw new Error(product.error);
      setCatalog((current) => [product, ...current]);
      setIsAdding(false);
      setImageUrl("");
      toast.success("Product published");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Product could not be saved",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleProductUpdate = async (
    event: FormEvent<HTMLFormElement>,
    product: Product,
  ) => {
    event.preventDefault();
    setSavingProductId(product.id);
    try {
      const form = new FormData(event.currentTarget);
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stockOnHand: Number(form.get("stock")),
          price: Math.round(Number(form.get("price")) * 100),
          ...(replacementImages[product.id] ? { images: [replacementImages[product.id]] } : {}),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setCatalog((current) =>
        current.map((item) => (item.id === product.id ? payload : item)),
      );
      toast.success(`${product.name} updated`);
      setReplacementImages((current) => {
        const next = { ...current };
        delete next[product.id];
        return next;
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Product could not be updated",
      );
    } finally {
      setSavingProductId(null);
    }
  };

  return (
    <section className="mt-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.09em] text-ink/70">
            Catalogue
          </p>
          <h2 className="mt-2 font-display text-5xl">Products and stock</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/events"
            className="flex min-h-12 items-center border border-ink px-5 text-sm font-bold"
          >
            Manage events
          </Link>
          <button
            onClick={() => setIsAdding(true)}
            className="flex min-h-12 items-center gap-2 bg-ink px-5 text-sm font-bold text-cream"
          >
            <Plus /> Add product
          </button>
        </div>
      </div>
      {isAdding && (
        <DialogShell
          labelledBy="new-product-title"
          onClose={() => setIsAdding(false)}
          panelClassName="my-auto w-full max-w-3xl bg-cream p-5 md:p-8"
        >
          <div className="flex items-center justify-between">
            <h3 id="new-product-title" className="font-display text-4xl">
              New product
            </h3>
            <button
              onClick={() => setIsAdding(false)}
              aria-label="Close"
              className="grid h-11 w-11 place-content-center"
            >
              <X />
            </button>
          </div>
          <form onSubmit={handleCreate} className="mt-8 grid gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-1 text-xs font-bold">
                Product name
                <input required name="name" className={field} />
              </label>
              <label className="grid gap-1 text-xs font-bold">
                URL slug
                <input
                  required
                  name="slug"
                  pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                  placeholder="e.g. citrus-awaken"
                  className={field}
                />
              </label>
              <label className="grid gap-1 text-xs font-bold">
                Scent
                <input required name="scent" className={field} />
              </label>
              <label className="grid gap-1 text-xs font-bold">
                Category
                <select name="category" className={field}>
                  <option>Refreshing towels</option>
                  <option>Refreshing wet wipes</option>
                  <option>Boxes and multipacks</option>
                  <option>Scent collections</option>
                  <option>Corporate and bulk</option>
                </select>
              </label>
              <label className="grid gap-1 text-xs font-bold">
                Pack size
                <input required name="packSize" className={field} />
              </label>
              <label className="grid gap-1 text-xs font-bold">
                Price (₦)
                <input
                  required
                  min="0"
                  step="0.01"
                  name="price"
                  type="number"
                  className={field}
                />
                <span className="font-normal text-ink/60">
                  For refreshing towels, enter the best-value price per piece.
                </span>
              </label>
              <label className="grid gap-1 text-xs font-bold">
                Opening stock
                <input
                  required
                  min="0"
                  name="stockOnHand"
                  type="number"
                  className={field}
                />
              </label>
              <label className="grid gap-1 text-xs font-bold">
                Low-stock alert at
                <input
                  required
                  min="0"
                  defaultValue="10"
                  name="lowStockThreshold"
                  type="number"
                  className={field}
                />
              </label>
            </div>
            <label className="grid gap-1 text-xs font-bold">
              Description
              <textarea
                required
                minLength={10}
                name="description"
                rows={4}
                className="w-full resize-none border-b border-ink/35 bg-transparent py-3 text-base font-normal outline-none"
              />
            </label>
            <label className="flex min-h-28 cursor-pointer items-center justify-center gap-3 border border-dashed border-ink/40 text-sm font-bold">
              <ImageSquare />{" "}
              {isUploading
                ? "Uploading image…"
                : imageUrl
                  ? "Image ready"
                  : "Upload product image"}
              <input
                className="sr-only"
                type="file"
                disabled={isUploading}
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={(event) => handleUpload(event.target.files?.[0])}
              />
            </label>
            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" name="featured" /> Feature on homepage
            </label>
            <button
              disabled={isSaving || isUploading}
              className="min-h-12 bg-ink px-5 font-bold text-cream disabled:opacity-50"
            >
              {isSaving ? "Publishing…" : "Publish product"}
            </button>
          </form>
        </DialogShell>
      )}
      <div className="mt-6 grid gap-3">
        {catalog.map((product, index) => {
          const available = product.stockOnHand - product.stockReserved;
          return (
            <article
              key={product.id}
              className="grid items-center gap-4 border border-ink/20 p-3 sm:grid-cols-[80px_1fr_auto]"
            >
              <ProductVisual
                images={product.images}
                name={product.name}
                index={index}
                className="aspect-square"
              />
              <div>
                <h3 className="font-display text-2xl">{product.name}</h3>
                <p className="mt-1 text-xs text-ink/70">
                  {product.packSize} · {formatMoney(product.price)}
                </p>
                <p
                  className={`mt-2 text-xs font-bold ${available <= product.lowStockThreshold ? "text-clayInk" : "text-leaf"}`}
                >
                  {available} available · {product.stockReserved} reserved
                </p>
              </div>
              <form
                className="grid grid-cols-2 items-end gap-2 sm:grid-cols-[100px_100px_auto_auto]"
                onSubmit={(event) => handleProductUpdate(event, product)}
              >
                <label className="grid gap-1 text-[10px] font-bold uppercase tracking-[.06em]">
                  {isRefreshingTowel(product) ? "Best-value unit (₦)" : "Price (₦)"}
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={product.price / 100}
                    className="h-10 border border-ink/25 bg-transparent px-2 text-sm"
                  />
                </label>
                <label className="grid gap-1 text-[10px] font-bold uppercase tracking-[.06em]">
                  On hand
                  <input
                    name="stock"
                    type="number"
                    min={product.stockReserved}
                    defaultValue={product.stockOnHand}
                    className="h-10 border border-ink/25 bg-transparent px-2 text-sm"
                  />
                </label>
                <button
                  disabled={savingProductId === product.id}
                  className="col-span-2 min-h-11 border border-ink px-3 text-xs font-bold disabled:opacity-50 sm:col-span-1"
                >
                  {savingProductId === product.id ? "Updating…" : "Update"}
                </button>
                <label className="col-span-2 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 border border-ink px-3 text-xs font-bold sm:col-span-1">
                  <ImageSquare /> {replacementImages[product.id] ? "Image ready" : "Replace image"}
                  <input
                    type="file"
                    className="sr-only"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    disabled={isUploading}
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      setIsUploading(true);
                      try {
                        const body = new FormData();
                        body.set("file", file);
                        const response = await fetch("/api/admin/uploads", { method: "POST", body });
                        const payload = await response.json();
                        if (!response.ok) throw new Error(payload.error);
                        setReplacementImages((current) => ({ ...current, [product.id]: payload.url }));
                        toast.success("Image ready — click Update to save");
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : "Image could not be uploaded");
                      } finally {
                        setIsUploading(false);
                      }
                    }}
                  />
                </label>
              </form>
            </article>
          );
        })}
      </div>
    </section>
  );
}
