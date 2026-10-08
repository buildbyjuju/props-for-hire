"use client";

import { useMemo, useState } from "react";
import { format, parseISO, startOfToday } from "date-fns";
import {
  bookingVariantLabel,
  formatBookingStatus,
  type AdminBooking,
  type AdminCategory,
} from "@/components/admin/admin-types";
import { AdminBookingForm } from "@/components/admin/AdminBookingForm";
import { Calendar } from "@/components/ui/calendar";

function formatDisplayDate(dateStr: string) {
  try {
    return format(parseISO(dateStr), "EEEE d MMMM yyyy");
  } catch {
    return dateStr;
  }
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

  const bookedDates = useMemo(
    () =>
      Array.from(new Set(bookings.map((booking) => booking.eventDate))).map(
        (day) => parseISO(day),
      ),
    [bookings],
  );

  const dayHireCount = useMemo(() => {
    const counts = new Map<string, number>();
    for (const booking of bookings) {
      counts.set(booking.eventDate, (counts.get(booking.eventDate) ?? 0) + 1);
    }
    return counts;
  }, [bookings]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
      <section className="rounded-3xl bg-cream p-5 shadow-luxury sm:p-6">
        <h2 className="font-serif text-xl font-light text-foreground">
          Calendar
        </h2>
        <p className="mt-2 text-sm font-light text-foreground-soft">
          Select a day to see every product hired for that event date.
        </p>
        <Calendar
          mode="single"
          selected={selected}
          onSelect={setSelected}
          defaultMonth={selected ?? startOfToday()}
          modifiers={{ booked: bookedDates }}
          modifiersClassNames={{
            booked: "bg-sage/20 text-foreground font-medium",
          }}
          className="mx-auto mt-4 w-full max-w-[320px] rounded-2xl bg-warm-white p-2"
        />
        <p className="mt-3 text-center text-xs font-light text-foreground-soft">
          Highlighted days have at least one hire
        </p>
      </section>

      <div className="space-y-6">
        <section className="rounded-3xl bg-cream p-5 shadow-luxury sm:p-6">
          <h2 className="font-serif text-xl font-light text-foreground">
            {selectedDateStr
              ? formatDisplayDate(selectedDateStr)
              : "Select a day"}
          </h2>

          {!selectedDateStr ? (
            <p className="mt-4 text-sm font-light text-foreground-soft">
              Choose a date on the calendar to view hires.
            </p>
          ) : dayBookings.length === 0 ? (
            <p className="mt-4 text-sm font-light text-foreground-soft">
              No products hired on this day yet.
            </p>
          ) : (
            <ul className="mt-5 space-y-3">
              {dayBookings.map((booking) => {
                const variant = bookingVariantLabel(booking);
                return (
                  <li
                    key={booking.id}
                    className="rounded-2xl bg-warm-white px-4 py-3"
                  >
                    <p className="font-serif text-lg font-light text-foreground">
                      {booking.itemName}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-wider text-sage">
                      {booking.categoryName} ·{" "}
                      {formatBookingStatus(booking.status)}
                    </p>
                    {variant ? (
                      <p className="mt-1 text-xs font-light text-foreground-soft">
                        {variant}
                      </p>
                    ) : null}
                    <p className="mt-2 text-sm text-foreground">
                      {booking.customerName ?? "No name"}
                      {booking.customerEmail
                        ? ` · ${booking.customerEmail}`
                        : ""}
                    </p>
                    {booking.notes ? (
                      <p className="mt-1 text-xs font-light text-foreground-soft">
                        Notes: {booking.notes}
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}

          {selectedDateStr ? (
            <p className="mt-4 text-xs font-light text-foreground-soft">
              {dayHireCount.get(selectedDateStr) ?? 0}{" "}
              {(dayHireCount.get(selectedDateStr) ?? 0) === 1
                ? "product"
                : "products"}{" "}
              hired
            </p>
          ) : null}
        </section>

        {selectedDateStr ? (
          <section className="rounded-3xl bg-cream p-5 shadow-luxury sm:p-6">
            <h2 className="font-serif text-xl font-light text-foreground">
              Add hire for this day
            </h2>
            <p className="mt-2 text-sm font-light text-foreground-soft">
              Manually add a product hire for{" "}
              {formatDisplayDate(selectedDateStr)}.
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
