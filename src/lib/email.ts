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
