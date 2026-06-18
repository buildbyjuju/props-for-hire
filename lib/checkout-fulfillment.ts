import { eq, inArray } from "drizzle-orm";
import type Stripe from "stripe";
import { requireDb } from "@/lib/db";
import { bookings } from "@/lib/db/schema";
import {
  sendBookingConfirmationEmail,
  sendBookingOwnerNotificationEmail,
} from "@/lib/emails/booking-confirmation";

export async function fulfillPaidCheckoutSession(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") {
    return { fulfilled: false as const, reason: "not_paid" as const };
  }

  const database = requireDb();
  const bookingIds =
    session.metadata?.bookingIds?.split(",").filter(Boolean) ?? [];

  if (bookingIds.length > 0) {
    await database
      .update(bookings)
      .set({ status: "pending_confirmation" })
      .where(inArray(bookings.id, bookingIds));
  } else if (session.id) {
    await database
      .update(bookings)
      .set({ status: "pending_confirmation" })
      .where(eq(bookings.stripeSessionId, session.id));
  }

  const metadata = { ...(session.metadata ?? {}) };
  let updated = false;

  if (metadata.confirmationEmailSent !== "true") {
    const customerSent = await sendBookingConfirmationEmail(session);
    if (customerSent) {
      metadata.confirmationEmailSent = "true";
      updated = true;
    }
  }

  if (metadata.ownerNotificationSent !== "true") {
    const ownerSent = await sendBookingOwnerNotificationEmail(session);
    if (ownerSent) {
      metadata.ownerNotificationSent = "true";
      updated = true;
    }
  }

  return {
    fulfilled: true as const,
    metadataUpdated: updated,
    metadata,
  };
}

export async function cancelExpiredCheckoutSession(session: Stripe.Checkout.Session) {
  const database = requireDb();
  const bookingIds =
    session.metadata?.bookingIds?.split(",").filter(Boolean) ?? [];

  if (bookingIds.length > 0) {
    await database
      .update(bookings)
      .set({ status: "cancelled" })
      .where(inArray(bookings.id, bookingIds));
    return;
  }

  if (session.id) {
    await database
      .update(bookings)
      .set({ status: "cancelled" })
      .where(eq(bookings.stripeSessionId, session.id));
  }
}
