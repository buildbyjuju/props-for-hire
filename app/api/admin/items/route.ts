import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { getItemById } from "@/lib/catalog";
import { requireAdminApi } from "@/lib/admin-auth";
import { requireDb } from "@/lib/db";
import { categories, items } from "@/lib/db/schema";

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const database = requireDb();
    const cats = await database
      .select()
      .from(categories)
      .orderBy(asc(categories.sortOrder));

    const allItems = await database
      .select()
      .from(items)
      .where(eq(items.isActive, true));

    const catalog = await Promise.all(
      cats.map(async (cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        items: await Promise.all(
          allItems
            .filter((item) => item.categoryId === cat.id)
            .map(async (item) => {
              const catalogItem = await getItemById(item.id);
              return {
                id: item.id,
                name: item.name,
                slug: item.slug,
                sizes: catalogItem?.sizes ?? [],
                setOptions: catalogItem?.setOptions ?? [],
                quantityAvailable: item.quantityAvailable,
              };
            }),
        ),
      })),
    );

    return NextResponse.json({ categories: catalog });
  } catch (error) {
    console.error("Admin items list error:", error);
    return NextResponse.json({ error: "Failed to load items" }, { status: 500 });
  }
}
