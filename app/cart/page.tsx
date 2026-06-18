"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { useCart } from "@/components/cart/CartProvider";
import { cartLineKey, cartBondTotal, cartHireTotal } from "@/lib/cart";
import {
  BOND_REFUND_NOTICE,
  DELIVERY_LEAVE_AT_DOOR_LABEL,
  DELIVERY_WINDOW_NOTICE,
  FULFILLMENT_OPTIONS,
  PICKUP_BEXLEY_NOTICE,
  type FulfillmentMethod,
} from "@/lib/constants";
import { DELIVERY_FEE_CENTS } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function CartPage() {
  const { cart, removeLine, totalCents, isLoading } = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [fulfillmentMethod, setFulfillmentMethod] = useState<
    FulfillmentMethod | ""
  >("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [leaveAtDoor, setLeaveAtDoor] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const hireTotal = cartHireTotal(cart);
  const bondTotal = cartBondTotal(cart);
  const isDelivery = fulfillmentMethod === "delivery";
  const deliveryFee = isDelivery ? DELIVERY_FEE_CENTS : 0;
  const checkoutTotal = totalCents + deliveryFee;

  function handleFulfillmentChange(method: FulfillmentMethod) {
    setFulfillmentMethod(method);
    if (method === "pickup_bexley") {
      setDeliveryAddress("");
      setLeaveAtDoor(false);
    }
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (!fulfillmentMethod) {
      toast.error("Please choose pickup or delivery");
      return;
    }
    if (isDelivery && !deliveryAddress.trim()) {
      toast.error("Please enter your full delivery address");
      return;
    }

    setCheckingOut(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          fulfillmentMethod,
          deliveryAddress: isDelivery ? deliveryAddress.trim() : undefined,
          leaveAtDoor: isDelivery ? leaveAtDoor : false,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Checkout failed");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      toast.error("Checkout failed");
    } finally {
      setCheckingOut(false);
    }
  }

  if (isLoading) {
    return (
      <div className="py-16 text-center text-sm font-light text-foreground-soft sm:py-32">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-warm-white py-12 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <h1 className="text-center font-serif text-3xl font-light text-foreground sm:text-4xl">
          Your selection
        </h1>
        <p className="mt-3 text-center text-sm font-light text-foreground-soft sm:mt-4">
          Review your reserved pieces before secure checkout.
        </p>

        {cart.length === 0 ? (
          <div className="mt-10 rounded-3xl bg-cream p-8 text-center shadow-luxury sm:mt-16 sm:p-12">
            <p className="font-light text-foreground-soft">Your selection is empty.</p>
            <Button className="mt-8" variant="outline" asChild>
              <Link href="/props">View collections</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-10 space-y-8 sm:mt-16 sm:space-y-10">
            <ul className="space-y-4 sm:space-y-6">
              {cart.map((line) => (
                <li
                  key={cartLineKey(line)}
                  className="flex gap-4 rounded-3xl bg-cream p-4 shadow-luxury sm:gap-5 sm:p-6"
                >
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl bg-sage-muted">
                    {line.imageUrl && (
                      <Image
                        src={line.imageUrl}
                        alt={line.itemName}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between sm:flex-row sm:items-center">
                    <div>
                      <p className="font-serif text-lg font-light text-foreground">
                        {line.itemName}
                      </p>
                      <p className="mt-1 text-xs font-light text-foreground-soft">
                        Event:{" "}
                        {format(parseISO(line.eventDate), "EEE d MMM yyyy")}
                        {line.selectedSize ? ` · ${line.selectedSize}` : ""}
                        {line.selectedSets ? ` · ${line.selectedSets}` : ""}
                      </p>
                      {line.pickupDate && line.returnDate && (
                        <p className="mt-0.5 text-xs font-light text-foreground-soft">
                          Pickup {format(parseISO(line.pickupDate), "d MMM")} · Return{" "}
                          {format(parseISO(line.returnDate), "d MMM")}
                        </p>
                      )}
                      <p className="mt-2 font-serif text-sage">
                        Hire fee: {formatPrice(line.priceCents)}
                      </p>
                      {line.bondCents ? (
                        <p className="text-xs font-light text-foreground-soft">
                          Refundable bond: {formatPrice(line.bondCents)}
                        </p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        removeLine(
                          line.itemId,
                          line.eventDate,
                          line.selectedSize,
                          line.selectedSets,
                        )
                      }
                      className="mt-2 text-xs uppercase tracking-luxury text-foreground-soft hover:text-sage sm:mt-0"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <form onSubmit={handleCheckout} className="space-y-5 rounded-3xl bg-cream p-5 shadow-luxury sm:space-y-6 sm:p-8">
              <h2 className="text-center font-serif text-xl font-light text-foreground">
                Checkout
              </h2>
              <div className="space-y-2">
                <Label htmlFor="checkout-name">Full name</Label>
                <Input
                  id="checkout-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkout-email">Email</Label>
                <Input
                  id="checkout-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <fieldset className="space-y-3">
                <legend className="text-sm font-light text-foreground">
                  Collection or delivery
                </legend>
                <div className="flex flex-wrap gap-2">
                  {FULFILLMENT_OPTIONS.map((option) => {
                    const isDeliveryOption = option.id === "delivery";

                    return (
                      <button
                        key={option.id}
                        type="button"
                        disabled={isDeliveryOption}
                        onClick={() => handleFulfillmentChange(option.id)}
                        className={cn(
                          "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2.5 text-xs uppercase tracking-wider transition-colors",
                          isDeliveryOption
                            ? "cursor-not-allowed border-sage/20 bg-cream text-foreground-soft"
                            : fulfillmentMethod === option.id
                              ? "border-sage bg-sage text-black"
                              : "border-sage/30 bg-warm-white text-foreground hover:border-sage",
                        )}
                      >
                        {option.label}
                        {isDeliveryOption ? (
                          <span className="text-[10px] font-light normal-case tracking-normal">
                            Coming soon
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
                {fulfillmentMethod === "pickup_bexley" ? (
                  <p className="text-xs font-light leading-relaxed text-foreground-soft">
                    {PICKUP_BEXLEY_NOTICE}
                  </p>
                ) : null}
                {isDelivery ? (
                  <div className="space-y-4 rounded-2xl bg-warm-white p-4">
                    <p className="text-xs font-light leading-relaxed text-foreground-soft">
                      {DELIVERY_WINDOW_NOTICE} A delivery fee of{" "}
                      {formatPrice(DELIVERY_FEE_CENTS)} applies.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="delivery-address">Full delivery address</Label>
                      <Textarea
                        id="delivery-address"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Street address, suburb, state, postcode"
                        rows={4}
                        required
                      />
                    </div>
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={leaveAtDoor}
                        onChange={(e) => setLeaveAtDoor(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-sage/40 accent-sage"
                      />
                      <span className="text-sm font-light leading-relaxed text-foreground">
                        {DELIVERY_LEAVE_AT_DOOR_LABEL}
                      </span>
                    </label>
                  </div>
                ) : null}
              </fieldset>

              <div className="rounded-2xl bg-warm-white px-4 py-4 text-center sm:px-6 sm:py-5">
                <div className="space-y-2 text-sm font-light text-foreground-soft">
                  <div className="flex justify-between gap-4">
                    <span>Hire fees</span>
                    <span className="text-foreground">{formatPrice(hireTotal)}</span>
                  </div>
                  {bondTotal > 0 ? (
                    <div className="flex justify-between gap-4">
                      <span>Refundable bonds</span>
                      <span className="text-foreground">{formatPrice(bondTotal)}</span>
                    </div>
                  ) : null}
                  {deliveryFee > 0 ? (
                    <div className="flex justify-between gap-4">
                      <span>Delivery fee</span>
                      <span className="text-foreground">{formatPrice(deliveryFee)}</span>
                    </div>
                  ) : null}
                </div>
                <p className="mt-4 text-xs uppercase tracking-luxury text-foreground-soft">
                  Total due at checkout
                </p>
                <p className="mt-2 font-serif text-2xl font-light text-foreground sm:text-3xl">
                  {formatPrice(checkoutTotal)}
                </p>
                {bondTotal > 0 ? (
                  <p className="mt-3 text-left text-xs font-light leading-relaxed text-foreground-soft">
                    {BOND_REFUND_NOTICE}
                  </p>
                ) : null}
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={checkingOut || !fulfillmentMethod}
              >
                {checkingOut ? "Redirecting..." : "Proceed to secure payment"}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
