import { NextResponse } from "next/server";
import {
  catalogDatabaseErrorMessage,
  getCatalogDatabaseStatus,
} from "@/lib/catalog-health";

export async function GET() {
  const status = await getCatalogDatabaseStatus();

  return NextResponse.json({
    database: status,
    checkoutReady: status === "ready",
    message:
      status === "ready"
        ? "Catalog database is ready for checkout."
        : catalogDatabaseErrorMessage(status),
  });
}
