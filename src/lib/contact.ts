const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "");

export const contactDetails = {
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || null,
  instagramUrl: process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() || null,
  whatsappHref: whatsappNumber
    ? `https://wa.me/${whatsappNumber}`
    : null,
};
