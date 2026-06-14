import Link from "next/link";
import Image from "next/image";
import { SOCIAL_LINKS } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section id="home" className="relative w-full overflow-hidden bg-cream">
      <div className="relative mx-auto max-w-7xl max-[340px]:block grid grid-cols-[minmax(0,1fr)_38%] items-center gap-3 px-3 py-5 sm:grid-cols-[minmax(0,1fr)_42%] sm:gap-4 sm:px-4 sm:py-6 md:px-6 lg:grid lg:min-h-[75vh] lg:grid-cols-2 lg:items-center lg:gap-0 lg:px-0 lg:py-0">
        <div className="relative z-10 flex min-w-0 flex-col justify-center text-left lg:px-6 lg:py-20 lg:pl-6 lg:pr-8 xl:pr-12">
          <p className="mb-2 text-[10px] font-light uppercase tracking-luxury text-black sm:mb-3 sm:text-[11px] lg:mb-4 lg:text-xs">
            Sydney · Luxury Event Styling
          </p>
          <h1 className="font-serif text-[1.2rem] font-light leading-[1.12] text-black sm:text-2xl md:text-4xl lg:max-w-none lg:text-5xl lg:leading-[1.15] xl:text-6xl">
            Props For Hire &amp;{" "}
            <span className="font-bold italic text-sage">Event Set Up</span> Sydney
          </h1>
          <p className="mt-2 max-w-lg text-[11px] font-light leading-snug tracking-wide text-black sm:mt-4 sm:text-sm md:text-base lg:mt-8">
            Curated props and full styling for celebrations that feel timeless,
            refined, and unmistakably yours.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:mt-5 sm:flex-row sm:flex-wrap lg:mt-10 lg:gap-4">
            <Button
              size="sm"
              className="min-h-10 w-full px-4 text-[10px] sm:min-h-11 sm:w-auto sm:px-7 sm:text-xs lg:hidden"
              asChild
            >
              <Link href="/#props-hire">Props for Hire</Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="min-h-10 w-full px-4 text-[10px] sm:min-h-11 sm:w-auto sm:px-7 sm:text-xs lg:hidden"
              asChild
            >
              <a
                href={SOCIAL_LINKS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            </Button>
            <Button size="lg" className="hidden min-h-11 px-10 lg:inline-flex" asChild>
              <Link href="/#props-hire">Props for Hire</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="hidden min-h-11 px-10 lg:inline-flex"
              asChild
            >
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

        <div className="relative aspect-[3/4] min-h-[180px] w-full overflow-hidden rounded-xl sm:min-h-[220px] sm:rounded-2xl lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:h-full lg:min-h-0 lg:w-[54%] lg:rounded-none xl:w-[52%]">
          <Image
            src="/hero.jpg"
            alt="Long dining table styling with sage green backdrop, neon sign, and dessert display"
            fill
            className="object-cover object-[70%_center] lg:object-[55%_center] [mask-image:linear-gradient(to_right,transparent_0%,rgba(0,0,0,0.1)_6%,black_16%,black_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,rgba(0,0,0,0.1)_6%,black_16%,black_100%)] lg:[mask-image:linear-gradient(to_right,transparent_0%,rgba(0,0,0,0.15)_8%,black_18%,black_100%)] lg:[-webkit-mask-image:linear-gradient(to_right,transparent_0%,rgba(0,0,0,0.15)_8%,black_18%,black_100%)]"
            priority
            sizes="(max-width: 1024px) 42vw, 54vw"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-cream/60 via-cream/10 to-transparent lg:from-cream/50 lg:via-cream/5 lg:to-transparent"
            aria-hidden
          />
        </div>
      </div>
    </section>
  );
}
