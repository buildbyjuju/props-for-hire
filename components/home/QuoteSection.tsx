import Image from "next/image";
import { SectionHeading } from "./SectionHeading";
import { QuoteForm } from "@/components/quote/QuoteForm";

export function QuoteSection() {
  return (
    <section id="contact" className="section-padding bg-cream">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Contact"
          title="Tell us what you're after"
          description="From setup, cake, desserts, thank you gifts, cake topper, catering, DJ and more — we set up your event from A to Z."
          blackText
        />
        <div className="mt-12 grid items-stretch gap-8 lg:grid-cols-2 lg:gap-10">
          <div className="mx-auto flex h-full w-full max-w-xs flex-col gap-3 sm:max-w-md sm:flex-row sm:gap-4 lg:mx-0 lg:max-w-sm lg:flex-col lg:gap-4">
            <div className="relative aspect-[4/3] min-h-0 flex-1 overflow-hidden rounded-2xl shadow-luxury sm:aspect-auto sm:max-h-44 lg:max-h-none">
              <Image
                src="/enquiry/setup.jpg"
                alt="DreamScape Event styling setup"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 45vw, 320px"
              />
            </div>
            <div className="relative aspect-[4/3] min-h-0 flex-1 overflow-hidden rounded-2xl shadow-luxury sm:aspect-auto sm:max-h-44 lg:max-h-none">
              <Image
                src="/enquiry/topper.jpg"
                alt="DreamScape Event cake topper styling"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 45vw, 320px"
              />
            </div>
          </div>
          <QuoteForm />
        </div>
      </div>
    </section>
  );
}
