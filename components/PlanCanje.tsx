"use client";

import { useMemo, useState } from "react";
import { waLink } from "@/lib/whatsapp";
import { formatUSD } from "@/lib/format";
import { ChatIcon } from "./ui/Icons";
import { Ars } from "./StoreSettings";

interface CurrentPhone {
  model: string;
  baseTradeIn: number;
}

const CURRENT_MODELS: CurrentPhone[] = [
  { model: "iPhone XR / XS / XS Max", baseTradeIn: 180 },
  { model: "iPhone 11", baseTradeIn: 230 },
  { model: "iPhone 11 Pro / Pro Max", baseTradeIn: 290 },
  { model: "iPhone 12 / 12 Mini", baseTradeIn: 320 },
  { model: "iPhone 12 Pro / Pro Max", baseTradeIn: 400 },
  { model: "iPhone 13 / 13 Mini", baseTradeIn: 440 },
  { model: "iPhone 13 Pro / Pro Max", baseTradeIn: 550 },
  { model: "iPhone 14 / 14 Plus", baseTradeIn: 520 },
  { model: "iPhone 14 Pro / Pro Max", baseTradeIn: 680 },
  { model: "iPhone 15 / 15 Plus", baseTradeIn: 640 },
  { model: "iPhone 15 Pro / Pro Max", baseTradeIn: 800 },
  { model: "iPhone 16 / 16 Plus", baseTradeIn: 720 },
  { model: "iPhone 16 Pro / Pro Max", baseTradeIn: 920 },
];

/** iPhone nuevo que te podés llevar: sale del catálogo real (modelo + capacidad más barata). */
export interface CanjeTarget {
  model: string;
  price: number;
}

export function PlanCanje({ targets }: { targets: CanjeTarget[] }) {
  const [currentIdx, setCurrentIdx] = useState(4); // iPhone 13 default
  const [targetIdx, setTargetIdx] = useState(Math.min(2, Math.max(0, targets.length - 1)));
  const [batteryState, setBatteryState] = useState<"alta" | "media">("alta");

  const current = CURRENT_MODELS[currentIdx];
  const target = targets[Math.min(targetIdx, targets.length - 1)];

  const estimatedTradeIn = useMemo(() => {
    let val = current.baseTradeIn;
    if (batteryState === "media") val -= 40;
    return val;
  }, [current, batteryState]);

  if (!target) return null;
  const difference = Math.max(0, target.price - estimatedTradeIn);

  const whatsappMessage = `Hola iPhone Vita! Quiero consultar por el Plan Canje: Entrego mi ${current.model} (${batteryState === "alta" ? "Batería +85% / excelente estado" : "Batería normal"}) y quiero llevarme el ${target.model}. Según la web la diferencia estimada es de aprox. $${difference} USD. ¿Podemos coordinar la revisión del equipo?`;

  return (
    <section
      id="plan-canje"
      className="scroll-mt-28 border-t border-white/10 bg-black py-16 text-white md:py-40"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div
          data-reveal
          className="mx-auto max-w-[980px] space-y-5 text-center"
        >
          <p className="text-lg font-semibold text-[#ebd7be] md:text-xl">
            Plan Canje
          </p>
          <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[1.05] tracking-[-0.03em]">
            Entregá tu iPhone usado. <br />
            <span className="text-[#ebd7be]">Llevate el último modelo.</span>
          </h2>
          <p className="mx-auto max-w-[60ch] text-lg text-white/60 md:text-xl">
            Tomamos tu equipo actual en parte de pago al mejor valor del
            mercado. Calculá tu diferencia en segundos:
          </p>
        </div>

        {/* Card interactiva */}
        <div
          data-reveal
          className="mx-auto mt-10 max-w-4xl rounded-[28px] bg-[#0a0a0a] p-6 ring-1 ring-white/10 md:p-10"
        >
          <div className="grid gap-8 md:grid-cols-2 md:gap-12">
            {/* Columna Izquierda: Lo que entregás */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs text-[#ebd7be]/80 font-semibold">
                  Paso 1: Tu equipo actual
                </span>
                <span className="text-xs text-white/50">iPhone usado</span>
              </div>

              <div className="space-y-2">
                <label htmlFor="canje-actual" className="text-sm font-medium text-white/80">
                  Modelo que tenés:
                </label>
                <select
                  id="canje-actual"
                  value={currentIdx}
                  onChange={(e) => setCurrentIdx(Number(e.target.value))}
                  className="w-full rounded-2xl border border-white/15 bg-[#0a0a0a] px-4 py-3.5 text-sm text-white focus:border-[#ebd7be] focus:outline-none"
                >
                  {CURRENT_MODELS.map((item, idx) => (
                    <option key={item.model} value={idx}>
                      {item.model}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-white/80">
                  Estado de batería y detalles:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBatteryState("alta")}
                    aria-pressed={batteryState === "alta"}
                    className={`rounded-xl border p-3 text-xs text-left transition ${
                      batteryState === "alta"
                        ? "border-[#ebd7be] bg-[#ebd7be]/15 text-[#ebd7be]"
                        : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    <span className="block font-semibold">
                      Excelente (+85%)
                    </span>
                    <span className="text-[11px] opacity-80">
                      Sin marcas graves
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatteryState("media")}
                    aria-pressed={batteryState === "media"}
                    className={`rounded-xl border p-3 text-xs text-left transition ${
                      batteryState === "media"
                        ? "border-[#ebd7be] bg-[#ebd7be]/15 text-[#ebd7be]"
                        : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    <span className="block font-semibold">
                      Uso normal (-85%)
                    </span>
                    <span className="text-[11px] opacity-80">
                      Detalles de uso
                    </span>
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 text-center">
                <span className="block text-xs text-white/50">
                  Valor estimado de toma:
                </span>
                <span className="text-2xl font-bold text-[#ebd7be]">
                  ~ {formatUSD(estimatedTradeIn)}
                </span>
              </div>
            </div>

            {/* Columna Derecha: Lo que te llevás */}
            <div className="flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs text-[#ebd7be]/80 font-semibold">
                    Paso 2: Tu nuevo iPhone
                  </span>
                  <span className="text-xs text-white/50">
                    Sellado con Garantía
                  </span>
                </div>

                <div className="mt-6 space-y-2">
                  <label htmlFor="canje-nuevo" className="text-sm font-medium text-white/80">
                    Modelo que querés llevarte:
                  </label>
                  <select
                    id="canje-nuevo"
                    value={targetIdx}
                    onChange={(e) => setTargetIdx(Number(e.target.value))}
                    className="w-full rounded-2xl border border-white/15 bg-[#0a0a0a] px-4 py-3.5 text-sm text-white focus:border-[#ebd7be] focus:outline-none"
                  >
                    {targets.map((item, idx) => (
                      <option key={item.model} value={idx}>
                        {item.model} — {formatUSD(item.price)}
                      </option>
                    ))}
                  </select>
                </div>

                <p className="mt-4 text-xs text-[#ebd7be]">
                  Incluye funda y templado de regalo.
                </p>
              </div>

              {/* Resultado del cálculo */}
              <div className="rounded-3xl bg-white/[0.04] p-6 text-center ring-1 ring-white/10">
                <span className="block text-sm text-white/60">
                  Diferencia estimada a pagar
                </span>
                <div className="mt-1 flex items-baseline justify-center gap-2">
                  <span className="text-4xl font-bold text-[#ebd7be] md:text-5xl">
                    {formatUSD(difference)}
                  </span>
                </div>
                <span className="mt-1 block text-xs text-white/50">
                  ≈ <Ars usd={difference} /> al cambio del día
                </span>

                <a
                  href={waLink(whatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#ebd7be] px-5 py-4 text-sm font-bold text-black transition hover:bg-white"
                >
                  <ChatIcon className="size-4 shrink-0" />
                  <span>Cotizar por WhatsApp</span>
                </a>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] text-white/50">
                  <span>⚡ Revisión en 15 minutos</span>
                  <span>·</span>
                  <span>🛡️ Garantía oficial</span>
                  <span>·</span>
                  <span>💵 Diferencia en USD, Pesos o USDT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
