"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { format, addMonths, startOfToday, parseISO } from "date-fns";
import type { CatalogItem } from "@/lib/catalog";
import {
  formatBondNotice,
  formatHirePriceSummary,
  formatVariantPriceRange,
  getVariantPriceCents,
  getHireWindow,
  HIRE_PICKUP_NOTE,
  HIRE_PRICE_CENTS,
  HIRE_PRICING_SUMMARY,
  parseSetCount,
} from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { getItemVariantImage, itemHasColorVariants, CUTOUT_IMAGE_CLASS, isCutoutCategory } from "@/lib/item-images";
import { useCart } from "@/components/cart/CartProvider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";

type AvailabilityResponse = {
  unavailable: string[];
  locked: string[];
};

function OptionPills({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div>
      <p className="mb-3 text-xs uppercase tracking-luxury text-foreground-soft">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "min-h-11 rounded-full border px-4 py-2.5 text-xs uppercase tracking-wider transition-colors",
              value === option
                ? "border-sage bg-sage text-black"
                : "border-sage/30 bg-cream text-foreground hover:border-sage",
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export function HireDialog({
  item,
  categoryName,
  categorySlug,
  children,
  selectedSize: controlledSize,
  onSelectedSizeChange,
}: {
  item: CatalogItem;
  categoryName: string;
  categorySlug: string;
  children: React.ReactNode;
  selectedSize?: string;
  onSelectedSizeChange?: (size: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Date | undefined>();
  const [internalSize, setInternalSize] = useState("");
  const [selectedSets, setSelectedSets] = useState<string>("");
  const [unavailable, setUnavailable] = useState<string[]>([]);
  const [locked, setLocked] = useState<string[]>([]);
  const [loadingDates, setLoadingDates] = useState(false);
  const { addLine } = useCart();

  const isControlledSize = controlledSize !== undefined;
  const selectedSize = isControlledSize ? controlledSize : internalSize;
  const hasColors = itemHasColorVariants(item);

  const hasSizes = Boolean(item.sizes?.length);
  const hasSetOptions = Boolean(item.setOptions?.length);
  const selectionLabel = item.selectionLabel ?? "Choose size";
  const selectionDisplay = item.selectionDisplay ?? "Size";
  const hasVariantPrices = Boolean(item.variantPrices);
  const priceSummary = hasVariantPrices
    ? selectedSize && item.variantPrices?.[selectedSize]
      ? formatHirePriceSummary(item.variantPrices[selectedSize])
      : formatVariantPriceRange(item.variantPrices!)
    : hasSetOptions
    ? formatHirePriceSummary(item.priceCents, true)
    : item.priceCents !== HIRE_PRICE_CENTS
      ? formatHirePriceSummary(item.priceCents)
      : HIRE_PRICING_SUMMARY;
  const sizeChosen = !hasSizes || Boolean(selectedSize);
  const setsChosen = !hasSetOptions || Boolean(selectedSets);
  const readyForCalendar = sizeChosen && setsChosen;

  const { today, maxDate, fromStr, toStr } = useMemo(() => {
    const start = startOfToday();
    const end = addMonths(start, 12);
    return {
      today: start,
      maxDate: end,
      fromStr: format(start, "yyyy-MM-dd"),
      toStr: format(end, "yyyy-MM-dd"),
    };
  }, []);

  const setCount = selectedSets ? parseSetCount(selectedSets) : 1;
  const eventDateStr = selected ? format(selected, "yyyy-MM-dd") : null;
  const hireWindow = eventDateStr ? getHireWindow(eventDateStr) : null;
  const totalCents = eventDateStr
    ? getVariantPriceCents(item, selectedSize || undefined, setCount)
    : null;
  const showDateLoading = open && readyForCalendar && loadingDates;
  const previewImage = getItemVariantImage(
    item,
    hasColors && selectedSize ? selectedSize : undefined,
  );

  function updateSelectedSize(size: string) {
    if (onSelectedSizeChange) {
      onSelectedSizeChange(size);
    } else {
      setInternalSize(size);
    }
  }

  useEffect(() => {
    if (!open || !readyForCalendar) {
      return;
    }

    let cancelled = false;

    async function loadAvailability() {
      setLoadingDates(true);
      try {
        const params = new URLSearchParams({
          itemId: item.id,
          from: fromStr,
          to: toStr,
        });
        if (selectedSize) {
          params.set("selectedSize", selectedSize);
        }
        if (selectedSets) {
          params.set("selectedSets", selectedSets);
        }

        const res = await fetch(`/api/availability?${params.toString()}`);
        const data = (await res.json()) as AvailabilityResponse;
        if (!cancelled) {
          setUnavailable(data.unavailable ?? []);
          setLocked(data.locked ?? []);
        }
      } catch {
        if (!cancelled) {
          setUnavailable([]);
          setLocked([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingDates(false);
        }
      }
    }

    void loadAvailability();

    return () => {
      cancelled = true;
    };
  }, [open, item.id, readyForCalendar, fromStr, toStr, selectedSize, selectedSets]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setSelected(undefined);
      if (!isControlledSize) {
        setInternalSize("");
      }
      setSelectedSets("");
      setUnavailable([]);
      setLocked([]);
    }
  }

  function handleSizeSelect(size: string) {
    updateSelectedSize(size);
    setSelected(undefined);
  }

  function handleSetSelect(sets: string) {
    setSelectedSets(sets);
    setSelected(undefined);
  }

  function handleAddToCart() {
    if (!selected || !hireWindow || totalCents === null) return;
    if (hasSizes && !selectedSize) return;
    if (hasSetOptions && !selectedSets) return;

    const eventDate = format(selected, "yyyy-MM-dd");
    addLine({
      itemId: item.id,
      itemName: item.name,
      itemSlug: item.slug,
      categorySlug: item.categorySlug,
      priceCents: totalCents,
      eventDate,
      imageUrl: previewImage,
      selectedSize: selectedSize || undefined,
      selectedSets: selectedSets || undefined,
      bondCents: item.bondCents,
      pickupDate: hireWindow.pickupDate,
      returnDate: hireWindow.returnDate,
      hireDays: hireWindow.hireDays,
    });
    setOpen(false);
    setSelected(undefined);
    if (!isControlledSize) {
      setInternalSize("");
    }
    setSelectedSets("");
  }

  const isDisabled = (date: Date) => {
    const key = format(date, "yyyy-MM-dd");
    return date < today || unavailable.includes(key);
  };

  const lockedDates = locked.map((day) => parseISO(day));
  const canAdd = selected && readyForCalendar;

  const dateLabel = (iso: string) =>
    format(parseISO(iso), "EEE d MMM yyyy");

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{item.name}</DialogTitle>
          <DialogDescription>
            {categoryName} · {priceSummary}
          </DialogDescription>
        </DialogHeader>

        {(hasColors || isCutoutCategory(categorySlug)) ? (
          <div className="relative mx-auto aspect-[4/3] w-full max-w-[280px] overflow-hidden rounded-2xl bg-cream">
            <Image
              src={previewImage}
              alt={selectedSize ? `${item.name} — ${selectedSize}` : item.name}
              fill
              className={cn(
                "transition-opacity duration-300",
                isCutoutCategory(categorySlug)
                  ? CUTOUT_IMAGE_CLASS
                  : "object-cover",
              )}
              sizes="280px"
            />
          </div>
        ) : null}

        <p className="text-sm font-light text-foreground-soft">{item.description}</p>
        {item.setIncludes ? (
          <p className="text-sm font-light text-foreground">{item.setIncludes}</p>
        ) : null}
        <p className="text-xs font-light text-foreground-soft">{HIRE_PICKUP_NOTE}</p>
        {item.bondCents ? (
          <p className="text-xs font-light text-foreground-soft">
            {formatBondNotice(item.bondCents)}
          </p>
        ) : null}

        {hasSetOptions && !hasSizes && (
          <OptionPills
            label="Choose sets"
            options={item.setOptions!}
            value={selectedSets}
            onChange={handleSetSelect}
          />
        )}

        {hasSizes && (
          <OptionPills
            label={selectionLabel}
            options={item.sizes!.map((option) =>
              item.variantPrices?.[option]
                ? `${option} · ${formatPrice(item.variantPrices[option])}`
                : option,
            )}
            value={
              selectedSize && item.variantPrices?.[selectedSize]
                ? `${selectedSize} · ${formatPrice(item.variantPrices[selectedSize])}`
                : selectedSize
            }
            onChange={(label) => {
              const option = item.sizes!.find((size) => label.startsWith(size)) ?? label;
              handleSizeSelect(option);
            }}
          />
        )}

        {hasSetOptions && hasSizes && sizeChosen && (
          <OptionPills
            label="Choose quantity"
            options={item.setOptions!}
            value={selectedSets}
            onChange={handleSetSelect}
          />
        )}

        {readyForCalendar && (
          <div>
            <p className="mb-3 text-xs uppercase tracking-luxury text-foreground-soft">
              Event date
            </p>
            <Calendar
              mode="single"
              selected={selected}
              onSelect={setSelected}
              disabled={isDisabled}
              startMonth={today}
              endMonth={maxDate}
              defaultMonth={today}
              captionLayout="label"
              modifiers={{ locked: lockedDates }}
              modifiersClassNames={{
                locked: "bg-sage/15 text-foreground-soft/50 line-through",
              }}
              className="mx-auto w-full max-w-[320px] rounded-2xl bg-cream p-2"
            />
            {showDateLoading ? (
              <p className="mt-2 text-center text-xs font-light text-foreground-soft">
                Checking availability...
              </p>
            ) : (
              <p className="mt-2 text-center text-xs font-light text-foreground-soft">
                Booked dates lock the day before, event day, and day after
              </p>
            )}
          </div>
        )}

        {!sizeChosen && hasSizes && (
          <p className="text-sm font-light text-foreground-soft">
            {item.selectionDisplay === "Number"
              ? "Select a number to continue."
              : item.selectionDisplay === "Package"
                ? "Select a package to continue."
                : "Select a size to continue."}
          </p>
        )}

        {hasSetOptions && !hasSizes && !setsChosen && (
          <p className="text-sm font-light text-foreground-soft">
            Choose 1 set or 2 sets to view the booking calendar.
          </p>
        )}

        {hireWindow && totalCents !== null && (
          <div className="rounded-2xl bg-cream px-4 py-3 text-sm font-light text-foreground-soft">
            {selectedSize && (
              <p>
                {selectionDisplay}: {selectedSize}
              </p>
            )}
            {selectedSets && <p>Quantity: {selectedSets}</p>}
            <p>Pickup: {dateLabel(hireWindow.pickupDate)}</p>
            <p>Event: {dateLabel(hireWindow.eventDate)}</p>
            <p>Return: {dateLabel(hireWindow.returnDate)}</p>
            <p className="mt-2 font-medium text-foreground">
              Hire: {formatPrice(totalCents)}
            </p>
            {item.bondCents ? (
              <p className="font-medium text-foreground">
                Bond (refundable): {formatPrice(item.bondCents)}
              </p>
            ) : null}
            {item.bondCents ? (
              <p className="mt-2 font-medium text-foreground">
                Total due: {formatPrice(totalCents + item.bondCents)}
              </p>
            ) : null}
          </div>
        )}

        <Button className="w-full" disabled={!canAdd} onClick={handleAddToCart}>
          Add to selection
        </Button>
      </DialogContent>
    </Dialog>
  );
}
