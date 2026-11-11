"use client";

import { useState, type KeyboardEvent } from "react";
import type { Product } from "@/types";
import { useStoreSettings } from "@/components/StoreSettings";
import { formatARS, formatUSD } from "@/lib/format";
import { PAYMENT_ALIAS, waLink } from "@/lib/whatsapp";
import {
  Banknote,
  CreditCard,
  Coins,
  ArrowRightLeft,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

const LINK_BTN =
  "flex h-11 items-center justify-center gap-2 rounded-full! bg-surface px-4 text-[13px] font-semibold text-fg ring-1 ring-fg/[0.12] transition duration-300 hover:ring-fg/30";

interface PaymentCalculatorProps {
  product: Product;
}

type TabType = "cash" | "card" | "crypto" | "tradein";

const TRADE_IN_CATALOG: { model: string; storage: string; baseUsd: number }[] = [
  { model: "iPhone 11", storage: "64GB", baseUsd: 180 },
  { model: "iPhone 11", storage: "128GB", baseUsd: 210 },
  { model: "iPhone 12", storage: "64GB", baseUsd: 250 },
  { model: "iPhone 12", storage: "128GB", baseUsd: 290 },
  { model: "iPhone 13", storage: "128GB", baseUsd: 380 },
  { model: "iPhone 13", storage: "256GB", baseUsd: 430 },
  { model: "iPhone 13 Pro", storage: "128GB", baseUsd: 480 },
  { model: "iPhone 14", storage: "128GB", baseUsd: 460 },
  { model: "iPhone 14 Pro", storage: "128GB", baseUsd: 590 },
  { model: "iPhone 15", storage: "128GB", baseUsd: 580 },
  { model: "iPhone 15 Pro", storage: "128GB", baseUsd: 740 },
];

export function PaymentCalculator({ product }: { product: Product }) {
  const { arsRate } = useStoreSettings();
  const [activeTab, setActiveTab] = useState<TabType>("cash");
  const [installments, setInstallments] = useState<1 | 3 | 6 | 12>(3);

  // Plan canje state
  const [selectedTradeInIdx, setSelectedTradeInIdx] = useState(2); // default iPhone 12 64GB
  const [tradeInCondition, setTradeInCondition] = useState<"optimo" | "bueno" | "detalles">("bueno");

  const priceUsd = product.price ?? 0;
  if (!priceUsd || product.priceType === "consultar") return null;

  const priceArs = priceUsd * arsRate;

  // Installment rates
  const installmentConfig = {
    1: { factor: 1.0, label: "1 pago (al cambio)", feePct: 0 },
    3: { factor: 1.14, label: "3 cuotas fijas", feePct: 14 },
    6: { factor: 1.27, label: "6 cuotas fijas", feePct: 27 },
    12: { factor: 1.48, label: "12 cuotas fijas", feePct: 48 },
  };

  const currentPlan = installmentConfig[installments];
  const financedTotalArs = priceArs * currentPlan.factor;
  const installmentArs = financedTotalArs / installments;

  // Trade-in calculation
  const currentTradeIn = TRADE_IN_CATALOG[selectedTradeInIdx] ?? TRADE_IN_CATALOG[0];
  const conditionMultiplier =
    tradeInCondition === "optimo" ? 1.0 : tradeInCondition === "bueno" ? 0.9 : 0.78;
  const tradeInEstimatedUsd = Math.round(currentTradeIn.baseUsd * conditionMultiplier);
  const tradeInDiffUsd = Math.max(0, priceUsd - tradeInEstimatedUsd);
  const tradeInDiffArs = tradeInDiffUsd * arsRate;


  const tabs = [
    { id: "cash", label: "Efectivo", sub: "o transferencia", Icon: Banknote },
    { id: "card", label: "Cuotas", sub: "con tarjeta", Icon: CreditCard },
    { id: "crypto", label: "USDT", sub: "cripto", Icon: Coins },
    { id: "tradein", label: "Canje", sub: "tu usado", Icon: ArrowRightLeft },
  ] as const;
  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const idx = tabs.findIndex((t) => t.id === activeTab);
    const map: Record<string, number> = {
      ArrowRight: idx + 1,
      ArrowLeft: idx - 1,
      Home: 0,
      End: tabs.length - 1,
    };
    if (!(e.key in map)) return;
    e.preventDefault();
    const next = tabs[(map[e.key] + tabs.length) % tabs.length].id;
    setActiveTab(next);
    document.getElementById(`pay-tab-${next}`)?.focus();
  };

  return (
    <div className="mt-5 rounded-[22px] bg-bg p-3 ring-1 ring-fg/[0.06] sm:p-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 pb-3">
        <span className="text-[13px] font-semibold tracking-[-0.01em] text-fg">
          ¿Cómo querés pagar?
        </span>
        <span className="tabular inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-[11px] font-medium text-fg/60 ring-1 ring-fg/[0.06]">
          <span className="size-1.5 rounded-full bg-[#34c759]" aria-hidden="true" />
          Dólar hoy {formatARS(1, arsRate)}
        </span>
      </div>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Medios de pago"
        onKeyDown={onTabKey}
        className="grid grid-cols-4 gap-1 rounded-2xl bg-fg/[0.05] p-1"
      >
        {tabs.map(({ id, label, sub, Icon }) => {
          const on = activeTab === id;
          return (
            <button
              key={id}
              id={`pay-tab-${id}`}
              type="button"
              role="tab"
              aria-selected={on}
              aria-controls="pay-panel"
              tabIndex={on ? 0 : -1}
              onClick={() => setActiveTab(id)}
              className={`flex flex-col items-center justify-center gap-0.5 rounded-xl! px-1 py-2 text-center transition duration-300 ease-[var(--ease-soft)] ${
                on
                  ? "bg-surface text-fg shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_-6px_rgba(0,0,0,0.12)]"
                  : "text-fg/55 hover:text-fg"
              }`}
            >
              <Icon className={`mb-0.5 size-4 shrink-0 ${on ? "text-vita" : ""}`} aria-hidden="true" />
              <span className="text-xs font-semibold leading-tight">{label}</span>
              <span className="hidden text-[10px] leading-tight text-fg/45 sm:block">{sub}</span>
            </button>
          );
        })}
      </div>

      <div
        id="pay-panel"
        role="tabpanel"
        aria-labelledby={`pay-tab-${activeTab}`}
        className="mt-3"
      >
      {/* Tab 1: Efectivo / Transferencia */}
      {activeTab === "cash" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 divide-x divide-fg/[0.08] rounded-2xl bg-surface ring-1 ring-fg/[0.06]">
            <div className="p-3.5 sm:p-4">
              <span className="text-[11px] font-medium text-fg/50">En dólares</span>
              <p className="tabular mt-0.5 text-lg font-semibold tracking-[-0.02em] text-fg sm:text-xl">
                {formatUSD(priceUsd)}
              </p>
            </div>
            <div className="p-3.5 text-right sm:p-4">
              <span className="text-[11px] font-medium text-fg/50">En pesos, hoy</span>
              <p className="tabular mt-0.5 text-lg font-semibold tracking-[-0.02em] text-fg sm:text-xl">
                {formatARS(priceUsd, arsRate)}
              </p>
            </div>
          </div>

          <ul className="grid gap-2 px-1 text-[13px] leading-snug text-fg/65">
            <li className="flex items-start gap-2">
              <ShieldCheck className="mt-px size-4 shrink-0 text-vita" aria-hidden="true" />
              <span>
                <strong className="font-semibold text-fg">Dólares billete:</strong> aceptamos billetes cara grande en buen estado.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck className="mt-px size-4 shrink-0 text-vita" aria-hidden="true" />
              <span>
                <strong className="font-semibold text-fg">Transferencia o billetera:</strong> pesos al cambio del día, sin recargo.
              </span>
            </li>
          </ul>

          <p className="mx-1 border-t border-fg/[0.08] pt-2.5 text-[12px] leading-relaxed text-fg/50">
            Alias:{" "}
            <strong className="select-all rounded bg-surface px-1.5 py-0.5 font-mono text-fg/80 ring-1 ring-fg/[0.06]">{PAYMENT_ALIAS}</strong>
            {" "}· transferí recién cuando te confirmemos el stock por WhatsApp.
          </p>
        </div>
      )}

      {/* Tab 2: Cuotas y Tarjetas */}
      {activeTab === "card" && (
        <div className="space-y-3">
          <div role="radiogroup" aria-label="Cantidad de cuotas" className="grid grid-cols-4 gap-1.5">
            {([1, 3, 6, 12] as const).map((cuotas) => {
              const on = installments === cuotas;
              return (
                <button
                  key={cuotas}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setInstallments(cuotas)}
                  className={`rounded-xl! px-1 py-2 text-center transition duration-300 ${
                    on
                      ? "bg-surface text-fg ring-2 ring-vita"
                      : "bg-surface/60 text-fg/70 ring-1 ring-fg/[0.08] hover:bg-surface hover:ring-fg/20"
                  }`}
                >
                  <div className="tabular text-sm font-semibold">{cuotas} {cuotas === 1 ? "pago" : "cuotas"}</div>
                  <div className="text-[10px] text-fg/50">
                    {cuotas === 1 ? "sin recargo" : `+${installmentConfig[cuotas].feePct}%`}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Cuota calculation highlight */}
          <div className="rounded-2xl bg-surface p-4 text-center ring-1 ring-fg/[0.06]" aria-live="polite">
            <span className="text-xs text-fg/55">
              {installments === 1 ? "Total a abonar en 1 pago" : `${installments} cuotas fijas mensuales de`}
            </span>
            <div className="tabular mt-1 text-[28px] font-semibold leading-tight tracking-[-0.03em] text-fg sm:text-[32px]">
              {formatARS(installmentArs / arsRate, arsRate)}
              <span className="ml-1 text-xs font-normal tracking-normal text-fg/50">/ mes</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-2 text-[11px] text-fg/50">
              <span className="tabular">Total financiado: {formatARS(financedTotalArs / arsRate, arsRate)}</span>
              <span aria-hidden="true">·</span>
              <span>Visa / Mastercard / Cabal</span>
            </div>
          </div>

          <a
            href={waLink(
              `Hola iPhone Vita! Me interesa el ${product.name} y quisiera pagar con tarjeta en ${installments} cuotas fijas ($${Math.round(installmentArs).toLocaleString("es-AR")} por mes). ¿Me envían el link de pago?`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className={LINK_BTN}
          >
            <span>Pedir link de pago en {installments} {installments === 1 ? "pago" : "cuotas"}</span>
            <ExternalLink className="size-3.5 text-fg/50" aria-hidden="true" />
          </a>
        </div>
      )}

      {/* Tab 3: Cripto USDT */}
      {activeTab === "crypto" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-surface p-3.5 ring-1 ring-fg/[0.06] sm:p-4">
            <div>
              <span className="text-[11px] font-medium text-fg/50">Monto a abonar</span>
              <p className="tabular text-[22px] font-semibold tracking-[-0.02em] text-fg">
                {priceUsd} <span className="text-sm font-semibold text-vita">USDT</span>
              </p>
            </div>
            <span className="rounded-full bg-vita-soft px-2.5 py-1 text-[11px] font-semibold text-vita">
              0% comisión
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-surface/70 p-3 ring-1 ring-fg/[0.06]">
              <span className="block font-semibold text-fg">Binance Pay</span>
              <span className="mt-0.5 block text-[11px] leading-snug text-fg/55">Transferencia directa por Pay ID al instante</span>
            </div>
            <div className="rounded-xl bg-surface/70 p-3 ring-1 ring-fg/[0.06]">
              <span className="block font-semibold text-fg">USDT (TRC20 / BEP20)</span>
              <span className="mt-0.5 block text-[11px] leading-snug text-fg/55">Envío a wallet propia con acreditación en 3 min</span>
            </div>
          </div>

          <a
            href={waLink(
              `Hola iPhone Vita! Quiero abonar el ${product.name} (${priceUsd} USDT) con Cripto / Binance Pay. ¿Me pasan su QR o Pay ID?`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className={LINK_BTN}
          >
            <span>Pedir Binance Pay ID o wallet</span>
            <ExternalLink className="size-3.5 text-fg/50" aria-hidden="true" />
          </a>
        </div>
      )}

      {/* Tab 4: Plan Canje Express */}
      {activeTab === "tradein" && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <div>
              <label htmlFor="tradein-model" className="mb-1 block px-1 text-[11px] font-medium text-fg/55">
                ¿Qué iPhone entregás?
              </label>
              <select
                id="tradein-model"
                value={selectedTradeInIdx}
                onChange={(e) => setSelectedTradeInIdx(Number(e.target.value))}
                className="h-9 w-full rounded-xl bg-surface px-2.5 text-[13px] text-fg ring-1 ring-fg/[0.12] transition hover:ring-fg/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-vita"
              >
                {TRADE_IN_CATALOG.map((item, idx) => (
                  <option key={`${item.model}-${item.storage}`} value={idx}>
                    {item.model} ({item.storage})
                  </option>
                ))}
              </select>
            </div>

            <div role="radiogroup" aria-labelledby="tradein-cond">
              <span id="tradein-cond" className="mb-1 block px-1 text-[11px] font-medium text-fg/55">
                Estado y batería
              </span>
              <div className="grid h-9 grid-cols-3 gap-1">
                {(
                  [
                    { id: "optimo", label: "Impecable" },
                    { id: "bueno", label: "Normal" },
                    { id: "detalles", label: "Marcas" },
                  ] as const
                ).map((c) => {
                  const on = tradeInCondition === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setTradeInCondition(c.id)}
                      className={`rounded-xl! px-1 text-[12px] font-medium transition duration-300 ${
                        on
                          ? "bg-surface text-fg ring-2 ring-vita"
                          : "bg-surface/60 text-fg/60 ring-1 ring-fg/[0.08] hover:bg-surface hover:text-fg"
                      }`}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Trade-in result */}
          <div className="rounded-2xl bg-surface p-3.5 ring-1 ring-fg/[0.06] sm:p-4" aria-live="polite">
            <div className="flex items-center justify-between gap-3 border-b border-fg/[0.08] pb-2.5 text-[13px] text-fg/65">
              <span>Tomamos tu {currentTradeIn.model} en</span>
              <span className="tabular font-semibold text-fg">~{formatUSD(tradeInEstimatedUsd)}</span>
            </div>
            <div className="flex items-end justify-between gap-3 pt-2.5">
              <div>
                <span className="text-[11px] font-semibold text-vita">
                  Diferencia a abonar
                </span>
                <p className="tabular text-[22px] font-semibold tracking-[-0.02em] text-fg">
                  {formatUSD(tradeInDiffUsd)}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-fg/50">En pesos, hoy</span>
                <p className="tabular text-sm font-semibold text-fg/80">
                  ≈ {formatARS(tradeInDiffUsd, arsRate)}
                </p>
              </div>
            </div>
          </div>

          <a
            href={waLink(
              `Hola iPhone Vita! Me interesa el ${product.name} ($${priceUsd} USD) y quiero entregar mi ${currentTradeIn.model} ${currentTradeIn.storage} (${tradeInCondition}). Según el cotizador entregaría mi usado y pagaría una diferencia estimada de $${tradeInDiffUsd} USD. ¿Coordinamos la revisión?`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className={LINK_BTN}
          >
            <span>Consultar canje y coordinar entrega</span>
            <ArrowRightLeft className="size-3.5 text-fg/50" aria-hidden="true" />
          </a>
        </div>
      )}
      </div>
    </div>
  );
}
