import { addDays, format, parseISO } from "date-fns";
import { getCatalogItemMeta } from "@/lib/catalog-meta";
import { formatPrice } from "@/lib/utils";

/** Flat hire price per event */
export const HIRE_PRICE_CENTS = 5000;

/** One-off delivery fee when customer chooses delivery at checkout */
export const DELIVERY_FEE_CENTS = 5000;

/** Pickup the day before the event; return the day after */
export const PICKUP_DAYS_BEFORE_EVENT = 1;
export const RETURN_DAYS_AFTER_EVENT = 1;

export type HireWindow = {
  eventDate: string;
  pickupDate: string;
  returnDate: string;
  hireDays: number;
};

export function getHireWindow(eventDateStr: string): HireWindow {
  const event = parseISO(eventDateStr);
  const pickup = addDays(event, -PICKUP_DAYS_BEFORE_EVENT);
  const returnDay = addDays(event, RETURN_DAYS_AFTER_EVENT);
  const hireDays =
    PICKUP_DAYS_BEFORE_EVENT + 1 + RETURN_DAYS_AFTER_EVENT;

  return {
    eventDate: eventDateStr,
    pickupDate: format(pickup, "yyyy-MM-dd"),
    returnDate: format(returnDay, "yyyy-MM-dd"),
    hireDays,
  };
}

export function parseSetCount(selectedSet: string): number {
  const match = selectedSet.match(/^(\d+)/);
  return match ? Number.parseInt(match[1], 10) : 1;
}

export function calculateHirePriceCents(
  basePriceCents: number = HIRE_PRICE_CENTS,
  setCount = 1,
): number {
  return basePriceCents * setCount;
}

export type PriceableItem = {
  slug?: string;
  priceCents: number;
  variantPrices?: Record<string, number>;
};

export function resolveVariantPrices(
  item: PriceableItem,
): Record<string, number> | undefined {
  if (item.variantPrices && Object.keys(item.variantPrices).length > 0) {
    return item.variantPrices;
  }
  if (item.slug) {
    return getCatalogItemMeta(item.slug)?.variantPrices;
  }
  return undefined;
}

export function getVariantPriceCents(
  item: PriceableItem,
  variant?: string,
  setCount = 1,
): number {
  const variantPrices = resolveVariantPrices(item);
  if (variant && variantPrices && variantPrices[variant] !== undefined) {
    return variantPrices[variant];
  }
  return calculateHirePriceCents(item.priceCents, setCount);
}

export function formatVariantPriceRange(variantPrices: Record<string, number>): string {
  const amounts = Object.values(variantPrices).sort((a, b) => a - b);
  const low = amounts[0];
  const high = amounts[amounts.length - 1];
  if (low === high) {
    return formatHirePriceSummary(low);
  }
  return `${formatPrice(low)} – ${formatPrice(high)} per hire`;
}

export function formatHirePriceSummary(priceCents: number, perSet = false): string {
  const amount = formatPrice(priceCents);
  return perSet ? `${amount} per set` : `${amount} per hire`;
}

export const HIRE_PRICING_SUMMARY = "$50 per hire";

export const HIRE_PICKUP_NOTE =
  "Pickup the day before your event · return the day after";

export const HIRE_BOND_CENTS = 5000;

export const HIRE_BOND_NOTICE =
  "A $50 bond applies to every booking and is refunded once the item is returned clean and in good condition. Late drop-off may affect your bond refund.";

export function formatBondNotice(bondCents: number): string {
  return `A ${formatPrice(bondCents)} refundable bond is required and returned once the item is returned clean and in good condition. Late drop-off may affect your bond refund.`;
}

/** Category-specific bond amounts (defaults to HIRE_BOND_CENTS) */
export const CATEGORY_BOND_CENTS: Record<string, number> = {
  "event-furniture-and-marquees": 15000,
};

export function getCategoryBondNotice(categorySlug: string): string {
  const bondCents = CATEGORY_BOND_CENTS[categorySlug] ?? HIRE_BOND_CENTS;
  return formatBondNotice(bondCents);
}
