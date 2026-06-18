"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type AdminItem = {
  id: string;
  name: string;
  slug: string;
  sizes: string[];
  setOptions: string[];
  quantityAvailable: number;
};

type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  items: AdminItem[];
};

type AdminBooking = {
  id: string;
  itemId: string;
  itemName: string;
  eventDate: string;
  status: string;
  customerName: string | null;
  customerEmail: string | null;
  notes: string | null;
  createdAt: string;
};

type DateBlock = {
  id: string;
  itemId: string;
  itemName: string;
  eventDate: string;
  selectedSize: string | null;
  selectedSets: string | null;
  note: string | null;
  createdAt: string;
};

function formatBookingStatus(status: string) {
  if (status === "pending_confirmation") {
    return "Pending confirmation";
  }
  return status.replaceAll("_", " ");
}

function blockVariantLabel(block: DateBlock) {
  if (block.selectedSize) {
    return `Size: ${block.selectedSize}`;
  }
  if (block.selectedSets) {
    return `Sets: ${block.selectedSets}`;
  }
  return "Entire item";
}

function formatDisplayDate(dateStr: string) {
  try {
    return format(parseISO(dateStr), "EEE d MMM yyyy");
  } catch {
    return dateStr;
  }
}

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [blocks, setBlocks] = useState<DateBlock[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});

  const [manualItemId, setManualItemId] = useState("");
  const [manualDate, setManualDate] = useState("");
  const [manualName, setManualName] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [manualNotes, setManualNotes] = useState("");

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

      const nextBookings = bookingsData.bookings as AdminBooking[];
      setBookings(nextBookings);
      setBlocks(blocksData.blocks as DateBlock[]);
      setCategories(itemsData.categories as AdminCategory[]);
      setNoteDrafts(
        Object.fromEntries(
          nextBookings.map((booking) => [booking.id, booking.notes ?? ""]),
        ),
      );
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

  async function handleSaveNotes(bookingId: string) {
    const res = await fetch(`/api/admin/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: noteDrafts[bookingId] ?? "" }),
    });

    if (!res.ok) {
      toast.error("Could not save notes");
      return;
    }

    toast.success("Notes saved");
    void loadData();
  }

  async function handleManualBooking(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/admin/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemId: manualItemId,
        eventDate: manualDate,
        customerName: manualName,
        customerEmail: manualEmail,
        notes: manualNotes,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Could not create booking");
      return;
    }

    toast.success("Manual booking added");
    setManualDate("");
    setManualName("");
    setManualEmail("");
    setManualNotes("");
    void loadData();
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

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
        {loading ? (
          <p className="text-sm font-light text-foreground-soft">Loading...</p>
        ) : null}

        <section className="rounded-3xl bg-cream p-5 shadow-luxury sm:p-6">
          <h2 className="font-serif text-xl font-light text-foreground">
            Add manual booking
          </h2>
          <form
            onSubmit={handleManualBooking}
            className="mt-5 grid gap-4 sm:grid-cols-2"
          >
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="manual-item">Item</Label>
              <select
                id="manual-item"
                value={manualItemId}
                onChange={(e) => setManualItemId(e.target.value)}
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
              <Label htmlFor="manual-date">Event date</Label>
              <Input
                id="manual-date"
                type="date"
                value={manualDate}
                onChange={(e) => setManualDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manual-name">Customer name</Label>
              <Input
                id="manual-name"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manual-email">Customer email</Label>
              <Input
                id="manual-email"
                type="email"
                value={manualEmail}
                onChange={(e) => setManualEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="manual-notes">Notes</Label>
              <Textarea
                id="manual-notes"
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={allItems.length === 0}>
                Add booking
              </Button>
            </div>
          </form>
        </section>

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
              <Button type="submit" variant="outline" disabled={allItems.length === 0}>
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

        <section className="rounded-3xl bg-cream p-5 shadow-luxury sm:p-6">
          <h2 className="font-serif text-xl font-light text-foreground">
            All bookings
          </h2>

          {bookings.length === 0 ? (
            <p className="mt-4 text-sm font-light text-foreground-soft">
              No bookings yet.
            </p>
          ) : (
            <div className="mt-5 space-y-4">
              {bookings.map((booking) => (
                <article
                  key={booking.id}
                  className="rounded-2xl bg-warm-white p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-serif text-lg font-light text-foreground">
                        {booking.itemName}
                      </p>
                      <p className="mt-1 text-sm font-light text-foreground-soft">
                        {formatDisplayDate(booking.eventDate)} ·{" "}
                        <span className="uppercase tracking-wider text-sage">
                          {formatBookingStatus(booking.status)}
                        </span>
                      </p>
                      <p className="mt-2 text-sm text-foreground">
                        {booking.customerName ?? "No name"}
                        {booking.customerEmail
                          ? ` · ${booking.customerEmail}`
                          : ""}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <Label htmlFor={`notes-${booking.id}`}>Notes</Label>
                    <Textarea
                      id={`notes-${booking.id}`}
                      value={noteDrafts[booking.id] ?? ""}
                      onChange={(e) =>
                        setNoteDrafts((current) => ({
                          ...current,
                          [booking.id]: e.target.value,
                        }))
                      }
                      rows={2}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="soft"
                      onClick={() => handleSaveNotes(booking.id)}
                    >
                      Save notes
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
