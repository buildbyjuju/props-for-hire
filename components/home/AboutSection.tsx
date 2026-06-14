import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const HIGHLIGHTS = [
  "Curated props for hire",
  "Luxury event styling",
  "Sydney & surrounds",
] as const;

export function AboutSection() {
  return (
    <section id="about" className="section-padding bg-cream">
      <div className="mx-auto max-w-6xl px-3 sm:px-4 lg:px-6">
        <div className="lg:grid lg:grid-cols-2 lg:items-center lg:gap-14">
          <div className="max-[340px]:flex max-[340px]:flex-col grid grid-cols-[minmax(0,1fr)_38%] items-start gap-3 sm:grid-cols-[minmax(0,1fr)_42%] sm:gap-4 lg:contents">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-luxury text-black sm:text-xs">
                About us
              </p>
              <h2 className="mt-2 font-serif text-lg font-light leading-snug text-black sm:mt-3 sm:text-xl md:text-2xl lg:mt-4 lg:text-[2.75rem]">
                Creating spaces
                <br className="hidden lg:block" />
                <span className="font-bold italic text-sage">worth remembering</span>
              </h2>
              <p className="mt-2 text-[11px] font-light leading-snug text-black sm:mt-4 sm:text-sm lg:mt-8 lg:text-base lg:leading-relaxed">
                DreamScape Event began with a love of beautiful celebrations — the
                kind where every corner feels considered, cohesive, and uniquely
                yours. Based in Sydney, we style intimate milestones and larger
                events with the same eye for detail, blending curated props with
                refined finishing touches.
              </p>
              <p className="mt-2 hidden text-[11px] font-light leading-snug text-black sm:mt-3 sm:block sm:text-sm lg:mt-4 lg:text-base lg:leading-relaxed">
                Whether you are planning a soft bridal shower, a bold birthday, or
                a once-in-a-lifetime wedding, we help bring your vision to life —
                so you can walk in and simply enjoy the moment.
              </p>
              <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 sm:mt-4 sm:gap-x-4 lg:mt-8 lg:gap-x-6">
                {HIGHLIGHTS.map((item) => (
                  <li
                    key={item}
                    className="text-[9px] uppercase tracking-luxury text-black sm:text-xs"
                  >
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap gap-2 sm:mt-4 sm:gap-3 lg:mt-10 lg:gap-4">
                <Button
                  size="sm"
                  variant="outline"
                  className="min-h-10 px-4 text-[10px] sm:min-h-11 sm:px-7 sm:text-xs lg:hidden"
                  asChild
                >
                  <Link href="/#gallery">View gallery</Link>
                </Button>
                <Button
                  size="sm"
                  className="min-h-10 px-4 text-[10px] sm:min-h-11 sm:px-7 sm:text-xs lg:hidden"
                  asChild
                >
                  <Link href="/props">Browse props</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="hidden min-h-11 px-10 lg:inline-flex"
                  asChild
                >
                  <Link href="/#gallery">View our gallery</Link>
                </Button>
                <Button size="lg" className="hidden min-h-11 px-10 lg:inline-flex" asChild>
                  <Link href="/props">Browse props</Link>
                </Button>
              </div>
            </div>

            <div className="relative aspect-[3/4] min-h-[160px] overflow-hidden rounded-xl shadow-luxury sm:min-h-[200px] sm:rounded-2xl lg:aspect-[3/4] lg:min-h-0">
              <Image
                src="/about.jpg"
                alt="DreamScape Event luxury styling setup"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 42vw, 50vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
