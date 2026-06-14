"use client";

import Image from "next/image";
import type { CatalogItem } from "@/lib/catalog";
import {
  formatBondNotice,
  formatHirePriceSummary,
  HIRE_PICKUP_NOTE,
  HIRE_PRICE_CENTS,
  HIRE_PRICING_SUMMARY,
} from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HireDialog } from "./HireDialog";

export function ItemCard({
  item,
  categoryName,
}: {
  item: CatalogItem;
  categoryName: string;
}) {
  const imageUrl =
    item.imageUrls[0] ??
    `https://images.unsplash.com/photo-1519167758481-83f29da8c2f4?w=600&q=85`;

  const hasSetOptions = Boolean(item.setOptions?.length);
  const hasSizes = Boolean(item.sizes?.length);
  const priceLabel = hasSetOptions
    ? formatHirePriceSummary(item.priceCents, true)
    : item.priceCents !== HIRE_PRICE_CENTS
      ? formatHirePriceSummary(item.priceCents)
      : HIRE_PRICING_SUMMARY;

  const reserveLabel = hasSetOptions && !hasSizes
    ? "Choose sets"
    : item.selectionLabel
      ? item.selectionLabel
      : hasSizes
        ? hasSetOptions
          ? "Choose size & sets"
          : "Choose size"
        : "Reserve";

  return (
    <Card>
      <div className="relative aspect-[3/4] overflow-hidden rounded-t-3xl bg-cream sm:aspect-[4/5]">
        <Image
          src={imageUrl}
          alt={item.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
      <CardHeader className="pb-0 text-center">
        <CardTitle>{item.name}</CardTitle>
        <CardDescription className="line-clamp-2">{item.description}</CardDescription>
        {item.setIncludes ? (
          <p className="mt-3 text-xs font-light text-foreground-soft">
            {item.setIncludes}
          </p>
        ) : item.sizes?.length ? (
          <p className="mt-3 text-xs font-light text-foreground-soft">
            {item.selectionDisplay === "Number"
              ? `Numbers: ${item.sizes.join(" · ")}`
              : `Sizes: ${item.sizes.join(" · ")}`}
          </p>
        ) : null}
        {item.bondCents ? (
          <p className="mt-2 text-xs font-light text-foreground-soft">
            {formatBondNotice(item.bondCents)}
          </p>
        ) : null}
        {hasSetOptions ? (
          <p className="mt-1 text-xs font-light text-foreground-soft">
            Hire 1 set or 2 sets
          </p>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 pb-8 pt-4 sm:gap-6 sm:pb-10">
        <div className="text-center">
          <p className="font-serif text-xl font-bold text-sage sm:text-2xl">
            {priceLabel}
          </p>
          <p className="mt-1 text-xs font-light text-foreground-soft">
            {HIRE_PICKUP_NOTE}
          </p>
        </div>
        <HireDialog item={item} categoryName={categoryName}>
          <Button size="sm">
            {reserveLabel}
          </Button>
        </HireDialog>
      </CardContent>
    </Card>
  );
}
