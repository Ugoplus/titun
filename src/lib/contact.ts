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

const whatsappNumber = normalizeWhatsAppNumber(
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "07069310085",
);

export const contactDetails = {
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || null,
  instagramUrl:
    process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() ||
    "https://www.instagram.com/titunrenewal/",
  instagramLabel: "@Titunrenewal",
  tiktokUrl:
    process.env.NEXT_PUBLIC_TIKTOK_URL?.trim() ||
    "https://www.tiktok.com/@titunrenewal",
  tiktokLabel: "@Titunrenewal",
  whatsappHref: `https://wa.me/${whatsappNumber}`,
  whatsappLabel: formatNigerianPhone(whatsappNumber),
};
