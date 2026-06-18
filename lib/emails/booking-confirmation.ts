import { format, parseISO } from "date-fns";
import { Resend } from "resend";
import type Stripe from "stripe";
import {
  BOND_REFUND_NOTICE,
  FULFILLMENT_OPTIONS,
  PICKUP_ADDRESS,
  RETURN_POLICY,
  type FulfillmentMethod,
} from "@/lib/constants";
import { getHireWindow } from "@/lib/pricing";
import { getBookingNotificationEmail } from "@/lib/stripe";
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

export function getBookingPaymentTotals(
  metadata: Stripe.Metadata | null,
  lines: BookingLineSnapshot[],
  amountTotalCents?: number | null,
) {
  const hireTotalCents =
    metadata?.hireTotalCents != null
      ? Number.parseInt(metadata.hireTotalCents, 10)
      : lines.reduce((sum, line) => sum + line.p, 0);
  const bondTotalCents =
    metadata?.bondTotalCents != null
      ? Number.parseInt(metadata.bondTotalCents, 10)
      : lines.reduce((sum, line) => sum + line.b, 0);
  const deliveryFeeCents =
    metadata?.deliveryFeeCents != null
      ? Number.parseInt(metadata.deliveryFeeCents, 10)
      : 0;

  const computedTotal =
    hireTotalCents + bondTotalCents + deliveryFeeCents;
  const totalCents = amountTotalCents ?? computedTotal;

  return {
    hireTotalCents,
    bondTotalCents,
    deliveryFeeCents,
    totalCents,
  };
}

function buildPaymentTotalsHtml({
  hireTotalCents,
  bondTotalCents,
  deliveryFeeCents,
  totalCents,
}: {
  hireTotalCents: number;
  bondTotalCents: number;
  deliveryFeeCents: number;
  totalCents: number;
}) {
  const rows = [
    `<tr>
      <td style="padding:8px 0;color:#6b6560;">Hire fees</td>
      <td style="padding:8px 0;text-align:right;">${formatPrice(hireTotalCents)}</td>
    </tr>`,
    bondTotalCents > 0
      ? `<tr>
          <td style="padding:8px 0;color:#6b6560;">Refundable bonds</td>
          <td style="padding:8px 0;text-align:right;">${formatPrice(bondTotalCents)}</td>
        </tr>`
      : "",
    deliveryFeeCents > 0
      ? `<tr>
          <td style="padding:8px 0;color:#6b6560;">Delivery fee</td>
          <td style="padding:8px 0;text-align:right;">${formatPrice(deliveryFeeCents)}</td>
        </tr>`
      : "",
    `<tr>
      <td style="padding:12px 0 0;border-top:1px solid #e8e4de;font-weight:500;color:#2c2825;">Total paid</td>
      <td style="padding:12px 0 0;border-top:1px solid #e8e4de;text-align:right;font-weight:500;">${formatPrice(totalCents)}</td>
    </tr>`,
  ]
    .filter(Boolean)
    .join("");

  const bondNote =
    bondTotalCents > 0
      ? `<p style="margin-top:12px;color:#6b6560;font-size:14px;">${escapeHtml(BOND_REFUND_NOTICE)}</p>`
      : "";

  return `
    <table style="width:100%;max-width:320px;margin:24px 0 0;border-collapse:collapse;font-size:15px;">
      <tbody>${rows}</tbody>
    </table>
    ${bondNote}`;
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
          ? `${formatPrice(line.b)} <span style="color:#6b6560;font-size:13px;">(refundable after return)</span>`
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
          <th style="padding-bottom:8px;text-align:right;">Hire fee</th>
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
      ${escapeHtml(BOND_REFUND_NOTICE)}
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
           <p style="color:#6b6560;font-size:14px;">${escapeHtml(BOND_REFUND_NOTICE)}</p>`
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
  metadata,
}: {
  customerName: string;
  fulfillmentMethod: FulfillmentMethod;
  lines: BookingLineSnapshot[];
  deliveryAddress?: string;
  leaveAtDoor: boolean;
  amountTotalCents?: number | null;
  metadata?: Stripe.Metadata | null;
}) {
  const isPickup = fulfillmentMethod === "pickup_bexley";
  const fulfillmentBlock = isPickup
    ? buildPickupHtml(lines)
    : buildDeliveryHtml(deliveryAddress ?? "Not provided", leaveAtDoor, lines);

  const totals = getBookingPaymentTotals(metadata ?? null, lines, amountTotalCents);
  const paymentTotalsHtml = buildPaymentTotalsHtml(totals);

  return `
    <div style="font-family:Georgia,'Times New Roman',serif;color:#2c2825;max-width:640px;line-height:1.6;">
      <p style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#a8b5a2;">Payment received</p>
      <h1 style="font-size:28px;font-weight:400;margin:16px 0 8px;">Thank you, ${escapeHtml(customerName)}</h1>
      <p>Your payment has been received and your booking is <strong>pending confirmation</strong>. We will review your order and send pickup or delivery details once confirmed.</p>

      ${buildLineItemsHtml(lines, fulfillmentMethod)}
      ${paymentTotalsHtml}
      ${fulfillmentBlock}

      <h2 style="font-size:18px;font-weight:500;margin:32px 0 12px;">Return policy</h2>
      <p>${escapeHtml(RETURN_POLICY)}</p>

      <p style="margin-top:32px;color:#6b6560;font-size:14px;">
        Questions? Reply to this email or contact us on WhatsApp.
      </p>
      <p style="color:#6b6560;font-size:14px;">DreamScape Event</p>
    </div>`;
}

function getResendFromAddress() {
  return (
    process.env.RESEND_FROM_EMAIL ??
    "Dreamscape Event <onboarding@resend.dev>"
  );
}

function getFulfillmentLabel(method: FulfillmentMethod) {
  return (
    FULFILLMENT_OPTIONS.find((option) => option.id === method)?.label ?? method
  );
}

function buildBookingOwnerHtml({
  customerName,
  customerEmail,
  fulfillmentMethod,
  lines,
  deliveryAddress,
  leaveAtDoor,
  amountTotalCents,
  stripeSessionId,
  metadata,
}: {
  customerName: string;
  customerEmail: string;
  fulfillmentMethod: FulfillmentMethod;
  lines: BookingLineSnapshot[];
  deliveryAddress?: string;
  leaveAtDoor: boolean;
  amountTotalCents?: number | null;
  stripeSessionId: string;
  metadata?: Stripe.Metadata | null;
}) {
  const isPickup = fulfillmentMethod === "pickup_bexley";
  const fulfillmentBlock = isPickup
    ? buildPickupHtml(lines)
    : buildDeliveryHtml(deliveryAddress ?? "Not provided", leaveAtDoor, lines);

  const totals = getBookingPaymentTotals(metadata ?? null, lines, amountTotalCents);
  const paymentTotalsHtml = buildPaymentTotalsHtml(totals);

  return `
    <div style="font-family:Georgia,'Times New Roman',serif;color:#2c2825;max-width:640px;line-height:1.6;">
      <p style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#a8b5a2;">New booking — pending confirmation</p>
      <h1 style="font-size:28px;font-weight:400;margin:16px 0 8px;">${escapeHtml(customerName)}</h1>
      <p><strong>Email:</strong> <a href="mailto:${escapeHtml(customerEmail)}">${escapeHtml(customerEmail)}</a></p>
      <p><strong>Status:</strong> Pending confirmation</p>
      <p><strong>Collection:</strong> ${escapeHtml(getFulfillmentLabel(fulfillmentMethod))}</p>
      <p style="color:#6b6560;font-size:14px;"><strong>Stripe session:</strong> ${escapeHtml(stripeSessionId)}</p>

      ${buildLineItemsHtml(lines, fulfillmentMethod)}
      ${paymentTotalsHtml}
      ${fulfillmentBlock}

      <h2 style="font-size:18px;font-weight:500;margin:32px 0 12px;">Return policy</h2>
      <p>${escapeHtml(RETURN_POLICY)}</p>
    </div>`;
}

export async function sendBookingOwnerNotificationEmail(
  session: Stripe.Checkout.Session,
): Promise<boolean> {
  const resendKey = process.env.RESEND_API_KEY;
  const ownerEmail = getBookingNotificationEmail();
  const customerEmail =
    session.customer_email ??
    session.metadata?.customerEmail ??
    session.customer_details?.email;

  if (!resendKey || !ownerEmail) {
    console.warn(
      "Booking owner notification skipped: missing Resend key or BOOKING_NOTIFICATION_EMAIL",
    );
    return false;
  }

  if (session.metadata?.ownerNotificationSent === "true") {
    return true;
  }

  if (!customerEmail) {
    console.warn("Booking owner notification skipped: missing customer email");
    return false;
  }

  const customerName = session.metadata?.customerName ?? "Customer";
  const fulfillmentMethod = (session.metadata?.fulfillmentMethod ??
    "pickup_bexley") as FulfillmentMethod;
  const deliveryAddress = session.metadata?.deliveryAddress;
  const leaveAtDoor = session.metadata?.leaveAtDoor === "yes";
  const lines = parseCartSnapshot(session.metadata);

  const html = buildBookingOwnerHtml({
    customerName,
    customerEmail,
    fulfillmentMethod,
    lines,
    deliveryAddress,
    leaveAtDoor,
    amountTotalCents: session.amount_total,
    stripeSessionId: session.id,
    metadata: session.metadata,
  });

  const resend = new Resend(resendKey);
  const totalLabel =
    session.amount_total != null ? formatPrice(session.amount_total) : "Paid";
  const { error } = await resend.emails.send({
    from: getResendFromAddress(),
    to: ownerEmail,
    replyTo: customerEmail,
    subject: `New booking (pending confirmation) — ${customerName} — ${totalLabel}`,
    html,
  });

  if (error) {
    console.error("Booking owner notification error:", error);
    return false;
  }

  return true;
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
    metadata: session.metadata,
  });

  const resend = new Resend(resendKey);
  const { error } = await resend.emails.send({
    from: getResendFromAddress(),
    to: customerEmail,
    subject: "Your DreamScape Event booking — payment received",
    html,
  });

  if (error) {
    console.error("Booking confirmation email error:", error);
    return false;
  }

  return true;
}
