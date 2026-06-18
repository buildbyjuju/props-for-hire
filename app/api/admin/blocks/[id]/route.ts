import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdminApi } from "@/lib/admin-auth";
import { requireDb } from "@/lib/db";
import { dateBlocks } from "@/lib/db/schema";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAdminApi();
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;

  try {
    const database = requireDb();
    const [deleted] = await database
      .delete(dateBlocks)
      .where(eq(dateBlocks.id, id))
      .returning({ id: dateBlocks.id });

    if (!deleted) {
      return NextResponse.json({ error: "Block not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin unblock date error:", error);
    return NextResponse.json(
      { error: "Failed to unblock date" },
      { status: 500 },
    );
  }
}
