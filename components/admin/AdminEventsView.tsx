"use client";

import { useCallback, useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { AdminBookingForm } from "@/components/admin/AdminBookingForm";
import {
  bookingVariantLabel,
  formatBookingStatus,
  type AdminBooking,
  type AdminCategory,
} from "@/components/admin/admin-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getHireWindow } from "@/lib/pricing";
import { toast } from "sonner";

export type AdminEventSummary = {
  id: string;
  title: string;
  eventDate: string;
  location: string;
  description: string;
  hireCount: number;
  createdAt: string;
};

type EventHire = Pick<
  AdminBooking,
  | "id"
  | "itemId"
  | "itemName"
  | "categoryName"
  | "eventDate"
  | "status"
  | "customerName"
  | "customerEmail"
  | "selectedSize"
  | "selectedSets"
  | "notes"
  | "createdAt"
>;

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

export function AdminEventsView({
  categories,
  onHiresChanged,
}: {
  categories: AdminCategory[];
  onHiresChanged: () => void;
}) {
  const [events, setEvents] = useState<AdminEventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<AdminEventSummary | null>(
    null,
  );
  const [hires, setHires] = useState<EventHire[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/events");
      if (!res.ok) throw new Error("Failed to load events");
      const data = await res.json();
      setEvents(data.events as AdminEventSummary[]);
    } catch {
      toast.error("Could not load events");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadEventDetail = useCallback(async (eventId: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/events/${eventId}`);
      if (!res.ok) throw new Error("Failed to load event");
      const data = await res.json();
      setSelectedEvent(data.event as AdminEventSummary);
      setHires(data.hires as EventHire[]);
    } catch {
      toast.error("Could not load event details");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadEvents();
    });
  }, [loadEvents]);

  useEffect(() => {
    if (!selectedEventId) {
      setSelectedEvent(null);
      setHires([]);
      return;
    }
    void loadEventDetail(selectedEventId);
  }, [selectedEventId, loadEventDetail]);

  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, eventDate, location, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not create event");
        return;
      }
      toast.success("Event created");
      setTitle("");
      setEventDate("");
      setLocation("");
      setDescription("");
      await loadEvents();
      setSelectedEventId(data.event.id as string);
    } catch {
      toast.error("Could not create event");
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteEvent(eventId: string) {
    if (
      !window.confirm(
        "Delete this event? Linked item hires will be cancelled and unlocked.",
      )
    ) {
      return;
    }

    const res = await fetch(`/api/admin/events/${eventId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      toast.error("Could not delete event");
      return;
    }

    toast.success("Event deleted");
    if (selectedEventId === eventId) {
      setSelectedEventId(null);
    }
    await loadEvents();
    onHiresChanged();
  }

  async function handleRemoveHire(hireId: string) {
    const res = await fetch(`/api/admin/bookings/${hireId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    });

    if (!res.ok) {
      // Fall back: try notes-only route may reject status — use dedicated cancel if needed
      toast.error("Could not remove hire. Updating booking status...");
      return;
    }

    toast.success("Hire removed and dates unlocked");
    if (selectedEventId) {
      await loadEventDetail(selectedEventId);
    }
    await loadEvents();
    onHiresChanged();
  }

  if (selectedEventId && selectedEvent) {
    const window = getHireWindow(selectedEvent.eventDate);

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSelectedEventId(null)}
          >
            ← All events
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleDeleteEvent(selectedEvent.id)}
          >
            Delete event
          </Button>
        </div>

        <section className="rounded-3xl bg-cream p-5 shadow-luxury sm:p-6">
          <p className="text-xs uppercase tracking-[0.14em] text-sage">Event</p>
          <h2 className="mt-2 font-serif text-2xl font-light text-foreground">
            {selectedEvent.title}
          </h2>
          <p className="mt-2 text-sm font-light text-foreground-soft">
            {formatDisplayDate(selectedEvent.eventDate)}
          </p>
          <p className="mt-1 text-sm text-foreground">{selectedEvent.location}</p>
          {selectedEvent.description ? (
            <p className="mt-3 text-sm font-light leading-relaxed text-foreground-soft">
              {selectedEvent.description}
            </p>
          ) : null}
          <p className="mt-4 text-xs font-light text-foreground-soft">
            Hire lock window: {formatShortDate(window.pickupDate)} →{" "}
            {formatShortDate(window.eventDate)} →{" "}
            {formatShortDate(window.returnDate)} (public + admin calendar)
          </p>
        </section>

        <section className="rounded-3xl bg-cream p-5 shadow-luxury sm:p-6">
          <h3 className="font-serif text-xl font-light text-foreground">
            Hired items for this event
          </h3>
          {detailLoading ? (
            <p className="mt-4 text-sm font-light text-foreground-soft">
              Loading...
            </p>
          ) : hires.length === 0 ? (
            <p className="mt-4 text-sm font-light text-foreground-soft">
              No items hired for this event yet.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {hires.map((hire) => {
                const variant = bookingVariantLabel(hire as AdminBooking);
                return (
                  <li
                    key={hire.id}
                    className="flex flex-col gap-3 rounded-2xl bg-warm-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-serif text-lg font-light text-foreground">
                        {hire.itemName}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-wider text-sage">
                        {hire.categoryName} · {formatBookingStatus(hire.status)}
                      </p>
                      {variant ? (
                        <p className="mt-1 text-xs font-light text-foreground-soft">
                          {variant}
                        </p>
                      ) : null}
                      {hire.notes ? (
                        <p className="mt-1 text-xs font-light text-foreground-soft">
                          Notes: {hire.notes}
                        </p>
                      ) : null}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveHire(hire.id)}
                    >
                      Remove hire
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-3xl bg-cream p-5 shadow-luxury sm:p-6">
          <h3 className="font-serif text-xl font-light text-foreground">
            Hire an item for this event
          </h3>
          <p className="mt-2 text-sm font-light text-foreground-soft">
            Choose any item from the website catalogue. It will lock the day
            before, event day, and day after on the public website and admin
            calendar.
          </p>
          <div className="mt-5">
            <AdminBookingForm
              key={selectedEvent.id}
              categories={categories}
              adminEventId={selectedEvent.id}
              defaultDate={selectedEvent.eventDate}
              defaultCustomerName={`Event — ${selectedEvent.title}`}
              submitLabel="Hire item for this event"
              onCreated={() => {
                void loadEventDetail(selectedEvent.id);
                void loadEvents();
                onHiresChanged();
              }}
            />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-cream p-5 shadow-luxury sm:p-6">
        <h2 className="font-serif text-xl font-light text-foreground">
          Create event
        </h2>
        <p className="mt-2 text-sm font-light text-foreground-soft">
          Add an event with date, location, and description. Then hire website
          items for it.
        </p>
        <form
          onSubmit={handleCreateEvent}
          className="mt-5 grid gap-4 sm:grid-cols-2"
        >
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="event-title">Event title</Label>
            <Input
              id="event-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Sara’s bridal shower"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-date">Event date</Label>
            <Input
              id="event-date"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-location">Location</Label>
            <Input
              id="event-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              placeholder="Address or venue"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="event-description">Description</Label>
            <Textarea
              id="event-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Theme, guest count, notes..."
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={creating}>
              {creating ? "Creating..." : "Create event"}
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-3xl bg-cream p-5 shadow-luxury sm:p-6">
        <h2 className="font-serif text-xl font-light text-foreground">
          Your events
        </h2>
        {loading ? (
          <p className="mt-4 text-sm font-light text-foreground-soft">
            Loading...
          </p>
        ) : events.length === 0 ? (
          <p className="mt-4 text-sm font-light text-foreground-soft">
            No events yet. Create one above.
          </p>
        ) : (
          <ul className="mt-5 space-y-3">
            {events.map((event) => (
              <li key={event.id}>
                <button
                  type="button"
                  onClick={() => setSelectedEventId(event.id)}
                  className="flex w-full flex-col rounded-2xl bg-warm-white px-4 py-4 text-left transition hover:bg-sage/10 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-serif text-lg font-light text-foreground">
                      {event.title}
                    </p>
                    <p className="mt-1 text-sm font-light text-foreground-soft">
                      {formatDisplayDate(event.eventDate)} · {event.location}
                    </p>
                  </div>
                  <p className="mt-2 text-xs uppercase tracking-wider text-sage sm:mt-0">
                    {event.hireCount}{" "}
                    {event.hireCount === 1 ? "item hired" : "items hired"} →
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
