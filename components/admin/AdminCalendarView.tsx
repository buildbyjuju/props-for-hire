"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  format,
  parseISO,
  startOfMonth,
  startOfToday,
} from "date-fns";
import {
  bookingVariantLabel,
  formatBookingStatus,
  type AdminBooking,
  type AdminCategory,
} from "@/components/admin/admin-types";
import { AdminBookingForm } from "@/components/admin/AdminBookingForm";
import { AdminMonthReport } from "@/components/admin/AdminMonthReport";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getHireWindow } from "@/lib/pricing";
import { toast } from "sonner";

function formatDisplayDate(dateStr: string) {
  try {
    return format(parseISO(dateStr), "EEEE d MMMM yyyy");
  } catch {
    return dateStr;
  }
}

function formatShortDate(dateStr: string) {
  try {
    return format(parseISO(dateStr), "EEE d MMM");
  } catch {
    return dateStr;
  }
}

/** Day before, event day, and day after — same window used on the public site */
function getHireWindowDays(eventDateStr: string): string[] {
  const window = getHireWindow(eventDateStr);
  return [window.pickupDate, window.eventDate, window.returnDate];
}

export function AdminCalendarView({
  bookings,
  categories,
  onUpdated,
}: {
  bookings: AdminBooking[];
  categories: AdminCategory[];
  onUpdated: () => void;
}) {
  const [selected, setSelected] = useState<Date | undefined>(startOfToday());
  const [month, setMonth] = useState(() => startOfMonth(startOfToday()));

  const selectedDateStr = selected
    ? format(selected, "yyyy-MM-dd")
    : null;

  const dayBookings = useMemo(() => {
    if (!selectedDateStr) return [];
    return bookings
      .filter((booking) => booking.eventDate === selectedDateStr)
      .sort((a, b) => a.itemName.localeCompare(b.itemName));
  }, [bookings, selectedDateStr]);

  /** Other event hires whose pickup/return window covers the selected day */
  const windowAffectedBookings = useMemo(() => {
    if (!selectedDateStr) return [];
    return bookings
      .filter((booking) => {
        if (booking.eventDate === selectedDateStr) return false;
        return getHireWindowDays(booking.eventDate).includes(selectedDateStr);
      })
      .sort((a, b) => a.itemName.localeCompare(b.itemName));
  }, [bookings, selectedDateStr]);

  const eventDates = useMemo(
    () =>
      Array.from(new Set(bookings.map((booking) => booking.eventDate))).map(
        (day) => parseISO(day),
      ),
    [bookings],
  );

  const lockedDates = useMemo(() => {
    const locked = new Set<string>();
    for (const booking of bookings) {
      for (const day of getHireWindowDays(booking.eventDate)) {
        if (day !== booking.eventDate) {
          locked.add(day);
        }
      }
    }
    return Array.from(locked).map((day) => parseISO(day));
  }, [bookings]);

  const selectedWindow = selectedDateStr
    ? getHireWindow(selectedDateStr)
    : null;

  return (
    <div className="space-y-6">
    <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
      <section className="rounded-3xl bg-cream p-5 shadow-luxury sm:p-6">
        <h2 className="font-serif text-xl font-light text-foreground">
          Calendar
        </h2>
        <p className="mt-2 text-sm font-light text-foreground-soft">
          Select a day to see hires. Adding a hire blocks the day before and the
          day after on the public website for that item.
        </p>
        <Calendar
          mode="single"
          selected={selected}
          onSelect={setSelected}
          month={month}
          onMonthChange={setMonth}
          modifiers={{
            booked: eventDates,
            locked: lockedDates,
          }}
          modifiersClassNames={{
            booked: "bg-sage text-black font-medium",
            locked: "bg-sage/20 text-foreground-soft",
          }}
          className="mx-auto mt-4 w-full max-w-[320px] rounded-2xl bg-warm-white p-2"
        />
        <div className="mt-3 space-y-1 text-center text-xs font-light text-foreground-soft">
          <p>
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-sage align-middle" />{" "}
            Event day with hire
          </p>
          <p>
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-sage/30 align-middle" />{" "}
            Blocked day before / after
          </p>
        </div>
      </section>

      <div className="space-y-6">
        <section className="rounded-3xl bg-cream p-5 shadow-luxury sm:p-6">
          <h2 className="font-serif text-xl font-light text-foreground">
            {selectedDateStr
              ? formatDisplayDate(selectedDateStr)
              : "Select a day"}
          </h2>

          {selectedWindow ? (
            <p className="mt-2 text-sm font-light text-foreground-soft">
              Hire window: {formatShortDate(selectedWindow.pickupDate)} pickup ·{" "}
              {formatShortDate(selectedWindow.eventDate)} event ·{" "}
              {formatShortDate(selectedWindow.returnDate)} return
            </p>
          ) : null}

          {!selectedDateStr ? (
            <p className="mt-4 text-sm font-light text-foreground-soft">
              Choose a date on the calendar to view hires.
            </p>
          ) : dayBookings.length === 0 && windowAffectedBookings.length === 0 ? (
            <p className="mt-4 text-sm font-light text-foreground-soft">
              No products hired on this day yet.
            </p>
          ) : (
            <div className="mt-5 space-y-5">
              {dayBookings.length > 0 ? (
                <div>
                  <h3 className="text-xs uppercase tracking-[0.14em] text-foreground-soft">
                    Event hires ({dayBookings.length})
                  </h3>
                  <ul className="mt-3 space-y-3">
                    {dayBookings.map((booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        onUpdated={onUpdated}
                        onDateMoved={(newDate) => {
                          setSelected(parseISO(newDate));
                          setMonth(startOfMonth(parseISO(newDate)));
                        }}
                      />
                    ))}
                  </ul>
                </div>
              ) : null}

              {windowAffectedBookings.length > 0 ? (
                <div>
                  <h3 className="text-xs uppercase tracking-[0.14em] text-foreground-soft">
                    Also locked this day (pickup / return)
                  </h3>
                  <ul className="mt-3 space-y-3">
                    {windowAffectedBookings.map((booking) => {
                      const window = getHireWindow(booking.eventDate);
                      const role =
                        selectedDateStr === window.pickupDate
                          ? "Pickup day"
                          : selectedDateStr === window.returnDate
                            ? "Return day"
                            : "Locked";
                      return (
                        <BookingCard
                          key={booking.id}
                          booking={booking}
                          roleLabel={role}
                          onUpdated={onUpdated}
                          onDateMoved={(newDate) => {
                            setSelected(parseISO(newDate));
                            setMonth(startOfMonth(parseISO(newDate)));
                          }}
                        />
                      );
                    })}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </section>

        {selectedDateStr ? (
          <section className="rounded-3xl bg-cream p-5 shadow-luxury sm:p-6">
            <h2 className="font-serif text-xl font-light text-foreground">
              Add hire for this day
            </h2>
            <p className="mt-2 text-sm font-light text-foreground-soft">
              Adds a hire for {formatDisplayDate(selectedDateStr)} and blocks{" "}
              {formatShortDate(
                format(addDays(parseISO(selectedDateStr), -1), "yyyy-MM-dd"),
              )}{" "}
              and{" "}
              {formatShortDate(
                format(addDays(parseISO(selectedDateStr), 1), "yyyy-MM-dd"),
              )}{" "}
              for that item on the public booking calendar.
            </p>
            <div className="mt-5">
              <AdminBookingForm
                key={selectedDateStr}
                categories={categories}
                defaultDate={selectedDateStr}
                lockDate
                onCreated={onUpdated}
              />
            </div>
          </section>
        ) : null}
      </div>
    </div>

      <AdminMonthReport month={month} bookings={bookings} />
    </div>
  );
}

function BookingCard({
  booking,
  roleLabel,
  onUpdated,
  onDateMoved,
}: {
  booking: AdminBooking;
  roleLabel?: string;
  onUpdated: () => void;
  onDateMoved: (newDate: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [newDate, setNewDate] = useState(booking.eventDate);
  const [saving, setSaving] = useState(false);

  const variant = bookingVariantLabel(booking);
  const window = getHireWindow(booking.eventDate);

  async function handleSaveDate() {
    if (!newDate || newDate === booking.eventDate) {
      setEditing(false);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventDate: newDate }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not update date");
        return;
      }
      toast.success("Hire date updated — public calendar locks moved");
      setEditing(false);
      onDateMoved(newDate);
      onUpdated();
    } catch {
      toast.error("Could not update date");
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="rounded-2xl bg-warm-white px-4 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="font-serif text-lg font-light text-foreground">
            {booking.itemName}
          </p>
          <p className="mt-1 text-xs uppercase tracking-wider text-sage">
            {booking.categoryName} · {formatBookingStatus(booking.status)}
            {booking.hiredFrom ? ` · ${booking.hiredFrom}` : ""}
            {booking.adminEventTitle ? ` · ${booking.adminEventTitle}` : ""}
            {roleLabel ? ` · ${roleLabel}` : ""}
          </p>
          {variant ? (
            <p className="mt-1 text-xs font-light text-foreground-soft">
              {variant}
            </p>
          ) : null}
          <p className="mt-1 text-xs font-light text-foreground-soft">
            Event: {formatShortDate(booking.eventDate)} · Window:{" "}
            {formatShortDate(window.pickupDate)} →{" "}
            {formatShortDate(window.eventDate)} →{" "}
            {formatShortDate(window.returnDate)}
          </p>
          <p className="mt-2 text-sm text-foreground">
            {booking.customerName ?? "No name"}
            {booking.customerEmail ? ` · ${booking.customerEmail}` : ""}
          </p>
          {booking.notes ? (
            <p className="mt-1 text-xs font-light text-foreground-soft">
              Notes: {booking.notes}
            </p>
          ) : null}
        </div>

        {!editing ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setNewDate(booking.eventDate);
              setEditing(true);
            }}
          >
            Edit date
          </Button>
        ) : null}
      </div>

      {editing ? (
        <div className="mt-3 space-y-3 border-t border-sage/15 pt-3">
          <div className="space-y-2">
            <Label htmlFor={`edit-date-${booking.id}`}>New event date</Label>
            <Input
              id={`edit-date-${booking.id}`}
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
            <p className="text-xs font-light text-foreground-soft">
              Moves the hire and the day-before / day-after locks on the public
              website.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              disabled={saving || !newDate}
              onClick={() => void handleSaveDate()}
            >
              {saving ? "Saving..." : "Save date"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={saving}
              onClick={() => {
                setEditing(false);
                setNewDate(booking.eventDate);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : null}
    </li>
  );
}
