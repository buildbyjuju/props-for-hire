import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { QuoteForm } from "@/components/quote/QuoteForm";

export function QuoteSection() {
  return (
    <section id="contact" className="section-padding bg-cream">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Contact"
          title="Tell us what you're after"
          description="From setup, cake, desserts, thank you gifts, cake topper, catering, DJ and more — we set up your event from A to Z."
          blackText
        />

        <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 lg:hidden">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-luxury">
            <Image
              src="/enquiry/setup.jpg"
              alt="DreamScape Event styling setup"
              fill
              className="object-cover"
              sizes="50vw"
            />
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-luxury">
            <Image
              src="/enquiry/topper.jpg"
              alt="DreamScape Event cake topper styling"
              fill
              className="object-cover"
              sizes="50vw"
            />
          </div>
        </div>

        <div className="mt-3 flex justify-center lg:hidden">
          <Link
            href="/party-setups"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-sage/30 text-sage transition-colors hover:border-sage hover:bg-sage/10"
            aria-label="What we offer for party setups"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
        </div>

        <div className="mt-6 lg:mt-12 lg:grid lg:grid-cols-2 lg:items-start lg:gap-10">
          <div className="hidden flex-col gap-4 lg:flex">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-luxury">
              <Image
                src="/enquiry/setup.jpg"
                alt="DreamScape Event styling setup"
                fill
                className="object-cover"
                sizes="320px"
              />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-luxury">
              <Image
                src="/enquiry/topper.jpg"
                alt="DreamScape Event cake topper styling"
                fill
                className="object-cover"
                sizes="320px"
              />
            </div>
          </div>
          <QuoteForm />
        </div>
      </div>
    </section>
  );
}
