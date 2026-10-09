import { NextResponse } from "next/server";
import { and, desc, eq, ne } from "drizzle-orm";
import { requireAdminApi } from "@/lib/admin-auth";
import { requireDb } from "@/lib/db";
import { adminEvents, bookings, categories, items } from "@/lib/db/schema";

function formatDate(value: Date | string) {
  return typeof value === "string" ? value : value.toISOString().slice(0, 10);
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireAdminApi();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const { id } = await context.params;
    const database = requireDb();

    const [event] = await database
      .select()
      .from(adminEvents)
      .where(eq(adminEvents.id, id))
      .limit(1);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const hires = await database
      .select({
        id: bookings.id,
        itemId: bookings.itemId,
        itemName: items.name,
        categoryName: categories.name,
        eventDate: bookings.eventDate,
        status: bookings.status,
        customerName: bookings.customerName,
        customerEmail: bookings.customerEmail,
        selectedSize: bookings.selectedSize,
        selectedSets: bookings.selectedSets,
        hiredFrom: bookings.hiredFrom,
        notes: bookings.notes,
        createdAt: bookings.createdAt,
      })
      .from(bookings)
      .innerJoin(items, eq(bookings.itemId, items.id))
      .innerJoin(categories, eq(items.categoryId, categories.id))
      .where(
        and(
          eq(bookings.adminEventId, id),
          ne(bookings.status, "cancelled"),
        ),
      )
      .orderBy(desc(bookings.createdAt));

    return NextResponse.json({
      event: {
        id: event.id,
        title: event.title,
        eventDate: formatDate(event.eventDate),
        location: event.location,
        description: event.description,
        createdAt: event.createdAt.toISOString(),
      },
      hires: hires.map((hire) => ({
        ...hire,
        eventDate: formatDate(hire.eventDate),
        createdAt: hire.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Admin event detail error:", error);
    return NextResponse.json(
      { error: "Failed to load event" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAdminApi();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const title = body.title as string | undefined;
    const eventDate = body.eventDate as string | undefined;
    const location = body.location as string | undefined;
    const description = body.description as string | undefined;

    if (!title?.trim() || !eventDate || !location?.trim()) {
      return NextResponse.json(
        { error: "Title, date, and location are required" },
        { status: 400 },
      );
    }

    const database = requireDb();
    const [event] = await database
      .update(adminEvents)
      .set({
        title: title.trim(),
        eventDate,
        location: location.trim(),
        description: description?.trim() || "",
      })
      .where(eq(adminEvents.id, id))
      .returning();

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Keep linked hire dates in sync with the event date
    await database
      .update(bookings)
      .set({ eventDate })
      .where(eq(bookings.adminEventId, id));

    return NextResponse.json({
      event: {
        id: event.id,
        title: event.title,
        eventDate: formatDate(event.eventDate),
        location: event.location,
        description: event.description,
        createdAt: event.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Admin update event error:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAdminApi();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const { id } = await context.params;
    const database = requireDb();

    // Cancel linked hires so dates unlock on public + admin calendars
    await database
      .update(bookings)
      .set({ status: "cancelled", adminEventId: null })
      .where(eq(bookings.adminEventId, id));

    const deleted = await database
      .delete(adminEvents)
      .where(eq(adminEvents.id, id))
      .returning({ id: adminEvents.id });

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin delete event error:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 },
    );
  }
}
