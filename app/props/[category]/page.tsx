import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getCategoryBySlug } from "@/lib/catalog";
import { ItemCard } from "@/components/props/ItemCard";
import { HIRE_BOND_NOTICE } from "@/lib/pricing";
import { CATEGORIES } from "@/lib/constants";

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
        <div className="relative h-[40vh] min-h-[280px] w-full">
          <Image
            src={heroImage}
            alt={category.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-warm-white via-warm-white/20 to-transparent" />
        </div>
      )}
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <Link
          href="/props"
          className="text-xs font-light uppercase tracking-luxury text-foreground-soft hover:text-sage"
        >
          ← All collections
        </Link>
        <h1 className="mt-8 font-serif text-4xl font-light text-foreground sm:text-5xl">
          {category.name}
        </h1>
        <p className="mt-6 max-w-2xl text-sm font-light leading-relaxed text-foreground">
          {HIRE_BOND_NOTICE}
        </p>
        <p className="mt-4 max-w-xl text-sm font-light leading-relaxed text-foreground-soft">
          {category.description}
        </p>
        <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {category.items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              categoryName={category.name}
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
