import { format, parseISO } from "date-fns";
import { Resend } from "resend";
import type Stripe from "stripe";
import {
  PICKUP_ADDRESS,
  RETURN_POLICY,
  type FulfillmentMethod,
} from "@/lib/constants";
import { DELIVERY_FEE_CENTS, getHireWindow } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";

export type BookingLineSnapshot = {
  n: string;
  p: number;
  b: number;
  e: string;
  pu?: string;
  r?: string;
  sz?: string;
  q?: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDisplayDate(dateStr: string) {
  try {
    return format(parseISO(dateStr), "EEEE, d MMMM yyyy");
  } catch {
    return dateStr;
  }
}

export function parseCartSnapshot(
  metadata: Stripe.Metadata | null,
): BookingLineSnapshot[] {
  if (!metadata) return [];

  const parts = Number.parseInt(metadata.cartSnapshotParts ?? "1", 10);
  let raw = metadata.cartSnapshot ?? "";

  if (parts > 1) {
    raw = Array.from({ length: parts }, (_, i) => metadata[`cartSnapshot_${i}`] ?? "").join(
      "",
    );
  }

  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as BookingLineSnapshot[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function serializeCartSnapshot(
  cart: {
    itemName: string;
    priceCents: number;
    bondCents?: number;
    eventDate: string;
    pickupDate?: string;
    returnDate?: string;
    selectedSize?: string;
    selectedSets?: string;
  }[],
): Record<string, string> {
  const snapshot = JSON.stringify(
    cart.map((line) => ({
      n: line.itemName,
      p: line.priceCents,
      b: line.bondCents ?? 0,
      e: line.eventDate,
      pu: line.pickupDate,
      r: line.returnDate,
      sz: line.selectedSize,
      q: line.selectedSets,
    })),
  );

  if (snapshot.length <= 500) {
    return { cartSnapshot: snapshot };
  }

  const meta: Record<string, string> = {
    cartSnapshotParts: String(Math.ceil(snapshot.length / 500)),
  };
  for (let i = 0, chunk = 0; i < snapshot.length; i += 500, chunk++) {
    meta[`cartSnapshot_${chunk}`] = snapshot.slice(i, i + 500);
  }
  return meta;
}

function lineDetailParts(line: BookingLineSnapshot) {
  const parts: string[] = [];
  if (line.sz) parts.push(`Size: ${line.sz}`);
  if (line.q) parts.push(`Quantity: ${line.q}`);
  return parts.length > 0 ? ` (${parts.join(" · ")})` : "";
}

function buildLineItemsHtml(
  lines: BookingLineSnapshot[],
  fulfillmentMethod: FulfillmentMethod,
) {
  if (lines.length === 0) {
    return "<p>Your booked items are listed on your receipt.</p>";
  }

  const isPickup = fulfillmentMethod === "pickup_bexley";
  const datesHeader = isPickup ? "Pickup &amp; return" : "Delivery &amp; return";
  const startLabel = isPickup ? "Pick up" : "Delivery";
  const endLabel = "Return";

  const rows = lines
    .map((line) => {
      const window = getHireWindow(line.e);
      const pickup = line.pu ?? window.pickupDate;
      const returnDay = line.r ?? window.returnDate;
      const bond =
        line.b > 0
          ? `${formatPrice(line.b)} <span style="color:#6b6560;font-size:13px;">(refundable)</span>`
          : "—";

      return `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #e8e4de;">
            <strong>${escapeHtml(line.n)}</strong>${escapeHtml(lineDetailParts(line))}
            <br><span style="color:#6b6560;font-size:14px;">Event: ${escapeHtml(formatDisplayDate(line.e))}</span>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #e8e4de;text-align:right;white-space:nowrap;">
            ${formatPrice(line.p)}
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #e8e4de;text-align:right;white-space:nowrap;">
            ${bond}
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #e8e4de;font-size:14px;color:#6b6560;">
            ${startLabel} ${escapeHtml(formatDisplayDate(pickup))}<br>
            ${endLabel} ${escapeHtml(formatDisplayDate(returnDay))}
          </td>
        </tr>`;
    })
    .join("");

  return `
    <table style="width:100%;border-collapse:collapse;margin:24px 0;">
      <thead>
        <tr style="text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#6b6560;">
          <th style="padding-bottom:8px;">Item</th>
          <th style="padding-bottom:8px;text-align:right;">Hire price</th>
          <th style="padding-bottom:8px;text-align:right;">Bond</th>
          <th style="padding-bottom:8px;">${datesHeader}</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function buildPickupHtml(lines: BookingLineSnapshot[]) {
  const windows = lines.map((line) => {
    const window = getHireWindow(line.e);
    return {
      pickup: line.pu ?? window.pickupDate,
      returnDay: line.r ?? window.returnDate,
    };
  });

  const pickupDates = [...new Set(windows.map((w) => w.pickup))];
  const returnDates = [...new Set(windows.map((w) => w.returnDay))];

  const pickupText =
    pickupDates.length === 1
      ? escapeHtml(formatDisplayDate(pickupDates[0]))
      : "See the dates listed for each item above";
  const returnText =
    returnDates.length === 1
      ? escapeHtml(formatDisplayDate(returnDates[0]))
      : "See the dates listed for each item above";

  return `
    <h2 style="font-size:18px;font-weight:500;margin:32px 0 12px;">Pickup &amp; return</h2>
    <p><strong>Pick up:</strong> ${pickupText}</p>
    <p><strong>Drop off:</strong> ${returnText}</p>
    <p><strong>Pickup address:</strong><br>${escapeHtml(PICKUP_ADDRESS)}</p>
    <p style="margin-top:16px;color:#6b6560;font-size:14px;">
      Refundable bonds are returned once your items are returned according to our return policy below.
    </p>`;
}

function buildDeliveryHtml(
  deliveryAddress: string,
  leaveAtDoor: boolean,
  lines: BookingLineSnapshot[],
) {
  const totalBond = lines.reduce((sum, line) => sum + line.b, 0);

  return `
    <h2 style="font-size:18px;font-weight:500;margin:32px 0 12px;">Delivery details</h2>
    <p><strong>Delivery address:</strong><br>${escapeHtml(deliveryAddress)}</p>
    <p><strong>Delivery window:</strong> 10 AM to 1 PM on your pickup day</p>
    ${
      leaveAtDoor
        ? "<p><strong>Leave at door:</strong> Yes — if no one is available, your order may be left at the door.</p>"
        : ""
    }
    <p>We will send you an email when we are on the way.</p>
    ${
      totalBond > 0
        ? `<p style="margin-top:16px;"><strong>Refundable bond total:</strong> ${formatPrice(totalBond)}</p>
           <p style="color:#6b6560;font-size:14px;">Bonds are refunded once items are returned according to our return policy below.</p>`
        : ""
    }`;
}

export function buildBookingConfirmationHtml({
  customerName,
  fulfillmentMethod,
  lines,
  deliveryAddress,
  leaveAtDoor,
  amountTotalCents,
}: {
  customerName: string;
  fulfillmentMethod: FulfillmentMethod;
  lines: BookingLineSnapshot[];
  deliveryAddress?: string;
  leaveAtDoor: boolean;
  amountTotalCents?: number | null;
}) {
  const isPickup = fulfillmentMethod === "pickup_bexley";
  const fulfillmentBlock = isPickup
    ? buildPickupHtml(lines)
    : buildDeliveryHtml(deliveryAddress ?? "Not provided", leaveAtDoor, lines);

  const totalLine =
    amountTotalCents != null
      ? `<p style="margin-top:24px;font-size:16px;"><strong>Total paid:</strong> ${formatPrice(amountTotalCents)}</p>`
      : "";

  const deliveryFeeNote =
    !isPickup
      ? `<p style="color:#6b6560;font-size:14px;">Includes ${formatPrice(DELIVERY_FEE_CENTS)} delivery fee.</p>`
      : "";

  return `
    <div style="font-family:Georgia,'Times New Roman',serif;color:#2c2825;max-width:640px;line-height:1.6;">
      <p style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#a8b5a2;">Booking confirmed</p>
      <h1 style="font-size:28px;font-weight:400;margin:16px 0 8px;">Thank you, ${escapeHtml(customerName)}</h1>
      <p>Your payment is complete and your hire dates are reserved. Here is a summary of your booking.</p>

      ${buildLineItemsHtml(lines, fulfillmentMethod)}
      ${totalLine}
      ${deliveryFeeNote}
      ${fulfillmentBlock}

      <h2 style="font-size:18px;font-weight:500;margin:32px 0 12px;">Return policy</h2>
      <p>${escapeHtml(RETURN_POLICY)}</p>

      <p style="margin-top:32px;color:#6b6560;font-size:14px;">
        Questions? Reply to this email or contact us on WhatsApp.
      </p>
      <p style="color:#6b6560;font-size:14px;">DreamScape Event</p>
    </div>`;
}

export async function sendBookingConfirmationEmail(
  session: Stripe.Checkout.Session,
): Promise<boolean> {
  const resendKey = process.env.RESEND_API_KEY;
  const customerEmail =
    session.customer_email ?? session.metadata?.customerEmail ?? session.customer_details?.email;

  if (!resendKey || !customerEmail) {
    console.warn("Booking confirmation email skipped: missing Resend key or customer email");
    return false;
  }

  if (session.metadata?.confirmationEmailSent === "true") {
    return true;
  }

  const customerName = session.metadata?.customerName ?? "there";
  const fulfillmentMethod = (session.metadata?.fulfillmentMethod ??
    "pickup_bexley") as FulfillmentMethod;
  const deliveryAddress = session.metadata?.deliveryAddress;
  const leaveAtDoor = session.metadata?.leaveAtDoor === "yes";
  const lines = parseCartSnapshot(session.metadata);

  const html = buildBookingConfirmationHtml({
    customerName,
    fulfillmentMethod,
    lines,
    deliveryAddress,
    leaveAtDoor,
    amountTotalCents: session.amount_total,
  });

  const resend = new Resend(resendKey);
  const { error } = await resend.emails.send({
    from:
      process.env.RESEND_FROM_EMAIL ??
      "Dreamscape Event <onboarding@resend.dev>",
    to: customerEmail,
    subject: "Your DreamScape Event booking confirmation",
    html,
  });

  if (error) {
    console.error("Booking confirmation email error:", error);
    return false;
  }

  return true;
}
