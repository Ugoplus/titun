import type { SiteSettings } from "@/lib/site-content";

export const normalizeWhatsAppNumber = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return /^0\d{10}$/.test(digits) ? `234${digits.slice(1)}` : digits;
};

export const formatNigerianPhone = (value: string) => {
  const digits = normalizeWhatsAppNumber(value);
  if (!/^234\d{10}$/.test(digits)) return value;
  const local = `0${digits.slice(3)}`;
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
};

const accountName = (value: string) => value.replace(/^@/, "");

export function getContactDetails(settings: SiteSettings) {
  const whatsappNumber = normalizeWhatsAppNumber(settings.whatsappNumber);
  const instagramAccount = accountName(settings.instagramHandle);
  const tiktokAccount = accountName(settings.tiktokHandle);

  return {
    email: settings.contactEmail || null,
    instagramUrl: `https://www.instagram.com/${instagramAccount}/`,
    instagramLabel: `@${instagramAccount}`,
    tiktokUrl: `https://www.tiktok.com/@${tiktokAccount}`,
    tiktokLabel: `@${tiktokAccount}`,
    whatsappHref: `https://wa.me/${whatsappNumber}`,
    whatsappLabel: formatNigerianPhone(whatsappNumber),
  };
}

export type ContactDetails = ReturnType<typeof getContactDetails>;
