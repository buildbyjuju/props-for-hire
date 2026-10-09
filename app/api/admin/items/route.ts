import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { getItemById } from "@/lib/catalog";
import { requireAdminApi } from "@/lib/admin-auth";
import { requireDb } from "@/lib/db";
import { categories, items } from "@/lib/db/schema";
import { slugify } from "@/lib/slug";

function revalidateCatalogue(categorySlug?: string | null) {
  revalidatePath("/");
  revalidatePath("/props");
  if (categorySlug) {
    revalidatePath(`/props/${categorySlug}`);
  }
}

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter(Boolean);
}

function parseVariantPrices(value: unknown): Record<string, number> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const result: Record<string, number> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    const label = key.trim();
    const cents =
      typeof raw === "number" ? raw : Number.parseInt(String(raw), 10);
    if (!label || !Number.isFinite(cents) || cents < 0) continue;
    result[label] = Math.round(cents);
  }
  return Object.keys(result).length > 0 ? result : null;
}

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

    const allItems = await database.select().from(items);

    const catalog = await Promise.all(
      cats.map(async (cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        imageUrl: cat.imageUrl,
        sortOrder: cat.sortOrder,
        items: await Promise.all(
          allItems
            .filter((item) => item.categoryId === cat.id)
            .map(async (item) => {
              const catalogItem = await getItemById(item.id);
              return {
                id: item.id,
                name: item.name,
                slug: item.slug,
                description: item.description,
                priceCents: item.priceCents,
                imageUrls: item.imageUrls,
                quantityAvailable: item.quantityAvailable,
                isActive: item.isActive,
                sizes: catalogItem?.sizes ?? item.sizes ?? [],
                setOptions: catalogItem?.setOptions ?? item.setOptions ?? [],
                setIncludes: item.setIncludes,
                bondCents: item.bondCents,
                selectionLabel: item.selectionLabel,
                selectionDisplay: item.selectionDisplay,
                variantPrices: catalogItem?.variantPrices ?? item.variantPrices,
                createdAt: item.createdAt.toISOString(),
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

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const body = await request.json();
    const categoryId = body.categoryId as string | undefined;
    const name = (body.name as string | undefined)?.trim();
    const description = (body.description as string | undefined)?.trim() ?? "";
    const slugInput = (body.slug as string | undefined)?.trim();
    const slug = slugify(slugInput || name || "");
    const priceCents =
      typeof body.priceCents === "number"
        ? Math.round(body.priceCents)
        : Number.parseInt(String(body.priceCents ?? ""), 10);
    const quantityAvailable =
      typeof body.quantityAvailable === "number"
        ? Math.max(1, Math.round(body.quantityAvailable))
        : Math.max(1, Number.parseInt(String(body.quantityAvailable ?? "1"), 10) || 1);
    const imageUrls = parseStringArray(body.imageUrls);
    const sizes = parseStringArray(body.sizes);
    const setOptions = parseStringArray(body.setOptions);
    const setIncludes = (body.setIncludes as string | undefined)?.trim() || null;
    const selectionLabel =
      (body.selectionLabel as string | undefined)?.trim() || null;
    const selectionDisplay =
      (body.selectionDisplay as string | undefined)?.trim() || null;
    const bondCentsRaw = body.bondCents;
    const bondCents =
      bondCentsRaw === null || bondCentsRaw === undefined || bondCentsRaw === ""
        ? null
        : Math.round(Number(bondCentsRaw));
    const variantPrices = parseVariantPrices(body.variantPrices);

    if (!categoryId || !name || !slug) {
      return NextResponse.json(
        { error: "Category and item name are required" },
        { status: 400 },
      );
    }

    if (!Number.isFinite(priceCents) || priceCents < 0) {
      return NextResponse.json(
        { error: "A valid price is required" },
        { status: 400 },
      );
    }

    if (imageUrls.length === 0) {
      return NextResponse.json(
        { error: "Add at least one photo for the item" },
        { status: 400 },
      );
    }

    const database = requireDb();

    const [category] = await database
      .select({ id: categories.id, slug: categories.slug })
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1);

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const [slugTaken] = await database
      .select({ id: items.id })
      .from(items)
      .where(eq(items.slug, slug))
      .limit(1);

    if (slugTaken) {
      return NextResponse.json(
        { error: "An item with this name/slug already exists" },
        { status: 409 },
      );
    }

    const [created] = await database
      .insert(items)
      .values({
        categoryId,
        name,
        slug,
        description: description || name,
        priceCents,
        imageUrls,
        quantityAvailable,
        isActive: true,
        sizes,
        setOptions,
        setIncludes,
        bondCents: Number.isFinite(bondCents as number) ? bondCents : null,
        selectionLabel,
        selectionDisplay,
        variantPrices,
      })
      .returning();

    revalidateCatalogue(category.slug);

    return NextResponse.json({
      item: {
        id: created.id,
        categoryId: created.categoryId,
        name: created.name,
        slug: created.slug,
        priceCents: created.priceCents,
        isActive: created.isActive,
      },
    });
  } catch (error) {
    console.error("Admin create item error:", error);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 },
    );
  }
}
