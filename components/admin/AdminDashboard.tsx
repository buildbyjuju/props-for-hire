"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { AdminBookingsByCategory } from "@/components/admin/AdminBookingsByCategory";
import { AdminCalendarView } from "@/components/admin/AdminCalendarView";
import {
  blockVariantLabel,
  type AdminBooking,
  type AdminCategory,
  type DateBlock,
} from "@/components/admin/admin-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type AdminTab = "bookings" | "calendar" | "blocks";

function formatDisplayDate(dateStr: string) {
  try {
    return format(parseISO(dateStr), "EEE d MMM yyyy");
  } catch {
    return dateStr;
  }
}

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<AdminTab>("calendar");
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [blocks, setBlocks] = useState<DateBlock[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [blockItemId, setBlockItemId] = useState("");
  const [blockDate, setBlockDate] = useState("");
  const [blockNote, setBlockNote] = useState("");
  const [blockSize, setBlockSize] = useState("");
  const [blockSets, setBlockSets] = useState("");

  const allItems = useMemo(
    () => categories.flatMap((category) => category.items),
    [categories],
  );

  const selectedBlockItem = useMemo(
    () => allItems.find((item) => item.id === blockItemId) ?? null,
    [allItems, blockItemId],
  );

  const blockHasSizes = Boolean(selectedBlockItem?.sizes.length);
  const blockHasSets = Boolean(selectedBlockItem?.setOptions.length);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [bookingsRes, blocksRes, itemsRes] = await Promise.all([
        fetch("/api/admin/bookings"),
        fetch("/api/admin/blocks"),
        fetch("/api/admin/items"),
      ]);

      if (!bookingsRes.ok || !blocksRes.ok || !itemsRes.ok) {
        throw new Error("Failed to load admin data");
      }

      const bookingsData = await bookingsRes.json();
      const blocksData = await blocksRes.json();
      const itemsData = await itemsRes.json();

      setBookings(bookingsData.bookings as AdminBooking[]);
      setBlocks(blocksData.blocks as DateBlock[]);
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

  async function handleBlockDate(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/admin/blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemId: blockItemId,
        eventDate: blockDate,
        note: blockNote,
        selectedSize: blockSize || undefined,
        selectedSets: blockSets || undefined,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Could not block date");
      return;
    }

    toast.success("Date blocked");
    setBlockDate("");
    setBlockNote("");
    setBlockSize("");
    setBlockSets("");
    void loadData();
  }

  async function handleUnblock(blockId: string) {
    const res = await fetch(`/api/admin/blocks/${blockId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      toast.error("Could not unblock date");
      return;
    }

    toast.success("Date unblocked");
    void loadData();
  }

  const tabs: { id: AdminTab; label: string }[] = [
    { id: "calendar", label: "Calendar" },
    { id: "bookings", label: "Bookings by category" },
    { id: "blocks", label: "Block dates" },
  ];

  return (
    <div className="min-h-[100dvh] bg-warm-white">
      <header className="border-b border-sage/15 bg-cream/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-sage">
              Dreamscape Admin
            </p>
            <h1 className="font-serif text-2xl font-light text-foreground">
              Bookings dashboard
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

        {loading ? (
          <p className="text-sm font-light text-foreground-soft">Loading...</p>
        ) : null}

        {!loading && tab === "calendar" ? (
          <AdminCalendarView
            bookings={bookings}
            categories={categories}
            onUpdated={loadData}
          />
        ) : null}

        {!loading && tab === "bookings" ? (
          <section className="rounded-3xl bg-cream p-5 shadow-luxury sm:p-6">
            <h2 className="font-serif text-xl font-light text-foreground">
              Bookings by category
            </h2>
            <p className="mt-2 text-sm font-light text-foreground-soft">
              All hires grouped under their collection headings.
            </p>
            <div className="mt-6">
              <AdminBookingsByCategory
                bookings={bookings}
                onUpdated={loadData}
              />
            </div>
          </section>
        ) : null}

        {!loading && tab === "blocks" ? (
          <section className="rounded-3xl bg-cream p-5 shadow-luxury sm:p-6">
            <h2 className="font-serif text-xl font-light text-foreground">
              Block dates
            </h2>
            <p className="mt-2 text-sm font-light text-foreground-soft">
              For plinths, block a single size only. For raisers, block 1 set, 2
              sets, or the entire item.
            </p>
            <form
              onSubmit={handleBlockDate}
              className="mt-5 grid gap-4 sm:grid-cols-2"
            >
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="block-item">Item</Label>
                <select
                  id="block-item"
                  value={blockItemId}
                  onChange={(e) => {
                    setBlockItemId(e.target.value);
                    setBlockSize("");
                    setBlockSets("");
                  }}
                  required
                  className="flex h-11 w-full rounded-2xl border border-sage/30 bg-warm-white px-3 text-sm font-light text-foreground"
                >
                  <option value="">Select an item</option>
                  {categories.map((category) => (
                    <optgroup key={category.id} label={category.name}>
                      {category.items.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="block-date">Event date to block</Label>
                <Input
                  id="block-date"
                  type="date"
                  value={blockDate}
                  onChange={(e) => setBlockDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="block-note">Note (optional)</Label>
                <Input
                  id="block-note"
                  value={blockNote}
                  onChange={(e) => setBlockNote(e.target.value)}
                />
              </div>

              {blockHasSizes ? (
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="block-size">Size to block</Label>
                  <select
                    id="block-size"
                    value={blockSize}
                    onChange={(e) => setBlockSize(e.target.value)}
                    className="flex h-11 w-full rounded-2xl border border-sage/30 bg-warm-white px-3 text-sm font-light text-foreground"
                  >
                    <option value="">All sizes (entire item)</option>
                    {selectedBlockItem?.sizes.map((size) => (
                      <option key={size} value={size}>
                        {size} only
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              {blockHasSets ? (
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="block-sets">Sets to block</Label>
                  <select
                    id="block-sets"
                    value={blockSets}
                    onChange={(e) => setBlockSets(e.target.value)}
                    className="flex h-11 w-full rounded-2xl border border-sage/30 bg-warm-white px-3 text-sm font-light text-foreground"
                  >
                    <option value="">All sets (fully block item)</option>
                    {selectedBlockItem?.setOptions.map((option) => (
                      <option key={option} value={option}>
                        {option} only
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              <div className="sm:col-span-2">
                <Button
                  type="submit"
                  variant="outline"
                  disabled={allItems.length === 0}
                >
                  Block date
                </Button>
              </div>
            </form>

            <div className="mt-6 space-y-3">
              <h3 className="text-xs uppercase tracking-[0.14em] text-foreground-soft">
                Blocked dates
              </h3>
              {blocks.length === 0 ? (
                <p className="text-sm font-light text-foreground-soft">
                  No blocked dates yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {blocks.map((block) => (
                    <li
                      key={block.id}
                      className="flex flex-col gap-3 rounded-2xl bg-warm-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-sm text-foreground">
                          {block.itemName} · {formatDisplayDate(block.eventDate)}
                        </p>
                        <p className="mt-1 text-xs font-light text-sage">
                          {blockVariantLabel(block)}
                        </p>
                        {block.note ? (
                          <p className="mt-1 text-xs font-light text-foreground-soft">
                            {block.note}
                          </p>
                        ) : null}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnblock(block.id)}
                      >
                        Unblock
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
