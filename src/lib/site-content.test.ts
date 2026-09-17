import { describe, expect, it } from "vitest";
import {
  defaultHomepageCopy,
  homepageCopySchema,
  homepageHeroSlidesSchema,
} from "./site-content";

const slide = {
  id: "welcome",
  mediaType: "video" as const,
  mediaUrl: "/uploads/2b7f745c-8c99-4be5-bfdb-1126e53845ea.mp4",
  posterUrl: "/videos/titun-renewal-poster.jpg",
  title: "The Art of Renewal",
  copy: "A considered moment of welcome.",
  alt: "",
  durationMs: 4500,
};

describe("homepage content", () => {
  it("accepts a locally hosted slideshow video", () => {
    expect(homepageHeroSlidesSchema.parse([slide])).toEqual([slide]);
  });

  it("rejects remote media and unsafe slideshow timing", () => {
    expect(() =>
      homepageHeroSlidesSchema.parse([
        { ...slide, mediaUrl: "https://example.com/video.mp4", durationMs: 500 },
      ]),
    ).toThrow();
  });

  it("accepts the complete homepage copy model", () => {
    expect(homepageCopySchema.parse(defaultHomepageCopy)).toEqual(defaultHomepageCopy);
  });

  it("rejects missing homepage headings", () => {
    expect(() =>
      homepageCopySchema.parse({ ...defaultHomepageCopy, storyHeading: "" }),
    ).toThrow();
  });
});
