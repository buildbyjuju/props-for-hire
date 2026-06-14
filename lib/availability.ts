import { and, eq, gte, inArray, lte } from "drizzle-orm";
import {
  addDays,
  eachDayOfInterval,
  format,
  parseISO,
  startOfDay,
} from "date-fns";
import { requireDb } from "@/lib/db";
import { bookings, items } from "@/lib/db/schema";
import {
  PICKUP_DAYS_BEFORE_EVENT,
  RETURN_DAYS_AFTER_EVENT,
} from "@/lib/pricing";

/** Paid bookings lock the calendar (event day + day before + day after) for that item only */
const CALENDAR_LOCK_STATUSES = ["paid"] as const;

/** Pending checkout sessions also reserve dates so two people cannot pay for the same slot */
const CHECKOUT_RESERVATION_STATUSES = ["pending", "paid"] as const;

/** Pickup, event, and return days for a booking on this event date */
export function getBlockedDaysForEvent(eventDateStr: string): string[] {
  const event = parseISO(eventDateStr);
  const days: string[] = [];
  for (
    let offset = -PICKUP_DAYS_BEFORE_EVENT;
    offset <= RETURN_DAYS_AFTER_EVENT;
    offset++
  ) {
    days.push(format(addDays(event, offset), "yyyy-MM-dd"));
  }
  return days;
}

/** True when two event dates would share pickup, event, or return days */
export function eventWindowsOverlap(
  candidateEvent: string,
  existingEvent: string,
): boolean {
  const candidateDays = new Set(getBlockedDaysForEvent(candidateEvent));
  return getBlockedDaysForEvent(existingEvent).some((day) =>
    candidateDays.has(day),
  );
}

export function getUnavailableEventDates(
  from: Date,
  to: Date,
  existingEventDates: string[],
  quantityAvailable: number,
): string[] {
  const unavailable: string[] = [];

  for (const day of eachDayOfInterval({ start: from, end: to })) {
    const eventStr = format(day, "yyyy-MM-dd");
    const overlapCount = existingEventDates.filter((existing) =>
      eventWindowsOverlap(eventStr, existing),
    ).length;
    if (overlapCount >= quantityAvailable) {
      unavailable.push(eventStr);
    }
  }

  return unavailable;
}

/** All calendar days locked by existing bookings (day before, event, day after) */
export function getLockedCalendarDates(existingEventDates: string[]): string[] {
  const locked = new Set<string>();
  for (const eventDate of existingEventDates) {
    for (const day of getBlockedDaysForEvent(eventDate)) {
      locked.add(day);
    }
  }
  return Array.from(locked).sort();
}

async function getActiveBookingEventDates(
  itemId: string,
  from: Date,
  to: Date,
  statuses: readonly ("pending" | "paid")[] = CALENDAR_LOCK_STATUSES,
): Promise<string[]> {
  const database = requireDb();
  const queryFrom = format(
    addDays(from, -RETURN_DAYS_AFTER_EVENT),
    "yyyy-MM-dd",
  );
  const queryTo = format(addDays(to, PICKUP_DAYS_BEFORE_EVENT), "yyyy-MM-dd");

  const rows = await database
    .select({ eventDate: bookings.eventDate })
    .from(bookings)
    .where(
      and(
        eq(bookings.itemId, itemId),
        inArray(bookings.status, [...statuses]),
        gte(bookings.eventDate, queryFrom),
        lte(bookings.eventDate, queryTo),
      ),
    );

  return rows.map((row) =>
    typeof row.eventDate === "string"
      ? row.eventDate
      : format(row.eventDate, "yyyy-MM-dd"),
  );
}

export type ItemAvailability = {
  /** Event dates that cannot be selected */
  unavailable: string[];
  /** Calendar days blocked by existing bookings (pickup, event, return) */
  locked: string[];
};

export async function getItemAvailability(
  itemId: string,
  from: Date,
  to: Date,
  options?: { includePendingReservations?: boolean },
): Promise<ItemAvailability> {
  const database = requireDb();

  const [item] = await database
    .select()
    .from(items)
    .where(eq(items.id, itemId))
    .limit(1);

  if (!item) {
    return { unavailable: [], locked: [] };
  }

  const statuses = options?.includePendingReservations
    ? CHECKOUT_RESERVATION_STATUSES
    : CALENDAR_LOCK_STATUSES;

  const existingEventDates = await getActiveBookingEventDates(
    itemId,
    from,
    to,
    statuses,
  );
  const locked = getLockedCalendarDates(existingEventDates);
  const unavailable = getUnavailableEventDates(
    from,
    to,
    existingEventDates,
    item.quantityAvailable,
  );

  return { unavailable, locked };
}

/** @deprecated Use getItemAvailability */
export async function getUnavailableDates(
  itemId: string,
  from: Date,
  to: Date,
): Promise<string[]> {
  const { unavailable } = await getItemAvailability(itemId, from, to);
  return unavailable;
}

export async function isDateAvailable(
  itemId: string,
  dateStr: string,
): Promise<boolean> {
  const date = parseISO(dateStr);
  const { unavailable } = await getItemAvailability(itemId, date, date, {
    includePendingReservations: true,
  });
  return !unavailable.includes(dateStr);
}

export function dateToKey(date: Date): string {
  return format(startOfDay(date), "yyyy-MM-dd");
}

export function allDatesInRange(from: Date, to: Date): string[] {
  return eachDayOfInterval({ start: from, end: to }).map(dateToKey);
}
