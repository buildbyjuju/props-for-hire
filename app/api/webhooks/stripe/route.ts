import { NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { requireDb } from "@/lib/db";
import { bookings } from "@/lib/db/schema";
import { sendBookingConfirmationEmail } from "@/lib/emails/booking-confirmation";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  const stripe = getStripe();
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("Webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const database = requireDb();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const bookingIds =
      session.metadata?.bookingIds?.split(",").filter(Boolean) ?? [];

    if (bookingIds.length > 0) {
      await database
        .update(bookings)
        .set({ status: "paid" })
        .where(inArray(bookings.id, bookingIds));
    } else if (session.id) {
      await database
        .update(bookings)
        .set({ status: "paid" })
        .where(eq(bookings.stripeSessionId, session.id));
    }

    if (session.metadata?.confirmationEmailSent !== "true") {
      const sent = await sendBookingConfirmationEmail(session);
      if (sent) {
        await stripe.checkout.sessions.update(session.id, {
          metadata: {
            ...session.metadata,
            confirmationEmailSent: "true",
          },
        });
      }
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object;
    const bookingIds =
      session.metadata?.bookingIds?.split(",").filter(Boolean) ?? [];

    if (bookingIds.length > 0) {
      await database
        .update(bookings)
        .set({ status: "cancelled" })
        .where(inArray(bookings.id, bookingIds));
    } else if (session.id) {
      await database
        .update(bookings)
        .set({ status: "cancelled" })
        .where(eq(bookings.stripeSessionId, session.id));
    }
  }

  return NextResponse.json({ received: true });
}
