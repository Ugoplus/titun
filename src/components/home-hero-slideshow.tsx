"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Pause, Play } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

const slideContent = [
  {
    type: "video",
    src: "/videos/titun-renewal.m4v",
    poster: "/videos/titun-renewal-poster.jpg",
    duration: 7000,
    title: "The Art of Renewal",
    copy: "Scented refreshing towels for moments of welcome, movement and everyday care.",
  },
  {
    type: "image",
    imageIndex: 1,
    duration: 4500,
    alt: "A guest enjoying a TITUN refreshing wipe",
    title: "A thoughtful welcome",
    copy: "A simple gesture, made memorable through scent, softness and considered presentation.",
  },
  {
    type: "image",
    imageIndex: 2,
    duration: 4500,
    alt: "TITUN refreshing towels prepared for travel and movement",
    title: "Refresh wherever life moves",
    copy: "Individually sealed and ready for travel, dining, wellness and the everyday in between.",
  },
] as const;

export function HomeHeroSlideshow({ images }: { images: [string, string, string] }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [autoplayEnabled, setAutoplayEnabled] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyMotionPreference = () => setAutoplayEnabled(!motionPreference.matches);

    applyMotionPreference();
    motionPreference.addEventListener("change", applyMotionPreference);
    return () => motionPreference.removeEventListener("change", applyMotionPreference);
  }, []);

  useEffect(() => {
    if (!autoplayEnabled || interactionPaused) return;
    const timer = window.setTimeout(() => {
      setActiveSlide((current) => (current + 1) % slideContent.length);
    }, slideContent[activeSlide].duration);
    return () => window.clearTimeout(timer);
  }, [activeSlide, autoplayEnabled, interactionPaused]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (activeSlide === 0 && autoplayEnabled) {
      void video.play().catch(() => undefined);
      return;
    }
    video.pause();
    if (activeSlide !== 0) video.currentTime = 0;
  }, [activeSlide, autoplayEnabled]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="TITUN introduction"
      className="relative isolate min-h-[39rem] overflow-hidden bg-ink md:min-h-[46rem]"
      onMouseEnter={() => setInteractionPaused(true)}
      onMouseLeave={() => setInteractionPaused(false)}
      onFocusCapture={() => setInteractionPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setInteractionPaused(false);
      }}
    >
      {slideContent.map((slide, index) => (
        <div
          key={slide.title}
          aria-hidden={activeSlide !== index}
          className={`absolute inset-0 transition-opacity duration-500 ease-out motion-reduce:transition-none ${
            activeSlide === index ? "opacity-100" : "opacity-0"
          }`}
        >
          {slide.type === "video" ? (
            <video
              ref={videoRef}
              muted
              loop
              playsInline
              preload="metadata"
              poster={slide.poster}
              className="h-full w-full object-cover object-center"
              aria-hidden="true"
            >
              <source src={slide.src} type="video/mp4" />
            </video>
          ) : (
            <Image
              src={images[slide.imageIndex]}
              alt={activeSlide === index ? slide.alt : ""}
              fill
              sizes="100vw"
              className="object-cover object-center"
            />
          )}
          <div className="absolute inset-0 bg-ink/55" />
        </div>
      ))}

      <div className="relative z-10 flex min-h-[39rem] items-center justify-center px-5 py-24 text-center text-white md:min-h-[46rem] md:px-8">
        <div className="max-w-4xl">
          <h1 className="text-balance font-display text-[clamp(3.25rem,6.5vw,5rem)] leading-[.9] tracking-[-.03em]">
            {slideContent[activeSlide].title}
          </h1>
          <p className="mx-auto mt-5 max-w-[52ch] text-sm leading-relaxed text-white/90 md:text-base">
            {slideContent[activeSlide].copy}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/shop"
              className="inline-flex min-h-12 items-center gap-4 bg-white px-6 text-sm font-semibold text-ink transition-colors hover:bg-cream"
            >
              Shop the collection <ArrowRight aria-hidden="true" />
            </Link>
            <Link
              href="/corporate"
              className="inline-flex min-h-12 items-center border border-white/70 px-6 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-ink"
            >
              Corporate orders
            </Link>
          </div>
        </div>
      </div>

      <button
        type="button"
        onFocus={() => setInteractionPaused(false)}
        onClick={() => setAutoplayEnabled((enabled) => !enabled)}
        className="absolute bottom-5 right-5 z-20 grid h-11 w-11 place-content-center border border-white/60 bg-ink/55 text-white transition-colors hover:bg-white hover:text-ink md:bottom-7 md:right-8"
        aria-label={autoplayEnabled ? "Pause slideshow" : "Play slideshow"}
        title={autoplayEnabled ? "Pause slideshow" : "Play slideshow"}
      >
        {autoplayEnabled ? <Pause size={18} weight="fill" aria-hidden="true" /> : <Play size={18} weight="fill" aria-hidden="true" />}
      </button>
    </section>
  );
}
