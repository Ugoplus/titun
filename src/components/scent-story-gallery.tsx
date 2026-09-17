"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Minus, Plus } from "@phosphor-icons/react";
import { useState } from "react";

export type ScentStory = {
  name: string;
  tagline: string;
  description: string;
  image: string;
  href: string;
};

export function ScentStoryGallery({ stories }: { stories: ScentStory[] }) {
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const selectedStory = stories.find(({ name }) => name === selectedName) ?? null;

  return (
    <div>
      <div className="filter-scroll mt-8 grid snap-x snap-mandatory grid-flow-col auto-cols-[82%] gap-3 overflow-x-auto pb-3 sm:auto-cols-[46%] lg:grid-flow-row lg:auto-cols-auto lg:grid-cols-3 lg:overflow-visible">
        {stories.map((story) => {
          const selected = selectedName === story.name;
          const panelId = `scent-story-${story.name.toLowerCase().replaceAll(" ", "-")}`;

          return (
            <button
              key={story.name}
              type="button"
              aria-expanded={selected}
              aria-controls={panelId}
              onClick={(event) => {
                setSelectedName(selected ? null : story.name);
                if (!selected) {
                  event.currentTarget.scrollIntoView({
                    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
                    block: "nearest",
                    inline: "center",
                  });
                }
              }}
              className="group block snap-start bg-ink text-left text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
            >
              <span className="relative block aspect-[944/1080] overflow-hidden">
                <Image
                  src={story.image}
                  alt={`${story.name} scent story for TITUN refreshing towels`}
                  fill
                  sizes="(max-width: 640px) 82vw, (max-width: 1024px) 46vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02] group-focus-visible:scale-[1.02] motion-reduce:transition-none"
                />
              </span>
              <span className="flex min-h-14 items-center justify-between gap-4 border-t border-white/20 px-4 text-sm font-semibold">
                <span>{selected ? "Close story" : "Read the scent story"}</span>
                {selected ? <Minus aria-hidden="true" /> : <Plus aria-hidden="true" />}
              </span>
            </button>
          );
        })}
      </div>

      {selectedStory ? (
        <article
          id={`scent-story-${selectedStory.name.toLowerCase().replaceAll(" ", "-")}`}
          aria-live="polite"
          className="mt-4 border-y border-ink/20 py-8 md:py-10"
        >
          <div className="grid gap-5 md:grid-cols-[minmax(10rem,.55fr)_minmax(18rem,1.45fr)] md:gap-12">
            <h3 className="text-xs font-bold uppercase tracking-[.09em] text-gold">{selectedStory.name}</h3>
            <div>
              <p className="max-w-[28ch] font-display text-3xl leading-tight tracking-[-.02em] md:text-4xl">
                {selectedStory.tagline}
              </p>
              <p className="mt-4 max-w-[62ch] leading-relaxed text-ink/70">{selectedStory.description}</p>
              <Link href={selectedStory.href} className="mt-6 inline-flex min-h-11 items-center gap-3 border-b border-ink pb-1 text-sm font-semibold">
                Shop {selectedStory.name} <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </article>
      ) : null}
    </div>
  );
}
