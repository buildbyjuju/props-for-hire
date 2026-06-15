import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  UtensilsCrossed,
  Sparkles,
  Layers,
  UserRound,
  type LucideIcon,
} from "lucide-react";

function ArchIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <path d="M4 20V12a8 8 0 0 1 16 0v8" />
    </svg>
  );
}

const CATEGORY_ICONS: Record<string, LucideIcon | typeof ArchIcon> = {
  backdrops: ArchIcon,
  "cake-plinth-and-stands": Layers,
  "table-and-buffet": UtensilsCrossed,
  "neon-signs": Heart,
  cutouts: UserRound,
};

export function HireCategoryCard({
  slug,
  name,
  image,
}: {
  slug: string;
  name: string;
  image: string;
}) {
  const Icon = CATEGORY_ICONS[slug] ?? Sparkles;

  return (
    <Link href={`/props/${slug}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-warm-white shadow-luxury transition-shadow duration-300 group-hover:shadow-luxury-hover">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            sizes="260px"
          />
        </div>

        <div className="relative flex flex-1 flex-col items-center px-4 pb-6 pt-8 text-center sm:px-5 sm:pb-7 sm:pt-9">
          <div
            className="absolute -top-5 left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-sage shadow-sm"
            aria-hidden
          >
            <Icon className="h-[18px] w-[18px] text-white stroke-[1.5]" />
          </div>

          <h3 className="font-serif text-sm font-light uppercase tracking-[0.18em] text-foreground sm:text-base">
            {name}
          </h3>
          <p className="mt-3 text-xs font-light uppercase tracking-[0.18em] text-foreground-soft transition-colors group-hover:text-sage">
            View collection →
          </p>
        </div>
      </article>
    </Link>
  );
}
