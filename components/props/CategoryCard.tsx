import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CategoryCard({
  slug,
  name,
  description,
  image,
}: {
  slug: string;
  name: string;
  description: string;
  image: string;
}) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl bg-cream shadow-luxury transition-all duration-500 hover:shadow-luxury-hover">
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          className={
            slug === "cutouts"
              ? "object-contain object-center bg-warm-white p-6 transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              : "object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          }
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cream/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>
      <div className="flex flex-1 flex-col items-center px-6 py-8 text-center sm:px-8 sm:py-10">
        <h2 className="font-serif text-2xl font-light text-foreground sm:text-3xl">
          {name}
        </h2>
        <p className="mt-3 max-w-xs text-sm font-light leading-relaxed text-foreground-soft">
          {description}
        </p>
        <Button variant="outline" size="sm" className="mt-8 min-h-11" asChild>
          <Link href={`/props/${slug}`}>View Collection</Link>
        </Button>
      </div>
    </article>
  );
}
