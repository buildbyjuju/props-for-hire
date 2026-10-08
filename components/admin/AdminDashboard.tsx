"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminCalendarView } from "@/components/admin/AdminCalendarView";
import type { AdminBooking, AdminCategory } from "@/components/admin/admin-types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
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
      setCategories(itemsData.categories as AdminCategory[]);
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

  return (
    <div className="min-h-[100dvh] bg-warm-white">
      <header className="border-b border-sage/15 bg-cream/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-sage">
              Dreamscape Admin
            </p>
            <h1 className="font-serif text-2xl font-light text-foreground">
              Hire calendar
            </h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {loading ? (
          <p className="text-sm font-light text-foreground-soft">Loading...</p>
        ) : (
          <AdminCalendarView
            bookings={bookings}
            categories={categories}
            onUpdated={loadData}
          />
        )}
      </main>
    </div>
  );
}
