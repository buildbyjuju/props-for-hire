import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq, inArray } from "drizzle-orm";
import { CART_COOKIE, parseCart } from "@/lib/cart";
import { FULFILLMENT_OPTIONS, type FulfillmentMethod } from "@/lib/constants";
import { getItemById } from "@/lib/catalog";
import { isDateAvailable } from "@/lib/availability";
import { DELIVERY_FEE_CENTS } from "@/lib/pricing";
import { requireDb } from "@/lib/db";
import { bookings } from "@/lib/db/schema";
import { getStripe, getSiteUrl } from "@/lib/stripe";
import { serializeCartSnapshot } from "@/lib/emails/booking-confirmation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const customerEmail = body.email as string | undefined;
    const customerName = body.name as string | undefined;
    const fulfillmentMethod = body.fulfillmentMethod as FulfillmentMethod | undefined;
    const deliveryAddress = body.deliveryAddress as string | undefined;
    const leaveAtDoor = Boolean(body.leaveAtDoor);

    if (!customerEmail || !customerName) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 },
      );
    }

    const validFulfillment = FULFILLMENT_OPTIONS.some(
      (option) => option.id === fulfillmentMethod,
    );
    if (!validFulfillment || !fulfillmentMethod) {
      return NextResponse.json(
        { error: "Please choose pickup or delivery" },
        { status: 400 },
      );
    }

    if (fulfillmentMethod === "delivery") {
      if (!deliveryAddress?.trim()) {
        return NextResponse.json(
          { error: "Full delivery address is required" },
          { status: 400 },
        );
      }
    }

    const cookieStore = await cookies();
    const cart = parseCart(cookieStore.get(CART_COOKIE)?.value);

    if (cart.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    for (const line of cart) {
      if (line.itemId.startsWith("static-")) {
        return NextResponse.json(
          {
            error:
              "Database not seeded. Run npm run db:push && npm run db:seed before checkout.",
          },
          { status: 400 },
        );
      }
      const available = await isDateAvailable(line.itemId, line.eventDate);
      if (!available) {
        return NextResponse.json(
          {
            error: `${line.itemName} is no longer available on ${line.eventDate}`,
          },
          { status: 409 },
        );
      }
    }

    const database = requireDb();
    const stripe = getStripe();
    const siteUrl = getSiteUrl();

    const lineItems: {
      price_data: {
        currency: string;
        product_data: { name: string; description: string };
        unit_amount: number;
      };
      quantity: number;
    }[] = [];

    const metadata: Record<string, string> = {
      customerName,
      customerEmail,
      cartCount: String(cart.length),
      fulfillmentMethod,
      ...serializeCartSnapshot(cart),
    };

    if (fulfillmentMethod === "delivery") {
      metadata.deliveryAddress = deliveryAddress!.trim().slice(0, 500);
      metadata.leaveAtDoor = leaveAtDoor ? "yes" : "no";
    }

    const bookingIds: string[] = [];

    for (let i = 0; i < cart.length; i++) {
      const line = cart[i];
      const item = await getItemById(line.itemId);
      if (!item) {
        return NextResponse.json(
          { error: `Item not found: ${line.itemName}` },
          { status: 400 },
        );
      }

      const nameParts = [item.name];
      if (line.selectedSize) nameParts.push(line.selectedSize);
      if (line.selectedSets) nameParts.push(line.selectedSets);

      const optionLabel = item.selectionDisplay ?? "Size";
      const descParts = [`Event ${line.eventDate}`];
      if (line.pickupDate && line.returnDate) {
        descParts.push(`Pickup ${line.pickupDate} · Return ${line.returnDate}`);
      }
      if (line.selectedSize) descParts.push(`${optionLabel}: ${line.selectedSize}`);
      if (line.selectedSets) descParts.push(`Quantity: ${line.selectedSets}`);

      lineItems.push({
        price_data: {
          currency: "aud",
          product_data: {
            name: nameParts.join(" · "),
            description: descParts.join(" · "),
          },
          unit_amount: line.priceCents,
        },
        quantity: 1,
      });

      if (line.bondCents) {
        lineItems.push({
          price_data: {
            currency: "aud",
            product_data: {
              name: `Refundable bond — ${item.name}`,
              description: `Refunded once ${item.name} is returned clean and in good condition`,
            },
            unit_amount: line.bondCents,
          },
          quantity: 1,
        });
      }

      metadata[`item_${i}`] = line.itemId;
      metadata[`date_${i}`] = line.eventDate;

      const [booking] = await database
        .insert(bookings)
        .values({
          itemId: line.itemId,
          eventDate: line.eventDate,
          status: "pending",
          customerEmail,
          customerName,
        })
        .returning();

      bookingIds.push(booking.id);
    }

    if (fulfillmentMethod === "delivery") {
      lineItems.push({
        price_data: {
          currency: "aud",
          product_data: {
            name: "Delivery fee",
            description: "Delivery to your address",
          },
          unit_amount: DELIVERY_FEE_CENTS,
        },
        quantity: 1,
      });
    }

    metadata.bookingIds = bookingIds.join(",");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: customerEmail,
      line_items: lineItems,
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/cart?cancelled=1`,
      metadata,
    });

    await database
      .update(bookings)
      .set({ stripeSessionId: session.id })
      .where(inArray(bookings.id, bookingIds));

    const response = NextResponse.json({ url: session.url });
    response.cookies.set(CART_COOKIE, "[]", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Checkout error:", error);
    const message =
      error instanceof Error ? error.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
