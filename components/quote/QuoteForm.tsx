"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitQuote } from "@/app/actions/quote";

export function QuoteForm() {
  const [pending, setPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();

    if (!email && !phone) {
      toast.error("Please enter an email address or phone number.");
      setPending(false);
      return;
    }

    try {
      const result = await submitQuote(formData);
      if (result.success) {
        toast.success("Your enquiry has been sent. We will be in touch shortly.");
        formRef.current?.reset();
      } else {
        toast.error(result.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Failed to send enquiry.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="w-full space-y-4 rounded-2xl bg-sage p-5 shadow-luxury sm:p-8 lg:p-10"
    >
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-warm-white/80">
          Full name
        </Label>
        <Input id="name" name="name" required placeholder="Your name" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-warm-white/80">
          Email address
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@email.com"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone" className="text-warm-white/80">
          Phone number
        </Label>
        <Input id="phone" name="phone" type="tel" placeholder="04xx xxx xxx" />
      </div>
      <p className="text-xs font-light text-warm-white/70">
        Provide an email address or phone number so we can reach you.
      </p>
      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-warm-white/80">
          Description
        </Label>
        <Textarea
          id="description"
          name="description"
          required
          placeholder="Tell us about your event, date, venue, and styling ideas..."
          rows={5}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="photos" className="text-warm-white/80">
          Photos
        </Label>
        <Input
          id="photos"
          name="photos"
          type="file"
          accept="image/*"
          multiple
          className="cursor-pointer file:mr-4 file:rounded-full file:border-0 file:bg-warm-white file:px-4 file:py-1 file:text-xs file:uppercase file:tracking-widest file:text-foreground-soft"
        />
      </div>
      <Button
        type="submit"
        size="lg"
        className="w-full bg-warm-white font-bold text-black hover:bg-cream"
        disabled={pending}
      >
        {pending ? "Sending..." : "Send enquiry"}
      </Button>
    </form>
  );
}
