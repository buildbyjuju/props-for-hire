import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getCategoryBySlug } from "@/lib/catalog";
import { ItemCard } from "@/components/props/ItemCard";
import { getCategoryBondNotice } from "@/lib/pricing";
import { CUTOUT_IMAGE_CLASS, isCutoutCategory } from "@/lib/item-images";
import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Props = {
  params: Promise<{ category: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { category: slug } = await params;
  const cat = await getCategoryBySlug(slug);
  return { title: cat?.name ?? "Collection" };
}

export default async function CategoryPage({ params }: Props) {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) notFound();

  const meta = CATEGORIES.find((c) => c.slug === slug);
  const heroImage = category.imageUrl ?? meta?.image;

  return (
    <div className="bg-warm-white">
      {heroImage && (
        <div className="relative h-[36vh] min-h-[240px] w-full lg:h-[40vh] lg:min-h-[280px]">
          <Image
            src={heroImage}
            alt={category.name}
            fill
            className={cn(
              isCutoutCategory(slug) ? CUTOUT_IMAGE_CLASS : "object-cover",
            )}
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-warm-white via-warm-white/20 to-transparent" />
        </div>
      )}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:py-20">
        <Link
          href="/props"
          className="text-xs font-light uppercase tracking-luxury text-foreground-soft hover:text-sage"
        >
          ← All collections
        </Link>
        <h1 className="mt-6 font-serif text-3xl font-light text-foreground sm:mt-8 sm:text-4xl lg:text-5xl">
          {category.name}
        </h1>
        <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-foreground-soft sm:mt-6">
          {getCategoryBondNotice(slug)}
        </p>
        <p className="mt-3 max-w-xl text-sm font-light leading-relaxed text-foreground-soft sm:mt-4">
          {category.description}
        </p>
        <div className="mt-10 grid gap-6 sm:mt-16 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-10">
          {category.items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              categoryName={category.name}
              categorySlug={slug}
            />
          ))}
        </div>
        {category.items.length === 0 && (
          <p className="mt-12 text-center font-light text-foreground-soft">
            Pieces coming soon to this collection.
          </p>
        )}
      </div>
    </div>
  );
}
