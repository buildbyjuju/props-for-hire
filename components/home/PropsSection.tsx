import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";
import { SectionHeading } from "./SectionHeading";
import { HireCategoryCard } from "@/components/props/HireCategoryCard";
import { Button } from "@/components/ui/button";

export function PropsSection() {
  return (
    <section id="props-hire" className="section-padding bg-cream">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          title="Props for Hire"
          description="Beautiful setups. Unforgettable moments."
        />
        <div className="-mx-6 mt-10 overflow-x-auto px-6 pb-4 scrollbar-none">
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
        <div className="mt-8 text-center">
          <Button variant="outline" asChild>
            <Link href="/props">Explore all collections</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
