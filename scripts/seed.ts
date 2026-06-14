import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import catalogData from "../data/items.json";
import { categories, items } from "../lib/db/schema";

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
      const existingItem = await db
        .select()
        .from(items)
        .where(eq(items.slug, item.slug))
        .limit(1);

      if (existingItem.length > 0) {
        await db
          .update(items)
          .set({
            name: item.name,
            description: item.description,
            priceCents: item.priceCents,
            imageUrls: item.imageUrls,
            quantityAvailable: item.quantityAvailable,
            categoryId,
            isActive: true,
          })
          .where(eq(items.id, existingItem[0].id));
        console.log(`    Updated item: ${item.name}`);
      } else {
        await db.insert(items).values({
          categoryId,
          name: item.name,
          slug: item.slug,
          description: item.description,
          priceCents: item.priceCents,
          imageUrls: item.imageUrls,
          quantityAvailable: item.quantityAvailable,
          isActive: true,
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
