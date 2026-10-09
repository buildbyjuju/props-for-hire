import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdminApi } from "@/lib/admin-auth";
import { isDateAvailable } from "@/lib/availability";
import { requireDb } from "@/lib/db";
import { bookings, items } from "@/lib/db/schema";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const ALLOWED_STATUSES = [
  "pending",
  "pending_confirmation",
  "paid",
  "cancelled",
] as const;

const HIRED_FROM = ["Hoda", "Jojo"] as const;

function formatDate(value: Date | string) {
  return typeof value === "string" ? value : value.toISOString().slice(0, 10);
}

function optionalTrim(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || null;
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAdminApi();
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const itemId = body.itemId as string | undefined;
    const eventDate = body.eventDate as string | undefined;
    const customerName = optionalTrim(body.customerName);
    const customerEmail = optionalTrim(body.customerEmail);
    const notes = optionalTrim(body.notes);
    const selectedSize = optionalTrim(body.selectedSize);
    const selectedSets = optionalTrim(body.selectedSets);
    const status = body.status as string | undefined;
    const hiredFromRaw = body.hiredFrom as string | null | undefined;
    const hiredFrom =
      hiredFromRaw === undefined
        ? undefined
        : hiredFromRaw === null || hiredFromRaw === ""
          ? null
          : HIRED_FROM.includes(hiredFromRaw as (typeof HIRED_FROM)[number])
            ? hiredFromRaw
            : undefined;

    const hasUpdate =
      itemId !== undefined ||
      eventDate !== undefined ||
      customerName !== undefined ||
      customerEmail !== undefined ||
      notes !== undefined ||
      selectedSize !== undefined ||
      selectedSets !== undefined ||
      status !== undefined ||
      hiredFrom !== undefined;

    if (!hasUpdate) {
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

    if (hiredFromRaw !== undefined && hiredFrom === undefined) {
      return NextResponse.json(
        { error: "Hired from must be Hoda or Jojo" },
        { status: 400 },
      );
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

    const nextItemId = itemId ?? existing.itemId;
    const nextEventDate = eventDate ?? formatDate(existing.eventDate);
    const nextSize =
      selectedSize !== undefined
        ? selectedSize
        : existing.selectedSize;
    const nextSets =
      selectedSets !== undefined
        ? selectedSets
        : existing.selectedSets;
    const nextStatus =
      (status as (typeof ALLOWED_STATUSES)[number] | undefined) ??
      existing.status;

    if (itemId !== undefined) {
      const [item] = await database
        .select({ id: items.id })
        .from(items)
        .where(eq(items.id, itemId))
        .limit(1);
      if (!item) {
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
      }
    }

    const scheduleChanged =
      nextItemId !== existing.itemId ||
      nextEventDate !== formatDate(existing.eventDate) ||
      (nextSize ?? null) !== (existing.selectedSize ?? null) ||
      (nextSets ?? null) !== (existing.selectedSets ?? null);

    if (scheduleChanged && nextStatus !== "cancelled") {
      const available = await isDateAvailable(nextItemId, nextEventDate, {
        selectedSize: nextSize || undefined,
        selectedSets: nextSets || undefined,
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
    }

    const updates: {
      itemId?: string;
      eventDate?: string;
      customerName?: string | null;
      customerEmail?: string | null;
      notes?: string | null;
      selectedSize?: string | null;
      selectedSets?: string | null;
      hiredFrom?: string | null;
      status?: (typeof ALLOWED_STATUSES)[number];
    } = {};

    if (itemId !== undefined) updates.itemId = itemId;
    if (eventDate !== undefined) updates.eventDate = eventDate;
    if (customerName !== undefined) updates.customerName = customerName;
    if (customerEmail !== undefined) updates.customerEmail = customerEmail;
    if (notes !== undefined) updates.notes = notes;
    if (selectedSize !== undefined) updates.selectedSize = selectedSize;
    if (selectedSets !== undefined) updates.selectedSets = selectedSets;
    if (hiredFrom !== undefined) updates.hiredFrom = hiredFrom;
    if (status !== undefined) {
      updates.status = status as (typeof ALLOWED_STATUSES)[number];
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
