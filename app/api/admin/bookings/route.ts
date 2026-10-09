import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { requireAdminApi } from "@/lib/admin-auth";
import { isDateAvailable } from "@/lib/availability";
import { requireDb } from "@/lib/db";
import { adminEvents, bookings, categories, items } from "@/lib/db/schema";

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
        id: bookings.id,
        itemId: bookings.itemId,
        itemName: items.name,
        categoryId: categories.id,
        categoryName: categories.name,
        categorySlug: categories.slug,
        categorySortOrder: categories.sortOrder,
        adminEventId: bookings.adminEventId,
        adminEventTitle: adminEvents.title,
        eventDate: bookings.eventDate,
        status: bookings.status,
        customerName: bookings.customerName,
        customerEmail: bookings.customerEmail,
        notes: bookings.notes,
        selectedSize: bookings.selectedSize,
        selectedSets: bookings.selectedSets,
        stripeSessionId: bookings.stripeSessionId,
        createdAt: bookings.createdAt,
      })
      .from(bookings)
      .innerJoin(items, eq(bookings.itemId, items.id))
      .innerJoin(categories, eq(items.categoryId, categories.id))
      .leftJoin(adminEvents, eq(bookings.adminEventId, adminEvents.id))
      .orderBy(desc(bookings.eventDate), desc(bookings.createdAt));

    return NextResponse.json({
      bookings: rows.map((row) => ({
        ...row,
        eventDate: formatDate(row.eventDate),
        createdAt: row.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Admin bookings list error:", error);
    return NextResponse.json(
      { error: "Failed to load bookings" },
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
    let eventDate = body.eventDate as string | undefined;
    const customerName = body.customerName as string | undefined;
    const customerEmail = body.customerEmail as string | undefined;
    const notes = body.notes as string | undefined;
    const selectedSize = body.selectedSize as string | undefined;
    const selectedSets = body.selectedSets as string | undefined;
    const adminEventId = body.adminEventId as string | undefined;

    if (!itemId) {
      return NextResponse.json({ error: "Item is required" }, { status: 400 });
    }

    const database = requireDb();

    let resolvedCustomerName = customerName?.trim() || "";
    let resolvedAdminEventId: string | null = null;

    if (adminEventId) {
      const [event] = await database
        .select()
        .from(adminEvents)
        .where(eq(adminEvents.id, adminEventId))
        .limit(1);

      if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }

      resolvedAdminEventId = event.id;
      eventDate = formatDate(event.eventDate);
      resolvedCustomerName =
        resolvedCustomerName || `Event — ${event.title}`;
    }

    if (!eventDate || !resolvedCustomerName) {
      return NextResponse.json(
        { error: "Item, event date, and customer name are required" },
        { status: 400 },
      );
    }

    const [item] = await database
      .select({ id: items.id })
      .from(items)
      .where(eq(items.id, itemId))
      .limit(1);

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const available = await isDateAvailable(itemId, eventDate, {
      selectedSize: selectedSize || undefined,
      selectedSets: selectedSets || undefined,
    });

    if (!available) {
      return NextResponse.json(
        {
          error:
            "This item is not available for that date (including day before / after locks).",
        },
        { status: 409 },
      );
    }

    const [booking] = await database
      .insert(bookings)
      .values({
        itemId,
        adminEventId: resolvedAdminEventId,
        eventDate,
        status: "paid",
        customerName: resolvedCustomerName,
        customerEmail: customerEmail?.trim() || null,
        notes: notes?.trim() || null,
        selectedSize: selectedSize?.trim() || null,
        selectedSets: selectedSets?.trim() || null,
      })
      .returning();

    return NextResponse.json({
      booking: {
        ...booking,
        eventDate: formatDate(booking.eventDate),
        createdAt: booking.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Admin manual booking error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 },
    );
  }
}
