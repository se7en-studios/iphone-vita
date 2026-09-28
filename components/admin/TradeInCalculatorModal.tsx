"use client";

import { useState } from "react";
import {
  ArrowRight,
  Calculator,
  Check,
  Copy,
  DollarSign,
  MessageCircle,
  Smartphone,
  Sparkles,
} from "lucide-react";
import type { Product } from "@/types";
import { formatARS, formatUSD, fullName } from "@/lib/format";
import { AdminModal } from "./AdminModal";
import { AdminButton } from "./AdminButton";
import { AdminField } from "./AdminField";
import { useAdminToast } from "./AdminToast";

// Valores de referencia base de toma para equipos usados (USD)
const BASE_TRADE_IN: Record<string, number> = {
  "iPhone 11 64GB": 200,
  "iPhone 11 128GB": 230,
  "iPhone 11 Pro 64GB": 260,
  "iPhone 11 Pro Max 64GB": 300,
  "iPhone 12 64GB": 280,
  "iPhone 12 128GB": 310,
  "iPhone 12 Pro 128GB": 370,
  "iPhone 12 Pro Max 128GB": 430,
  "iPhone 13 128GB": 420,
  "iPhone 13 256GB": 460,
  "iPhone 13 Pro 128GB": 520,
  "iPhone 13 Pro Max 128GB": 590,
  "iPhone 14 128GB": 530,
  "iPhone 14 Plus 128GB": 570,
  "iPhone 14 Pro 128GB": 680,
  "iPhone 14 Pro Max 128GB": 770,
  "iPhone 15 128GB": 690,
  "iPhone 15 Plus 128GB": 750,
  "iPhone 15 Pro 128GB": 860,
  "iPhone 15 Pro Max 256GB": 980,
};

export function TradeInCalculatorModal({
  products,
  arsRate,
  onClose,
}: {
  products: Product[];
  arsRate: number | null;
  onClose: () => void;
}) {
  const showToast = useAdminToast();

  const [clientModel, setClientModel] = useState<string>("iPhone 12 128GB");
  const [batteryHealth, setBatteryHealth] = useState<number>(85);
  const [conditionGrade, setConditionGrade] = useState<string>("bueno");
  const [targetProductId, setTargetProductId] = useState<string>(
    products[0]?.id || "",
  );
  const [copied, setCopied] = useState(false);

  // Ajuste según batería y condición
  const baseValue = BASE_TRADE_IN[clientModel] || 300;
  let multiplier = 1.0;
  if (batteryHealth < 80) multiplier -= 0.1;
  else if (batteryHealth >= 90) multiplier += 0.05;

  if (conditionGrade === "impecable") multiplier += 0.05;
  else if (conditionGrade === "detalles") multiplier -= 0.12;

  const tradeInUSD = Math.round(baseValue * multiplier);

  const targetProduct = products.find((p) => p.id === targetProductId);
  const targetPriceUSD = targetProduct?.price || 1000;
  const differenceUSD = Math.max(0, targetPriceUSD - tradeInUSD);
  const differenceARS = arsRate ? Math.round(differenceUSD * arsRate) : 0;

  function copyQuoteWhatsApp() {
    const text = `¡Hola! 👋 Te paso la cotización personalizada de tu Plan Canje en Vita iPhone:

📱 *Tu equipo:* ${clientModel} (Batería ${batteryHealth}%, estado ${conditionGrade})
💵 *Valor de toma sugerido:* ${formatUSD(tradeInUSD)}

✨ *Equipo que querés:* ${targetProduct ? fullName(targetProduct) : "iPhone seleccionado"} (${formatUSD(targetPriceUSD)})
💰 *Diferencia a abonar:* ${formatUSD(differenceUSD)}${arsRate ? ` (o aprox. ${formatARS(differenceUSD, arsRate)})` : ""}

✅ Incluye garantía escrita, traspaso de datos sin cargo y podés pagar en efectivo USD, transferencia ARS o mixto. ¿Te gustaría reservarlo para pasar por el local?`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      showToast("Cotización copiada lista para enviar por WhatsApp", "success");
      setTimeout(() => setCopied(false), 2200);
    });
  }

  return (
    <AdminModal
      title="Tasador de Plan Canje Rápido"
      onClose={onClose}
      maxWidth={620}
      footer={
        <div className="flex items-center justify-end gap-3 sm:justify-between">
          <div className="hidden text-xs text-[var(--a-muted)] sm:block">
            Diferencia: <strong>US$ {differenceUSD}</strong> (≈{" "}
            {arsRate ? formatARS(differenceUSD, arsRate) : "—"})
          </div>
          <div className="flex gap-2">
            <AdminButton variant="secondary" onClick={onClose}>
              Cerrar
            </AdminButton>
            <AdminButton
              variant="primary"
              onClick={copyQuoteWhatsApp}
              className="bg-[#25D366] hover:bg-[#20ba59] text-white"
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? "¡Copiado!" : "Copiar para WhatsApp"}
            </AdminButton>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-xs text-[var(--a-muted)]">
          Calculá al instante cuánto le tomás el celular usado al cliente y la
          diferencia a pagar por el modelo nuevo, con cotización en USD y ARS.
        </p>

        {/* Sección: Equipo que entrega el cliente */}
        <div className="rounded-xl border border-[var(--a-border)] bg-[var(--a-surface-2)] p-4 space-y-3">
          <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--a-text)]">
            <Smartphone size={15} className="text-[var(--a-accent)]" />
            1. Equipo que entrega el cliente
          </h4>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-[var(--a-muted)]">
                Modelo usado
              </label>
              <select
                className="admin-input"
                value={clientModel}
                onChange={(e) => setClientModel(e.target.value)}
              >
                {Object.keys(BASE_TRADE_IN).map((m) => (
                  <option key={m} value={m}>
                    {m} (Base US$ {BASE_TRADE_IN[m]})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--a-muted)]">
                Salud Batería (%)
              </label>
              <input
                type="number"
                min={50}
                max={100}
                className="admin-input"
                value={batteryHealth}
                onChange={(e) => setBatteryHealth(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-[var(--a-muted)]">Estado estético:</span>
            {[
              { id: "impecable", label: "✨ Impecable (+5%)" },
              { id: "bueno", label: "👌 Normal / Bueno" },
              { id: "detalles", label: "⚠️ Con detalles (-12%)" },
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setConditionGrade(c.id)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                  conditionGrade === c.id
                    ? "bg-[var(--a-accent)] text-white shadow-sm"
                    : "border border-[var(--a-border-strong)] bg-[var(--a-surface)] text-[var(--a-muted)] hover:text-[var(--a-text)]"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="mt-2 flex items-center justify-between rounded-lg bg-[var(--a-surface)] p-2.5 border border-[var(--a-border)]">
            <span className="text-xs text-[var(--a-muted)]">
              Valor de toma recomendado para este equipo:
            </span>
            <span className="text-base font-bold text-[var(--a-accent)] tabular-nums">
              US$ {tradeInUSD}
            </span>
          </div>
        </div>

        {/* Sección: Equipo que quiere comprar */}
        <div className="rounded-xl border border-[var(--a-border)] bg-[var(--a-surface-2)] p-4 space-y-3">
          <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--a-text)]">
            <Sparkles size={15} className="text-[var(--a-warning)]" />
            2. Equipo que se lleva de la tienda
          </h4>

          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--a-muted)]">
              Elegir del catálogo
            </label>
            <select
              className="admin-input"
              value={targetProductId}
              onChange={(e) => setTargetProductId(e.target.value)}
            >
              {products
                .filter((p) => p.price != null)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {fullName(p)} — US$ {p.price} ({p.condition})
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Resumen del cálculo final */}
        <div className="rounded-2xl border border-[var(--a-success-border)] bg-[var(--a-success-bg)] p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-[var(--a-success)]">
                Diferencia que abona el cliente:
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-[var(--a-text)] tabular-nums">
                  US$ {differenceUSD.toLocaleString("es-AR")}
                </span>
                {arsRate != null && (
                  <span className="text-sm font-semibold text-[var(--a-muted)] tabular-nums">
                    ≈ {formatARS(differenceUSD, arsRate)} ARS
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={copyQuoteWhatsApp}
              className="admin-btn admin-btn--primary admin-btn--sm self-start sm:self-auto !bg-[#25D366] hover:!bg-[#20ba59]"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "¡Mensaje copiado!" : "Copiar mensaje WhatsApp"}
            </button>
          </div>
        </div>
      </div>
    </AdminModal>
  );
}
