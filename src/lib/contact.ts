import type { SiteSettings } from "@/lib/site-content";

export const normalizeWhatsAppNumber = (value: string) => {
  const digits = value.replace(/\D/g, "");
  const internationalDigits = digits.startsWith("00") ? digits.slice(2) : digits;
  if (/^07[1-57-9]\d{8}$/.test(internationalDigits))
    return `44${internationalDigits.slice(1)}`;
  return /^0\d{10}$/.test(internationalDigits)
    ? `234${internationalDigits.slice(1)}`
    : internationalDigits;
};

export const formatNigerianPhone = (value: string) => {
  const digits = normalizeWhatsAppNumber(value);
  if (!/^234\d{10}$/.test(digits)) return value;
  const local = `0${digits.slice(3)}`;
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
};

export const formatWhatsAppPhone = (value: string) => {
  const digits = normalizeWhatsAppNumber(value);
  if (/^234\d{10}$/.test(digits)) return formatNigerianPhone(digits);
  if (/^44\d{10}$/.test(digits))
    return `+44 ${digits.slice(2, 6)} ${digits.slice(6)}`;
  return digits ? `+${digits}` : value;
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
    whatsappLabel: formatWhatsAppPhone(settings.whatsappNumber),
  };
}

export type ContactDetails = ReturnType<typeof getContactDetails>;
