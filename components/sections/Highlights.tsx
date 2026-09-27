"use client";

import { useRef, useState } from "react";
import { ChevronIcon } from "../ui/Icons";

const CARDS = [
  {
    eyebrow: "Chip",
    value: "A20 Pro",
    body: "CPU de 6 núcleos, GPU de 7 núcleos con Neural Accelerators y trazado de rayos acelerado por hardware.",
  },
  {
    eyebrow: "Batería",
    value: "34 h",
    body: "de reproducción de video en el iPhone 18 Pro. Hasta 43 horas en el iPhone 18 Pro Max.",
  },
  {
    eyebrow: "Pantalla",
    value: "6.3”",
    body: "Super Retina XDR con ProMotion hasta 120 Hz y hasta 3,000 nits de brillo al aire libre.",
  },
  {
    eyebrow: "Resistencia",
    value: "IP68",
    body: "Aguanta agua hasta 6 metros de profundidad durante 30 minutos. Frente de Ceramic Shield 2.",
  },
  {
    eyebrow: "Conectividad",
    value: "Wi‑Fi 7",
    body: "Con el chip inalámbrico N1 de Apple, Bluetooth 6 y el módem C2 para 5G.",
  },
];

/** Carrusel horizontal de destacados, con flechas y puntos como en apple.com. */
export function Highlights() {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const slides = () =>
    Array.from(track.current?.children ?? []) as HTMLElement[];
  const go = (i: number) => {
    const el = track.current;
    const items = slides();
    const target = items[Math.max(0, Math.min(items.length - 1, i))];
    if (el && target)
      el.scrollTo({
        left: target.offsetLeft - items[0].offsetLeft,
        behavior: "smooth",
      });
  };
  const onScroll = () => {
    const el = track.current;
    const items = slides();
    if (!el || !items.length) return;
    const x = el.scrollLeft + items[0].offsetLeft;
    const nearest = items.reduce(
      (best, it, i) =>
        Math.abs(it.offsetLeft - x) < Math.abs(items[best].offsetLeft - x)
          ? i
          : best,
      0,
    );
    setActive(nearest);
  };

  return (
    <section
      id="destacados"
      className="scroll-mt-28 border-t border-white/10 bg-black py-16 md:py-40"
    >
      <div data-reveal className="mx-auto max-w-7xl px-4 md:px-8">
        <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[1.05] tracking-[-0.03em] text-white">
          Mirá lo más destacado.
        </h2>
      </div>

      <div
        ref={track}
        onScroll={onScroll}
        className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 md:scroll-px-8 md:px-8 xl:scroll-px-[calc((100vw-80rem)/2+2rem)] xl:px-[calc((100vw-80rem)/2+2rem)]"
        aria-label="Destacados del iPhone 18 Pro"
      >
        {CARDS.map((c, i) => (
          <article
            key={c.eyebrow}
            aria-roledescription="diapositiva"
            aria-label={`${i + 1} de ${CARDS.length}: ${c.eyebrow}`}
            className="flex aspect-[4/5] w-[80vw] shrink-0 snap-start flex-col justify-between rounded-[28px] bg-[#0a0a0a] p-8 ring-1 ring-white/10 sm:w-[380px] md:p-10"
          >
            <p className="text-lg font-semibold text-white/80">{c.eyebrow}</p>
            <div>
              <p className="tabular whitespace-nowrap text-[clamp(3rem,8vw,4.5rem)] font-bold leading-none tracking-[-0.04em] text-[#ebd7be]">
                {c.value}
              </p>
              <p className="mt-5 text-[17px] leading-relaxed text-white/60">
                {c.body}
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="mx-auto mt-8 flex max-w-7xl items-center justify-between px-4 md:px-8">
        <div className="-mx-1.5 flex">
          {CARDS.map((c, i) => (
            <button
              key={c.eyebrow}
              type="button"
              aria-label={`Ir a ${c.eyebrow}`}
              aria-current={i === active}
              onClick={() => go(i)}
              className="group/dot grid h-11 min-w-5 place-items-center px-1.5"
            >
              <span
                className={`h-2 rounded-full transition-all ${i === active ? "w-6 bg-white" : "w-2 bg-white/30 group-hover/dot:bg-white/60"}`}
              />
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => go(active - 1)}
            disabled={active === 0}
            aria-label="Anterior"
            className="grid size-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-30"
          >
            <ChevronIcon dir="left" className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => go(active + 1)}
            disabled={active === CARDS.length - 1}
            aria-label="Siguiente"
            className="grid size-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-30"
          >
            <ChevronIcon className="size-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
