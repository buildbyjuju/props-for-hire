export const INVOICE_BUSINESS = {
  businessName: "DreamScape Event",
  contactName: "Josline Baydoun",
  phone: "0474 973 317",
  phoneRaw: "0474973317",
  email: "dreamscape_event.au",
  bankName: "Deposit bank details",
  bsb: "732-057",
  accountNumber: "792532",
  accountName: "Josline Baydoun",
} as const;

export type InvoiceType = "hire" | "event";

export type InvoiceLineItem = {
  id: string;
  /** Catalog item id when chosen from the website; empty for a custom line */
  itemId: string;
  description: string;
  amountCents: number;
  bondCents: number;
  selectedSize: string;
  selectedSets: string;
};

export type InvoiceDraft = {
  type: InvoiceType;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  eventDate: string;
  dueDate: string;
  lineItems: InvoiceLineItem[];
  includeDelivery: boolean;
  deliveryFeeCents: number;
  depositCents: number;
  notes: string;
};

export function createEmptyLineItem(): InvoiceLineItem {
  return {
    id: crypto.randomUUID(),
    itemId: "",
    description: "",
    amountCents: 0,
    bondCents: 0,
    selectedSize: "",
    selectedSets: "",
  };
}

export function createInvoiceNumber(date = new Date()): string {
  const stamp = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");
  const suffix = String(Math.floor(Math.random() * 900) + 100);
  return `DS-${stamp}-${suffix}`;
}

export function createEmptyInvoice(): InvoiceDraft {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  return {
    type: "hire",
    invoiceNumber: createInvoiceNumber(today),
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    eventDate: todayStr,
    dueDate: todayStr,
    lineItems: [createEmptyLineItem()],
    includeDelivery: false,
    deliveryFeeCents: 5000,
    depositCents: 0,
    notes: "",
  };
}

export function invoiceSubtotalCents(invoice: InvoiceDraft): number {
  return invoice.lineItems.reduce(
    (sum, line) => sum + (Number.isFinite(line.amountCents) ? line.amountCents : 0),
    0,
  );
}

export function invoiceBondCents(invoice: InvoiceDraft): number {
  return invoice.lineItems.reduce(
    (sum, line) => sum + (Number.isFinite(line.bondCents) ? line.bondCents : 0),
    0,
  );
}

export function invoiceDeliveryCents(invoice: InvoiceDraft): number {
  if (invoice.type !== "hire" || !invoice.includeDelivery) return 0;
  return Number.isFinite(invoice.deliveryFeeCents)
    ? invoice.deliveryFeeCents
    : 0;
}

/** Hire fees + delivery (excludes refundable bonds) */
export function invoiceTotalCents(invoice: InvoiceDraft): number {
  return invoiceSubtotalCents(invoice) + invoiceDeliveryCents(invoice);
}

/** Amount the customer needs to pay now (hire + delivery + bonds − deposit) */
export function invoiceBalanceCents(invoice: InvoiceDraft): number {
  const deposit = Number.isFinite(invoice.depositCents)
    ? invoice.depositCents
    : 0;
  return Math.max(
    0,
    invoiceTotalCents(invoice) + invoiceBondCents(invoice) - deposit,
  );
}

export function dollarsToCents(value: string): number {
  const normalized = value.trim().replace(/^\$/, "").replace(/,/g, "");
  if (!normalized) return 0;
  const amount = Number.parseFloat(normalized);
  if (!Number.isFinite(amount) || amount < 0) return 0;
  return Math.round(amount * 100);
}

export function centsToDollarsInput(cents: number): string {
  if (!cents) return "";
  return (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2);
}
