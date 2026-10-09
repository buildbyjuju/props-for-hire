import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdminApi } from "@/lib/admin-auth";
import { isDateAvailable } from "@/lib/availability";
import { requireDb } from "@/lib/db";
import { bookings } from "@/lib/db/schema";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const ALLOWED_STATUSES = [
  "pending",
  "pending_confirmation",
  "paid",
  "cancelled",
] as const;

function formatDate(value: Date | string) {
  return typeof value === "string" ? value : value.toISOString().slice(0, 10);
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAdminApi();
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const notes = body.notes as string | undefined;
    const status = body.status as string | undefined;
    const eventDate = body.eventDate as string | undefined;

    if (notes === undefined && status === undefined && eventDate === undefined) {
      return NextResponse.json(
        { error: "Nothing to update" },
        { status: 400 },
      );
    }

    if (
      status !== undefined &&
      !ALLOWED_STATUSES.includes(status as (typeof ALLOWED_STATUSES)[number])
    ) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    if (eventDate !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
      return NextResponse.json(
        { error: "Invalid event date" },
        { status: 400 },
      );
    }

    const database = requireDb();
    const [existing] = await database
      .select()
      .from(bookings)
      .where(eq(bookings.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const updates: {
      notes?: string | null;
      status?: (typeof ALLOWED_STATUSES)[number];
      eventDate?: string;
    } = {};

    if (notes !== undefined) {
      updates.notes = notes.trim() || null;
    }
    if (status !== undefined) {
      updates.status = status as (typeof ALLOWED_STATUSES)[number];
    }

    if (eventDate !== undefined && eventDate !== formatDate(existing.eventDate)) {
      if (existing.status === "cancelled") {
        return NextResponse.json(
          { error: "Cannot change the date of a cancelled hire" },
          { status: 400 },
        );
      }

      const available = await isDateAvailable(existing.itemId, eventDate, {
        selectedSize: existing.selectedSize || undefined,
        selectedSets: existing.selectedSets || undefined,
        excludeBookingId: id,
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

      updates.eventDate = eventDate;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ ok: true });
    }

    const [updated] = await database
      .update(bookings)
      .set(updates)
      .where(eq(bookings.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      booking: {
        id: updated.id,
        eventDate: formatDate(updated.eventDate),
      },
    });
  } catch (error) {
    console.error("Admin booking update error:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 },
    );
  }
}
