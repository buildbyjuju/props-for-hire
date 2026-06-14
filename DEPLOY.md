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
| **Stripe** | Prop hire checkout (test mode first) |
| **Resend** | Quote request emails to your inbox |
| **Vercel Blob** | Inspiration photos on quote form |

## 3. Database

```bash
npm run db:push
npm run db:seed
```

`db:seed` loads items from [`data/items.json`](data/items.json). Edit that file and re-run seed when you add props.

**Important:** Online hire and checkout only work after the database is seeded. Until then, the site shows the catalogue using static data (browse only).

## 4. Stripe (test mode)

1. Create products/prices are created dynamically at checkout — no manual Stripe products needed.
2. In [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/test/webhooks), add endpoint:
   - Local: use [Stripe CLI](https://stripe.com/docs/stripe-cli):  
     `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
   - Production: `https://your-domain.com/api/webhooks/stripe`
3. Listen for `checkout.session.completed` and `checkout.session.expired`.
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`.

### Test checkout

1. Add a prop to cart and pick a future date.
2. Use test card `4242 4242 4242 4242`, any future expiry, any CVC.
3. Confirm the booking row shows `paid` in Neon and the date is unavailable on the calendar.

## 5. Resend

1. Verify your domain or use `onboarding@resend.dev` for testing.
2. Set `QUOTE_NOTIFICATION_EMAIL` to the inbox that should receive quotes.
3. Submit the quote form on the home page with a test image.

## 6. Vercel deploy

1. Push the repo to GitHub and import in [Vercel](https://vercel.com).
2. Add all environment variables from `.env.example` in Project Settings.
3. Connect **Neon** and **Blob** integrations if available.
4. After deploy, update `NEXT_PUBLIC_SITE_URL` to your production URL.
5. Register the production Stripe webhook URL.

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
