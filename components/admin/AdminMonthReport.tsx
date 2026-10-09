"use client";

import { useMemo } from "react";
import { endOfMonth, format, startOfMonth } from "date-fns";
import type { AdminBooking } from "@/components/admin/admin-types";
import { bookingHirePriceCents } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";

type ItemReportRow = {
  itemId: string;
  itemName: string;
  hireCount: number;
  revenueCents: number;
};

export function AdminMonthReport({
  month,
  bookings,
}: {
  month: Date;
  bookings: AdminBooking[];
}) {
  const monthLabel = format(month, "MMMM yyyy");
  const monthStart = format(startOfMonth(month), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(month), "yyyy-MM-dd");

  const { rows, totalRevenueCents, totalHires, hodaCents, jojoCents, otherCents } =
    useMemo(() => {
      const paid = bookings.filter(
        (booking) =>
          booking.status === "paid" &&
          booking.eventDate >= monthStart &&
          booking.eventDate <= monthEnd,
      );

      const byItem = new Map<string, ItemReportRow>();
      let hoda = 0;
      let jojo = 0;
      let other = 0;

      for (const booking of paid) {
        const revenue = bookingHirePriceCents(booking);
        const existing = byItem.get(booking.itemId);
        if (existing) {
          existing.hireCount += 1;
          existing.revenueCents += revenue;
        } else {
          byItem.set(booking.itemId, {
            itemId: booking.itemId,
            itemName: booking.itemName,
            hireCount: 1,
            revenueCents: revenue,
          });
        }

        if (booking.hiredFrom === "Hoda") {
          hoda += revenue;
        } else if (booking.hiredFrom === "Jojo") {
          jojo += revenue;
        } else {
          other += revenue;
        }
      }

      const sorted = Array.from(byItem.values()).sort(
        (a, b) =>
          b.revenueCents - a.revenueCents ||
          b.hireCount - a.hireCount ||
          a.itemName.localeCompare(b.itemName),
      );

      return {
        rows: sorted,
        totalRevenueCents: sorted.reduce(
          (sum, row) => sum + row.revenueCents,
          0,
        ),
        totalHires: paid.length,
        hodaCents: hoda,
        jojoCents: jojo,
        otherCents: other,
      };
    }, [bookings, monthEnd, monthStart]);

  return (
    <section className="rounded-3xl bg-cream p-5 shadow-luxury sm:p-6">
      <h2 className="font-serif text-xl font-light text-foreground">
        Monthly hire report — {monthLabel}
      </h2>
      <p className="mt-2 text-sm font-light text-foreground-soft">
        Paid hires with an event date in this month. Only items that were hired
        are listed. Totals are hire fees (bonds and delivery not included).
      </p>

      {rows.length === 0 ? (
        <p className="mt-5 text-sm font-light text-foreground-soft">
          No paid hires in {monthLabel}.
        </p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-sage/20 text-xs uppercase tracking-[0.12em] text-foreground-soft">
                <th className="pb-3 pr-4 font-light">Item</th>
                <th className="pb-3 pr-4 font-light">Times hired</th>
                <th className="pb-3 font-light">Money made</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.itemId}
                  className="border-b border-sage/10 last:border-0"
                >
                  <td className="py-3 pr-4 font-serif text-base font-light text-foreground">
                    {row.itemName}
                  </td>
                  <td className="py-3 pr-4 font-light text-foreground">
                    {row.hireCount}
                  </td>
                  <td className="py-3 font-light text-foreground">
                    {formatPrice(row.revenueCents)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="pt-4 pr-4 font-serif text-lg font-light text-foreground">
                  Total
                </td>
                <td className="pt-4 pr-4 text-sm font-medium text-foreground">
                  {totalHires}
                </td>
                <td className="pt-4 text-sm font-medium text-foreground">
                  {formatPrice(totalRevenueCents)}
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="mt-5 grid gap-3 border-t border-sage/20 pt-5 sm:grid-cols-2">
            <div className="rounded-2xl bg-warm-white px-4 py-3">
              <p className="text-xs uppercase tracking-[0.14em] text-foreground-soft">
                Hoda
              </p>
              <p className="mt-1 font-serif text-2xl font-light text-foreground">
                {formatPrice(hodaCents)}
              </p>
            </div>
            <div className="rounded-2xl bg-warm-white px-4 py-3">
              <p className="text-xs uppercase tracking-[0.14em] text-foreground-soft">
                Jojo
              </p>
              <p className="mt-1 font-serif text-2xl font-light text-foreground">
                {formatPrice(jojoCents)}
              </p>
            </div>
            {otherCents > 0 ? (
              <div className="rounded-2xl bg-warm-white px-4 py-3 sm:col-span-2">
                <p className="text-xs uppercase tracking-[0.14em] text-foreground-soft">
                  Unassigned (no Hoda / Jojo)
                </p>
                <p className="mt-1 font-serif text-xl font-light text-foreground">
                  {formatPrice(otherCents)}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}
