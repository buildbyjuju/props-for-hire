import { eq, asc } from "drizzle-orm";
import catalogData from "@/data/items.json";
import { getCatalogItemMeta } from "@/lib/catalog-meta";
import { CATEGORIES } from "@/lib/constants";
import { db } from "@/lib/db";
import { categories, items } from "@/lib/db/schema";

type JsonItemMeta = {
  sizes?: string[];
  setOptions?: string[];
  setIncludes?: string;
  bondCents?: number;
  selectionLabel?: string;
  selectionDisplay?: string;
  colorImages?: Record<string, string>;
  variantPrices?: Record<string, number>;
};

export type CatalogItem = {
  id: string;
  categoryId: string;
  categorySlug: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  imageUrls: string[];
  quantityAvailable: number;
  sizes?: string[];
  setOptions?: string[];
  setIncludes?: string;
  bondCents?: number;
  selectionLabel?: string;
  selectionDisplay?: string;
  colorImages?: Record<string, string>;
  variantPrices?: Record<string, number>;
};

export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  sortOrder: number;
  items: CatalogItem[];
};

function categoryImage(slug: string, fallback: string | null) {
  const fromConstants = CATEGORIES.find((c) => c.slug === slug);
  return fromConstants?.image ?? fallback;
}

function mapJsonItem(
  item: (typeof catalogData.categories)[number]["items"][number],
  cat: (typeof catalogData.categories)[number],
): CatalogItem {
  const meta = item as JsonItemMeta;
  return {
    id: `static-${cat.slug}-${item.slug}`,
    categoryId: `static-${cat.slug}`,
    categorySlug: cat.slug,
    name: item.name,
    slug: item.slug,
    description: item.description,
    priceCents: item.priceCents,
    imageUrls: item.imageUrls,
    quantityAvailable: item.quantityAvailable,
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

const staticCatalog = buildStaticCatalog();

function buildStaticCatalog(): CatalogCategory[] {
  return catalogData.categories.map((cat) => ({
    id: `static-${cat.slug}`,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    imageUrl: categoryImage(cat.slug, cat.imageUrl),
    sortOrder: cat.sortOrder,
    items: cat.items.map((item) => mapJsonItem(item, cat)),
  }));
}

function mapDbItem(
  row: typeof items.$inferSelect,
  categorySlug: string,
): CatalogItem {
  const meta = getCatalogItemMeta(row.slug);
  return {
    id: row.id,
    categoryId: row.categoryId,
    categorySlug,
    name: row.name,
    slug: row.slug,
    description: row.description,
    priceCents: row.priceCents,
    imageUrls: row.imageUrls,
    quantityAvailable: row.quantityAvailable,
    sizes: meta?.sizes,
    setOptions: meta?.setOptions,
    setIncludes: meta?.setIncludes,
    bondCents: meta?.bondCents,
    selectionLabel: meta?.selectionLabel,
    selectionDisplay: meta?.selectionDisplay,
    colorImages: meta?.colorImages,
    variantPrices: meta?.variantPrices,
  };
}

export async function getAllCategories(): Promise<CatalogCategory[]> {
  if (!db) return staticCatalog;

  const cats = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.sortOrder));

  if (cats.length === 0) return staticCatalog;

  const allItems = await db.select().from(items).where(eq(items.isActive, true));

  return cats
    .map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      imageUrl: categoryImage(cat.slug, cat.imageUrl),
      sortOrder: cat.sortOrder,
      items: allItems
        .filter((i) => i.categoryId === cat.id)
        .map((i) => mapDbItem(i, cat.slug)),
    }))
    .filter((cat) => cat.items.length > 0);
}

export async function getCategoryBySlug(
  slug: string,
): Promise<CatalogCategory | null> {
  const all = await getAllCategories();
  return all.find((c) => c.slug === slug) ?? null;
}

export async function getItemBySlug(
  categorySlug: string,
  itemSlug: string,
): Promise<CatalogItem | null> {
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return null;
  return category.items.find((i) => i.slug === itemSlug) ?? null;
}

export async function getItemById(itemId: string): Promise<CatalogItem | null> {
  if (itemId.startsWith("static-")) {
    for (const cat of staticCatalog) {
      const found = cat.items.find((i) => i.id === itemId);
      if (found) return found;
    }
    return null;
  }

  if (!db) return null;

  const [row] = await db.select().from(items).where(eq(items.id, itemId)).limit(1);
  if (!row) return null;

  const [cat] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, row.categoryId))
    .limit(1);

  return mapDbItem(row, cat?.slug ?? "");
}
