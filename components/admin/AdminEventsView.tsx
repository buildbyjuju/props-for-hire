"use client";

import { useCallback, useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { AdminEventHirePicker } from "@/components/admin/AdminEventHirePicker";
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
      setSelectedEvent({
        ...(data.event as AdminEventSummary),
        hireCount: (data.hires as EventHire[]).length,
      });
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

  async function openEvent(event: AdminEventSummary) {
    setSelectedEvent(event);
    setHires([]);
    await loadEventDetail(event.id);
  }

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

      const created = data.event as AdminEventSummary;
      toast.success("Event created — hire items below");
      setTitle("");
      setEventDate("");
      setLocation("");
      setDescription("");
      setSelectedEvent(created);
      setHires([]);
      await loadEvents();
      await loadEventDetail(created.id);
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
    setSelectedEvent(null);
    setHires([]);
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
      toast.error("Could not remove hire");
      return;
    }

    toast.success("Hire removed and dates unlocked");
    if (selectedEvent) {
      await loadEventDetail(selectedEvent.id);
    }
    await loadEvents();
    onHiresChanged();
  }

  if (selectedEvent) {
    const window = getHireWindow(selectedEvent.eventDate);

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedEvent(null);
              setHires([]);
            }}
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

        <section className="rounded-3xl border-2 border-sage/40 bg-cream p-5 shadow-luxury sm:p-6">
          <h3 className="font-serif text-xl font-light text-foreground">
            Select items to hire
          </h3>
          <p className="mt-2 text-sm font-light text-foreground-soft">
            Select the products you need for this event. Once hired, they lock
            on the public website and show on the admin calendar as this event.
          </p>
          <div className="mt-5">
            <AdminEventHirePicker
              key={selectedEvent.id}
              categories={categories}
              adminEventId={selectedEvent.id}
              eventTitle={selectedEvent.title}
              onHired={() => {
                void loadEventDetail(selectedEvent.id);
                void loadEvents();
                onHiresChanged();
              }}
            />
          </div>
        </section>

        <section className="rounded-3xl bg-cream p-5 shadow-luxury sm:p-6">
          <h3 className="font-serif text-xl font-light text-foreground">
            Hired items ({hires.length})
          </h3>
          {detailLoading ? (
            <p className="mt-4 text-sm font-light text-foreground-soft">
              Loading hired items...
            </p>
          ) : hires.length === 0 ? (
            <p className="mt-4 text-sm font-light text-foreground-soft">
              No items hired yet. Use the form above to add products.
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
          Add an event with date, location, and description. After creating, you
          can hire website products for it.
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
              {creating ? "Creating..." : "Create event & hire items"}
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-3xl bg-cream p-5 shadow-luxury sm:p-6">
        <h2 className="font-serif text-xl font-light text-foreground">
          Your events
        </h2>
        <p className="mt-2 text-sm font-light text-foreground-soft">
          Open an event to hire products for it.
        </p>
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
                  onClick={() => void openEvent(event)}
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
                    {event.hireCount === 1 ? "item hired" : "items hired"} ·
                    Open to hire →
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
