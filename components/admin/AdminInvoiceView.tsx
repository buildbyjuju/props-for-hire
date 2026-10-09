"use client";

import { toPng } from "html-to-image";
import { useMemo, useRef, useState } from "react";
import { InvoiceDocument } from "@/components/admin/InvoiceDocument";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  centsToDollarsInput,
  createEmptyInvoice,
  createEmptyLineItem,
  createInvoiceNumber,
  dollarsToCents,
  invoiceBalanceCents,
  invoiceTotalCents,
  type InvoiceDraft,
  type InvoiceLineItem,
} from "@/lib/invoice";
import { cn, formatPrice } from "@/lib/utils";
import { toast } from "sonner";

export function AdminInvoiceView() {
  const [invoice, setInvoice] = useState<InvoiceDraft>(() => createEmptyInvoice());
  const [exporting, setExporting] = useState(false);
  const documentRef = useRef<HTMLDivElement>(null);

  const total = useMemo(() => invoiceTotalCents(invoice), [invoice]);
  const balance = useMemo(() => invoiceBalanceCents(invoice), [invoice]);

  function updateInvoice(patch: Partial<InvoiceDraft>) {
    setInvoice((current) => ({ ...current, ...patch }));
  }

  function updateLine(id: string, patch: Partial<InvoiceLineItem>) {
    setInvoice((current) => ({
      ...current,
      lineItems: current.lineItems.map((line) =>
        line.id === id ? { ...line, ...patch } : line,
      ),
    }));
  }

  function removeLine(id: string) {
    setInvoice((current) => ({
      ...current,
      lineItems:
        current.lineItems.length <= 1
          ? current.lineItems
          : current.lineItems.filter((line) => line.id !== id),
    }));
  }

  async function downloadInvoiceImage() {
    if (!invoice.customerName.trim()) {
      toast.error("Enter the customer name");
      return;
    }
    if (
      invoice.lineItems.every(
        (line) => !line.description.trim() && line.amountCents <= 0,
      )
    ) {
      toast.error("Add at least one invoice item");
      return;
    }

    const node = documentRef.current;
    if (!node) {
      toast.error("Invoice preview is not ready");
      return;
    }

    setExporting(true);
    try {
      // Ensure logo/fonts are painted before capture
      await document.fonts.ready;
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#fffdfb",
      });

      const link = document.createElement("a");
      link.download = `${invoice.invoiceNumber}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Invoice image downloaded — ready to send");
    } catch (error) {
      console.error(error);
      toast.error("Could not create invoice image");
    } finally {
      setExporting(false);
    }
  }

  function startNewInvoice() {
    setInvoice(createEmptyInvoice());
    toast.message("Started a new invoice");
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-cream p-5 shadow-luxury sm:p-6">
        <h2 className="font-serif text-xl font-light text-foreground">
          Create invoice
        </h2>
        <p className="mt-2 text-sm font-light text-foreground-soft">
          Fill in the details, then download a professional invoice image to
          send to your customer.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,720px)]">
        <section className="rounded-3xl bg-cream p-5 shadow-luxury sm:p-6">
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              void downloadInvoiceImage();
            }}
          >
            <div className="space-y-2 sm:col-span-2">
              <Label>Invoice type</Label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    ["hire", "Hiring"],
                    ["event", "Event"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      updateInvoice({
                        type: value,
                        includeDelivery:
                          value === "hire" ? invoice.includeDelivery : false,
                      })
                    }
                    className={cn(
                      "h-11 rounded-2xl border text-sm",
                      invoice.type === value
                        ? "border-sage bg-sage/20 font-medium text-foreground"
                        : "border-sage/30 bg-warm-white font-light text-foreground-soft",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="inv-number">Invoice number</Label>
              <div className="flex gap-2">
                <Input
                  id="inv-number"
                  value={invoice.invoiceNumber}
                  onChange={(e) =>
                    updateInvoice({ invoiceNumber: e.target.value })
                  }
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    updateInvoice({ invoiceNumber: createInvoiceNumber() })
                  }
                >
                  New #
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="inv-due">Amount due on</Label>
              <Input
                id="inv-due"
                type="date"
                value={invoice.dueDate}
                onChange={(e) => updateInvoice({ dueDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inv-customer">Customer name</Label>
              <Input
                id="inv-customer"
                value={invoice.customerName}
                onChange={(e) =>
                  updateInvoice({ customerName: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inv-phone">Customer phone</Label>
              <Input
                id="inv-phone"
                value={invoice.customerPhone}
                onChange={(e) =>
                  updateInvoice({ customerPhone: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inv-email">Customer email</Label>
              <Input
                id="inv-email"
                type="email"
                value={invoice.customerEmail}
                onChange={(e) =>
                  updateInvoice({ customerEmail: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inv-event-date">Event / hire date</Label>
              <Input
                id="inv-event-date"
                type="date"
                value={invoice.eventDate}
                onChange={(e) => updateInvoice({ eventDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-3 sm:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <Label>Items</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    updateInvoice({
                      lineItems: [...invoice.lineItems, createEmptyLineItem()],
                    })
                  }
                >
                  Add item
                </Button>
              </div>
              <div className="space-y-3">
                {invoice.lineItems.map((line) => (
                  <div
                    key={line.id}
                    className="grid gap-2 rounded-2xl bg-warm-white p-3 sm:grid-cols-[1fr_120px_auto]"
                  >
                    <Input
                      placeholder="Item description"
                      value={line.description}
                      onChange={(e) =>
                        updateLine(line.id, { description: e.target.value })
                      }
                    />
                    <Input
                      inputMode="decimal"
                      placeholder="Amount $"
                      value={centsToDollarsInput(line.amountCents)}
                      onChange={(e) =>
                        updateLine(line.id, {
                          amountCents: dollarsToCents(e.target.value),
                        })
                      }
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => removeLine(line.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {invoice.type === "hire" ? (
              <div className="space-y-3 rounded-2xl bg-warm-white p-4 sm:col-span-2">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={invoice.includeDelivery}
                    onChange={(e) =>
                      updateInvoice({ includeDelivery: e.target.checked })
                    }
                    className="h-4 w-4 accent-[var(--sage)]"
                  />
                  <span className="text-sm text-foreground">
                    Add delivery fee
                  </span>
                </label>
                {invoice.includeDelivery ? (
                  <div className="space-y-2">
                    <Label htmlFor="inv-delivery">Delivery fee (AUD)</Label>
                    <Input
                      id="inv-delivery"
                      inputMode="decimal"
                      value={centsToDollarsInput(invoice.deliveryFeeCents)}
                      onChange={(e) =>
                        updateInvoice({
                          deliveryFeeCents: dollarsToCents(e.target.value),
                        })
                      }
                    />
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="inv-deposit">Deposit amount (AUD)</Label>
              <Input
                id="inv-deposit"
                inputMode="decimal"
                value={centsToDollarsInput(invoice.depositCents)}
                onChange={(e) =>
                  updateInvoice({
                    depositCents: dollarsToCents(e.target.value),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Totals</Label>
              <div className="rounded-2xl bg-warm-white px-4 py-3 text-sm">
                <p>Total: {formatPrice(total)}</p>
                <p className="mt-1 font-medium text-foreground">
                  Amount due: {formatPrice(balance)}
                </p>
              </div>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="inv-notes">Notes (optional)</Label>
              <Textarea
                id="inv-notes"
                rows={3}
                value={invoice.notes}
                onChange={(e) => updateInvoice({ notes: e.target.value })}
                placeholder="Payment terms, pickup notes, bond info..."
              />
            </div>

            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <Button type="submit" disabled={exporting}>
                {exporting ? "Creating image..." : "Download invoice photo"}
              </Button>
              <Button type="button" variant="outline" onClick={startNewInvoice}>
                New invoice
              </Button>
            </div>
          </form>
        </section>

        <section className="rounded-3xl bg-cream p-4 shadow-luxury sm:p-5">
          <p className="mb-4 text-xs uppercase tracking-[0.14em] text-foreground-soft">
            Preview
          </p>
          <div className="overflow-x-auto">
            <InvoiceDocument invoice={invoice} documentRef={documentRef} />
          </div>
        </section>
      </div>
    </div>
  );
}
