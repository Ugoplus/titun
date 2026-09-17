"use client";

import Image from "next/image";
import { ImageSquare } from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";

type Asset = { key: string; label: string; url: string };

export function SiteImageManager({ initialAssets }: { initialAssets: Asset[] }) {
  const [assets, setAssets] = useState(initialAssets);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  const handleReplace = async (key: string, file?: File) => {
    if (!file) return;
    setUploadingKey(key);
    try {
      const body = new FormData();
      body.set("file", file);
      const upload = await fetch("/api/admin/uploads", { method: "POST", body });
      const uploaded = await upload.json();
      if (!upload.ok) throw new Error(uploaded.error);
      const response = await fetch("/api/admin/site-assets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, url: uploaded.url }),
      });
      const updated = await response.json();
      if (!response.ok) throw new Error(updated.error);
      setAssets((current) => current.map((asset) => asset.key === key ? { ...asset, url: updated.url } : asset));
      toast.success("Website image replaced");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image could not be replaced");
    } finally {
      setUploadingKey(null);
    }
  };

  return (
    <section id="other-website-images" className="mt-16 scroll-mt-6">
      <h2 className="font-display text-5xl">Other website images</h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/65"><strong className="font-semibold text-ink">Publishes immediately.</strong> Replace collection, scent, application and page imagery here.</p>
      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {assets.map((asset) => (
          <article key={asset.key} className="border border-ink/20 bg-white p-3">
            <div className="relative aspect-[4/3] overflow-hidden bg-oat">
              <Image src={asset.url} alt="" fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">{asset.label}</p>
              <label className="inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 border border-ink px-3 text-xs font-bold focus-within:outline focus-within:outline-2 focus-within:outline-offset-2">
                <ImageSquare /> {uploadingKey === asset.key ? "Publishing…" : "Replace and publish"}
                <input type="file" className="sr-only" accept="image/jpeg,image/png,image/webp,image/avif" disabled={uploadingKey !== null} onChange={(event) => handleReplace(asset.key, event.target.files?.[0])} />
              </label>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
