import Image from "next/image";
import { SectionHeading } from "./SectionHeading";
import { QuoteForm } from "@/components/quote/QuoteForm";

export function QuoteSection() {
  return (
    <section id="contact" className="section-padding bg-cream">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
        <div className="hidden lg:block">
          <SectionHeading
            eyebrow="Contact"
            title="Tell us what you're after"
            description="From setup, cake, desserts, thank you gifts, cake topper, catering, DJ and more — we set up your event from A to Z."
            blackText
          />
        </div>

        <div className="max-[340px]:flex max-[340px]:flex-col grid grid-cols-[minmax(0,1fr)_38%] items-start gap-3 sm:grid-cols-[minmax(0,1fr)_42%] sm:gap-4 lg:hidden">
          <SectionHeading
            eyebrow="Contact"
            title="Tell us what you're after"
            description="From setup, cake, desserts, thank you gifts, cake topper, catering, DJ and more — we set up your event from A to Z."
            blackText
            compact
            align="left"
          />
          <div className="grid grid-rows-2 gap-1.5 sm:gap-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg shadow-luxury sm:rounded-xl">
              <Image
                src="/enquiry/setup.jpg"
                alt="DreamScape Event styling setup"
                fill
                className="object-cover"
                sizes="42vw"
              />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg shadow-luxury sm:rounded-xl">
              <Image
                src="/enquiry/topper.jpg"
                alt="DreamScape Event cake topper styling"
                fill
                className="object-cover"
                sizes="42vw"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 grid items-stretch gap-4 sm:mt-6 lg:mt-12 lg:grid-cols-2 lg:gap-10">
          <div className="hidden lg:flex lg:flex-col lg:gap-4">
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
