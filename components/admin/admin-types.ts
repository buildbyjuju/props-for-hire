export type AdminItem = {
  id: string;
  name: string;
  slug: string;
  sizes: string[];
  setOptions: string[];
  quantityAvailable: number;
};

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  items: AdminItem[];
};

export type AdminBooking = {
  id: string;
  itemId: string;
  itemName: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  categorySortOrder: number;
  adminEventId?: string | null;
  adminEventTitle?: string | null;
  eventDate: string;
  status: string;
  customerName: string | null;
  customerEmail: string | null;
  notes: string | null;
  selectedSize: string | null;
  selectedSets: string | null;
  createdAt: string;
};

export function formatBookingStatus(status: string) {
  if (status === "pending_confirmation") {
    return "Pending confirmation";
  }
  return status.replaceAll("_", " ");
}

export function bookingVariantLabel(booking: AdminBooking) {
  const parts = [
    booking.selectedSize ? `Size: ${booking.selectedSize}` : null,
    booking.selectedSets ? `Sets: ${booking.selectedSets}` : null,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : null;
}
