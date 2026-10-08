"use client";

import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import {
  bookingVariantLabel,
  formatBookingStatus,
  type AdminBooking,
} from "@/components/admin/admin-types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

function formatDisplayDate(dateStr: string) {
  try {
    return format(parseISO(dateStr), "EEE d MMM yyyy");
  } catch {
    return dateStr;
  }
}

export function AdminBookingsByCategory({
  bookings,
  onUpdated,
}: {
  bookings: AdminBooking[];
  onUpdated: () => void;
}) {
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    setNoteDrafts(
      Object.fromEntries(
        bookings.map((booking) => [booking.id, booking.notes ?? ""]),
      ),
    );
  }, [bookings]);

  const grouped = useMemo(() => {
    const byCategory = new Map<
      string,
      { name: string; sortOrder: number; bookings: AdminBooking[] }
    >();

    for (const booking of bookings) {
      const existing = byCategory.get(booking.categoryId);
      if (existing) {
        existing.bookings.push(booking);
      } else {
        byCategory.set(booking.categoryId, {
          name: booking.categoryName,
          sortOrder: booking.categorySortOrder,
          bookings: [booking],
        });
      }
    }

    return Array.from(byCategory.values()).sort(
      (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
    );
  }, [bookings]);

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
    onUpdated();
  }

  if (bookings.length === 0) {
    return (
      <p className="text-sm font-light text-foreground-soft">No bookings yet.</p>
    );
  }

  return (
    <div className="space-y-10">
      {grouped.map((group) => (
        <section key={group.name}>
          <div className="mb-4 border-b border-sage/20 pb-2">
            <h2 className="font-serif text-2xl font-light text-foreground">
              {group.name}
            </h2>
            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-foreground-soft">
              {group.bookings.length}{" "}
              {group.bookings.length === 1 ? "hire" : "hires"}
            </p>
          </div>

          <div className="space-y-4">
            {group.bookings.map((booking) => {
              const variant = bookingVariantLabel(booking);
              return (
                <article
                  key={booking.id}
                  className="rounded-2xl bg-warm-white p-4 sm:p-5"
                >
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
                    {variant ? (
                      <p className="mt-1 text-xs font-light text-sage">{variant}</p>
                    ) : null}
                    <p className="mt-2 text-sm text-foreground">
                      {booking.customerName ?? "No name"}
                      {booking.customerEmail
                        ? ` · ${booking.customerEmail}`
                        : ""}
                    </p>
                  </div>

                  <div className="mt-4 space-y-2">
                    <Label htmlFor={`notes-${booking.id}`}>Notes</Label>
                    <Textarea
                      id={`notes-${booking.id}`}
                      value={noteDrafts[booking.id] ?? booking.notes ?? ""}
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
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
