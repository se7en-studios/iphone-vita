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
        <div className="relative overflow-hidden rounded-2xl border border-[var(--a-border-strong)] bg-[#0d0d0f] p-6 shadow-xl">
          {/* Subtle watermark */}
          <div
            className="pointer-events-none absolute -right-6 -top-6 text-[88px] font-black text-white/[0.02] select-none"
            aria-hidden="true"
          >
            VITA
          </div>

          <div className="flex items-center justify-between border-b border-[var(--a-border)] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-xl bg-[#ebd7be] text-black font-black text-sm shadow-[0_0_12px_rgba(235,215,190,0.4)]">
                V
              </div>
              <div>
                <span className="block font-bold tracking-tight text-white leading-tight">
                  iPhone Vita
                </span>
                <span className="text-[10px] text-[var(--a-muted)] uppercase tracking-wider font-semibold">
                  Comprobante Oficial
                </span>
              </div>
            </div>
            <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 font-mono text-xs font-bold text-[#ebd7be]">
              #{sale.id.slice(-6).toUpperCase()}
            </span>
          </div>

          <div className="mt-4 space-y-2.5 text-xs">
            <div className="flex justify-between text-[var(--a-muted)]">
              <span>Fecha & Hora:</span>
              <span className="font-medium text-white capitalize">
                {dateStr} · {timeStr}
              </span>
            </div>

            {sale.customerName && (
              <div className="flex justify-between text-[var(--a-muted)]">
                <span>Cliente:</span>
                <span className="font-semibold text-white">
                  {sale.customerName}
                </span>
              </div>
            )}

            <div className="pt-3 border-t border-[var(--a-border)]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#ebd7be]/80">
                Detalle del Equipo
              </span>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-base font-bold text-white tracking-tight">
                  {sale.productName}
                </span>
                <span className="font-mono text-xs font-semibold text-[var(--a-muted)]">
                  x{sale.quantity || 1}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="inline-flex rounded-full bg-[#ebd7be]/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#ebd7be] border border-[#ebd7be]/30">
                  {sale.condition === "nuevo" ? "Sellado en caja" : "Semi-nuevo"}
                </span>
                <span className="text-[11px] text-[var(--a-muted)]">
                  {sale.condition === "nuevo"
                    ? "Garantía Oficial Apple"
                    : "Garantía 3 meses Vita"}
                </span>
              </div>
            </div>

            {sale.tradeInModel && (
              <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-amber-300">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  ✦ Plan Canje Tomado en Pago
                </span>
                <span className="text-xs font-semibold mt-0.5 block">{sale.tradeInModel}</span>
              </div>
            )}

            {/* Perforated ticket divider with circular side cutouts */}
            <div className="relative my-4 pt-2">
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 size-4 rounded-full bg-[var(--a-bg)] border-r border-[var(--a-border-strong)]" />
              <div className="absolute -right-8 top-1/2 -translate-y-1/2 size-4 rounded-full bg-[var(--a-bg)] border-l border-[var(--a-border-strong)]" />
              <div className="border-b border-dashed border-white/20" />
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--a-muted)]">Método de pago:</span>
                <span className="font-semibold text-white">
                  {paymentMethodLabel(sale.paymentMethod)}
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-2">
                <div>
                  <span className="block text-xs font-medium uppercase tracking-wider text-[var(--a-muted)]">
                    Total Abonado
                  </span>
                  <span className="text-[11px] font-medium text-[var(--a-muted)] tabular-nums">
                    ≈ {formatARS(sale.salePriceUSD, sale.salePriceARS / (sale.salePriceUSD || 1))} ARS
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-[#ebd7be] tabular-nums tracking-tight">
                    {formatUSD(sale.salePriceUSD)}
                  </div>
                </div>
              </div>
            </div>

            {sale.notes && (
              <div className="pt-3 text-[11px] text-[var(--a-muted)] italic border-t border-[var(--a-border)]">
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
