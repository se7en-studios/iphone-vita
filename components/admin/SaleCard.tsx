"use client";

import { Receipt, Trash2 } from "lucide-react";
import { formatUSD } from "@/lib/format";
import { paymentMethodLabel, type SaleRecord } from "@/lib/sales";

/** Venta en formato tarjeta para celular: las tablas de ventas tienen 7-8 columnas y no entran. */
export function SaleCard({
  sale: s,
  onReceipt,
  onDelete,
}: {
  sale: SaleRecord;
  onReceipt: () => void;
  onDelete?: () => void;
}) {
  const date = new Date(s.createdAt).toLocaleString("es-AR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <li className="border-t border-[var(--a-border)] px-4 py-3.5 first:border-t-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[15px] font-semibold leading-snug text-[var(--a-text)]">
            {s.quantity > 1 && `${s.quantity} × `}
            {s.productName}
          </p>
          <p className="mt-0.5 text-[13px] text-[var(--a-muted)]">
            {s.customerName || "Venta de mostrador"} · {date}
          </p>
        </div>
        <div className="shrink-0 text-right tabular-nums">
          <p className="text-[15px] font-bold text-[var(--a-text)]">
            {formatUSD(s.salePriceUSD)}
          </p>
          <p className="text-[13px] font-semibold text-[var(--a-success)]">
            +{formatUSD(s.profitUSD)}
          </p>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[13px]">
        <span className="rounded-full bg-[var(--a-surface-3)] px-2.5 py-1 capitalize text-[var(--a-muted)]">
          {s.condition}
        </span>
        <span className="rounded-full border border-[var(--a-border)] px-2.5 py-1 text-[var(--a-text)]">
          {paymentMethodLabel(s.paymentMethod)}
        </span>
      </div>
      {s.tradeInModel && (
        <p className="mt-2 text-[13px] font-medium text-[var(--a-warning)]">
          Canje: {s.tradeInModel}
        </p>
      )}
      {s.notes && (
        <p className="mt-1 text-[13px] italic text-[var(--a-muted)]">
          {s.notes}
        </p>
      )}

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onReceipt}
          className="admin-btn admin-btn--secondary min-h-[44px] flex-1"
        >
          <Receipt size={16} className="text-[var(--a-accent)]" /> Ver recibo
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Eliminar venta de ${s.productName}`}
            className="admin-icon-btn admin-icon-btn--danger !size-11"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </li>
  );
}
