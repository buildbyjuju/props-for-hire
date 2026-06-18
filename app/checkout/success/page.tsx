import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ClearCartOnSuccess } from "@/components/checkout/ClearCartOnSuccess";
import { Button } from "@/components/ui/button";
import {
  getBookingPaymentTotals,
  parseCartSnapshot,
} from "@/lib/emails/booking-confirmation";
import { BOND_REFUND_NOTICE, FULFILLMENT_OPTIONS } from "@/lib/constants";
import { fulfillPaidCheckoutSession } from "@/lib/checkout-fulfillment";
import { getStripe } from "@/lib/stripe";
import { formatPrice } from "@/lib/utils";

type PageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const { session_id: sessionId } = await searchParams;

  let customerName: string | null = null;
  let itemCount = 0;
  let hireTotal: string | null = null;
  let bondTotal: string | null = null;
  let deliveryFee: string | null = null;
  let totalPaid: string | null = null;
  let fulfillmentLabel: string | null = null;
  let nextEventDate: string | null = null;
  let paymentReceived = false;

  if (sessionId) {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const lines = parseCartSnapshot(session.metadata);

      if (session.payment_status === "paid") {
        paymentReceived = true;
        const result = await fulfillPaidCheckoutSession(session);

        if (result.fulfilled && result.metadataUpdated) {
          await stripe.checkout.sessions.update(session.id, {
            metadata: result.metadata,
          });
        }

        const totals = getBookingPaymentTotals(
          session.metadata,
          lines,
          session.amount_total,
        );

        customerName = session.metadata?.customerName ?? null;
        itemCount = lines.length;
        hireTotal = formatPrice(totals.hireTotalCents);
        bondTotal =
          totals.bondTotalCents > 0
            ? formatPrice(totals.bondTotalCents)
            : null;
        deliveryFee =
          totals.deliveryFeeCents > 0
            ? formatPrice(totals.deliveryFeeCents)
            : null;
        totalPaid = formatPrice(totals.totalCents);

        const fulfillmentId = session.metadata?.fulfillmentMethod;
        fulfillmentLabel =
          FULFILLMENT_OPTIONS.find((option) => option.id === fulfillmentId)
            ?.label ?? null;

        const earliestEvent = lines
          .map((line) => line.e)
          .sort()
          .at(0);
        if (earliestEvent) {
          nextEventDate = format(parseISO(earliestEvent), "EEEE, d MMMM yyyy");
        }
      }
    } catch {
      // Session lookup is best-effort; thank-you page still renders.
    }
  }

  return (
    <div className="bg-warm-white py-16 sm:py-28">
      <ClearCartOnSuccess enabled={paymentReceived} />
      <div className="mx-auto max-w-lg px-4 text-center sm:px-6">
        <p className="text-xs uppercase tracking-luxury text-sage">
          {paymentReceived ? "Payment received" : "Thank you"}
        </p>
        <h1 className="mt-5 font-serif text-3xl font-light text-foreground sm:mt-6 sm:text-4xl">
          {customerName ? `Thank you, ${customerName}` : "Thank you"}
        </h1>
        <p className="mt-6 font-light leading-relaxed text-foreground-soft">
          {paymentReceived ? (
            <>
              Your payment has been received and your booking is{" "}
              <strong className="font-normal text-foreground">
                pending confirmation
              </strong>
              . We will review your order and email you pickup or delivery
              details once confirmed.
            </>
          ) : (
            <>
              Your payment is being processed. A confirmation email will arrive
              shortly with your booking details.
            </>
          )}
        </p>

        {(itemCount > 0 ||
          hireTotal ||
          bondTotal ||
          totalPaid ||
          fulfillmentLabel ||
          nextEventDate) && (
          <div className="mt-8 rounded-3xl bg-cream p-6 text-left shadow-luxury sm:mt-10 sm:p-8">
            <p className="text-xs uppercase tracking-luxury text-sage">
              Booking summary
            </p>
            <dl className="mt-4 space-y-3 text-sm font-light text-foreground-soft">
              {itemCount > 0 ? (
                <div className="flex justify-between gap-4">
                  <dt>Items booked</dt>
                  <dd className="text-foreground">{itemCount}</dd>
                </div>
              ) : null}
              {nextEventDate ? (
                <div className="flex justify-between gap-4">
                  <dt>Next event date</dt>
                  <dd className="text-right text-foreground">{nextEventDate}</dd>
                </div>
              ) : null}
              {fulfillmentLabel ? (
                <div className="flex justify-between gap-4">
                  <dt>Collection</dt>
                  <dd className="text-foreground">{fulfillmentLabel}</dd>
                </div>
              ) : null}
              {hireTotal ? (
                <div className="flex justify-between gap-4 border-t border-sage/15 pt-3">
                  <dt>Hire fees</dt>
                  <dd className="text-foreground">{hireTotal}</dd>
                </div>
              ) : null}
              {bondTotal ? (
                <div className="flex justify-between gap-4">
                  <dt>Refundable bonds</dt>
                  <dd className="text-foreground">{bondTotal}</dd>
                </div>
              ) : null}
              {deliveryFee ? (
                <div className="flex justify-between gap-4">
                  <dt>Delivery fee</dt>
                  <dd className="text-foreground">{deliveryFee}</dd>
                </div>
              ) : null}
              {totalPaid ? (
                <div className="flex justify-between gap-4 border-t border-sage/15 pt-3">
                  <dt className="font-serif text-foreground">Total paid</dt>
                  <dd className="font-serif text-lg text-foreground">
                    {totalPaid}
                  </dd>
                </div>
              ) : null}
            </dl>
            {bondTotal ? (
              <p className="mt-4 text-xs font-light leading-relaxed text-foreground-soft">
                {BOND_REFUND_NOTICE}
              </p>
            ) : null}
          </div>
        )}

        <div className="mt-10 flex flex-wrap justify-center gap-3 sm:mt-12 sm:gap-4">
          <Button asChild>
            <Link href="/props">View collections</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
