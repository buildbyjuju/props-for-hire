import { NextResponse } from "next/server";
import {
  cancelExpiredCheckoutSession,
  fulfillPaidCheckoutSession,
} from "@/lib/checkout-fulfillment";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const result = await fulfillPaidCheckoutSession(session);

    if (result.fulfilled && result.metadataUpdated) {
      await stripe.checkout.sessions.update(session.id, {
        metadata: result.metadata,
      });
    }
  }

  if (event.type === "checkout.session.expired") {
    await cancelExpiredCheckoutSession(event.data.object);
  }

  return NextResponse.json({ received: true });
}
