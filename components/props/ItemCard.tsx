"use client";

import { useState } from "react";
import Image from "next/image";
import type { CatalogItem } from "@/lib/catalog";
import {
  formatBondNotice,
  formatHirePriceSummary,
  formatVariantPriceRange,
  HIRE_PICKUP_NOTE,
  HIRE_PRICE_CENTS,
  HIRE_PRICING_SUMMARY,
} from "@/lib/pricing";
import { getItemVariantImage, itemHasColorVariants } from "@/lib/item-images";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatPrice } from "@/lib/utils";
import { HireDialog } from "./HireDialog";

function ColorPills({
  options,
  value,
  onChange,
  compact = false,
}: {
  options: string[];
  value: string;
  onChange: (next: string) => void;
  compact?: boolean;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            "rounded-full border transition-colors",
            compact
              ? "min-h-9 px-3 py-2 text-[10px] uppercase tracking-wider"
              : "min-h-11 px-4 py-2.5 text-xs uppercase tracking-wider",
            value === option
              ? "border-sage bg-sage text-black"
              : "border-sage/30 bg-cream text-foreground hover:border-sage",
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export function ItemCard({
  item,
  categoryName,
}: {
  item: CatalogItem;
  categoryName: string;
}) {
  const hasColors = itemHasColorVariants(item);
  const [selectedColor, setSelectedColor] = useState(item.sizes?.[0] ?? "");

  const imageUrl = getItemVariantImage(
    item,
    hasColors ? selectedColor : undefined,
  );

  const hasSetOptions = Boolean(item.setOptions?.length);
  const hasSizes = Boolean(item.sizes?.length);
  const hasVariantPrices = Boolean(item.variantPrices);
  const priceLabel = hasVariantPrices
    ? formatVariantPriceRange(item.variantPrices!)
    : hasSetOptions
    ? formatHirePriceSummary(item.priceCents, true)
    : item.priceCents !== HIRE_PRICE_CENTS
      ? formatHirePriceSummary(item.priceCents)
      : HIRE_PRICING_SUMMARY;

  const reserveLabel = hasColors
    ? item.selectionLabel ?? "Choose colour"
    : hasSetOptions && !hasSizes
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
          alt={
            hasColors && selectedColor
              ? `${item.name} — ${selectedColor}`
              : item.name
          }
          fill
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
      <CardHeader className="pb-0 text-center">
        <CardTitle>{item.name}</CardTitle>
        <CardDescription className="line-clamp-2">{item.description}</CardDescription>
        {hasColors ? (
          <div className="mt-4 space-y-2">
            <p className="text-xs uppercase tracking-luxury text-foreground-soft">
              {item.selectionLabel ?? "Choose colour"}
            </p>
            <ColorPills
              options={item.sizes!}
              value={selectedColor}
              onChange={setSelectedColor}
              compact
            />
            {hasVariantPrices ? (
              <p className="text-xs font-light text-foreground-soft">
                Set of 4 {formatPrice(item.variantPrices!["Set of 4"])}
                {" · "}
                Set of 6 {formatPrice(item.variantPrices!["Set of 6"])}
              </p>
            ) : null}
          </div>
        ) : item.setIncludes ? (
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
        {hasSetOptions && !hasVariantPrices ? (
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
        <HireDialog
          item={item}
          categoryName={categoryName}
          selectedSize={hasColors ? selectedColor : undefined}
          onSelectedSizeChange={hasColors ? setSelectedColor : undefined}
        >
          <Button size="sm">{reserveLabel}</Button>
        </HireDialog>
      </CardContent>
    </Card>
  );
}
