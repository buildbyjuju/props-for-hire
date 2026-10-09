import { NextResponse } from "next/server";
import { and, desc, isNotNull, ne } from "drizzle-orm";
import { requireAdminApi } from "@/lib/admin-auth";
import { requireDb } from "@/lib/db";
import { adminEvents, bookings } from "@/lib/db/schema";

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
    const events = await database
      .select()
      .from(adminEvents)
      .orderBy(desc(adminEvents.eventDate), desc(adminEvents.createdAt));

    const hireRows = await database
      .select({
        adminEventId: bookings.adminEventId,
      })
      .from(bookings)
      .where(
        and(isNotNull(bookings.adminEventId), ne(bookings.status, "cancelled")),
      );

    const countByEvent = new Map<string, number>();
    for (const row of hireRows) {
      if (!row.adminEventId) continue;
      countByEvent.set(
        row.adminEventId,
        (countByEvent.get(row.adminEventId) ?? 0) + 1,
      );
    }

    return NextResponse.json({
      events: events.map((event) => ({
        id: event.id,
        title: event.title,
        eventDate: formatDate(event.eventDate),
        location: event.location,
        description: event.description,
        hireCount: countByEvent.get(event.id) ?? 0,
        createdAt: event.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Admin events list error:", error);
    return NextResponse.json(
      { error: "Failed to load events" },
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
      .insert(adminEvents)
      .values({
        title: title.trim(),
        eventDate,
        location: location.trim(),
        description: description?.trim() || "",
      })
      .returning();

    return NextResponse.json({
      event: {
        id: event.id,
        title: event.title,
        eventDate: formatDate(event.eventDate),
        location: event.location,
        description: event.description,
        hireCount: 0,
        createdAt: event.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Admin create event error:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 },
    );
  }
}
