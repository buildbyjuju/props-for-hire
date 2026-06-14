# Dreamscape Event

Props for hire and event styling — birthdays, bridal showers, baby showers, zafeh, and more.

## Features

- Marketing home page (services, testimonials, portfolio, quote form, social)
- Six prop categories with hireable items
- Date picker with availability locking after Stripe payment
- Quote form with inspiration photo uploads

## Quick start

```bash
npm install
cp .env.example .env.local
# Configure .env.local — see DEPLOY.md
npm run db:push
npm run db:seed
npm run dev
```

Full setup (Stripe webhooks, Resend, Vercel): see **[DEPLOY.md](./DEPLOY.md)**.

## Stack

Next.js · Tailwind CSS · Drizzle · Neon · Stripe · Resend · Vercel Blob
