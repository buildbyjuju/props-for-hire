"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AdminCategory, AdminItem } from "@/components/admin/admin-types";
import { toast } from "sonner";

export function AdminBookingForm({
  categories,
  defaultDate = "",
  lockDate = false,
  onCreated,
}: {
  categories: AdminCategory[];
  defaultDate?: string;
  lockDate?: boolean;
  onCreated: () => void;
}) {
  const [itemId, setItemId] = useState("");
  const [eventDate, setEventDate] = useState(defaultDate);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedSets, setSelectedSets] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId,
          eventDate,
          customerName,
          customerEmail,
          notes,
          selectedSize: selectedSize || undefined,
          selectedSets: selectedSets || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not create booking");
        return;
      }

      toast.success("Hire added");
      setCustomerName("");
      setCustomerEmail("");
      setSelectedSize("");
      setSelectedSets("");
      setNotes("");
      if (!lockDate) {
        setEventDate("");
      }
      onCreated();
    } catch {
      toast.error("Could not create booking");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="hire-item">Item</Label>
        <select
          id="hire-item"
          value={itemId}
          onChange={(e) => {
            setItemId(e.target.value);
            setSelectedSize("");
            setSelectedSets("");
          }}
          required
          className="flex h-11 w-full rounded-2xl border border-sage/30 bg-warm-white px-3 text-sm font-light text-foreground"
        >
          <option value="">Select an item</option>
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
        <Label htmlFor="hire-date">Event date</Label>
        <Input
          id="hire-date"
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          required
          disabled={lockDate}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="hire-name">Customer name</Label>
        <Input
          id="hire-name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="hire-email">Customer email</Label>
        <Input
          id="hire-email"
          type="email"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
        />
      </div>

      {hasSizes ? (
        <div className="space-y-2">
          <Label htmlFor="hire-size">Size / option</Label>
          <select
            id="hire-size"
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="flex h-11 w-full rounded-2xl border border-sage/30 bg-warm-white px-3 text-sm font-light text-foreground"
          >
            <option value="">None</option>
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
          <Label htmlFor="hire-sets">Sets</Label>
          <select
            id="hire-sets"
            value={selectedSets}
            onChange={(e) => setSelectedSets(e.target.value)}
            className="flex h-11 w-full rounded-2xl border border-sage/30 bg-warm-white px-3 text-sm font-light text-foreground"
          >
            <option value="">None</option>
            {selectedItem?.setOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="hire-notes">Notes</Label>
        <Textarea
          id="hire-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      <div className="sm:col-span-2">
        <Button type="submit" disabled={submitting || allItems.length === 0}>
          {submitting ? "Adding..." : "Add hire for this day"}
        </Button>
      </div>
    </form>
  );
}
