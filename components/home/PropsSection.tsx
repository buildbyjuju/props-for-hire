import Link from "next/link";
import Image from "next/image";
import { CATEGORIES } from "@/lib/constants";
import { SectionHeading } from "./SectionHeading";
import { HireCategoryCard } from "@/components/props/HireCategoryCard";
import { Button } from "@/components/ui/button";

export function PropsSection() {
  return (
    <section id="props-hire" className="section-padding bg-cream">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
        <div className="max-[340px]:flex max-[340px]:flex-col grid grid-cols-[minmax(0,1fr)_40%] items-end gap-3 sm:gap-4 lg:block">
          <SectionHeading
            align="left"
            compact
            title="Props for Hire"
            description="Beautiful setups. Unforgettable moments."
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

        <ul className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-3 md:gap-4 lg:hidden">
          {CATEGORIES.map((cat) => (
            <li key={cat.slug}>
              <HireCategoryCard slug={cat.slug} name={cat.name} image={cat.image} />
            </li>
          ))}
        </ul>

        <div className="-mx-3 mt-10 hidden overflow-x-auto px-3 pb-4 scrollbar-none sm:-mx-4 sm:px-4 lg:mx-0 lg:block lg:px-0">
          <ul className="flex w-max gap-5 sm:gap-6">
            {CATEGORIES.map((cat) => (
              <li
                key={cat.slug}
                className="w-[220px] shrink-0 sm:w-[240px] md:w-[260px]"
              >
                <HireCategoryCard
                  slug={cat.slug}
                  name={cat.name}
                  image={cat.image}
                />
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 text-center sm:mt-6 lg:mt-8">
          <Button variant="outline" className="min-h-10 px-5 text-[10px] sm:min-h-11 sm:text-xs" asChild>
            <Link href="/props">Explore all collections</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
