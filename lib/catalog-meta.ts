import catalogData from "@/data/items.json";

export type CatalogItemMeta = {
  sizes?: string[];
  setOptions?: string[];
  setIncludes?: string;
  bondCents?: number;
  selectionLabel?: string;
  selectionDisplay?: string;
  colorImages?: Record<string, string>;
  variantPrices?: Record<string, number>;
};

export function getCatalogItemMeta(slug: string): CatalogItemMeta | null {
  for (const cat of catalogData.categories) {
    const item = cat.items.find((i) => i.slug === slug);
    if (item) {
      const meta = item as CatalogItemMeta;
      return {
        sizes: meta.sizes,
        setOptions: meta.setOptions,
        setIncludes: meta.setIncludes,
        bondCents: meta.bondCents,
        selectionLabel: meta.selectionLabel,
        selectionDisplay: meta.selectionDisplay,
        colorImages: meta.colorImages,
        variantPrices: meta.variantPrices,
      };
    }
  }
  return null;
}
