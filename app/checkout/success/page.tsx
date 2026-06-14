import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CheckoutSuccessPage() {
  return (
    <div className="bg-warm-white py-16 sm:py-28">
      <div className="mx-auto max-w-lg px-4 text-center sm:px-6">
        <p className="text-xs uppercase tracking-luxury text-sage">Confirmed</p>
        <h1 className="mt-5 font-serif text-3xl font-light text-foreground sm:mt-6 sm:text-4xl">
          Thank you
        </h1>
        <p className="mt-6 font-light leading-relaxed text-foreground-soft">
          Your payment is complete and your hire dates are reserved. A confirmation
          will arrive in your inbox shortly.
        </p>
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
