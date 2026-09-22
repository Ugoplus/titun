import { describe, expect, it } from "vitest";
import {
  formatNigerianPhone,
  formatWhatsAppPhone,
  getContactDetails,
  normalizeWhatsAppNumber,
} from "./contact";
import { defaultSiteSettings } from "./site-content";

describe("TITUN contact details", () => {
  it("converts a Nigerian local number to WhatsApp international format", () => {
    expect(normalizeWhatsAppNumber("07069310085")).toBe("2347069310085");
  });

  it("formats the WhatsApp number for display", () => {
    expect(formatNigerianPhone("2347069310085")).toBe("0706 931 0085");
  });

  it("preserves a UK number as an international WhatsApp destination", () => {
    expect(normalizeWhatsAppNumber("+44 7933 965107")).toBe("447933965107");
    expect(normalizeWhatsAppNumber("07933 965107")).toBe("447933965107");
    expect(formatWhatsAppPhone("+44 7933 965107")).toBe("+44 7933 965107");
    expect(formatWhatsAppPhone("07933 965107")).toBe("+44 7933 965107");

    expect(getContactDetails({
      ...defaultSiteSettings,
      whatsappNumber: "+44 7933 965107",
    })).toMatchObject({
      whatsappHref: "https://wa.me/447933965107",
      whatsappLabel: "+44 7933 965107",
    });
    expect(getContactDetails({
      ...defaultSiteSettings,
      whatsappNumber: "07933 965107",
    })).toMatchObject({
      whatsappHref: "https://wa.me/447933965107",
      whatsappLabel: "+44 7933 965107",
    });
  });

  it("builds safe social links from editable account names", () => {
    expect(getContactDetails(defaultSiteSettings)).toMatchObject({
      instagramUrl: "https://www.instagram.com/Titunrenewal/",
      tiktokUrl: "https://www.tiktok.com/@Titunrenewal",
      whatsappHref: "https://wa.me/2347069310085",
    });
  });
});
