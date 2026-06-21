import Image from "next/image";
import { SectionHeading } from "./SectionHeading";

const portfolio = [
  {
    src: "/gallery/cinderella.jpg",
    alt: "Cinderella-themed first birthday with arch backdrop, balloon garland, cutout, and light number",
  },
  {
    src: "/gallery/setup-1.jpg",
    alt: "Mickey Mouse first birthday with black arch backdrop, balloon garland, and themed cake",
  },
  {
    src: "/gallery/setup-2.jpg",
    alt: "80th birthday styling with wood backdrop, balloon arch, light-up numbers, and tree stump plinth",
  },
  {
    src: "/gallery/setup-3.jpg",
    alt: "Sage and cream outdoor picnic styling with double arch backdrop and balloon garland",
  },
];

export function WorkSection() {
  return (
    <section id="gallery" className="section-padding bg-warm-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Gallery"
          title="A glimpse of our work"
          description="Moments we have styled — refined, feminine, and quietly spectacular."
          blackText
        />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 lg:gap-8">
          {portfolio.map((img) => (
            <div
              key={img.src}
              className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-cream shadow-luxury sm:aspect-[4/5]"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 50vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
