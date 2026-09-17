"use client";

import { FloppyDisk } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { HomepageCopy } from "@/lib/site-content";

type CopyField = keyof HomepageCopy;

const sections: Array<{
  name: string;
  description: string;
  fields: Array<{ key: CopyField; label: string; multiline?: boolean }>;
}> = [
  {
    name: "Shopping sections",
    description: "Headings customers see while browsing the homepage collection.",
    fields: [
      { key: "collectionHeading", label: "Collection heading" },
      { key: "towelsHeading", label: "Refreshing towels heading" },
      { key: "scentsHeading", label: "Scent images heading" },
    ],
  },
  {
    name: "Product story",
    description: "The introduction above the dining, wellness and travel images.",
    fields: [
      { key: "applicationsHeading", label: "Heading" },
      { key: "applicationsCopy", label: "Description", multiline: true },
    ],
  },
  {
    name: "Why TITUN",
    description: "The explanation beside the product-detail list.",
    fields: [
      { key: "whyHeading", label: "Heading" },
      { key: "whyCopy", label: "Description", multiline: true },
    ],
  },
  {
    name: "Refreshing wet wipes",
    description: "The introduction above the wet-wipe products. Price and minimum quantity are added automatically from the catalogue rules.",
    fields: [
      { key: "wipesHeading", label: "Heading" },
      { key: "wipesCopy", label: "Description", multiline: true },
    ],
  },
  {
    name: "Corporate orders",
    description: "The invitation beside the corporate photograph.",
    fields: [
      { key: "corporateHeading", label: "Heading" },
      { key: "corporateCopy", label: "Description", multiline: true },
    ],
  },
  {
    name: "Brand story",
    description: "The final homepage message before customers continue to the About page.",
    fields: [
      { key: "storyHeading", label: "Heading" },
      { key: "storyCopy", label: "Description", multiline: true },
    ],
  },
];

export function HomepageCopyManager({ initialContent }: { initialContent: HomepageCopy }) {
  const [content, setContent] = useState(initialContent);
  const [savedContent, setSavedContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const dirty = useMemo(
    () => JSON.stringify(content) !== JSON.stringify(savedContent),
    [content, savedContent],
  );

  const update = (key: CopyField, value: string) => {
    setContent((current) => ({ ...current, [key]: value }));
  };

  const publish = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/content/homepage-copy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Homepage text could not be published");
      setContent(result.content);
      setSavedContent(result.content);
      toast.success("Homepage text published");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Homepage text could not be published");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section id="homepage-text" className="mt-16 scroll-mt-6 border-t border-ink/20 pt-10">
      <div className="border-b border-ink/20 pb-7">
        <h2 className="font-display text-4xl tracking-[-.025em] md:text-5xl">Homepage text</h2>
        <p className="mt-3 max-w-[68ch] text-sm leading-relaxed text-ink/70">
          Edit the homepage’s brand and section copy here. Product names, prices, pack sizes and stock remain in the catalogue manager.
        </p>
      </div>

      <div className="divide-y divide-ink/20">
        {sections.map((section) => (
          <fieldset key={section.name} className="grid gap-5 py-8 lg:grid-cols-[minmax(13rem,.55fr)_minmax(24rem,1.45fr)] lg:gap-12">
            <legend className="sr-only">{section.name}</legend>
            <div>
              <h3 className="font-display text-3xl">{section.name}</h3>
              <p className="mt-2 max-w-[42ch] text-sm leading-relaxed text-ink/65">{section.description}</p>
            </div>
            <div className="grid gap-5">
              {section.fields.map((field) => (
                <label key={field.key} className="grid gap-2 text-sm font-semibold">
                  {field.label}
                  {field.multiline ? (
                    <textarea
                      value={content[field.key]}
                      maxLength={320}
                      rows={3}
                      onChange={(event) => update(field.key, event.target.value)}
                      className="resize-y border border-ink/30 bg-white px-4 py-3 font-normal leading-relaxed focus:border-ink"
                    />
                  ) : (
                    <input
                      value={content[field.key]}
                      maxLength={90}
                      onChange={(event) => update(field.key, event.target.value)}
                      className="min-h-12 border border-ink/30 bg-white px-4 font-normal focus:border-ink"
                    />
                  )}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>

      <div className="flex flex-col gap-3 border-t border-ink/20 py-6 sm:flex-row sm:items-center sm:justify-end">
        <p className="text-sm text-ink/65" role="status">
          {dirty ? "You have unpublished text changes." : "Homepage text is published."}
        </p>
        <button type="button" onClick={() => setContent(savedContent)} disabled={!dirty || saving} className="inline-flex min-h-12 items-center justify-center border border-ink/30 px-5 text-sm font-semibold hover:border-ink disabled:cursor-not-allowed disabled:opacity-40">
          Discard changes
        </button>
        <button type="button" onClick={() => void publish()} disabled={!dirty || saving} className="inline-flex min-h-12 items-center justify-center gap-2 bg-ink px-6 text-sm font-semibold text-white hover:bg-walnut disabled:cursor-not-allowed disabled:opacity-40">
          <FloppyDisk aria-hidden="true" /> {saving ? "Publishing…" : "Publish text"}
        </button>
      </div>
    </section>
  );
}
