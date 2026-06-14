import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CheckoutSuccessPage() {
  return (
    <div className="bg-warm-white py-28">
      <div className="mx-auto max-w-lg px-6 text-center">
        <p className="text-xs uppercase tracking-luxury text-sage">Confirmed</p>
        <h1 className="mt-6 font-serif text-4xl font-light text-foreground">
          Thank you
        </h1>
        <p className="mt-6 font-light leading-relaxed text-foreground-soft">
          Your payment is complete and your hire dates are reserved. A confirmation
          will arrive in your inbox shortly.
        </p>
        <div className="mt-12 flex flex-wrap justify-center gap-4">
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
