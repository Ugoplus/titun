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

const sendEmail = async (to: string, subject: string, html: string) => {
  const transport = getTransport();
  if (!transport) {
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

export const sendCustomOrderAlert = async (request: {
  reference: string;
  name: string;
  company: string | null;
  email: string;
  phone: string;
  orderType: string;
  estimatedQuantity: number;
  artworkUrl: string | null;
  message: string;
}) => {
  const recipient = process.env.ORDER_NOTIFICATION_EMAIL ?? process.env.EMAIL_FROM;
  if (!recipient) return;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const artwork = request.artworkUrl
    ? `<p><a href="${escapeHtml(`${siteUrl}${request.artworkUrl}`)}">View uploaded artwork</a></p>`
    : "<p>No artwork was uploaded.</p>";
  await sendEmail(
    recipient,
    `Custom order request · ${request.reference}`,
    `<div style="font-family:Arial,sans-serif;color:#181511;max-width:640px;margin:auto"><p style="letter-spacing:.08em;text-transform:uppercase">TITUN</p><h1 style="font-family:Georgia,serif;font-weight:400">New custom order request</h1><p><strong>${escapeHtml(request.orderType)}</strong> · ${request.estimatedQuantity.toLocaleString("en-NG")} units</p><p>${escapeHtml(request.name)}${request.company ? ` · ${escapeHtml(request.company)}` : ""}<br>${escapeHtml(request.email)}<br>${escapeHtml(request.phone)}</p>${artwork}<h2 style="font-family:Georgia,serif;font-weight:400">Requirements</h2><p>${escapeHtml(request.message)}</p></div>`,
  );
};
