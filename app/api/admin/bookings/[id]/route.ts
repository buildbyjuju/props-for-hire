import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdminApi } from "@/lib/admin-auth";
import { requireDb } from "@/lib/db";
import { bookings } from "@/lib/db/schema";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAdminApi();
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const notes = body.notes as string | undefined;

    if (notes === undefined) {
      return NextResponse.json({ error: "Notes are required" }, { status: 400 });
    }

    const database = requireDb();
    const [updated] = await database
      .update(bookings)
      .set({ notes: notes.trim() || null })
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
