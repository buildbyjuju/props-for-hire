import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cancelExpiredCheckoutSession } from "@/lib/checkout-fulfillment";
import { getStripe } from "@/lib/stripe";

type PageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function CheckoutCancelPage({ searchParams }: PageProps) {
  const { session_id: sessionId } = await searchParams;

  if (sessionId) {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== "paid") {
        await cancelExpiredCheckoutSession(session);
      }
    } catch {
      // Best-effort cleanup; cart and thank-you messaging still render.
    }
  }

  return (
    <div className="bg-warm-white py-16 sm:py-28">
      <div className="mx-auto max-w-lg px-4 text-center sm:px-6">
        <p className="text-xs uppercase tracking-luxury text-sage">Checkout cancelled</p>
        <h1 className="mt-5 font-serif text-3xl font-light text-foreground sm:mt-6 sm:text-4xl">
          Payment not completed
        </h1>
        <p className="mt-6 font-light leading-relaxed text-foreground-soft">
          Your payment was not processed and no charge was made. Your selection is
          still in your cart — you can return anytime to complete checkout.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3 sm:mt-12 sm:gap-4">
          <Button asChild>
            <Link href="/cart">Return to cart</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/props">View collections</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
