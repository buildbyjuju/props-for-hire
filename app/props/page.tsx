import Image from "next/image";
import { CATEGORIES } from "@/lib/constants";
import { CategoryCard } from "@/components/props/CategoryCard";
import { SectionHeading } from "@/components/home/SectionHeading";

export const metadata = {
  title: "Hire Collection",
};

export default function PropsPage() {
  return (
    <div className="section-padding bg-warm-white">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
        <div className="max-[340px]:flex max-[340px]:flex-col grid grid-cols-[minmax(0,1fr)_40%] items-end gap-3 sm:gap-4 lg:block">
          <SectionHeading
            eyebrow="Hire Collection"
            title="Curated for the finest celebrations"
            description="Explore our collections of backdrops, styling pieces, and décor — each selected with the eye of a luxury event stylist."
            compact
            align="left"
            className="lg:mx-auto lg:max-w-2xl lg:text-center"
          />
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-luxury sm:rounded-2xl lg:hidden">
            <Image
              src={CATEGORIES[0].image}
              alt={CATEGORIES[0].name}
              fill
              className="object-cover"
              sizes="42vw"
            />
          </div>
        </div>
        <div className="mt-3 grid gap-3 sm:mt-4 sm:grid-cols-2 sm:gap-6 lg:mt-10 lg:gap-12">
          {CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat.slug}
              slug={cat.slug}
              name={cat.name}
              description={cat.description}
              image={cat.image}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
