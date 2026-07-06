import {
  applyHireDiscount,
  HIRE_DISCOUNT_PERCENT,
} from "@/lib/pricing";
import { cn, formatPrice } from "@/lib/utils";

type DiscountedHirePriceProps = {
  listPriceCents: number;
  suffix?: string;
  className?: string;
  originalClassName?: string;
  saleClassName?: string;
  showBadge?: boolean;
};

export function DiscountedHirePrice({
  listPriceCents,
  suffix = "",
  className,
  originalClassName,
  saleClassName,
  showBadge = false,
}: DiscountedHirePriceProps) {
  const salePriceCents = applyHireDiscount(listPriceCents);
  const hasDiscount =
    HIRE_DISCOUNT_PERCENT > 0 && salePriceCents < listPriceCents;

  if (!hasDiscount) {
    return (
      <span className={className}>
        {formatPrice(listPriceCents)}
        {suffix}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-baseline gap-x-2 gap-y-0.5",
        className,
      )}
    >
      <span
        className={cn("line-through text-foreground-soft/60", originalClassName)}
      >
        {formatPrice(listPriceCents)}
      </span>
      <span className={cn("font-medium text-sage", saleClassName)}>
        {formatPrice(salePriceCents)}
      </span>
      {showBadge ? (
        <span className="rounded-full bg-sage/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-sage">
          {HIRE_DISCOUNT_PERCENT}% off
        </span>
      ) : null}
      {suffix ? <span className="font-normal text-foreground-soft">{suffix}</span> : null}
    </span>
  );
}

export function DiscountedHirePriceRange({
  variantPrices,
  suffix = " per hire",
  className,
  showBadge = false,
}: {
  variantPrices: Record<string, number>;
  suffix?: string;
  className?: string;
  showBadge?: boolean;
}) {
  const listAmounts = Object.values(variantPrices).sort((a, b) => a - b);
  const saleAmounts = listAmounts.map(applyHireDiscount);
  const listLow = listAmounts[0];
  const listHigh = listAmounts[listAmounts.length - 1];
  const saleLow = saleAmounts[0];
  const saleHigh = saleAmounts[saleAmounts.length - 1];

  if (listLow === listHigh) {
    return (
      <DiscountedHirePrice
        listPriceCents={listLow}
        suffix={suffix}
        className={className}
        showBadge={showBadge}
      />
    );
  }

  const hasDiscount =
    HIRE_DISCOUNT_PERCENT > 0 && saleLow < listLow;

  if (!hasDiscount) {
    return (
      <span className={className}>
        {formatPrice(listLow)} – {formatPrice(listHigh)}
        {suffix}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-baseline gap-x-2 gap-y-0.5",
        className,
      )}
    >
      <span className="line-through text-foreground-soft/60">
        {formatPrice(listLow)} – {formatPrice(listHigh)}
      </span>
      <span className="font-medium text-sage">
        {formatPrice(saleLow)} – {formatPrice(saleHigh)}
      </span>
      {showBadge ? (
        <span className="rounded-full bg-sage/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-sage">
          {HIRE_DISCOUNT_PERCENT}% off
        </span>
      ) : null}
      {suffix ? <span className="font-normal text-foreground-soft">{suffix}</span> : null}
    </span>
  );
}
