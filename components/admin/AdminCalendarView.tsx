"use client";

import { useMemo, useState } from "react";
import { addDays, format, parseISO, startOfToday } from "date-fns";
import {
  bookingVariantLabel,
  formatBookingStatus,
  type AdminBooking,
  type AdminCategory,
} from "@/components/admin/admin-types";
import { AdminBookingForm } from "@/components/admin/AdminBookingForm";
import { Calendar } from "@/components/ui/calendar";
import { getHireWindow } from "@/lib/pricing";

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
          defaultMonth={selected ?? startOfToday()}
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
                      <BookingCard key={booking.id} booking={booking} />
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
  );
}

function BookingCard({
  booking,
  roleLabel,
}: {
  booking: AdminBooking;
  roleLabel?: string;
}) {
  const variant = bookingVariantLabel(booking);
  const window = getHireWindow(booking.eventDate);

  return (
    <li className="rounded-2xl bg-warm-white px-4 py-3">
      <p className="font-serif text-lg font-light text-foreground">
        {booking.itemName}
      </p>
      <p className="mt-1 text-xs uppercase tracking-wider text-sage">
        {booking.categoryName} · {formatBookingStatus(booking.status)}
        {roleLabel ? ` · ${roleLabel}` : ""}
      </p>
      {variant ? (
        <p className="mt-1 text-xs font-light text-foreground-soft">{variant}</p>
      ) : null}
      <p className="mt-1 text-xs font-light text-foreground-soft">
        Window: {formatShortDate(window.pickupDate)} →{" "}
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
    </li>
  );
}
