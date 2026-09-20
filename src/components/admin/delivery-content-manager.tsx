"use client";

import { FloppyDisk, Plus, Trash } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { DeliveryContent, DeliveryRegion } from "@/lib/delivery-content";

type RegionKey = "nigeriaRegions" | "internationalRegions";

function RegionEditor({
  regions,
  onChange,
}: {
  regions: DeliveryRegion[];
  onChange: (regions: DeliveryRegion[]) => void;
}) {
  const updateRegion = (index: number, values: Partial<DeliveryRegion>) => {
    onChange(regions.map((region, regionIndex) => (
      regionIndex === index ? { ...region, ...values } : region
    )));
  };

  const removeRegion = (index: number) => {
    if (regions.length === 1) {
      toast.error("Keep at least one destination in this section");
      return;
    }
    onChange(regions.filter((_, regionIndex) => regionIndex !== index));
  };

  const addRegion = () => {
    if (regions.length >= 12) {
      toast.error("A delivery section can contain up to 12 destinations");
      return;
    }
    onChange([
      ...regions,
      { id: crypto.randomUUID(), name: "New destination", timeframe: "Add timeframe" },
    ]);
  };

  return (
    <div>
      <div className="border-t border-ink/20">
        {regions.map((region, index) => (
          <div key={region.id} className="grid gap-3 border-b border-ink/20 py-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_3rem] sm:items-end">
            <label className="grid gap-2 text-sm font-semibold">
              Destination
              <input
                value={region.name}
                maxLength={80}
                onChange={(event) => updateRegion(index, { name: event.target.value })}
                className="min-h-12 border border-ink/30 bg-white px-4 font-normal focus:border-ink"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Delivery timeframe
              <input
                value={region.timeframe}
                maxLength={80}
                onChange={(event) => updateRegion(index, { timeframe: event.target.value })}
                className="min-h-12 border border-ink/30 bg-white px-4 font-normal tabular-nums focus:border-ink"
              />
            </label>
            <button
              type="button"
              onClick={() => removeRegion(index)}
              aria-label={`Remove ${region.name}`}
              className="inline-flex h-12 w-12 items-center justify-center border border-ink/30 text-ink hover:border-ink hover:bg-ink hover:text-white"
            >
              <Trash aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addRegion}
        className="mt-4 inline-flex min-h-11 items-center gap-2 border border-ink/30 px-4 text-sm font-semibold hover:border-ink"
      >
        <Plus aria-hidden="true" /> Add destination
      </button>
    </div>
  );
}

export function DeliveryContentManager({ initialContent }: { initialContent: DeliveryContent }) {
  const [content, setContent] = useState(initialContent);
  const [savedContent, setSavedContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const dirty = useMemo(
    () => JSON.stringify(content) !== JSON.stringify(savedContent),
    [content, savedContent],
  );

  const updateText = (
    key: Exclude<keyof DeliveryContent, RegionKey>,
    value: string,
  ) => {
    setContent((current) => ({ ...current, [key]: value }));
  };

  const updateRegions = (key: RegionKey, regions: DeliveryRegion[]) => {
    setContent((current) => ({ ...current, [key]: regions }));
  };

  const publish = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/content/delivery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Delivery information could not be published");
      setContent(result.content);
      setSavedContent(result.content);
      toast.success("Delivery information published");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delivery information could not be published");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section id="delivery-information" className="mt-16 scroll-mt-6 border-t border-ink/20 pt-10">
      <div className="border-b border-ink/20 pb-7">
        <h2 className="font-display text-4xl tracking-[-.025em] md:text-5xl">Delivery information</h2>
        <p className="mt-3 max-w-[68ch] text-sm leading-relaxed text-ink/70">
          Update delivery destinations, timeframes, courier information and the note shown on the Shipping page.
        </p>
      </div>

      <div className="grid gap-5 border-b border-ink/20 py-8 lg:grid-cols-[minmax(13rem,.55fr)_minmax(24rem,1.45fr)] lg:gap-12">
        <div>
          <h3 className="font-display text-3xl">Page introduction</h3>
          <p className="mt-2 max-w-[42ch] text-sm leading-relaxed text-ink/65">
            Keep this short so visitors reach the delivery estimates quickly.
          </p>
        </div>
        <div className="grid gap-5">
          <label className="grid gap-2 text-sm font-semibold">
            Page heading
            <input
              value={content.pageTitle}
              maxLength={90}
              onChange={(event) => updateText("pageTitle", event.target.value)}
              className="min-h-12 border border-ink/30 bg-white px-4 font-normal focus:border-ink"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Introduction
            <textarea
              value={content.introduction}
              maxLength={500}
              rows={3}
              onChange={(event) => updateText("introduction", event.target.value)}
              className="resize-y border border-ink/30 bg-white px-4 py-3 font-normal leading-relaxed focus:border-ink"
            />
          </label>
        </div>
      </div>

      <div className="grid gap-5 border-b border-ink/20 py-8 lg:grid-cols-[minmax(13rem,.55fr)_minmax(24rem,1.45fr)] lg:gap-12">
        <div>
          <h3 className="font-display text-3xl">Nigeria</h3>
          <p className="mt-2 max-w-[42ch] text-sm leading-relaxed text-ink/65">
            Manage Nigerian destinations and the courier note displayed beneath them.
          </p>
        </div>
        <div className="grid gap-5">
          <label className="grid gap-2 text-sm font-semibold">
            Section heading
            <input
              value={content.nigeriaHeading}
              maxLength={90}
              onChange={(event) => updateText("nigeriaHeading", event.target.value)}
              className="min-h-12 border border-ink/30 bg-white px-4 font-normal focus:border-ink"
            />
          </label>
          <RegionEditor
            regions={content.nigeriaRegions}
            onChange={(regions) => updateRegions("nigeriaRegions", regions)}
          />
          <label className="grid gap-2 text-sm font-semibold">
            Courier note
            <textarea
              value={content.nigeriaCourierNote}
              maxLength={500}
              rows={3}
              onChange={(event) => updateText("nigeriaCourierNote", event.target.value)}
              className="resize-y border border-ink/30 bg-white px-4 py-3 font-normal leading-relaxed focus:border-ink"
            />
          </label>
        </div>
      </div>

      <div className="grid gap-5 border-b border-ink/20 py-8 lg:grid-cols-[minmax(13rem,.55fr)_minmax(24rem,1.45fr)] lg:gap-12">
        <div>
          <h3 className="font-display text-3xl">International</h3>
          <p className="mt-2 max-w-[42ch] text-sm leading-relaxed text-ink/65">
            Add or remove destinations as TITUN’s delivery coverage changes.
          </p>
        </div>
        <div className="grid gap-5">
          <label className="grid gap-2 text-sm font-semibold">
            Section heading
            <input
              value={content.internationalHeading}
              maxLength={90}
              onChange={(event) => updateText("internationalHeading", event.target.value)}
              className="min-h-12 border border-ink/30 bg-white px-4 font-normal focus:border-ink"
            />
          </label>
          <RegionEditor
            regions={content.internationalRegions}
            onChange={(regions) => updateRegions("internationalRegions", regions)}
          />
        </div>
      </div>

      <div className="grid gap-5 py-8 lg:grid-cols-[minmax(13rem,.55fr)_minmax(24rem,1.45fr)] lg:gap-12">
        <div>
          <h3 className="font-display text-3xl">Delivery note</h3>
          <p className="mt-2 max-w-[42ch] text-sm leading-relaxed text-ink/65">
            This appears beneath both delivery sections.
          </p>
        </div>
        <label className="grid gap-2 text-sm font-semibold">
          Note
          <textarea
            value={content.disclaimer}
            maxLength={500}
            rows={4}
            onChange={(event) => updateText("disclaimer", event.target.value)}
            className="resize-y border border-ink/30 bg-white px-4 py-3 font-normal leading-relaxed focus:border-ink"
          />
        </label>
      </div>

      <div className="flex flex-col gap-3 border-t border-ink/20 py-6 sm:flex-row sm:items-center sm:justify-end">
        <p className="text-sm text-ink/65" role="status">
          {dirty ? "You have unpublished delivery changes." : "Delivery information is published."}
        </p>
        <button
          type="button"
          onClick={() => setContent(savedContent)}
          disabled={!dirty || saving}
          className="inline-flex min-h-12 items-center justify-center border border-ink/30 px-5 text-sm font-semibold hover:border-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          Discard changes
        </button>
        <button
          type="button"
          onClick={() => void publish()}
          disabled={!dirty || saving}
          className="inline-flex min-h-12 items-center justify-center gap-2 bg-ink px-6 text-sm font-semibold text-white hover:bg-walnut disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FloppyDisk aria-hidden="true" /> {saving ? "Publishing…" : "Publish delivery information"}
        </button>
      </div>
    </section>
  );
}
