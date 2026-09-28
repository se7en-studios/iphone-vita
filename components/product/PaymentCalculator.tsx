"use client";

import { useState } from "react";
import type { Product } from "@/types";
import { useStoreSettings } from "@/components/StoreSettings";
import { formatARS, formatUSD } from "@/lib/format";
import { waLink } from "@/lib/whatsapp";
import {
  Banknote,
  CreditCard,
  Coins,
  ArrowRightLeft,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

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
  const [copiedAlias, setCopiedAlias] = useState(false);

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

  const handleCopyAlias = () => {
    navigator.clipboard.writeText("IPHONE.VITA.MP");
    setCopiedAlias(true);
    setTimeout(() => setCopiedAlias(false), 2200);
  };

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-4.5 sm:p-5 shadow-xl backdrop-blur-md">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-champagne" />
          <span className="text-xs font-semibold uppercase tracking-wider text-fg/90">
            Simulador de Pagos & Financiación
          </span>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-500/20">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          1 USD = {formatARS(1, arsRate)}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-3.5 grid grid-cols-4 gap-1 rounded-xl bg-white/[0.03] p-1 border border-white/5">
        <button
          type="button"
          onClick={() => setActiveTab("cash")}
          className={`flex flex-col items-center justify-center gap-1 rounded-lg py-2 px-1 text-center transition ${
            activeTab === "cash"
              ? "bg-white/10 text-fg shadow-sm font-semibold"
              : "text-fg/60 hover:text-fg hover:bg-white/[0.04]"
          }`}
        >
          <Banknote className="size-4 shrink-0" />
          <span className="text-[11px] leading-tight">Efectivo / Transf.</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("card")}
          className={`flex flex-col items-center justify-center gap-1 rounded-lg py-2 px-1 text-center transition ${
            activeTab === "card"
              ? "bg-white/10 text-fg shadow-sm font-semibold"
              : "text-fg/60 hover:text-fg hover:bg-white/[0.04]"
          }`}
        >
          <CreditCard className="size-4 shrink-0" />
          <span className="text-[11px] leading-tight">Cuotas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("crypto")}
          className={`flex flex-col items-center justify-center gap-1 rounded-lg py-2 px-1 text-center transition ${
            activeTab === "crypto"
              ? "bg-white/10 text-fg shadow-sm font-semibold"
              : "text-fg/60 hover:text-fg hover:bg-white/[0.04]"
          }`}
        >
          <Coins className="size-4 shrink-0" />
          <span className="text-[11px] leading-tight">Cripto USDT</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tradein")}
          className={`flex flex-col items-center justify-center gap-1 rounded-lg py-2 px-1 text-center transition ${
            activeTab === "tradein"
              ? "bg-champagne/20 text-champagne shadow-sm font-semibold border border-champagne/30"
              : "text-fg/60 hover:text-fg hover:bg-white/[0.04]"
          }`}
        >
          <ArrowRightLeft className="size-4 shrink-0" />
          <span className="text-[11px] leading-tight">Plan Canje</span>
        </button>
      </div>

      {/* Tab 1: Efectivo / Transferencia */}
      {activeTab === "cash" && (
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 flex items-baseline justify-between">
            <div>
              <span className="text-[11px] text-fg/50 uppercase font-medium">Total en Dólares</span>
              <p className="text-xl font-bold text-fg tabular tracking-tight">
                {formatUSD(priceUsd)}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-fg/50 uppercase font-medium">Equivalente en Pesos</span>
              <p className="text-lg font-semibold text-emerald-400 tabular tracking-tight">
                {formatARS(priceUsd, arsRate)}
              </p>
            </div>
          </div>

          <div className="grid gap-2 text-xs text-fg/70">
            <div className="flex items-start gap-2">
              <ShieldCheck className="size-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>
                <strong className="text-fg">Dólares billete:</strong> Aceptamos billetes cara grande en buen estado.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <ShieldCheck className="size-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>
                <strong className="text-fg">Transferencia bancaria / billetera:</strong> Pesos al cambio del día sin recargos.
              </span>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between gap-2 border-t border-white/5">
            <div className="text-[11px] text-fg/50">
              Alias de cobro: <span className="font-mono text-fg/80 font-medium">IPHONE.VITA.MP</span>
            </div>
            <button
              type="button"
              onClick={handleCopyAlias}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-fg/80 hover:bg-white/10 transition"
            >
              {copiedAlias ? (
                <>
                  <Check className="size-3.5 text-emerald-400" />
                  <span className="text-emerald-400">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5 text-fg/60" />
                  <span>Copiar Alias</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Cuotas y Tarjetas */}
      {activeTab === "card" && (
        <div className="mt-4 space-y-3.5">
          <div className="grid grid-cols-4 gap-1.5">
            {([1, 3, 6, 12] as const).map((cuotas) => (
              <button
                key={cuotas}
                type="button"
                onClick={() => setInstallments(cuotas)}
                className={`rounded-lg py-2 px-1 text-center transition border ${
                  installments === cuotas
                    ? "border-accent bg-accent/15 text-accent font-semibold"
                    : "border-white/5 bg-white/[0.02] text-fg/70 hover:bg-white/5"
                }`}
              >
                <div className="text-sm font-bold">{cuotas} {cuotas === 1 ? "pago" : "cuotas"}</div>
                <div className="text-[10px] text-fg/50">
                  {cuotas === 1 ? "sin recargo" : `+${installmentConfig[cuotas].feePct}%`}
                </div>
              </button>
            ))}
          </div>

          {/* Cuota calculation highlight */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
            <span className="text-xs text-fg/60">
              {installments === 1 ? "Total a abonar en 1 pago" : `${installments} cuotas fijas mensuales de:`}
            </span>
            <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-fg tracking-tight tabular">
              {formatARS(installmentArs / arsRate, arsRate)}
              <span className="text-xs font-normal text-fg/50 ml-1">/ mes</span>
            </div>
            <div className="mt-2 text-[11px] text-fg/50 flex items-center justify-center gap-2">
              <span>Total financiado: {formatARS(financedTotalArs / arsRate, arsRate)}</span>
              <span>·</span>
              <span>Visa / Mastercard / Cabal</span>
            </div>
          </div>

          <a
            href={waLink(
              `Hola iPhone Vita! Me interesa el ${product.name} y quisiera pagar con tarjeta en ${installments} cuotas fijas ($${Math.round(installmentArs).toLocaleString("es-AR")} por mes). ¿Me envían el link de pago?`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-white/10 py-2.5 text-xs font-semibold text-fg hover:bg-white/20 transition"
          >
            <span>Pedir link de pago para {installments} cuotas</span>
            <ExternalLink className="size-3.5 text-fg/60" />
          </a>
        </div>
      )}

      {/* Tab 3: Cripto USDT */}
      {activeTab === "crypto" && (
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] p-3.5 flex items-baseline justify-between">
            <div>
              <span className="text-[11px] text-emerald-400 uppercase font-medium">Monto a abonar</span>
              <p className="text-2xl font-black text-fg tabular">
                {priceUsd} <span className="text-sm font-semibold text-emerald-400">USDT</span>
              </p>
            </div>
            <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
              0% Comisión
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <span className="font-semibold text-fg block">Binance Pay</span>
              <span className="text-[11px] text-fg/60 mt-0.5 block">Transferencia directa por Pay ID al instante</span>
            </div>
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <span className="font-semibold text-fg block">USDT (TRC20 / BEP20)</span>
              <span className="text-[11px] text-fg/60 mt-0.5 block">Envío a wallet propia con acreditación en 3 min</span>
            </div>
          </div>

          <a
            href={waLink(
              `Hola iPhone Vita! Quiero abonar el ${product.name} (${priceUsd} USDT) con Cripto / Binance Pay. ¿Me pasan su QR o Pay ID?`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-white/10 py-2.5 text-xs font-semibold text-fg hover:bg-white/20 transition"
          >
            <span>Solicitar Binance Pay ID / Wallet</span>
            <ExternalLink className="size-3.5 text-fg/60" />
          </a>
        </div>
      )}

      {/* Tab 4: Plan Canje Express */}
      {activeTab === "tradein" && (
        <div className="mt-4 space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-medium text-fg/60 block mb-1">
                ¿Qué iPhone entregás?
              </label>
              <select
                value={selectedTradeInIdx}
                onChange={(e) => setSelectedTradeInIdx(Number(e.target.value))}
                className="w-full rounded-lg border border-white/15 bg-white/[0.05] px-2.5 py-1.5 text-xs text-fg focus:border-champagne focus:outline-none"
              >
                {TRADE_IN_CATALOG.map((item, idx) => (
                  <option key={`${item.model}-${item.storage}`} value={idx} className="bg-[#1a1a1a] text-fg">
                    {item.model} ({item.storage})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-fg/60 block mb-1">
                Estado y Batería
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(
                  [
                    { id: "optimo", label: "Impecable" },
                    { id: "bueno", label: "Normal" },
                    { id: "detalles", label: "Marcas" },
                  ] as const
                ).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setTradeInCondition(c.id)}
                    className={`rounded py-1 px-1 text-[11px] font-medium transition border ${
                      tradeInCondition === c.id
                        ? "border-champagne bg-champagne/20 text-champagne"
                        : "border-white/5 bg-white/[0.02] text-fg/60 hover:bg-white/5"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Trade-in result */}
          <div className="rounded-xl border border-champagne/30 bg-champagne/[0.05] p-3.5">
            <div className="flex items-center justify-between text-xs text-fg/70 border-b border-white/5 pb-2">
              <span>Tomamos tu {currentTradeIn.model} en:</span>
              <span className="font-semibold text-emerald-400 tabular">~{formatUSD(tradeInEstimatedUsd)}</span>
            </div>
            <div className="pt-2 flex items-baseline justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-champagne">
                  Diferencia a abonar:
                </span>
                <p className="text-2xl font-black text-fg tabular">
                  {formatUSD(tradeInDiffUsd)}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-fg/50">En pesos al día</span>
                <p className="text-sm font-semibold text-emerald-400 tabular">
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
            className="flex items-center justify-center gap-2 rounded-xl bg-champagne py-2.5 text-xs font-bold text-black hover:bg-[#dfc7aa] transition shadow-md"
          >
            <span>Consultar canje y coordinar entrega</span>
            <ArrowRightLeft className="size-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}
