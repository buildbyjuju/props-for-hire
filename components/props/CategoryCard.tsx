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
    <article className="group grid grid-cols-[38%_1fr] overflow-hidden rounded-2xl bg-cream shadow-luxury transition-all duration-500 hover:shadow-luxury-hover sm:rounded-3xl lg:flex lg:flex-col">
      <div className="relative aspect-[3/4] overflow-hidden lg:aspect-[4/5]">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          sizes="(max-width: 1024px) 38vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cream/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>
      <div className="flex min-w-0 flex-col justify-center px-3 py-3 text-left sm:px-4 sm:py-4 lg:items-center lg:px-8 lg:py-10 lg:text-center">
        <h2 className="font-serif text-sm font-light leading-snug text-foreground sm:text-base lg:text-3xl">
          {name}
        </h2>
        <p className="mt-1 line-clamp-3 text-[10px] font-light leading-snug text-foreground-soft sm:mt-2 sm:text-xs lg:mt-3 lg:line-clamp-none lg:text-sm lg:leading-relaxed">
          {description}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2 hidden min-h-9 px-3 text-[10px] sm:mt-4 lg:mt-8 lg:inline-flex lg:min-h-11 lg:px-5 lg:text-xs"
          asChild
        >
          <Link href={`/props/${slug}`}>View Collection</Link>
        </Button>
        <Link
          href={`/props/${slug}`}
          className="mt-2 text-[9px] uppercase tracking-luxury text-foreground-soft transition-colors hover:text-sage lg:hidden"
        >
          View →
        </Link>
      </div>
    </article>
  );
}
