import Image from "next/image";
import { SectionHeading } from "./SectionHeading";

const portfolio = [
  {
    src: "/gallery/setup-1.jpg",
    alt: "DreamScape Event styling setup",
  },
  {
    src: "/gallery/setup-2.jpg",
    alt: "DreamScape Event celebration styling",
  },
  {
    src: "/gallery/setup-3.jpg",
    alt: "DreamScape Event props and décor setup",
  },
  {
    src: "/gallery/setup-4.jpg",
    alt: "DreamScape Event luxury event setup",
  },
];

export function WorkSection() {
  return (
    <section id="gallery" className="section-padding bg-warm-white">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
        <div className="max-[340px]:flex max-[340px]:flex-col grid grid-cols-[minmax(0,1fr)_38%] items-end gap-3 sm:grid-cols-[minmax(0,1fr)_42%] sm:gap-4 lg:block">
          <SectionHeading
            eyebrow="Gallery"
            title="A glimpse of our work"
            description="Moments we have styled — refined, feminine, and quietly spectacular."
            blackText
            compact
            align="left"
            className="lg:mx-auto lg:max-w-2xl lg:text-center"
          />
          <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-cream shadow-luxury sm:rounded-2xl lg:hidden">
            <Image
              src={portfolio[0].src}
              alt={portfolio[0].alt}
              fill
              className="object-cover"
              sizes="42vw"
            />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-3 lg:mt-10 lg:gap-8">
          {portfolio.map((img) => (
            <div
              key={img.src}
              className="relative aspect-[3/4] overflow-hidden rounded-xl bg-cream shadow-luxury sm:rounded-2xl lg:aspect-[4/5]"
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
