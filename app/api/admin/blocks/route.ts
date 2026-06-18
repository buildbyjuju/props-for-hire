import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getItemById } from "@/lib/catalog";
import { requireAdminApi } from "@/lib/admin-auth";
import { requireDb } from "@/lib/db";
import { dateBlocks, items } from "@/lib/db/schema";

function formatDate(value: Date | string) {
  return typeof value === "string" ? value : value.toISOString().slice(0, 10);
}

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const database = requireDb();
    const rows = await database
      .select({
        id: dateBlocks.id,
        itemId: dateBlocks.itemId,
        itemName: items.name,
        eventDate: dateBlocks.eventDate,
        selectedSize: dateBlocks.selectedSize,
        selectedSets: dateBlocks.selectedSets,
        note: dateBlocks.note,
        createdAt: dateBlocks.createdAt,
      })
      .from(dateBlocks)
      .innerJoin(items, eq(dateBlocks.itemId, items.id))
      .orderBy(desc(dateBlocks.createdAt));

    return NextResponse.json({
      blocks: rows.map((row) => ({
        ...row,
        eventDate: formatDate(row.eventDate),
        createdAt: row.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Admin blocks list error:", error);
    return NextResponse.json(
      { error: "Failed to load blocked dates" },
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
    const itemId = body.itemId as string | undefined;
    const eventDate = body.eventDate as string | undefined;
    const note = body.note as string | undefined;
    const selectedSize = body.selectedSize as string | undefined;
    const selectedSets = body.selectedSets as string | undefined;

    if (!itemId || !eventDate) {
      return NextResponse.json(
        { error: "Item and event date are required" },
        { status: 400 },
      );
    }

    const database = requireDb();
    const [item] = await database
      .select()
      .from(items)
      .where(eq(items.id, itemId))
      .limit(1);

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const catalogItem = await getItemById(itemId);
    if (catalogItem?.sizes?.length && selectedSets) {
      return NextResponse.json(
        { error: "Set options do not apply to this item" },
        { status: 400 },
      );
    }
    if (catalogItem?.setOptions?.length && selectedSize) {
      return NextResponse.json(
        { error: "Size options do not apply to this item" },
        { status: 400 },
      );
    }

    const [block] = await database
      .insert(dateBlocks)
      .values({
        itemId,
        eventDate,
        note: note?.trim() || null,
        selectedSize: selectedSize?.trim() || null,
        selectedSets: selectedSets?.trim() || null,
      })
      .returning();

    return NextResponse.json({
      block: {
        ...block,
        eventDate: formatDate(block.eventDate),
        createdAt: block.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Admin block date error:", error);
    return NextResponse.json(
      { error: "Failed to block date" },
      { status: 500 },
    );
  }
}
