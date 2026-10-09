import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdminApi } from "@/lib/admin-auth";
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

    if (notes === undefined && status === undefined) {
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

    const updates: {
      notes?: string | null;
      status?: (typeof ALLOWED_STATUSES)[number];
    } = {};

    if (notes !== undefined) {
      updates.notes = notes.trim() || null;
    }
    if (status !== undefined) {
      updates.status = status as (typeof ALLOWED_STATUSES)[number];
    }

    const database = requireDb();
    const [updated] = await database
      .update(bookings)
      .set(updates)
      .where(eq(bookings.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin booking update error:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 },
    );
  }
}
