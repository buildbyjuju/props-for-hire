import { NextResponse } from "next/server";
import { parseISO } from "date-fns";
import { getItemAvailability } from "@/lib/availability";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const itemId = searchParams.get("itemId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!itemId || !from || !to) {
    return NextResponse.json(
      { error: "itemId, from, and to are required" },
      { status: 400 },
    );
  }

  if (itemId.startsWith("static-") || !process.env.DATABASE_URL) {
    return NextResponse.json({ unavailable: [], locked: [] });
  }

  try {
    const availability = await getItemAvailability(
      itemId,
      parseISO(from),
      parseISO(to),
    );
    return NextResponse.json(availability);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ unavailable: [], locked: [] });
  }
}
