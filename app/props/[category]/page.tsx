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
        <div className="relative hidden h-[40vh] min-h-[280px] w-full lg:block">
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
      <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-10 lg:px-6 lg:py-20">
        <div className="max-[340px]:flex max-[340px]:flex-col grid grid-cols-[minmax(0,1fr)_38%] items-start gap-3 sm:grid-cols-[minmax(0,1fr)_42%] sm:gap-4 lg:block">
          <div className="min-w-0">
            <Link
              href="/props"
              className="text-[10px] font-light uppercase tracking-luxury text-foreground-soft hover:text-sage sm:text-xs"
            >
              ← All collections
            </Link>
            <h1 className="mt-3 font-serif text-xl font-light text-foreground sm:mt-4 sm:text-2xl md:text-3xl lg:mt-8 lg:text-5xl">
              {category.name}
            </h1>
            <p className="mt-2 text-[11px] font-light leading-snug text-foreground sm:mt-4 sm:text-sm lg:mt-6 lg:text-sm lg:leading-relaxed">
              {HIRE_BOND_NOTICE}
            </p>
            <p className="mt-2 hidden text-[11px] font-light leading-snug text-foreground-soft sm:mt-3 sm:block sm:text-sm lg:mt-4">
              {category.description}
            </p>
          </div>
          {heroImage && (
            <div className="relative aspect-[3/4] min-h-[160px] overflow-hidden rounded-xl shadow-luxury sm:min-h-[200px] sm:rounded-2xl lg:hidden">
              <Image
                src={heroImage}
                alt={category.name}
                fill
                className="object-cover"
                priority
                sizes="42vw"
              />
            </div>
          )}
        </div>
        <p className="mt-2 text-[11px] font-light leading-snug text-foreground-soft sm:hidden">
          {category.description}
        </p>
        <div className="mt-6 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:mt-16 lg:grid-cols-3 lg:gap-10">
          {category.items.map((item) => (
            <ItemCard key={item.id} item={item} categoryName={category.name} />
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
