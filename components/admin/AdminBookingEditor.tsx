"use client";

import { useMemo, useState } from "react";
import {
  HIRED_FROM_OPTIONS,
  type AdminBooking,
  type AdminCategory,
  type AdminItem,
  type HiredFrom,
} from "@/components/admin/admin-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  { value: "paid", label: "Paid" },
  { value: "pending_confirmation", label: "Pending confirmation" },
  { value: "pending", label: "Pending" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export function AdminBookingEditor({
  booking,
  categories,
  onCancel,
  onSaved,
}: {
  booking: AdminBooking;
  categories: AdminCategory[];
  onCancel: () => void;
  onSaved: (eventDate: string) => void;
}) {
  const [itemId, setItemId] = useState(booking.itemId);
  const [eventDate, setEventDate] = useState(booking.eventDate);
  const [customerName, setCustomerName] = useState(booking.customerName ?? "");
  const [customerEmail, setCustomerEmail] = useState(
    booking.customerEmail ?? "",
  );
  const [selectedSize, setSelectedSize] = useState(booking.selectedSize ?? "");
  const [selectedSets, setSelectedSets] = useState(booking.selectedSets ?? "");
  const [hiredFrom, setHiredFrom] = useState<HiredFrom | "">(
    booking.hiredFrom === "Hoda" || booking.hiredFrom === "Jojo"
      ? booking.hiredFrom
      : "",
  );
  const [notes, setNotes] = useState(booking.notes ?? "");
  const [status, setStatus] = useState(booking.status);
  const [saving, setSaving] = useState(false);

  const allItems = useMemo(
    () => categories.flatMap((category) => category.items),
    [categories],
  );

  const selectedItem = useMemo(
    () => allItems.find((item) => item.id === itemId) ?? null,
    [allItems, itemId],
  );

  const hasSizes = Boolean(selectedItem?.sizes.length);
  const hasSets = Boolean(selectedItem?.setOptions.length);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    if (!itemId || !eventDate || !customerName.trim()) {
      toast.error("Item, event date, and customer name are required");
      return;
    }
    if (!hiredFrom) {
      toast.error("Choose Hoda or Jojo");
      return;
    }
    if (hasSizes && !selectedSize) {
      toast.error("Choose a size / option");
      return;
    }
    if (hasSets && !selectedSets) {
      toast.error("Choose sets");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId,
          eventDate,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim() || null,
          selectedSize: hasSizes ? selectedSize : null,
          selectedSets: hasSets ? selectedSets : null,
          hiredFrom,
          notes: notes.trim() || null,
          status,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not update hire");
        return;
      }
      toast.success("Hire updated");
      onSaved(eventDate);
    } catch {
      toast.error("Could not update hire");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={(e) => void handleSave(e)}
      className="mt-3 grid gap-4 border-t border-sage/15 pt-3 sm:grid-cols-2"
    >
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={`edit-item-${booking.id}`}>Item</Label>
        <select
          id={`edit-item-${booking.id}`}
          value={itemId}
          onChange={(e) => {
            setItemId(e.target.value);
            setSelectedSize("");
            setSelectedSets("");
          }}
          required
          className="flex h-11 w-full rounded-2xl border border-sage/30 bg-cream px-3 text-sm font-light text-foreground"
        >
          {categories.map((category) => (
            <optgroup key={category.id} label={category.name}>
              {category.items.map((item: AdminItem) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`edit-date-${booking.id}`}>Event date</Label>
        <Input
          id={`edit-date-${booking.id}`}
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`edit-status-${booking.id}`}>Status</Label>
        <select
          id={`edit-status-${booking.id}`}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="flex h-11 w-full rounded-2xl border border-sage/30 bg-cream px-3 text-sm font-light text-foreground"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`edit-name-${booking.id}`}>Customer name</Label>
        <Input
          id={`edit-name-${booking.id}`}
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`edit-email-${booking.id}`}>Customer email</Label>
        <Input
          id={`edit-email-${booking.id}`}
          type="email"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
        />
      </div>

      {hasSizes ? (
        <div className="space-y-2">
          <Label htmlFor={`edit-size-${booking.id}`}>Size / option</Label>
          <select
            id={`edit-size-${booking.id}`}
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            required
            className="flex h-11 w-full rounded-2xl border border-sage/30 bg-cream px-3 text-sm font-light text-foreground"
          >
            <option value="">Select an option</option>
            {selectedItem?.sizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {hasSets ? (
        <div className="space-y-2">
          <Label htmlFor={`edit-sets-${booking.id}`}>Sets</Label>
          <select
            id={`edit-sets-${booking.id}`}
            value={selectedSets}
            onChange={(e) => setSelectedSets(e.target.value)}
            required
            className="flex h-11 w-full rounded-2xl border border-sage/30 bg-cream px-3 text-sm font-light text-foreground"
          >
            <option value="">Select sets</option>
            {selectedItem?.setOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="space-y-2 sm:col-span-2">
        <Label>Hired from</Label>
        <div className="grid grid-cols-2 gap-2">
          {HIRED_FROM_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setHiredFrom(option)}
              className={cn(
                "h-11 rounded-2xl border text-sm",
                hiredFrom === option
                  ? "border-sage bg-sage/20 font-medium text-foreground"
                  : "border-sage/30 bg-cream font-light text-foreground-soft",
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={`edit-notes-${booking.id}`}>Notes</Label>
        <Textarea
          id={`edit-notes-${booking.id}`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex flex-wrap gap-2 sm:col-span-2">
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={saving}
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
