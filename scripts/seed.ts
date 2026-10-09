import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import catalogData from "../data/items.json";
import { categories, items } from "../lib/db/schema";

type SeedItemMeta = {
  sizes?: string[];
  setOptions?: string[];
  setIncludes?: string;
  bondCents?: number;
  selectionLabel?: string;
  selectionDisplay?: string;
  colorImages?: Record<string, string>;
  variantPrices?: Record<string, number>;
};

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is required. Add it to .env.local");
    process.exit(1);
  }

  const sql = neon(url);
  const db = drizzle(sql);

  console.log("Seeding categories and items...");

  for (const cat of catalogData.categories) {
    const existing = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, cat.slug))
      .limit(1);

    let categoryId: string;

    if (existing.length > 0) {
      categoryId = existing[0].id;
      await db
        .update(categories)
        .set({
          name: cat.name,
          description: cat.description,
          sortOrder: cat.sortOrder,
          imageUrl: cat.imageUrl,
        })
        .where(eq(categories.id, categoryId));
      console.log(`  Updated category: ${cat.name}`);
    } else {
      const [inserted] = await db
        .insert(categories)
        .values({
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          sortOrder: cat.sortOrder,
          imageUrl: cat.imageUrl,
        })
        .returning();
      categoryId = inserted.id;
      console.log(`  Created category: ${cat.name}`);
    }

    for (const item of cat.items) {
      const meta = item as SeedItemMeta;
      const values = {
        name: item.name,
        description: item.description,
        priceCents: item.priceCents,
        imageUrls: item.imageUrls,
        quantityAvailable: item.quantityAvailable,
        categoryId,
        isActive: true,
        sizes: meta.sizes ?? [],
        setOptions: meta.setOptions ?? [],
        setIncludes: meta.setIncludes ?? null,
        bondCents: meta.bondCents ?? null,
        selectionLabel: meta.selectionLabel ?? null,
        selectionDisplay: meta.selectionDisplay ?? null,
        colorImages: meta.colorImages ?? null,
        variantPrices: meta.variantPrices ?? null,
      };

      const existingItem = await db
        .select()
        .from(items)
        .where(eq(items.slug, item.slug))
        .limit(1);

      if (existingItem.length > 0) {
        await db
          .update(items)
          .set(values)
          .where(eq(items.id, existingItem[0].id));
        console.log(`    Updated item: ${item.name}`);
      } else {
        await db.insert(items).values({
          ...values,
          slug: item.slug,
        });
        console.log(`    Created item: ${item.name}`);
      }
    }
  }

  console.log("Seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
