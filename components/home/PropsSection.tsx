import Link from "next/link";
import { getAllCategories } from "@/lib/catalog";
import { SectionHeading } from "./SectionHeading";
import { HireCategoryCard } from "@/components/props/HireCategoryCard";
import { HorizontalScroll } from "@/components/ui/horizontal-scroll";
import { Button } from "@/components/ui/button";

export async function PropsSection() {
  const categories = await getAllCategories();

  return (
    <section id="props-hire" className="section-padding bg-cream">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          title="Props for Hire"
          description="Beautiful setups. Unforgettable moments."
        />

        <HorizontalScroll className="mt-8 lg:mt-10">
          {categories.map((cat) => (
            <li
              key={cat.slug}
              className="w-[220px] shrink-0 snap-start sm:w-[240px] md:w-[260px]"
            >
              <HireCategoryCard
                slug={cat.slug}
                name={cat.name}
                image={cat.imageUrl || "/logo.png"}
              />
            </li>
          ))}
        </HorizontalScroll>

        <p className="mt-3 text-center text-xs font-light text-foreground-soft">
          Swipe or drag to browse collections
        </p>

        <div className="mt-8 text-center">
          <Button variant="outline" className="min-h-11" asChild>
            <Link href="/props">Explore all collections</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
