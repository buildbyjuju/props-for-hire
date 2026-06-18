import Stripe from "stripe";

export function isStripeLiveMode() {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  return key.startsWith("sk_live_");
}

export function getStripePublishableKey(): string | null {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();
  return key || null;
}

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key?.trim()) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  if (process.env.NODE_ENV === "production" && key.startsWith("sk_test_")) {
    throw new Error(
      "Production requires live Stripe keys. Set STRIPE_SECRET_KEY to sk_live_... from your Stripe dashboard.",
    );
  }

  return new Stripe(key.trim());
}

export function getStripeConfigError(): string | null {
  if (!process.env.STRIPE_SECRET_KEY?.trim()) {
    return "Payments are not set up yet. Add STRIPE_SECRET_KEY to your environment variables.";
  }

  const key = process.env.STRIPE_SECRET_KEY.trim();
  if (process.env.NODE_ENV === "production" && key.startsWith("sk_test_")) {
    return "Production requires live Stripe keys (sk_live_...).";
  }

  return null;
}

export function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

export function getBookingNotificationEmail() {
  return (
    process.env.BOOKING_NOTIFICATION_EMAIL ??
    process.env.QUOTE_NOTIFICATION_EMAIL ??
    null
  );
}
