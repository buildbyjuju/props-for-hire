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
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Gallery"
          title="A glimpse of our work"
          description="Moments we have styled — refined, feminine, and quietly spectacular."
          blackText
        />
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
          {portfolio.map((img) => (
            <div
              key={img.src}
              className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-cream shadow-luxury"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
