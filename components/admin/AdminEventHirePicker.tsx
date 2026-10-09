"use client";

import { useMemo, useState } from "react";
import {
  HIRED_FROM_OPTIONS,
  type AdminCategory,
  type AdminItem,
  type HiredFrom,
} from "@/components/admin/admin-types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type PendingSelection = {
  item: AdminItem;
  categoryName: string;
  selectedSize: string;
  selectedSets: string;
};

export function AdminEventHirePicker({
  categories,
  adminEventId,
  eventTitle,
  onHired,
}: {
  categories: AdminCategory[];
  adminEventId: string;
  eventTitle: string;
  onHired: () => void;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [variants, setVariants] = useState<
    Record<string, { selectedSize: string; selectedSets: string }>
  >({});
  const [hiredFrom, setHiredFrom] = useState<HiredFrom | "">("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const allItems = useMemo(
    () =>
      categories.flatMap((category) =>
        category.items.map((item) => ({
          item,
          categoryName: category.name,
        })),
      ),
    [categories],
  );

  const selections: PendingSelection[] = useMemo(
    () =>
      allItems
        .filter(({ item }) => selectedIds.has(item.id))
        .map(({ item, categoryName }) => ({
          item,
          categoryName,
          selectedSize: variants[item.id]?.selectedSize ?? "",
          selectedSets: variants[item.id]?.selectedSets ?? "",
        })),
    [allItems, selectedIds, variants],
  );

  function toggleItem(itemId: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }

  function updateVariant(
    itemId: string,
    patch: Partial<{ selectedSize: string; selectedSets: string }>,
  ) {
    setVariants((current) => ({
      ...current,
      [itemId]: {
        selectedSize: current[itemId]?.selectedSize ?? "",
        selectedSets: current[itemId]?.selectedSets ?? "",
        ...patch,
      },
    }));
  }

  async function handleHireSelected() {
    if (selections.length === 0) {
      toast.error("Select at least one item");
      return;
    }
    if (!hiredFrom) {
      toast.error("Choose Hoda or Jojo");
      return;
    }

    for (const selection of selections) {
      if (selection.item.sizes.length > 0 && !selection.selectedSize) {
        toast.error(`Choose a size/option for ${selection.item.name}`);
        return;
      }
      if (selection.item.setOptions.length > 0 && !selection.selectedSets) {
        toast.error(`Choose sets for ${selection.item.name}`);
        return;
      }
    }

    setSubmitting(true);
    let successCount = 0;
    const errors: string[] = [];

    try {
      for (const selection of selections) {
        const res = await fetch("/api/admin/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemId: selection.item.id,
            adminEventId,
            customerName: `Event — ${eventTitle}`,
            notes: notes.trim() || undefined,
            selectedSize: selection.selectedSize || undefined,
            selectedSets: selection.selectedSets || undefined,
            hiredFrom,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          errors.push(
            `${selection.item.name}: ${data.error ?? "could not hire"}`,
          );
        } else {
          successCount += 1;
        }
      }

      if (successCount > 0) {
        toast.success(
          `${successCount} item${successCount === 1 ? "" : "s"} hired — locked on public website and calendar`,
        );
        setSelectedIds(new Set());
        setVariants({});
        setHiredFrom("");
        setNotes("");
        onHired();
      }

      if (errors.length > 0) {
        toast.error(errors.slice(0, 3).join(" · "));
      }
    } catch {
      toast.error("Could not hire selected items");
    } finally {
      setSubmitting(false);
    }
  }

  if (categories.length === 0 || allItems.length === 0) {
    return (
      <p className="text-sm font-light text-foreground-soft">
        No catalogue items available. Check that the shop database is seeded.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.14em] text-foreground-soft">
          Select an item
        </p>
        <p className="mt-1 text-sm font-light text-foreground-soft">
          Choose one or more products from the website. Selected items will be
          hired for this event and locked on the public website and admin
          calendar.
        </p>
      </div>

      <div className="space-y-5">
        {categories.map((category) =>
          category.items.length === 0 ? null : (
            <div key={category.id}>
              <h4 className="mb-3 font-serif text-lg font-light text-foreground">
                {category.name}
              </h4>
              <ul className="space-y-2">
                {category.items.map((item) => {
                  const checked = selectedIds.has(item.id);
                  const hasSizes = item.sizes.length > 0;
                  const hasSets = item.setOptions.length > 0;

                  return (
                    <li
                      key={item.id}
                      className={cn(
                        "rounded-2xl border px-4 py-3 transition-colors",
                        checked
                          ? "border-sage bg-sage/10"
                          : "border-sage/20 bg-warm-white",
                      )}
                    >
                      <label className="flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleItem(item.id)}
                          className="mt-1 h-4 w-4 accent-[var(--sage)]"
                        />
                        <span className="flex-1">
                          <span className="block text-sm text-foreground">
                            {item.name}
                          </span>
                          <span className="mt-0.5 block text-xs font-light text-foreground-soft">
                            Select to hire for this event
                          </span>
                        </span>
                      </label>

                      {checked && (hasSizes || hasSets) ? (
                        <div className="mt-3 grid gap-3 border-t border-sage/15 pt-3 sm:grid-cols-2">
                          {hasSizes ? (
                            <div className="space-y-2">
                              <Label htmlFor={`size-${item.id}`}>
                                Select size / option
                              </Label>
                              <select
                                id={`size-${item.id}`}
                                value={variants[item.id]?.selectedSize ?? ""}
                                onChange={(e) =>
                                  updateVariant(item.id, {
                                    selectedSize: e.target.value,
                                  })
                                }
                                required
                                className="flex h-11 w-full rounded-2xl border border-sage/30 bg-warm-white px-3 text-sm font-light text-foreground"
                              >
                                <option value="">Select an option</option>
                                {item.sizes.map((size) => (
                                  <option key={size} value={size}>
                                    {size}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : null}
                          {hasSets ? (
                            <div className="space-y-2">
                              <Label htmlFor={`sets-${item.id}`}>
                                Select sets
                              </Label>
                              <select
                                id={`sets-${item.id}`}
                                value={variants[item.id]?.selectedSets ?? ""}
                                onChange={(e) =>
                                  updateVariant(item.id, {
                                    selectedSets: e.target.value,
                                  })
                                }
                                required
                                className="flex h-11 w-full rounded-2xl border border-sage/30 bg-warm-white px-3 text-sm font-light text-foreground"
                              >
                                <option value="">Select sets</option>
                                {item.setOptions.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          ),
        )}
      </div>

      <div className="space-y-2">
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
                  : "border-sage/30 bg-warm-white font-light text-foreground-soft",
              )}
            >
              {option}
            </button>
          ))}
        </div>
        <p className="text-xs font-light text-foreground-soft">
          Choose which end this hire came from
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="event-hire-notes">Notes (optional)</Label>
        <Textarea
          id="event-hire-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Shared notes for the selected hires"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-light text-foreground-soft">
          {selections.length} item{selections.length === 1 ? "" : "s"} selected
        </p>
        <Button
          type="button"
          disabled={submitting || selections.length === 0}
          onClick={() => void handleHireSelected()}
        >
          {submitting
            ? "Hiring..."
            : `Hire selected & lock dates (${selections.length})`}
        </Button>
      </div>
    </div>
  );
}
