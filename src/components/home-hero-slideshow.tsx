"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

const slideContent = [
  {
    image: "/images/titun/hero-lounge.jpg",
    alt: "TITUN refreshing towels presented in a quiet hospitality setting",
    title: "The Art of Renewal",
    copy: "Scented refreshing towels for moments of welcome, movement and everyday care.",
  },
  {
    image: "/images/titun/wipes-lifestyle.jpg",
    alt: "A guest enjoying a TITUN refreshing wipe",
    title: "A thoughtful welcome",
    copy: "A simple gesture, made memorable through scent, softness and considered presentation.",
  },
  {
    image: "/images/titun/movement-kit.jpg",
    alt: "TITUN refreshing towels prepared for travel and movement",
    title: "Refresh wherever life moves",
    copy: "Individually sealed and ready for travel, dining, wellness and the everyday in between.",
  },
] as const;

export function HomeHeroSlideshow({ images }: { images: [string, string, string] }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slideContent.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="TITUN introduction"
      className="relative isolate min-h-[39rem] overflow-hidden bg-ink md:min-h-[46rem]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
    >
      {slideContent.map((slide, index) => (
        <div
          key={`${index}-${images[index]}`}
          aria-hidden={activeSlide !== index}
          className={`absolute inset-0 transition-opacity duration-700 ease-out motion-reduce:transition-none ${
            activeSlide === index ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={images[index]}
            alt={activeSlide === index ? slide.alt : ""}
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-ink/55" />
        </div>
      ))}

      <div className="relative z-10 flex min-h-[39rem] items-center justify-center px-5 py-24 text-center text-white md:min-h-[46rem] md:px-8">
        <div className="max-w-4xl" aria-live="polite" aria-atomic="true">
          <h1 className="text-balance font-display text-[clamp(3.75rem,8vw,6rem)] leading-[.88] tracking-[-.035em]">
            {slideContent[activeSlide].title}
          </h1>
          <p className="mx-auto mt-6 max-w-[52ch] text-base leading-relaxed text-white/90 md:text-lg">
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
    </section>
  );
}
