import nodemailer from "nodemailer";
import type { Order } from "@/lib/db/schema";
import { formatMoney } from "@/lib/money";

const getTransport = () => {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
  });
};

export const isEmailDeliveryConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.EMAIL_FROM);

export const isAdminEmailSecurityReady = () =>
  isEmailDeliveryConfigured() &&
  Boolean(process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https://"));

const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  required = false,
) => {
  const transport = getTransport();
  if (!transport) {
    if (required) throw new Error("Email delivery is not configured");
    console.info(`[email skipped] ${subject} -> ${to}`);
    return;
  }
  await transport.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
};

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character] ?? character,
  );

export const sendOrderConfirmation = async (order: Order) => {
  const summary = `Order ${order.reference} · ${formatMoney(order.total, order.currency)}`;
  const html = `<div style="font-family:Arial,sans-serif;color:#17251e;max-width:560px;margin:auto"><p style="letter-spacing:.08em;text-transform:uppercase">TITUN</p><h1 style="font-family:Georgia,serif;font-weight:400">Your refresh is on its way.</h1><p>Thank you, ${order.customerName}. We’ve received your payment.</p><p><strong>${summary}</strong></p><p>We’ll send another update when your order is ready for delivery.</p></div>`;
  await Promise.all([
    sendEmail(order.customerEmail, `TITUN order confirmed · ${order.reference}`, html),
    process.env.ORDER_NOTIFICATION_EMAIL
      ? sendEmail(process.env.ORDER_NOTIFICATION_EMAIL, `New paid order · ${order.reference}`, html)
      : Promise.resolve(),
  ]);
};

export const sendLowStockAlert = async (productName: string, stock: number, threshold: number) => {
  if (!process.env.LOW_STOCK_EMAIL) return;
  await sendEmail(
    process.env.LOW_STOCK_EMAIL,
    `Low stock · ${productName}`,
    `<p><strong>${productName}</strong> has ${stock} unit${stock === 1 ? "" : "s"} remaining. Its alert threshold is ${threshold}.</p>`,
  );
};

export const sendFreeEventConfirmation = async (registration: {
  name: string;
  email: string;
  title: string;
  startsAt: Date;
  venue: string;
  quantity: number;
  reference: string;
}) => {
  const date = new Intl.DateTimeFormat("en-NG", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(registration.startsAt);
  const html = `<div style="font-family:Arial,sans-serif;color:#181511;max-width:560px;margin:auto;padding:32px 20px">
    <p style="letter-spacing:.08em;text-transform:uppercase;font-size:12px">TITUN Community</p>
    <h1 style="font-family:Georgia,serif;font-size:38px;line-height:1;font-weight:400">Your place is confirmed.</h1>
    <p>Hello ${escapeHtml(registration.name)}, you’re registered for <strong>${escapeHtml(registration.title)}</strong>.</p>
    <p><strong>${escapeHtml(date)}</strong><br>${escapeHtml(registration.venue)}</p>
    <p>${registration.quantity} ${registration.quantity === 1 ? "place" : "places"} · Reference ${escapeHtml(registration.reference)}</p>
  </div>`;
  await sendEmail(
    registration.email,
    `You’re registered · ${registration.title}`,
    html,
  );
};

export const sendCorporateEnquiryAlert = async (enquiry: {
  name: string;
  company: string;
  industry: string;
  email: string;
  phone: string;
  estimatedQuantity: number;
  productRequired: string;
  message: string;
}) => {
  const recipient =
    process.env.ORDER_NOTIFICATION_EMAIL ?? process.env.EMAIL_FROM;
  if (!recipient) return;
  const rows = [
    ["Name", enquiry.name],
    ["Company", enquiry.company],
    ["Industry", enquiry.industry],
    ["Email", enquiry.email],
    ["Phone", enquiry.phone],
    ["Estimated quantity", String(enquiry.estimatedQuantity)],
    ["Product", enquiry.productRequired],
  ]
    .map(
      ([label, value]) =>
        `<tr><th style="padding:8px;text-align:left">${escapeHtml(label)}</th><td style="padding:8px">${escapeHtml(value)}</td></tr>`,
    )
    .join("");
  await sendEmail(
    recipient,
    `Corporate enquiry · ${enquiry.company}`,
    `<div style="font-family:Arial,sans-serif;color:#181511;max-width:640px;margin:auto"><p style="letter-spacing:.08em;text-transform:uppercase">TITUN</p><h1 style="font-family:Georgia,serif;font-weight:400">New corporate enquiry</h1><table style="border-collapse:collapse;width:100%">${rows}</table><h2 style="font-family:Georgia,serif;font-weight:400">Message</h2><p>${escapeHtml(enquiry.message)}</p></div>`,
  );
};

const adminCodeEmail = ({
  heading,
  copy,
  code,
}: {
  heading: string;
  copy: string;
  code: string;
}) => `<div style="font-family:Arial,sans-serif;color:#181511;max-width:560px;margin:auto;padding:32px 20px">
  <p style="letter-spacing:.08em;text-transform:uppercase;font-size:12px">TITUN</p>
  <h1 style="font-family:Georgia,serif;font-size:38px;line-height:1;font-weight:400">${escapeHtml(heading)}</h1>
  <p style="font-size:16px;line-height:1.6">${escapeHtml(copy)}</p>
  <p style="font-size:32px;letter-spacing:.18em;font-weight:700;margin:28px 0">${escapeHtml(code)}</p>
  <p style="font-size:13px;line-height:1.6;color:#665f55">This code expires in 10 minutes and can only be used once. If you did not request it, you can ignore this email.</p>
</div>`;

export const sendAdminLoginCode = async (email: string, code: string) =>
  sendEmail(
    email,
    "Your TITUN admin sign-in code",
    adminCodeEmail({
      heading: "Confirm your sign-in",
      copy: "Enter this verification code to finish signing in to TITUN admin.",
      code,
    }),
    true,
  );

export const sendAdminPasswordResetCode = async (
  email: string,
  code: string,
) =>
  sendEmail(
    email,
    "Reset your TITUN admin password",
    adminCodeEmail({
      heading: "Reset your password",
      copy: "Enter this code on the password reset page, then choose a new passphrase.",
      code,
    }),
    true,
  );

export const sendAdminInvitation = async (
  email: string,
  name: string,
  code: string,
) => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const link = `${siteUrl}/admin/accept-invite`;
  return sendEmail(
    email,
    "You have been invited to TITUN admin",
    `<div style="font-family:Arial,sans-serif;color:#181511;max-width:560px;margin:auto;padding:32px 20px">
      <p style="letter-spacing:.08em;text-transform:uppercase;font-size:12px">TITUN</p>
      <h1 style="font-family:Georgia,serif;font-size:38px;line-height:1;font-weight:400">Your admin invitation</h1>
      <p style="font-size:16px;line-height:1.6">Hello ${escapeHtml(name)}, you have been invited to help manage TITUN.</p>
      <p style="font-size:32px;letter-spacing:.18em;font-weight:700;margin:28px 0">${escapeHtml(code)}</p>
      <p><a href="${escapeHtml(link)}" style="display:inline-block;background:#181511;color:#fff;padding:14px 20px;text-decoration:none">Accept invitation</a></p>
      <p style="font-size:13px;line-height:1.6;color:#665f55">The invitation code expires in 24 hours and can only be used once.</p>
    </div>`,
    true,
  );
};
