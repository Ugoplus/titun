import { describe, expect, it } from "vitest";
import { formatNigerianPhone, normalizeWhatsAppNumber } from "./contact";

describe("TITUN contact details", () => {
  it("converts a Nigerian local number to WhatsApp international format", () => {
    expect(normalizeWhatsAppNumber("07069310085")).toBe("2347069310085");
  });

  it("formats the WhatsApp number for display", () => {
    expect(formatNigerianPhone("2347069310085")).toBe("0706 931 0085");
  });
});
