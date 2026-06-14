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
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-2 lg:items-center lg:gap-14">
          <div>
            <p className="text-xs font-bold uppercase tracking-luxury text-black">
              About us
            </p>
            <h2 className="mt-4 font-serif text-2xl font-light leading-snug text-black sm:text-3xl lg:text-[2.75rem]">
              Creating spaces
              <br />
              <span className="font-bold italic text-sage">worth remembering</span>
            </h2>
            <p className="mt-6 text-sm font-light leading-relaxed text-black sm:text-base lg:mt-8">
              DreamScape Event began with a love of beautiful celebrations — the
              kind where every corner feels considered, cohesive, and uniquely
              yours. Based in Sydney, we style intimate milestones and larger
              events with the same eye for detail, blending curated props with
              refined finishing touches.
            </p>
            <p className="mt-4 text-sm font-light leading-relaxed text-black sm:text-base">
              Whether you are planning a soft bridal shower, a bold birthday, or
              a once-in-a-lifetime wedding, we help bring your vision to life —
              so you can walk in and simply enjoy the moment.
            </p>
            <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-2 sm:gap-x-6 lg:mt-8">
              {HIGHLIGHTS.map((item) => (
                <li
                  key={item}
                  className="text-xs uppercase tracking-luxury text-black"
                >
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3 sm:gap-4 lg:mt-10">
              <Button size="lg" variant="outline" className="min-h-11" asChild>
                <Link href="/#gallery">View our gallery</Link>
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
        </div>
      </div>
    </section>
  );
}
