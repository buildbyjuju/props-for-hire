import { and, eq, gte, inArray, lte } from "drizzle-orm";
import {
  addDays,
  eachDayOfInterval,
  format,
  parseISO,
  startOfDay,
} from "date-fns";
import { getItemById } from "@/lib/catalog";
import { requireDb } from "@/lib/db";
import { bookings, dateBlocks, items } from "@/lib/db/schema";
import {
  getBlockUnits,
  getRequestedUnits,
  getReservationUnits,
  itemUsesPerSizeInventory,
  itemUsesSetInventory,
  reservationAppliesToSize,
  type BookingReservation,
} from "@/lib/inventory";
import {
  PICKUP_DAYS_BEFORE_EVENT,
  RETURN_DAYS_AFTER_EVENT,
} from "@/lib/pricing";

/** Confirmed and paid bookings lock the calendar (event day + day before + day after) */
const CALENDAR_LOCK_STATUSES = ["paid", "pending_confirmation"] as const;

/** Pending checkout sessions also reserve dates so two people cannot pay for the same slot */
const CHECKOUT_RESERVATION_STATUSES = [
  "pending",
  "pending_confirmation",
  "paid",
] as const;

export type AvailabilityOptions = {
  includePendingReservations?: boolean;
  selectedSize?: string;
  selectedSets?: string;
};

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

function getUnavailableForSetInventory(
  from: Date,
  to: Date,
  reservations: BookingReservation[],
  manualBlocks: BookingReservation[],
  quantityAvailable: number,
  requestedSets: number,
  item: { setOptions?: string[] },
) {
  const unavailable: string[] = [];

  for (const day of eachDayOfInterval({ start: from, end: to })) {
    const eventStr = format(day, "yyyy-MM-dd");

    let usedUnits = reservations
      .filter((reservation) => eventWindowsOverlap(eventStr, reservation.eventDate))
      .reduce(
        (sum, reservation) =>
          sum + getReservationUnits(item, reservation.selectedSize, reservation.selectedSets),
        0,
      );

    usedUnits += manualBlocks
      .filter((block) => eventWindowsOverlap(eventStr, block.eventDate))
      .reduce(
        (sum, block) => sum + getBlockUnits(item, block, quantityAvailable),
        0,
      );

    if (usedUnits + requestedSets > quantityAvailable) {
      unavailable.push(eventStr);
    }
  }

  return unavailable;
}

function getUnavailableForSizedItem(
  from: Date,
  to: Date,
  reservations: BookingReservation[],
  manualBlocks: BookingReservation[],
  selectedSize: string,
  item: { sizes?: string[] },
) {
  const relevant = [...reservations, ...manualBlocks].filter((entry) =>
    reservationAppliesToSize(entry, selectedSize, item),
  );

  return getUnavailableEventDates(
    from,
    to,
    relevant.map((entry) => entry.eventDate),
    1,
  );
}

function getLockedForReservations(reservations: BookingReservation[]): string[] {
  const locked = new Set<string>();
  for (const reservation of reservations) {
    for (const day of getBlockedDaysForEvent(reservation.eventDate)) {
      locked.add(day);
    }
  }
  return Array.from(locked).sort();
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

async function getActiveBookingReservations(
  itemId: string,
  from: Date,
  to: Date,
  statuses: readonly (
    "pending" | "pending_confirmation" | "paid"
  )[] = CALENDAR_LOCK_STATUSES,
): Promise<BookingReservation[]> {
  const database = requireDb();
  const queryFrom = format(
    addDays(from, -RETURN_DAYS_AFTER_EVENT),
    "yyyy-MM-dd",
  );
  const queryTo = format(addDays(to, PICKUP_DAYS_BEFORE_EVENT), "yyyy-MM-dd");

  const rows = await database
    .select({
      eventDate: bookings.eventDate,
      selectedSize: bookings.selectedSize,
      selectedSets: bookings.selectedSets,
    })
    .from(bookings)
    .where(
      and(
        eq(bookings.itemId, itemId),
        inArray(bookings.status, [...statuses]),
        gte(bookings.eventDate, queryFrom),
        lte(bookings.eventDate, queryTo),
      ),
    );

  return rows.map((row) => ({
    eventDate:
      typeof row.eventDate === "string"
        ? row.eventDate
        : format(row.eventDate, "yyyy-MM-dd"),
    selectedSize: row.selectedSize,
    selectedSets: row.selectedSets,
  }));
}

async function getManualBlockReservations(
  itemId: string,
  from: Date,
  to: Date,
): Promise<BookingReservation[]> {
  const database = requireDb();
  const queryFrom = format(
    addDays(from, -RETURN_DAYS_AFTER_EVENT),
    "yyyy-MM-dd",
  );
  const queryTo = format(addDays(to, PICKUP_DAYS_BEFORE_EVENT), "yyyy-MM-dd");

  const rows = await database
    .select({
      eventDate: dateBlocks.eventDate,
      selectedSize: dateBlocks.selectedSize,
      selectedSets: dateBlocks.selectedSets,
    })
    .from(dateBlocks)
    .where(
      and(
        eq(dateBlocks.itemId, itemId),
        gte(dateBlocks.eventDate, queryFrom),
        lte(dateBlocks.eventDate, queryTo),
      ),
    );

  return rows.map((row) => ({
    eventDate:
      typeof row.eventDate === "string"
        ? row.eventDate
        : format(row.eventDate, "yyyy-MM-dd"),
    selectedSize: row.selectedSize,
    selectedSets: row.selectedSets,
  }));
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
  options?: AvailabilityOptions,
): Promise<ItemAvailability> {
  const database = requireDb();
  const catalogItem = await getItemById(itemId);

  const [item] = await database
    .select()
    .from(items)
    .where(eq(items.id, itemId))
    .limit(1);

  if (!item || !catalogItem) {
    return { unavailable: [], locked: [] };
  }

  const statuses = options?.includePendingReservations
    ? CHECKOUT_RESERVATION_STATUSES
    : CALENDAR_LOCK_STATUSES;

  const reservations = await getActiveBookingReservations(
    itemId,
    from,
    to,
    statuses,
  );
  const manualBlocks = await getManualBlockReservations(itemId, from, to);

  let unavailable: string[] = [];
  let lockedReservations = [...reservations, ...manualBlocks];

  if (itemUsesSetInventory(catalogItem) && options?.selectedSets) {
    const requestedSets = getRequestedUnits(
      catalogItem,
      options.selectedSize,
      options.selectedSets,
    );
    unavailable = getUnavailableForSetInventory(
      from,
      to,
      reservations,
      manualBlocks,
      item.quantityAvailable,
      requestedSets,
      catalogItem,
    );
  } else if (itemUsesPerSizeInventory(catalogItem) && options?.selectedSize) {
    unavailable = getUnavailableForSizedItem(
      from,
      to,
      reservations,
      manualBlocks,
      options.selectedSize,
      catalogItem,
    );
    lockedReservations = [...reservations, ...manualBlocks].filter((entry) =>
      reservationAppliesToSize(entry, options.selectedSize!, catalogItem),
    );
  } else {
    const fullBlockDates = manualBlocks
      .filter((block) => !block.selectedSize && !block.selectedSets)
      .map((block) => block.eventDate);
    const bookingEventDates = [
      ...reservations.map((reservation) => reservation.eventDate),
      ...fullBlockDates,
    ];
    unavailable = getUnavailableEventDates(
      from,
      to,
      bookingEventDates,
      item.quantityAvailable,
    );
    lockedReservations = [
      ...reservations,
      ...manualBlocks.filter((block) => !block.selectedSize && !block.selectedSets),
    ];
  }

  const locked = getLockedForReservations(lockedReservations);

  return {
    unavailable,
    locked: [...new Set(locked)].sort(),
  };
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
  options?: Pick<AvailabilityOptions, "selectedSize" | "selectedSets">,
): Promise<boolean> {
  const date = parseISO(dateStr);
  const catalogItem = await getItemById(itemId);

  if (catalogItem && itemUsesPerSizeInventory(catalogItem) && !options?.selectedSize) {
    return false;
  }

  if (catalogItem && itemUsesSetInventory(catalogItem) && !options?.selectedSets) {
    return false;
  }

  const { unavailable } = await getItemAvailability(itemId, date, date, {
    includePendingReservations: true,
    selectedSize: options?.selectedSize,
    selectedSets: options?.selectedSets,
  });
  return !unavailable.includes(dateStr);
}

export function dateToKey(date: Date): string {
  return format(startOfDay(date), "yyyy-MM-dd");
}

export function allDatesInRange(from: Date, to: Date): string[] {
  return eachDayOfInterval({ start: from, end: to }).map(dateToKey);
}
