import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";

export async function getCatalogDatabaseStatus(): Promise<
  "ready" | "not_configured" | "empty"
> {
  if (!db) {
    return "not_configured";
  }

  const rows = await db
    .select({ id: categories.id })
    .from(categories)
    .orderBy(asc(categories.sortOrder))
    .limit(1);

  return rows.length > 0 ? "ready" : "empty";
}

export function catalogDatabaseErrorMessage(
  status: "not_configured" | "empty",
): string {
  if (status === "not_configured") {
    return "Checkout is unavailable because DATABASE_URL is not configured on the server.";
  }

  return "Checkout is unavailable because the production database has not been seeded yet.";
}
