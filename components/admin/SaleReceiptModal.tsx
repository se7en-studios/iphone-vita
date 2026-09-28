"use client";

import { useState } from "react";
import { Check, Copy, MessageCircle, Receipt, Share2, X } from "lucide-react";
import type { SaleRecord } from "@/lib/sales";
import { generateSaleReceiptText, paymentMethodLabel } from "@/lib/sales";
import { formatARS, formatUSD } from "@/lib/format";
import { AdminModal } from "./AdminModal";
import { AdminButton } from "./AdminButton";

export function SaleReceiptModal({
  sale,
  onClose,
}: {
  sale: SaleRecord | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [customerPhone, setCustomerPhone] = useState("");

  if (!sale) return null;

  const receiptText = generateSaleReceiptText(sale);

  function handleCopy() {
    navigator.clipboard.writeText(receiptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleWhatsApp() {
    const cleanPhone = customerPhone.replace(/\D/g, "");
    const base = cleanPhone
      ? `https://wa.me/${cleanPhone.startsWith("54") ? cleanPhone : `549${cleanPhone}`}`
      : "https://wa.me/";
    const url = `${base}?text=${encodeURIComponent(receiptText)}`;
    window.open(url, "_blank");
  }

  const dateStr = new Date(sale.createdAt).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeStr = new Date(sale.createdAt).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <AdminModal
      onClose={onClose}
      title={`Comprobante #${sale.id.slice(-6).toUpperCase()}`}
      maxWidth={520}
    >
      <div className="space-y-4">
        {/* Receipt Voucher Card */}
        <div className="rounded-2xl border border-[var(--a-border-strong)] bg-[var(--a-surface-2)] p-5 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--a-border)] pb-3">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-[var(--a-text)] text-[var(--a-bg)] font-bold text-xs">
                V
              </div>
              <span className="font-bold tracking-tight text-[var(--a-text)]">
                iPhone Vita
              </span>
            </div>
            <span className="rounded-full bg-[var(--a-surface-3)] px-2.5 py-0.5 font-mono text-xs font-semibold text-[var(--a-muted)]">
              #{sale.id.slice(-6).toUpperCase()}
            </span>
          </div>

          <div className="mt-3.5 space-y-2 text-xs">
            <div className="flex justify-between text-[var(--a-muted)]">
              <span>Fecha:</span>
              <span className="font-medium text-[var(--a-text)] capitalize">
                {dateStr} - {timeStr}
              </span>
            </div>

            {sale.customerName && (
              <div className="flex justify-between text-[var(--a-muted)]">
                <span>Cliente:</span>
                <span className="font-semibold text-[var(--a-text)]">
                  {sale.customerName}
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-[var(--a-border)]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--a-muted)]">
                Producto
              </span>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-sm font-bold text-[var(--a-text)]">
                  {sale.productName}
                </span>
                <span className="font-mono text-xs text-[var(--a-muted)]">
                  x{sale.quantity || 1}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="inline-flex rounded-full bg-[var(--a-surface-3)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--a-text)]">
                  {sale.condition === "nuevo" ? "Sellado" : "Semi-nuevo"}
                </span>
                <span className="text-[11px] text-[var(--a-muted)]">
                  {sale.condition === "nuevo"
                    ? "Garantía Oficial Apple"
                    : "Garantía 3 meses Vita"}
                </span>
              </div>
            </div>

            {sale.tradeInModel && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5 text-amber-500 dark:text-amber-400">
                <span className="block text-[10px] font-bold uppercase tracking-wider">
                  Canje recibido en parte de pago
                </span>
                <span className="text-xs font-medium">{sale.tradeInModel}</span>
              </div>
            )}

            <div className="pt-3 border-t border-[var(--a-border)] space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--a-muted)]">Método de pago:</span>
                <span className="font-semibold text-[var(--a-text)]">
                  {paymentMethodLabel(sale.paymentMethod)}
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <span className="text-sm font-semibold text-[var(--a-text)]">
                  Total abonado:
                </span>
                <div className="text-right">
                  <div className="text-lg font-black text-emerald-500 tabular-nums">
                    {formatUSD(sale.salePriceUSD)}
                  </div>
                  <div className="text-[11px] font-medium text-[var(--a-muted)] tabular-nums">
                    {formatARS(sale.salePriceUSD, sale.salePriceARS / (sale.salePriceUSD || 1))} ARS
                  </div>
                </div>
              </div>
            </div>

            {sale.notes && (
              <div className="pt-2 text-[11px] text-[var(--a-muted)] italic border-t border-[var(--a-border)]">
                Nota: {sale.notes}
              </div>
            )}
          </div>
        </div>

        {/* WhatsApp Sender Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--a-muted)]">
            Número de WhatsApp del cliente (opcional):
          </label>
          <div className="flex gap-2">
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Ej: 2991234567"
              className="admin-input flex-1 !text-sm"
            />
            <AdminButton
              variant="secondary"
              onClick={handleWhatsApp}
              className="!text-emerald-500 hover:!border-emerald-500/50"
            >
              <MessageCircle size={15} /> Enviar por WhatsApp
            </AdminButton>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--a-border)]">
          <button
            type="button"
            onClick={handleCopy}
            className="admin-btn admin-btn--secondary admin-btn--sm flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <Check size={14} className="text-emerald-400" /> Copiado al portapapeles
              </>
            ) : (
              <>
                <Copy size={14} /> Copiar texto
              </>
            )}
          </button>

          <AdminButton variant="ghost" onClick={onClose}>
            Cerrar
          </AdminButton>
        </div>
      </div>
    </AdminModal>
  );
}
