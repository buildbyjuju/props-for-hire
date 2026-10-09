import { getAllCategories } from "@/lib/catalog";
import { CategoryCard } from "@/components/props/CategoryCard";
import { SectionHeading } from "@/components/home/SectionHeading";

export const metadata = {
  title: "Hire Collection",
};

export default async function PropsPage() {
  const categories = await getAllCategories();

  return (
    <div className="section-padding bg-warm-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Hire Collection"
          title="Curated for the finest celebrations"
          description="Explore our collections of backdrops, styling pieces, and décor — each selected with the eye of a luxury event stylist."
        />
        <div className="mt-8 grid gap-6 sm:mt-10 sm:grid-cols-2 sm:gap-8 lg:gap-12">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.slug}
              slug={cat.slug}
              name={cat.name}
              description={cat.description}
              image={cat.imageUrl || "/logo.png"}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
