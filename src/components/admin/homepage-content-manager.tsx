"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowSquareOut,
  ArrowUp,
  FloppyDisk,
  ImageSquare,
  Plus,
  Trash,
  UploadSimple,
  VideoCamera,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { HomepageHeroSlide } from "@/lib/site-content";

type UploadResult = {
  url: string;
  mediaType: "image" | "video";
  error?: string;
};

function mediaTypeForUrl(url: string) {
  const extension = url.split(".").pop()?.toLowerCase();
  if (extension === "webm") return "video/webm";
  if (extension === "mov") return "video/quicktime";
  return "video/mp4";
}

function VideoPreview({ slide }: { slide: HomepageHeroSlide }) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative h-full w-full bg-ink">
      {slide.posterUrl && (
        <Image
          src={slide.posterUrl}
          alt=""
          fill
          unoptimized
          sizes="(max-width: 1024px) 100vw, 42vw"
          className="object-cover"
        />
      )}
      <video
        controls={ready}
        muted
        playsInline
        preload="metadata"
        poster={slide.posterUrl || undefined}
        onCanPlay={() => setReady(true)}
        onError={() => setFailed(true)}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-0"}`}
      >
        <source src={slide.mediaUrl} type={mediaTypeForUrl(slide.mediaUrl)} />
      </video>
      {!ready && !failed && (
        <p className="absolute inset-x-3 bottom-3 bg-white px-3 py-2 text-xs font-semibold text-ink">
          Preparing video preview…
        </p>
      )}
      {failed && (
        <p role="alert" className="absolute inset-x-3 bottom-3 bg-white px-3 py-2 text-xs font-semibold leading-relaxed text-red-900">
          Preview unavailable. Replace this file with an MP4 or MOV video and try again.
        </p>
      )}
    </div>
  );
}

export function HomepageContentManager({
  initialSlides,
}: {
  initialSlides: HomepageHeroSlide[];
}) {
  const [slides, setSlides] = useState(initialSlides);
  const [savedSlides, setSavedSlides] = useState(initialSlides);
  const [uploading, setUploading] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const dirty = useMemo(
    () => JSON.stringify(slides) !== JSON.stringify(savedSlides),
    [slides, savedSlides],
  );

  const updateSlide = (index: number, values: Partial<HomepageHeroSlide>) => {
    setSlides((current) =>
      current.map((slide, slideIndex) =>
        slideIndex === index ? { ...slide, ...values } : slide,
      ),
    );
  };

  const uploadFile = async (
    index: number,
    file: File | undefined,
    target: "media" | "poster",
  ) => {
    if (!file) return;
    const uploadKey = `${index}-${target}`;
    setUploading(uploadKey);
    try {
      const body = new FormData();
      body.set("file", file);
      const response = await fetch("/api/admin/uploads", {
        method: "POST",
        body,
      });
      const result = (await response.json()) as UploadResult;
      if (!response.ok) throw new Error(result.error ?? "File could not be uploaded");
      if (target === "poster" && result.mediaType !== "image") {
        throw new Error("Choose an image for the video poster");
      }
      updateSlide(
        index,
        target === "poster"
          ? { posterUrl: result.url }
          : {
              mediaUrl: result.url,
              mediaType: result.mediaType,
              ...(result.mediaType === "image" ? { posterUrl: "" } : {}),
            },
      );
      toast.success(
        target === "poster"
          ? "Poster image ready to publish"
          : "Slide media ready to publish",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "File could not be uploaded");
    } finally {
      setUploading(null);
    }
  };

  const moveSlide = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= slides.length) return;
    setSlides((current) => {
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  };

  const addSlide = () => {
    if (slides.length >= 6) return;
    setSlides((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        mediaType: "image",
        mediaUrl: "/images/titun/hero-lounge.jpg",
        posterUrl: "",
        title: "A new TITUN moment",
        copy: "Add a short description for this moment.",
        alt: "TITUN refreshing towel",
        durationMs: 4500,
      },
    ]);
  };

  const save = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/content/home-hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Changes could not be saved");
      setSlides(result.slides);
      setSavedSlides(result.slides);
      toast.success("Homepage slideshow published");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Changes could not be saved");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section id="homepage-slideshow" className="mt-10 scroll-mt-6">
      <div className="flex flex-col gap-5 border-b border-ink/20 pb-7 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-display text-4xl tracking-[-.025em] md:text-5xl">
            Homepage slideshow
          </h2>
          <p className="mt-3 max-w-[68ch] text-sm leading-relaxed text-ink/70">
            Replace a photo or video, edit its words, and arrange the slides. Uploads stay in this editor until you publish them.
          </p>
        </div>
        <Link
          href="/"
          target="_blank"
          className="inline-flex min-h-11 w-fit items-center gap-2 border border-ink px-4 text-sm font-semibold hover:bg-ink hover:text-white"
        >
          View website <ArrowSquareOut aria-hidden="true" />
        </Link>
      </div>

      <div className="divide-y divide-ink/20 border-b border-ink/20">
        {slides.map((slide, index) => (
          <article key={slide.id} className="grid gap-6 py-8 lg:grid-cols-[minmax(18rem,0.9fr)_minmax(24rem,1.1fr)] lg:gap-10">
            <div>
              <div className="relative aspect-video overflow-hidden bg-ink">
                {slide.mediaType === "video" ? (
                  <VideoPreview key={slide.mediaUrl} slide={slide} />
                ) : (
                  <Image
                    src={slide.mediaUrl}
                    alt=""
                    fill
                    unoptimized
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    className="object-cover"
                  />
                )}
                <span className="absolute left-3 top-3 inline-flex items-center gap-2 bg-white px-3 py-2 text-xs font-bold text-ink">
                  {slide.mediaType === "video" ? <VideoCamera aria-hidden="true" /> : <ImageSquare aria-hidden="true" />}
                  {slide.mediaType === "video" ? "Video" : "Image"}
                </span>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 border border-ink px-4 text-sm font-semibold hover:bg-ink hover:text-white focus-within:outline focus-within:outline-2 focus-within:outline-offset-2">
                  <UploadSimple aria-hidden="true" />
                  {uploading === `${index}-media` ? "Uploading…" : "Replace image or video"}
                  <input
                    type="file"
                    className="sr-only"
                    accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/x-m4v,video/webm,video/quicktime"
                    disabled={uploading !== null}
                    onChange={(event) => {
                      void uploadFile(index, event.target.files?.[0], "media");
                      event.currentTarget.value = "";
                    }}
                  />
                </label>
                {slide.mediaType === "video" && (
                  <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 border border-ink/30 px-4 text-sm font-semibold hover:border-ink focus-within:outline focus-within:outline-2 focus-within:outline-offset-2">
                    <ImageSquare aria-hidden="true" />
                    {uploading === `${index}-poster` ? "Uploading…" : "Replace cover image"}
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      disabled={uploading !== null}
                      onChange={(event) => {
                        void uploadFile(index, event.target.files?.[0], "poster");
                        event.currentTarget.value = "";
                      }}
                    />
                  </label>
                )}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-ink/60">
                Images: JPG, PNG, WebP or AVIF up to 6 MB. Videos: MP4, M4V, WebM or MOV up to 80 MB. Videos are prepared automatically for the website.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between gap-4 border-b border-ink/15 pb-4">
                <h3 className="font-display text-3xl">Slide {index + 1}</h3>
                <div className="flex gap-1">
                  <button type="button" onClick={() => moveSlide(index, -1)} disabled={index === 0} className="grid h-11 w-11 place-content-center border border-ink/25 disabled:cursor-not-allowed disabled:opacity-30" aria-label={`Move slide ${index + 1} earlier`}><ArrowUp aria-hidden="true" /></button>
                  <button type="button" onClick={() => moveSlide(index, 1)} disabled={index === slides.length - 1} className="grid h-11 w-11 place-content-center border border-ink/25 disabled:cursor-not-allowed disabled:opacity-30" aria-label={`Move slide ${index + 1} later`}><ArrowDown aria-hidden="true" /></button>
                  <button type="button" onClick={() => {
                    if (window.confirm(`Remove slide ${index + 1}? This will not affect the website until you publish.`)) {
                      setSlides((current) => current.filter((_, itemIndex) => itemIndex !== index));
                    }
                  }} disabled={slides.length === 1} className="grid h-11 w-11 place-content-center border border-ink/25 text-red-800 disabled:cursor-not-allowed disabled:opacity-30" aria-label={`Delete slide ${index + 1}`}><Trash aria-hidden="true" /></button>
                </div>
              </div>

              <div className="mt-5 grid gap-5">
                <label className="grid gap-2 text-sm font-semibold">
                  Heading
                  <input value={slide.title} maxLength={90} onChange={(event) => updateSlide(index, { title: event.target.value })} className="min-h-12 border border-ink/30 bg-white px-4 font-normal focus:border-ink" />
                </label>
                <label className="grid gap-2 text-sm font-semibold">
                  Description
                  <textarea value={slide.copy} maxLength={240} rows={3} onChange={(event) => updateSlide(index, { copy: event.target.value })} className="resize-y border border-ink/30 bg-white px-4 py-3 font-normal leading-relaxed focus:border-ink" />
                </label>
                {slide.mediaType === "image" && (
                  <label className="grid gap-2 text-sm font-semibold">
                    Image description <span className="font-normal text-ink/60">Describe what is visible for customers using a screen reader.</span>
                    <input value={slide.alt} maxLength={160} onChange={(event) => updateSlide(index, { alt: event.target.value })} className="min-h-12 border border-ink/30 bg-white px-4 font-normal focus:border-ink" />
                  </label>
                )}
                <label className="grid max-w-56 gap-2 text-sm font-semibold">
                  Time on screen
                  <select value={slide.durationMs} onChange={(event) => updateSlide(index, { durationMs: Number(event.target.value) })} className="min-h-12 border border-ink/30 bg-white px-4 font-normal focus:border-ink">
                    <option value={3000}>3 seconds</option>
                    <option value={4500}>4.5 seconds</option>
                    <option value={6000}>6 seconds</option>
                    <option value={7000}>7 seconds</option>
                    <option value={9000}>9 seconds</option>
                    <option value={12000}>12 seconds</option>
                  </select>
                </label>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={addSlide} disabled={slides.length >= 6} className="inline-flex min-h-12 items-center justify-center gap-2 border border-ink px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40">
          <Plus aria-hidden="true" /> Add slide
        </button>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <p className="text-sm text-ink/65" role="status">
            {dirty ? "You have unpublished changes." : "Everything is published."}
          </p>
          <button type="button" onClick={() => setSlides(savedSlides)} disabled={!dirty || saving} className="inline-flex min-h-12 items-center justify-center border border-ink/30 px-5 text-sm font-semibold hover:border-ink disabled:cursor-not-allowed disabled:opacity-40">
            Discard changes
          </button>
          <button type="button" onClick={() => void save()} disabled={!dirty || saving || uploading !== null} className="inline-flex min-h-12 items-center justify-center gap-2 bg-ink px-6 text-sm font-semibold text-white hover:bg-walnut disabled:cursor-not-allowed disabled:opacity-40">
            <FloppyDisk aria-hidden="true" /> {saving ? "Publishing…" : "Publish changes"}
          </button>
        </div>
      </div>
    </section>
  );
}
