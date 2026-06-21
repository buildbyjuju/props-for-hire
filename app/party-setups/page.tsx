import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/home/SectionHeading";
import { Button } from "@/components/ui/button";
import { homeSectionLink } from "@/lib/site-home";

const PARTY_SETUP_OFFERS = [
  {
    title: "Full event styling",
    description:
      "Backdrops, balloons, table styling, and coordinated décor — designed and set up by our team.",
    image: "/party-setups/birthday.jpg",
    alt: "DreamScape Event birthday party styling setup",
  },
  {
    title: "Cake & desserts",
    description:
      "Beautiful cakes and dessert tables through our bakery partners — styled to suit your theme.",
    image: "/party-setups/cakes.jpg",
    alt: "DreamScape Event cake and dessert styling",
  },
  {
    title: "Cake toppers & details",
    description:
      "Custom cake toppers and personalised finishing touches, sourced through trusted local makers.",
    image: "/party-setups/cake-toppers.png",
    alt: "DreamScape Event custom cake topper",
  },
  {
    title: "Thank you gifts",
    description:
      "Thoughtfully presented favours and gift styling for your guests, arranged with our partner suppliers.",
    image: "/party-setups/gifts.jpg",
    alt: "DreamScape Event thank you gift styling",
  },
  {
    title: "Catering coordination",
    description:
      "Buffet styling, food warmers, and table setups — working with caterers we trust to feed your guests beautifully.",
    image: "/party-setups/catering.jpg",
    alt: "DreamScape Event buffet and catering setup",
  },
  {
    title: "DJ & entertainment",
    description:
      "We can connect you with DJs and entertainers from our network so your celebration keeps its energy from start to finish.",
    image: "/party-setups/birthday.jpg",
    alt: "DreamScape Event party entertainment setup",
  },
] as const;

export default function PartySetupsPage() {
  return (
    <div className="section-padding bg-cream">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Link
          href={homeSectionLink("contact")}
          className="text-xs font-light uppercase tracking-luxury text-foreground-soft hover:text-sage"
        >
          ← Back to contact
        </Link>

        <SectionHeading
          className="mt-6"
          eyebrow="Party setups"
          title="What we offer — with trusted partners"
          description="We work closely with bakeries, caterers, and creatives across Sydney so you can book styling, cake, catering, gifts, and more through one place. DreamScape coordinates everything; our partners deliver the specialist touches."
          align="left"
          blackText
        />

        <ul className="mt-10 space-y-8">
          {PARTY_SETUP_OFFERS.map((offer) => (
            <li
              key={offer.title}
              className="overflow-hidden rounded-2xl bg-warm-white shadow-luxury"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={offer.image}
                  alt={offer.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 768px"
                />
              </div>
              <div className="px-5 py-5 sm:px-6 sm:py-6">
                <h2 className="font-serif text-xl font-light text-foreground">
                  {offer.title}
                </h2>
                <p className="mt-2 text-sm font-light leading-relaxed text-foreground-soft">
                  {offer.description}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-10 text-center sm:text-left">
          <Button className="min-h-11" asChild>
            <Link href={homeSectionLink("contact")}>Get in touch</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
