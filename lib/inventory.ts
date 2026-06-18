import type { CatalogItem } from "@/lib/catalog";
import { parseSetCount } from "@/lib/pricing";

export type BookingReservation = {
  eventDate: string;
  selectedSize: string | null;
  selectedSets: string | null;
};

export function itemUsesPerSizeInventory(item: Pick<CatalogItem, "sizes">) {
  return Boolean(item.sizes?.length);
}

export function itemUsesSetInventory(item: Pick<CatalogItem, "setOptions">) {
  return Boolean(item.setOptions?.length);
}

export function getReservationUnits(
  item: Pick<CatalogItem, "sizes" | "setOptions">,
  selectedSize?: string | null,
  selectedSets?: string | null,
): number {
  if (itemUsesSetInventory(item)) {
    return selectedSets ? parseSetCount(selectedSets) : 1;
  }
  return 1;
}

export function reservationAppliesToSize(
  reservation: BookingReservation,
  selectedSize: string,
  item: Pick<CatalogItem, "sizes">,
) {
  if (!itemUsesPerSizeInventory(item)) {
    return true;
  }
  if (!reservation.selectedSize) {
    return true;
  }
  return reservation.selectedSize === selectedSize;
}

export function getRequestedUnits(
  item: Pick<CatalogItem, "sizes" | "setOptions">,
  selectedSize?: string,
  selectedSets?: string,
): number {
  return getReservationUnits(item, selectedSize ?? null, selectedSets ?? null);
}

/** Units consumed by an admin date block */
export function getBlockUnits(
  item: Pick<CatalogItem, "sizes" | "setOptions">,
  block: BookingReservation,
  quantityAvailable: number,
): number {
  if (itemUsesSetInventory(item)) {
    if (!block.selectedSets) {
      return quantityAvailable;
    }
    return parseSetCount(block.selectedSets);
  }
  return 1;
}
