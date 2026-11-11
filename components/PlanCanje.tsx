"use client";

import { useMemo, useState, type ReactNode } from "react";
import { waLink } from "@/lib/whatsapp";
import { formatUSD } from "@/lib/format";
import { ChatIcon, CheckIcon, ChevronIcon } from "./ui/Icons";
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
  const coveragePercent = target.price > 0 ? Math.min(100, Math.round((estimatedTradeIn / target.price) * 100)) : 0;

  const whatsappMessage = `Hola iPhone Vita! Quiero consultar por el Plan Canje: Entrego mi ${current.model} (${batteryState === "alta" ? "Batería +85% / excelente estado" : "Batería normal"}) y quiero llevarme el ${target.model}. Según la web la diferencia estimada es de aprox. $${difference} USD. ¿Podemos coordinar la revisión del equipo?`;

  return (
    <section
      id="plan-canje"
      className="relative scroll-mt-28 border-t border-fg/10 bg-bg py-20 text-fg md:py-32"
    >
      <div className="relative mx-auto max-w-7xl px-4 md:px-8">
        <div data-reveal className="mx-auto max-w-[980px] text-center">
          <p className="text-[15px] font-semibold tracking-[-0.005em] text-vita md:text-[17px]">
            Plan Canje
          </p>
          <h2 className="mt-2 text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.04] tracking-[-0.035em]">
            Entregá tu iPhone usado.{" "}
            <br className="hidden sm:block" />
            <span className="text-fg/40">Llevate el último modelo.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-[52ch] text-[17px] leading-relaxed text-fg/60 md:text-lg">
            Tomamos tu equipo actual en parte de pago con cotización inmediata al mejor valor de mercado.
          </p>
        </div>

        {/* Card interactiva */}
        <div
          data-reveal
          className="mx-auto mt-12 max-w-[1040px] rounded-[28px] bg-surface p-2 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_24px_48px_-28px_rgba(0,0,0,0.18)] ring-1 ring-fg/[0.06] md:mt-16 md:rounded-[36px] md:p-3"
        >
          <div className="grid md:grid-cols-2">
            {/* Paso 1: lo que entregás */}
            <div className="flex flex-col gap-6 p-4 pb-8 md:p-8">
              <StepHead n={1} title="Tu equipo actual" meta="Cotización estimada" />

              <Field label="Modelo que tenés" htmlFor="canje-actual">
                <select
                  id="canje-actual"
                  value={currentIdx}
                  onChange={(e) => setCurrentIdx(Number(e.target.value))}
                  className={SELECT}
                >
                  {CURRENT_MODELS.map((item, idx) => (
                    <option key={item.model} value={idx}>
                      {item.model}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="space-y-2.5">
                <p id="canje-estado" className="text-[13px] font-semibold text-fg/70">
                  Estado de batería y detalles
                </p>
                <div role="group" aria-labelledby="canje-estado" className="grid grid-cols-2 gap-2.5">
                  <ConditionButton
                    active={batteryState === "alta"}
                    onClick={() => setBatteryState("alta")}
                    title="Excelente"
                    detail="Batería 85%+, sin marcas"
                  />
                  <ConditionButton
                    active={batteryState === "media"}
                    onClick={() => setBatteryState("media")}
                    title="Uso normal"
                    detail="Batería <85% o detalles leves"
                  />
                </div>
              </div>

              <div className="mt-auto rounded-[20px] bg-bg p-5 md:p-6">
                <span className="block text-[13px] font-semibold text-fg/55">
                  Tomamos tu equipo aproximadamente en
                </span>
                <span
                  aria-live="polite"
                  className="tabular mt-1 block text-[2rem] font-bold leading-tight tracking-[-0.03em] text-fg md:text-[2.5rem]"
                >
                  <span className="text-fg/35">~</span> {formatUSD(estimatedTradeIn)}
                </span>
                <span className="mt-3 block border-t border-fg/[0.08] pt-3 text-xs leading-relaxed text-fg/50">
                  Valor orientativo. Lo confirmamos al revisar el equipo.
                </span>
              </div>
            </div>

            {/* Paso 2: lo que te llevás */}
            <div className="flex flex-col gap-6 rounded-[22px] bg-bg/60 p-4 pt-6 ring-1 ring-fg/[0.04] md:rounded-[28px] md:p-8">
              <StepHead n={2} title="Tu nuevo iPhone" meta="Sellado · Garantía Oficial" />

              <Field label="Modelo que querés llevarte" htmlFor="canje-nuevo">
                <select
                  id="canje-nuevo"
                  value={targetIdx}
                  onChange={(e) => setTargetIdx(Number(e.target.value))}
                  className={`${SELECT} bg-surface`}
                >
                  {targets.map((item, idx) => (
                    <option key={item.model} value={idx}>
                      {item.model} — {formatUSD(item.price)}
                    </option>
                  ))}
                </select>
              </Field>

              {/* Cobertura del canje */}
              <div className="space-y-2.5">
                <div className="flex items-baseline justify-between text-[13px]">
                  <span id="canje-cobertura" className="font-semibold text-fg/70">
                    Cobertura del Plan Canje
                  </span>
                  <span className="tabular font-semibold text-vita">{coveragePercent}% cubierto</span>
                </div>
                <div
                  role="progressbar"
                  aria-labelledby="canje-cobertura"
                  aria-valuenow={coveragePercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="h-1.5 w-full overflow-hidden rounded-full bg-fg/[0.08]"
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-champagne to-vita transition-[width] duration-700 ease-[var(--ease-out-expo)] motion-reduce:transition-none"
                    style={{ width: `${coveragePercent}%` }}
                  />
                </div>
              </div>

              {/* Resultado del cálculo */}
              <div className="mt-auto rounded-[20px] bg-surface px-4 py-6 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-fg/[0.06] md:p-7">
                <span className="block text-[13px] font-semibold text-fg/55">
                  Diferencia estimada a pagar
                </span>
                <span
                  aria-live="polite"
                  className="tabular mt-1 block text-[clamp(2.5rem,7vw,3.25rem)] font-bold leading-none tracking-[-0.035em] text-fg"
                >
                  {formatUSD(difference)}
                </span>
                <span className="mt-2 block text-[13px] text-fg/50">
                  ≈ <Ars usd={difference} /> al cambio del día
                </span>

                <a
                  href={waLink(whatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sheen mt-6 flex h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-champagne px-4 text-sm md:text-[15px] font-semibold text-black transition-colors duration-300 hover:bg-champagne-light"
                >
                  <ChatIcon className="size-4 shrink-0" />
                  <span>Cotizar Canje por WhatsApp</span>
                </a>

                <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-fg/55">
                  {["Revisión en 15 min", "Garantía oficial", "Funda y templado de regalo"].map((t) => (
                    <li key={t} className="inline-flex items-center gap-1">
                      <CheckIcon className="size-3.5 text-vita" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const SELECT =
  "h-12 w-full appearance-none rounded-xl bg-bg pl-4 pr-10 text-[15px] text-fg ring-1 ring-fg/10 transition hover:ring-fg/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-vita";

function StepHead({ n, title, meta }: { n: number; title: string; meta: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="tabular grid size-7 shrink-0 place-items-center rounded-full bg-fg text-[13px] font-semibold text-surface"
      >
        {n}
      </span>
      <div className="min-w-0">
        <h3 className="text-[17px] font-semibold leading-tight tracking-[-0.01em]">
          <span className="sr-only">Paso {n}: </span>
          {title}
        </h3>
        <p className="text-xs text-fg/50">{meta}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      <label htmlFor={htmlFor} className="block text-[13px] font-semibold text-fg/70">
        {label}
      </label>
      <div className="relative">
        {children}
        <ChevronIcon className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 rotate-90 text-fg/45" />
      </div>
    </div>
  );
}

function ConditionButton({
  active,
  onClick,
  title,
  detail,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  detail: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-xl p-3.5 text-left transition duration-300 ${
        active
          ? "bg-vita-soft ring-2 ring-vita"
          : "bg-surface ring-1 ring-fg/10 hover:ring-fg/25"
      }`}
    >
      <span className={`block text-sm font-semibold ${active ? "text-vita" : "text-fg"}`}>
        {title}
      </span>
      <span className="mt-0.5 block text-xs leading-snug text-fg/55">{detail}</span>
    </button>
  );
}
