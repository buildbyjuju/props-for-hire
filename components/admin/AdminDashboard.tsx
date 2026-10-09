"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminCalendarView } from "@/components/admin/AdminCalendarView";
import { AdminCatalogView } from "@/components/admin/AdminCatalogView";
import { AdminEventsView } from "@/components/admin/AdminEventsView";
import type { AdminBooking, AdminCategory } from "@/components/admin/admin-types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type AdminTab = "calendar" | "events" | "catalog";

type ApiCategory = {
  id: string;
  name: string;
  slug: string;
  items: Array<{
    id: string;
    name: string;
    slug: string;
    sizes?: string[];
    setOptions?: string[];
    quantityAvailable: number;
    isActive?: boolean;
  }>;
};

function toHireCategories(categories: ApiCategory[]): AdminCategory[] {
  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    items: category.items
      .filter((item) => item.isActive !== false)
      .map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        sizes: item.sizes ?? [],
        setOptions: item.setOptions ?? [],
        quantityAvailable: item.quantityAvailable,
      })),
  }));
}

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<AdminTab>("events");
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [bookingsRes, itemsRes] = await Promise.all([
        fetch("/api/admin/bookings"),
        fetch("/api/admin/items"),
      ]);

      if (!bookingsRes.ok || !itemsRes.ok) {
        throw new Error("Failed to load admin data");
      }

      const bookingsData = await bookingsRes.json();
      const itemsData = await itemsRes.json();

      setBookings(bookingsData.bookings as AdminBooking[]);
      setCategories(toHireCategories(itemsData.categories as ApiCategory[]));
    } catch {
      toast.error("Could not load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadData();
    });
  }, [loadData]);

  async function handleLogout() {
    await fetch("/api/admin/session", { method: "DELETE" });
    onLogout();
  }

  const tabs: { id: AdminTab; label: string }[] = [
    { id: "events", label: "Events" },
    { id: "calendar", label: "Calendar" },
    { id: "catalog", label: "Catalogue" },
  ];

  const title =
    tab === "events"
      ? "Events"
      : tab === "calendar"
        ? "Hire calendar"
        : "Catalogue";

  return (
    <div className="min-h-[100dvh] bg-warm-white">
      <header className="border-b border-sage/15 bg-cream/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-sage">
              Dreamscape Admin
            </p>
            <h1 className="font-serif text-2xl font-light text-foreground">
              {title}
            </h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
        <nav className="flex flex-wrap gap-2">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "min-h-10 rounded-full border px-4 py-2 text-xs uppercase tracking-wider transition-colors",
                tab === item.id
                  ? "border-sage bg-sage text-black"
                  : "border-sage/30 bg-cream text-foreground hover:border-sage",
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {loading && tab !== "catalog" ? (
          <p className="text-sm font-light text-foreground-soft">Loading...</p>
        ) : null}

        {!loading && tab === "events" ? (
          <AdminEventsView
            categories={categories}
            onHiresChanged={loadData}
          />
        ) : null}

        {!loading && tab === "calendar" ? (
          <AdminCalendarView
            bookings={bookings.filter((b) => b.status !== "cancelled")}
            categories={categories}
            onUpdated={loadData}
          />
        ) : null}

        {tab === "catalog" ? (
          <AdminCatalogView onChanged={loadData} />
        ) : null}
      </main>
    </div>
  );
}
