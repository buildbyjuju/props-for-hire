import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { and, eq, ne } from "drizzle-orm";
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

type RouteContext = {
  params: Promise<{ id: string }>;
};

function parseStringArray(value: unknown): string[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter(Boolean);
}

function parseVariantPrices(value: unknown): Record<string, number> | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "object" || Array.isArray(value)) return null;
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

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAdminApi();
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const database = requireDb();

    const [existing] = await database
      .select()
      .from(items)
      .where(eq(items.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const updates: Partial<typeof items.$inferInsert> = {};

    if (body.categoryId !== undefined) {
      const [category] = await database
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.id, body.categoryId))
        .limit(1);
      if (!category) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }
      updates.categoryId = body.categoryId;
    }

    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (!name) {
        return NextResponse.json({ error: "Name is required" }, { status: 400 });
      }
      updates.name = name;
    }

    if (body.slug !== undefined || body.name !== undefined) {
      const slug = slugify(
        (body.slug as string | undefined)?.trim() ||
          (updates.name as string | undefined) ||
          existing.name,
      );
      const [taken] = await database
        .select({ id: items.id })
        .from(items)
        .where(and(eq(items.slug, slug), ne(items.id, id)))
        .limit(1);
      if (taken) {
        return NextResponse.json(
          { error: "An item with this name/slug already exists" },
          { status: 409 },
        );
      }
      updates.slug = slug;
    }

    if (body.description !== undefined) {
      updates.description = String(body.description).trim();
    }

    if (body.priceCents !== undefined) {
      const priceCents = Math.round(Number(body.priceCents));
      if (!Number.isFinite(priceCents) || priceCents < 0) {
        return NextResponse.json({ error: "Invalid price" }, { status: 400 });
      }
      updates.priceCents = priceCents;
    }

    if (body.quantityAvailable !== undefined) {
      updates.quantityAvailable = Math.max(
        1,
        Math.round(Number(body.quantityAvailable)) || 1,
      );
    }

    if (body.isActive !== undefined) {
      updates.isActive = Boolean(body.isActive);
    }

    const imageUrls = parseStringArray(body.imageUrls);
    if (imageUrls !== undefined) {
      if (imageUrls.length === 0) {
        return NextResponse.json(
          { error: "Add at least one photo for the item" },
          { status: 400 },
        );
      }
      updates.imageUrls = imageUrls;
    }

    const sizes = parseStringArray(body.sizes);
    if (sizes !== undefined) updates.sizes = sizes;

    const setOptions = parseStringArray(body.setOptions);
    if (setOptions !== undefined) updates.setOptions = setOptions;

    if (body.setIncludes !== undefined) {
      updates.setIncludes = String(body.setIncludes).trim() || null;
    }
    if (body.selectionLabel !== undefined) {
      updates.selectionLabel = String(body.selectionLabel).trim() || null;
    }
    if (body.selectionDisplay !== undefined) {
      updates.selectionDisplay = String(body.selectionDisplay).trim() || null;
    }
    if (body.bondCents !== undefined) {
      if (body.bondCents === null || body.bondCents === "") {
        updates.bondCents = null;
      } else {
        updates.bondCents = Math.round(Number(body.bondCents));
      }
    }

    const variantPrices = parseVariantPrices(body.variantPrices);
    if (variantPrices !== undefined) {
      updates.variantPrices = variantPrices;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ ok: true });
    }

    await database.update(items).set(updates).where(eq(items.id, id));

    const categoryId = updates.categoryId ?? existing.categoryId;
    const [category] = await database
      .select({ slug: categories.slug })
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1);
    revalidateCatalogue(category?.slug);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin update item error:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAdminApi();
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;

  try {
    const database = requireDb();
    const [existing] = await database
      .select({ id: items.id, categoryId: items.categoryId })
      .from(items)
      .where(eq(items.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    await database
      .update(items)
      .set({ isActive: false })
      .where(eq(items.id, id));

    const [category] = await database
      .select({ slug: categories.slug })
      .from(categories)
      .where(eq(categories.id, existing.categoryId))
      .limit(1);
    revalidateCatalogue(category?.slug);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin delete item error:", error);
    return NextResponse.json(
      { error: "Failed to remove item" },
      { status: 500 },
    );
  }
}
