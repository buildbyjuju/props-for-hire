import Link from "next/link";
import Image from "next/image";
import { SOCIAL_LINKS } from "@/lib/constants";
import { homeSectionLink } from "@/lib/site-home";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section id="home" className="relative w-full overflow-hidden bg-cream">
      <div className="relative mx-auto flex max-w-7xl flex-col lg:grid lg:min-h-[75vh] lg:grid-cols-2 lg:items-center">
        <div className="relative z-10 flex flex-col justify-center px-4 py-10 text-center sm:px-6 sm:py-12 lg:py-20 lg:pl-6 lg:pr-8 lg:text-left xl:pr-12">
          <p className="mb-4 text-xs font-light uppercase tracking-luxury text-black">
            Sydney · Luxury Event Styling
          </p>
          <h1 className="mx-auto max-w-4xl font-serif text-3xl font-light leading-[1.15] text-black sm:text-4xl md:text-5xl lg:mx-0 lg:max-w-none lg:text-5xl xl:text-6xl">
            Props For Hire &amp;
            <br />
            <span className="font-bold italic text-sage">Event Set Up</span> Sydney
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-sm font-light leading-relaxed tracking-wide text-black sm:text-base lg:mx-0 lg:mt-8">
            Curated props and full styling for celebrations that feel timeless,
            refined, and unmistakably yours.
          </p>
          <div className="mt-8 hidden flex-wrap justify-center gap-3 sm:gap-4 lg:mt-10 lg:flex lg:justify-start">
            <Button size="lg" className="min-h-11" asChild>
              <Link href={homeSectionLink("props-hire")}>Props for Hire</Link>
            </Button>
            <Button size="lg" variant="outline" className="min-h-11" asChild>
              <a
                href={SOCIAL_LINKS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            </Button>
          </div>
        </div>

        <div className="relative h-[38vh] min-h-[240px] w-full sm:h-[42vh] sm:min-h-[280px] lg:absolute lg:inset-y-0 lg:right-0 lg:h-full lg:min-h-0 lg:w-[54%] xl:w-[52%]">
          <Image
            src="/hero.jpg"
            alt="Long dining table styling with sage green backdrop, neon sign, and dessert display"
            fill
            className="object-cover object-[65%_center] [mask-image:linear-gradient(to_right,transparent_0%,rgba(0,0,0,0.15)_8%,black_18%,black_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,rgba(0,0,0,0.15)_8%,black_18%,black_100%)] lg:object-[55%_center]"
            priority
            sizes="(max-width: 1024px) 100vw, 54vw"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-cream/40 via-transparent to-transparent lg:bg-gradient-to-r lg:from-cream/50 lg:via-cream/5 lg:to-transparent"
            aria-hidden
          />
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-3 px-4 pb-10 sm:mt-5 sm:gap-4 sm:px-6 sm:pb-12 lg:hidden">
          <Button size="lg" className="min-h-11" asChild>
            <Link href={homeSectionLink("props-hire")}>Props for Hire</Link>
          </Button>
          <Button size="lg" variant="outline" className="min-h-11" asChild>
            <a
              href={SOCIAL_LINKS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
