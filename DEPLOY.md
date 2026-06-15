# Dreamscape Event — Deploy & setup guide

## 1. Install dependencies

```bash
npm install
```

## 2. Environment variables

Copy `.env.example` to `.env.local` and fill in every value.

| Service | Purpose |
|---------|---------|
| **Neon** | Categories, items, bookings, quote records |
| **Stripe** | Prop hire checkout (live mode in production) |
| **Resend** | Quote request emails to your inbox |
| **Vercel Blob** | Inspiration photos on quote form |

## 3. Database

```bash
npm run db:push
npm run db:seed
```

`db:seed` loads items from [`data/items.json`](data/items.json). Edit that file and re-run seed when you add props.

**Important:** Online hire and checkout only work after the database is seeded. Until then, the site shows the catalogue using static data (browse only).

## 4. Stripe (live checkout)

Checkout uses **Stripe Checkout** — customers pay on Stripe’s secure hosted page, then return to your thank-you page.

### Live keys (production)

1. In [Stripe Dashboard → API keys](https://dashboard.stripe.com/apikeys), copy your **live** secret key (`sk_live_...`) to `STRIPE_SECRET_KEY`.
2. Products and prices are created automatically at checkout — no manual Stripe products needed.
3. In [Stripe Dashboard → Webhooks (live mode)](https://dashboard.stripe.com/webhooks), add endpoint:
   - Production: `https://your-domain.com/api/webhooks/stripe`
   - Local testing with live keys is not recommended; use test keys locally instead.
4. Subscribe to:
   - `checkout.session.completed`
   - `checkout.session.expired`
5. Copy the **live** webhook signing secret to `STRIPE_WEBHOOK_SECRET` (`whsec_...`).

After a successful payment, the webhook will:

- Mark bookings as **paid** in Neon
- Email the customer a booking confirmation
- Email you the full booking details at `BOOKING_NOTIFICATION_EMAIL` (falls back to `QUOTE_NOTIFICATION_EMAIL`)

### Local development (optional test mode)

For local testing only, you may use test keys (`sk_test_...`) and the [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Use test card `4242 4242 4242 4242`. **Production deployments require live keys** — test keys are rejected when `NODE_ENV=production`.

### Verify checkout

1. Run `npm run db:push && npm run db:seed` so hire items exist in the database.
2. Add a prop to cart and pick a future date.
3. Complete checkout on the live Stripe page.
4. Confirm:
   - Thank-you page shows your booking summary
   - Customer receives confirmation email
   - You receive a new-booking email
   - The booked date is unavailable on the calendar in Neon

## 5. Resend

1. Verify your sending domain in Resend, or use `onboarding@resend.dev` for testing only.
2. Set `RESEND_FROM_EMAIL` to your verified sender (e.g. `Dream Scape Moments <bookings@yourdomain.com>`).
3. Set `BOOKING_NOTIFICATION_EMAIL` and `QUOTE_NOTIFICATION_EMAIL` to the inbox that should receive bookings and quote enquiries.
4. Submit the quote form on the home page with a test image.

## 6. Vercel deploy

1. Push the repo to GitHub and import in [Vercel](https://vercel.com).
2. Add all environment variables from `.env.example` in Project Settings — use **live** Stripe keys for production.
3. Connect **Neon** and **Blob** integrations if available.
4. After deploy, set `NEXT_PUBLIC_SITE_URL` to your production URL.
5. Register the **live** Stripe webhook URL: `https://your-domain.com/api/webhooks/stripe`.

## 7. Your content

- **Props:** Edit [`data/items.json`](data/items.json), add images under `public/props/`, run `npm run db:seed`.
- **Portfolio:** Update images in [`components/home/WorkSection.tsx`](components/home/WorkSection.tsx).
- **Testimonials:** Update [`components/home/TestimonialsSection.tsx`](components/home/TestimonialsSection.tsx).
- **Social links:** Set `NEXT_PUBLIC_*_URL` env vars.

## Local development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
