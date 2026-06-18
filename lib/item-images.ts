import type { CatalogItem } from "@/lib/catalog";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1519167758481-83f29da8c2f4?w=600&q=85";

export function getItemVariantImage(
  item: Pick<CatalogItem, "imageUrls" | "colorImages">,
  variant?: string,
) {
  if (variant && item.colorImages?.[variant]) {
    return item.colorImages[variant];
  }
  return item.imageUrls[0] ?? FALLBACK_IMAGE;
}

export function itemHasColorVariants(
  item: Pick<CatalogItem, "colorImages" | "sizes">,
) {
  return Boolean(item.colorImages && item.sizes?.length);
}
