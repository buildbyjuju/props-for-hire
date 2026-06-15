import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { parseCartSnapshot } from "@/lib/emails/booking-confirmation";
import { FULFILLMENT_OPTIONS } from "@/lib/constants";
import { getStripe } from "@/lib/stripe";
import { formatPrice } from "@/lib/utils";

type PageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const { session_id: sessionId } = await searchParams;

  let customerName: string | null = null;
  let itemCount = 0;
  let totalPaid: string | null = null;
  let fulfillmentLabel: string | null = null;
  let nextEventDate: string | null = null;

  if (sessionId) {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const lines = parseCartSnapshot(session.metadata);

      if (session.payment_status === "paid") {
        customerName = session.metadata?.customerName ?? null;
        itemCount = lines.length;
        totalPaid =
          session.amount_total != null
            ? formatPrice(session.amount_total)
            : null;

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
      <div className="mx-auto max-w-lg px-4 text-center sm:px-6">
        <p className="text-xs uppercase tracking-luxury text-sage">Confirmed</p>
        <h1 className="mt-5 font-serif text-3xl font-light text-foreground sm:mt-6 sm:text-4xl">
          {customerName ? `Thank you, ${customerName}` : "Thank you"}
        </h1>
        <p className="mt-6 font-light leading-relaxed text-foreground-soft">
          Your payment is complete and your hire dates are reserved. A confirmation
          email will arrive in your inbox shortly with pickup or delivery details.
        </p>

        {(itemCount > 0 || totalPaid || fulfillmentLabel || nextEventDate) && (
          <div className="mt-8 rounded-3xl bg-cream p-6 text-left shadow-luxury sm:mt-10 sm:p-8">
            <p className="text-xs uppercase tracking-luxury text-sage">Booking summary</p>
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
              {totalPaid ? (
                <div className="flex justify-between gap-4 border-t border-sage/15 pt-3">
                  <dt className="font-serif text-foreground">Total paid</dt>
                  <dd className="font-serif text-lg text-foreground">{totalPaid}</dd>
                </div>
              ) : null}
            </dl>
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
