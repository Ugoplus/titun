# TITUN storefront

A mobile-first storefront, community events area and operations dashboard for TITUN refreshing towels. The app includes product browsing, search, a persistent basket, Stripe and Paystack checkout, inventory reservations, signed payment webhooks, discount support, product-image uploads, order emails and low-stock alerts.

## Stack

- Next.js App Router and TypeScript
- PostgreSQL with Drizzle ORM
- Paystack and Stripe hosted checkout
- SMTP email via Nodemailer
- Local persistent image storage on the VPS
- Tailwind CSS 3

Money is stored in the smallest currency unit: `₦1,800` is stored as `180000` kobo. The browser never decides the charge amount; every price and discount is recalculated from PostgreSQL.

## Local setup

1. Copy `.env.example` to `.env` and fill in the values.
2. Create the PostgreSQL database and user.
3. Run `npm run db:migrate`.
4. Run `npm run dev`.

Without `DATABASE_URL`, public pages use a read-only sample catalogue so the design can be previewed. Checkout and admin operations intentionally require a database.

Generate the admin password hash:

```bash
node -e "console.log(require('bcryptjs').hashSync(process.argv[1], 12))" 'choose-a-strong-password'
```

Generate secrets with `openssl rand -base64 48`. Never commit `.env`.

## Payments

Customers choose Paystack or Stripe at checkout. Both gateways use the same server-owned order totals, inventory reservation and fulfilment pipeline.

Add the Paystack live or test secret key as `PAYSTACK_SECRET_KEY`. In Paystack, register this webhook URL:

```text
https://shop.titun.co/api/payments/paystack/webhook
```

Add `STRIPE_SECRET_KEY` and the endpoint signing secret as `STRIPE_WEBHOOK_SECRET`. In Stripe, register:

```text
https://shop.titun.co/api/payments/stripe/webhook
```

Subscribe the Stripe endpoint to `checkout.session.completed` and `checkout.session.async_payment_succeeded`.

Stock is reserved for 35 minutes when checkout starts. Only a successful payment verified using the selected gateway’s signed webhook reduces physical stock. Replayed webhooks do not double-charge inventory. The five-minute cron in `deploy/release-stock.cron` releases abandoned reservations.

## Community events

The public Community tab lists published upcoming events. Each event has capacity-controlled admission and an admin-selected set of recommended TITUN products that guests see before entering checkout. Tickets and optional products share one order and one Stripe or Paystack payment.

Create and review events at `/admin/events`. After a successful event payment, the purchaser is saved or updated as a community member and linked to that event and order. Event capacity uses the same reservation and low-stock system as physical products, which prevents overselling while a payment is in progress.

## Email

Use any SMTP provider by filling in `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` and `EMAIL_FROM`. A paid order emails the customer and `ORDER_NOTIFICATION_EMAIL`. The first time a product falls at or below its threshold, `LOW_STOCK_EMAIL` receives an alert. Restocking above the threshold arms that alert again.

## Ubuntu VPS deployment

The supplied files assume Ubuntu, Nginx, PostgreSQL and systemd—no container layer is required.

1. Install Node.js 24, PostgreSQL, Nginx and Certbot.
2. Create a locked-down `titun` Linux user, `/opt/titun`, and `/var/lib/titun/uploads` owned by that user.
3. Copy the project to `/opt/titun`, create `/opt/titun/.env`, then run `npm ci`, `npm run db:migrate`, and `npm run build`.
4. Copy `.next/static` into `.next/standalone/.next/static` and `public` into `.next/standalone/public` if deploying only the standalone folder. The supplied service starts the project-root standalone build.
5. Copy `deploy/titun.service` to `/etc/systemd/system/`, run `systemctl daemon-reload`, then `systemctl enable --now titun`.
6. Copy `deploy/nginx.conf` to `/etc/nginx/sites-available/titun`, enable it, test with `nginx -t`, and reload Nginx.
7. Run `certbot --nginx -d shop.titun.co` for HTTPS.
8. Install the reservation-release cron after replacing its secret.

Check deployment health at `/api/health`. Back up both PostgreSQL and `/var/lib/titun/uploads` daily.

## Verification

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

The shop dashboard is at `/admin`, and community administration is at `/admin/events`. Update the placeholder WhatsApp number, Instagram URL, domain and delivery wording before launch.
