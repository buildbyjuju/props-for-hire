import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { requireAdminApi } from "@/lib/admin-auth";
import { requireDb } from "@/lib/db";
import { categories, items } from "@/lib/db/schema";
import { slugify } from "@/lib/slug";

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
      .orderBy(asc(categories.sortOrder), asc(categories.name));

    const allItems = await database.select().from(items);

    return NextResponse.json({
      categories: cats.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        imageUrl: cat.imageUrl,
        sortOrder: cat.sortOrder,
        itemCount: allItems.filter((item) => item.categoryId === cat.id).length,
        createdAt: cat.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Admin categories list error:", error);
    return NextResponse.json(
      { error: "Failed to load categories" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const body = await request.json();
    const name = (body.name as string | undefined)?.trim();
    const description = (body.description as string | undefined)?.trim() ?? "";
    const imageUrl = (body.imageUrl as string | undefined)?.trim() || null;
    const sortOrder =
      typeof body.sortOrder === "number" ? body.sortOrder : Number(body.sortOrder) || 0;
    const slugInput = (body.slug as string | undefined)?.trim();
    const slug = slugify(slugInput || name || "");

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 },
      );
    }

    const database = requireDb();
    const [existing] = await database
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "A category with this name/slug already exists" },
        { status: 409 },
      );
    }

    const [created] = await database
      .insert(categories)
      .values({
        name,
        slug,
        description: description || name,
        imageUrl,
        sortOrder,
      })
      .returning();

    revalidatePath("/");
    revalidatePath("/props");
    revalidatePath(`/props/${created.slug}`);

    return NextResponse.json({
      category: {
        id: created.id,
        name: created.name,
        slug: created.slug,
        description: created.description,
        imageUrl: created.imageUrl,
        sortOrder: created.sortOrder,
      },
    });
  } catch (error) {
    console.error("Admin create category error:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 },
    );
  }
}
