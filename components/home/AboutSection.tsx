import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SOCIAL_LINKS } from "@/lib/constants";

const HIGHLIGHTS = [
  "Curated props for hire",
  "Luxury event styling",
  "Sydney & surrounds",
] as const;

export function AboutSection() {
  return (
    <section id="about" className="section-padding bg-cream">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-2 lg:items-center lg:gap-14">
          <div className="text-center lg:text-left">
            <p className="text-xs font-bold uppercase tracking-luxury text-black">
              About us
            </p>
            <h2 className="mx-auto mt-4 max-w-4xl font-serif text-3xl font-light leading-[1.15] text-black sm:text-4xl lg:mx-0 lg:max-w-none lg:text-[2.75rem] lg:leading-snug">
              Creating spaces
              <br />
              <span className="font-bold italic text-sage">worth remembering</span>
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-sm font-light leading-relaxed tracking-wide text-black sm:text-base lg:mx-0 lg:mt-8">
              DreamScape Event began with a love of beautiful celebrations — the
              kind where every corner feels considered, cohesive, and uniquely
              yours. Based in Sydney, we style intimate milestones and larger
              events with the same eye for detail, blending curated props with
              refined finishing touches.
            </p>
            <p className="mx-auto mt-4 max-w-lg text-sm font-light leading-relaxed tracking-wide text-black sm:text-base lg:mx-0">
              Whether you are planning a soft bridal shower, a bold birthday, or
              a once-in-a-lifetime wedding, we help bring your vision to life —
              so you can walk in and simply enjoy the moment.
            </p>
            <ul className="mx-auto mt-6 flex max-w-lg flex-wrap justify-center gap-x-4 gap-y-2 sm:gap-x-6 lg:mx-0 lg:mt-8 lg:max-w-none lg:justify-start">
              {HIGHLIGHTS.map((item) => (
                <li
                  key={item}
                  className="text-xs uppercase tracking-luxury text-black"
                >
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 hidden flex-wrap justify-start gap-3 sm:gap-4 lg:mt-10 lg:flex">
              <Button size="lg" variant="outline" className="min-h-11" asChild>
                <a
                  href={SOCIAL_LINKS.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
              </Button>
              <Button size="lg" className="min-h-11" asChild>
                <Link href="/props">Browse props</Link>
              </Button>
            </div>
          </div>

          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-2xl shadow-luxury lg:mx-0 lg:max-w-none">
            <Image
              src="/about.jpg"
              alt="DreamScape Event luxury styling setup"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div className="mt-4 flex flex-nowrap justify-center gap-3 px-4 sm:mt-5 sm:gap-4 sm:px-6 lg:hidden">
            <Button size="sm" variant="outline" className="min-h-11 shrink-0 whitespace-nowrap px-4 sm:px-5" asChild>
              <a
                href={SOCIAL_LINKS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            </Button>
            <Button size="sm" className="min-h-11 shrink-0 whitespace-nowrap px-4 sm:px-5" asChild>
              <Link href="/props">Browse props</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
