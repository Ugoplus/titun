import { describe, expect, it } from "vitest";
import { formatNigerianPhone, getContactDetails, normalizeWhatsAppNumber } from "./contact";
import { defaultSiteSettings } from "./site-content";

describe("TITUN contact details", () => {
  it("converts a Nigerian local number to WhatsApp international format", () => {
    expect(normalizeWhatsAppNumber("07069310085")).toBe("2347069310085");
  });

  it("formats the WhatsApp number for display", () => {
    expect(formatNigerianPhone("2347069310085")).toBe("0706 931 0085");
  });

  it("builds safe social links from editable account names", () => {
    expect(getContactDetails(defaultSiteSettings)).toMatchObject({
      instagramUrl: "https://www.instagram.com/Titunrenewal/",
      tiktokUrl: "https://www.tiktok.com/@Titunrenewal",
      whatsappHref: "https://wa.me/2347069310085",
    });
  });
});
