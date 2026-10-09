"use client";

import {
  INVOICE_BUSINESS,
  invoiceBalanceCents,
  invoiceBondCents,
  invoiceDeliveryCents,
  invoiceSubtotalCents,
  invoiceTotalCents,
  type InvoiceDraft,
} from "@/lib/invoice";
import { formatPrice } from "@/lib/utils";

function formatDisplayDate(value: string) {
  if (!value) return "—";
  try {
    return new Date(`${value}T12:00:00`).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

export function InvoiceDocument({
  invoice,
  documentRef,
}: {
  invoice: InvoiceDraft;
  documentRef: React.RefObject<HTMLDivElement | null>;
}) {
  const subtotal = invoiceSubtotalCents(invoice);
  const delivery = invoiceDeliveryCents(invoice);
  const bond = invoiceBondCents(invoice);
  const total = invoiceTotalCents(invoice);
  const deposit = invoice.depositCents;
  const balance = invoiceBalanceCents(invoice);
  const typeLabel =
    invoice.type === "hire" ? "Props Hire Invoice" : "Event Invoice";
  const showBondColumn = invoice.lineItems.some((line) => line.bondCents > 0);

  return (
    <div
      ref={documentRef}
      style={{
        width: 720,
        background: "#fffdfb",
        color: "#5c5a56",
        fontFamily: "var(--font-jost), Jost, system-ui, sans-serif",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #a8b5a2 0%, #c5cfc0 100%)",
          padding: "28px 36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="DreamScape Event"
            width={72}
            height={72}
            style={{
              width: 72,
              height: 72,
              objectFit: "contain",
              background: "#fffdfb",
              borderRadius: 16,
              padding: 6,
            }}
          />
          <div>
            <p
              style={{
                margin: 0,
                fontFamily:
                  "var(--font-cormorant), Cormorant Garamond, Georgia, serif",
                fontSize: 32,
                fontWeight: 400,
                color: "#2f322e",
                letterSpacing: "0.04em",
              }}
            >
              {INVOICE_BUSINESS.businessName}
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 12,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#3d433b",
              }}
            >
              Luxury props & event styling
            </p>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <p
            style={{
              margin: 0,
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#3d433b",
            }}
          >
            Invoice
          </p>
          <p
            style={{
              margin: "4px 0 0",
              fontFamily:
                "var(--font-cormorant), Cormorant Garamond, Georgia, serif",
              fontSize: 26,
              color: "#2f322e",
            }}
          >
            {invoice.invoiceNumber}
          </p>
        </div>
      </div>

      <div style={{ padding: "32px 36px 28px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 32,
            marginBottom: 28,
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 11,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#8a8780",
              }}
            >
              Bill to
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontFamily:
                  "var(--font-cormorant), Cormorant Garamond, Georgia, serif",
                fontSize: 24,
                color: "#5c5a56",
              }}
            >
              {invoice.customerName || "Customer name"}
            </p>
            {invoice.customerPhone ? (
              <p style={{ margin: "6px 0 0", fontSize: 14 }}>{invoice.customerPhone}</p>
            ) : null}
            {invoice.customerEmail ? (
              <p style={{ margin: "4px 0 0", fontSize: 14 }}>{invoice.customerEmail}</p>
            ) : null}
          </div>
          <div style={{ textAlign: "right", minWidth: 220 }}>
            <p style={{ margin: 0, fontSize: 14 }}>
              <span style={{ color: "#8a8780" }}>Type</span> · {typeLabel}
            </p>
            <p style={{ margin: "8px 0 0", fontSize: 14 }}>
              <span style={{ color: "#8a8780" }}>Event date</span> ·{" "}
              {formatDisplayDate(invoice.eventDate)}
            </p>
            <p style={{ margin: "8px 0 0", fontSize: 14 }}>
              <span style={{ color: "#8a8780" }}>Amount due by</span> ·{" "}
              {formatDisplayDate(invoice.dueDate)}
            </p>
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid #dce3d8",
            borderBottom: "1px solid #dce3d8",
            padding: "12px 0",
            display: "grid",
            gridTemplateColumns: showBondColumn
              ? "1fr 100px 100px"
              : "1fr 120px",
            gap: 12,
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#8a8780",
          }}
        >
          <span>Description</span>
          {showBondColumn ? (
            <span style={{ textAlign: "right" }}>Bond</span>
          ) : null}
          <span style={{ textAlign: "right" }}>Amount</span>
        </div>

        <div style={{ marginTop: 8 }}>
          {invoice.lineItems
            .filter(
              (line) =>
                line.description.trim() ||
                line.amountCents > 0 ||
                line.bondCents > 0,
            )
            .map((line) => (
              <div
                key={line.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: showBondColumn
                    ? "1fr 100px 100px"
                    : "1fr 120px",
                  gap: 12,
                  padding: "14px 0",
                  borderBottom: "1px solid #f0ebe3",
                  fontSize: 15,
                }}
              >
                <span>{line.description || "Item"}</span>
                {showBondColumn ? (
                  <span style={{ textAlign: "right" }}>
                    {line.bondCents > 0 ? formatPrice(line.bondCents) : "—"}
                  </span>
                ) : null}
                <span style={{ textAlign: "right" }}>
                  {formatPrice(line.amountCents)}
                </span>
              </div>
            ))}
          {invoice.type === "hire" && invoice.includeDelivery ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: showBondColumn
                  ? "1fr 100px 100px"
                  : "1fr 120px",
                gap: 12,
                padding: "14px 0",
                borderBottom: "1px solid #f0ebe3",
                fontSize: 15,
              }}
            >
              <span>Delivery fee</span>
              {showBondColumn ? <span /> : null}
              <span style={{ textAlign: "right" }}>{formatPrice(delivery)}</span>
            </div>
          ) : null}
        </div>

        <div
          style={{
            marginTop: 24,
            marginLeft: "auto",
            width: 280,
            background: "#f8f5f0",
            borderRadius: 18,
            padding: "18px 20px",
          }}
        >
          <Row label="Subtotal" value={formatPrice(subtotal)} />
          {invoice.type === "hire" && invoice.includeDelivery ? (
            <Row label="Delivery" value={formatPrice(delivery)} />
          ) : null}
          {bond > 0 ? (
            <Row label="Refundable bond" value={formatPrice(bond)} />
          ) : null}
          <Row
            label="Total"
            value={formatPrice(total + bond)}
            strong
          />
          <Row label="Deposit" value={formatPrice(deposit)} />
          <div
            style={{
              marginTop: 10,
              paddingTop: 12,
              borderTop: "1px solid #dce3d8",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 16,
            }}
          >
            <span
              style={{
                fontSize: 12,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#8a8780",
              }}
            >
              Amount due
            </span>
            <span
              style={{
                fontFamily:
                  "var(--font-cormorant), Cormorant Garamond, Georgia, serif",
                fontSize: 28,
                color: "#3d433b",
              }}
            >
              {formatPrice(balance)}
            </span>
          </div>
        </div>

        {invoice.notes.trim() ? (
          <div style={{ marginTop: 28 }}>
            <p
              style={{
                margin: 0,
                fontSize: 11,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#8a8780",
              }}
            >
              Notes
            </p>
            <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.6 }}>
              {invoice.notes}
            </p>
          </div>
        ) : null}

        <div
          style={{
            marginTop: 32,
            padding: "20px 22px",
            borderRadius: 18,
            background: "#dce3d8",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 11,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#3d433b",
            }}
          >
            Payment details
          </p>
          <p style={{ margin: "10px 0 0", fontSize: 15 }}>
            Account name: <strong>{INVOICE_BUSINESS.accountName}</strong>
          </p>
          <p style={{ margin: "6px 0 0", fontSize: 15 }}>
            BSB: <strong>{INVOICE_BUSINESS.bsb}</strong>
          </p>
          <p style={{ margin: "6px 0 0", fontSize: 15 }}>
            Account number: <strong>{INVOICE_BUSINESS.accountNumber}</strong>
          </p>
          <p style={{ margin: "10px 0 0", fontSize: 13, color: "#5c5a56" }}>
            Please use invoice number <strong>{invoice.invoiceNumber}</strong> as
            your payment reference.
          </p>
        </div>

        <div
          style={{
            marginTop: 28,
            display: "flex",
            justifyContent: "space-between",
            gap: 24,
            fontSize: 13,
            color: "#8a8780",
          }}
        >
          <div>
            <p style={{ margin: 0 }}>{INVOICE_BUSINESS.contactName}</p>
            <p style={{ margin: "4px 0 0" }}>{INVOICE_BUSINESS.phone}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0 }}>Thank you for choosing</p>
            <p style={{ margin: "4px 0 0" }}>{INVOICE_BUSINESS.businessName}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 16,
        marginBottom: 8,
        fontSize: strong ? 16 : 14,
        fontWeight: strong ? 500 : 300,
      }}
    >
      <span style={{ color: "#8a8780" }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
