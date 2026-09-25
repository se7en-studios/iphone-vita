"use client";

import { useMemo, useState } from "react";
import { waLink } from "@/lib/whatsapp";
import { formatUSD } from "@/lib/format";
import { ArrowIcon, ChatIcon } from "./ui/Icons";

interface CurrentPhone {
  model: string;
  baseTradeIn: number;
}

const CURRENT_MODELS: CurrentPhone[] = [
  { model: "iPhone 11", baseTradeIn: 220 },
  { model: "iPhone 11 Pro / Pro Max", baseTradeIn: 280 },
  { model: "iPhone 12", baseTradeIn: 320 },
  { model: "iPhone 12 Pro / Pro Max", baseTradeIn: 390 },
  { model: "iPhone 13", baseTradeIn: 430 },
  { model: "iPhone 13 Pro / Pro Max", baseTradeIn: 540 },
  { model: "iPhone 14", baseTradeIn: 510 },
  { model: "iPhone 14 Pro / Pro Max", baseTradeIn: 660 },
  { model: "iPhone 15", baseTradeIn: 620 },
  { model: "iPhone 15 Pro / Pro Max", baseTradeIn: 780 },
  { model: "iPhone 16", baseTradeIn: 700 },
];

const TARGET_MODELS = [
  { model: "iPhone 16 (128 GB)", price: 890 },
  { model: "iPhone 17 (256 GB)", price: 1090 },
  { model: "iPhone 17 Pro (256 GB)", price: 1290 },
  { model: "iPhone 18 Pro (256 GB)", price: 1605 },
];

export function PlanCanje() {
  const [currentIdx, setCurrentIdx] = useState(4); // iPhone 13 default
  const [targetIdx, setTargetIdx] = useState(2); // iPhone 17 Pro default
  const [batteryState, setBatteryState] = useState<"alta" | "media">("alta");

  const current = CURRENT_MODELS[currentIdx];
  const target = TARGET_MODELS[targetIdx];

  const estimatedTradeIn = useMemo(() => {
    let val = current.baseTradeIn;
    if (batteryState === "media") val -= 40;
    return val;
  }, [current, batteryState]);

  const difference = Math.max(0, target.price - estimatedTradeIn);

  const whatsappMessage = `Hola iPhone Vita! Quiero consultar por el Plan Canje: Entrego mi ${current.model} (${batteryState === "alta" ? "Batería +85% / excelente estado" : "Batería normal"}) y quiero llevarme el ${target.model}. Según la web la diferencia estimada es de aprox. $${difference} USD. ¿Podemos coordinar la revisión del equipo?`;

  return (
    <section id="plan-canje" className="relative isolate overflow-hidden border-t border-white/10 bg-[#050b18] py-20 text-white md:py-28">
      {/* Resplandor de fondo */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3877ff]/10 blur-[130px]" />

      <div className="relative mx-auto max-w-7xl px-4 md:px-8">
        <div className="mx-auto max-w-3xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#ebd7be]/30 bg-[#ebd7be]/10 px-4 py-1.5 text-xs font-semibold text-[#ebd7be]">
            <span>🔄</span> Plan Canje Oficial iPhone Vita
          </div>
          <h2 className="text-[clamp(2.2rem,5vw,3.6rem)] font-bold tracking-tight">
            Entregá tu iPhone usado. <br />
            <span className="font-serif-luxury text-[#ebd7be]">Llevate el último modelo.</span>
          </h2>
          <p className="text-base text-white/70 md:text-lg">
            Tomamos tu equipo actual en parte de pago al mejor valor del mercado. Calculá tu diferencia en segundos:
          </p>
        </div>

        {/* Card interactiva */}
        <div className="mx-auto mt-12 max-w-4xl rounded-[36px] border border-white/10 bg-[#081226]/90 p-6 backdrop-blur-xl shadow-2xl md:p-10">
          <div className="grid gap-8 md:grid-cols-2 md:gap-12">
            {/* Columna Izquierda: Lo que entregás */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs uppercase tracking-wider text-[#ebd7be]/80 font-mono">Paso 1: Tu equipo actual</span>
                <span className="text-xs text-white/50">iPhone usado</span>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Modelo que tenés:</label>
                <select
                  value={currentIdx}
                  onChange={(e) => setCurrentIdx(Number(e.target.value))}
                  className="w-full rounded-2xl border border-white/15 bg-[#050b18] px-4 py-3.5 text-sm text-white focus:border-[#ebd7be] focus:outline-none"
                >
                  {CURRENT_MODELS.map((item, idx) => (
                    <option key={item.model} value={idx}>
                      {item.model}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Estado de batería y detalles:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBatteryState("alta")}
                    className={`rounded-xl border p-3 text-xs text-left transition ${
                      batteryState === "alta"
                        ? "border-[#ebd7be] bg-[#ebd7be]/15 text-[#ebd7be]"
                        : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    <span className="block font-semibold">Excelente (+85%)</span>
                    <span className="text-[11px] opacity-80">Sin marcas graves</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatteryState("media")}
                    className={`rounded-xl border p-3 text-xs text-left transition ${
                      batteryState === "media"
                        ? "border-[#ebd7be] bg-[#ebd7be]/15 text-[#ebd7be]"
                        : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    <span className="block font-semibold">Uso normal (-85%)</span>
                    <span className="text-[11px] opacity-80">Detalles de uso</span>
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 text-center">
                <span className="block text-xs text-white/50">Valor estimado de toma:</span>
                <span className="text-2xl font-serif-luxury font-bold text-[#ebd7be]">
                  ~ {formatUSD(estimatedTradeIn)}
                </span>
              </div>
            </div>

            {/* Columna Derecha: Lo que te llevás */}
            <div className="flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs uppercase tracking-wider text-[#ebd7be]/80 font-mono">Paso 2: Tu nuevo iPhone</span>
                  <span className="text-xs text-white/50">Sellado con Garantía</span>
                </div>

                <div className="mt-6 space-y-2">
                  <label className="text-sm font-medium text-white/80">Modelo que querés llevarte:</label>
                  <select
                    value={targetIdx}
                    onChange={(e) => setTargetIdx(Number(e.target.value))}
                    className="w-full rounded-2xl border border-white/15 bg-[#050b18] px-4 py-3.5 text-sm text-white focus:border-[#ebd7be] focus:outline-none"
                  >
                    {TARGET_MODELS.map((item, idx) => (
                      <option key={item.model} value={idx}>
                        {item.model} — {formatUSD(item.price)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-[#ebd7be]">
                  <span>🎁</span>
                  <span>Incluye <strong>Funda + Templado de Regalo</strong></span>
                </div>
              </div>

              {/* Resultado del cálculo */}
              <div className="rounded-3xl border border-[#ebd7be]/30 bg-gradient-to-br from-[#ebd7be]/15 to-[#3877ff]/10 p-6 text-center">
                <span className="block text-xs uppercase tracking-wider text-white/60">Diferencia estimada a pagar</span>
                <div className="mt-1 flex items-baseline justify-center gap-2">
                  <span className="text-4xl font-serif-luxury font-bold text-[#ebd7be] md:text-5xl">
                    {formatUSD(difference)}
                  </span>
                  <span className="text-sm text-white/70">USD</span>
                </div>
                <span className="mt-1 block text-xs text-white/50">
                  (O abonás el equivalente en Pesos al cambio del día)
                </span>

                <a
                  href={waLink(whatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#ebd7be] py-4 text-sm font-bold text-[#050b18] shadow-lg shadow-[#ebd7be]/20 transition hover:bg-[#f7ede0]"
                >
                  <ChatIcon className="size-4" /> Cotizar mi Plan Canje en WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
