"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/types";
import { formatUSD } from "@/lib/format";
import { ArrowIcon } from "../ui/Icons";

/** Hero cinematográfico: iPhone 17 Pro en sus tres colores. */
export function Hero({ variants }: { variants: Product[] }) {
  const [i, setI] = useState(0);
  const img = useRef<HTMLDivElement>(null);
  const active = variants[i];

  // Parallax muy suave sobre la foto
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || window.innerWidth < 1024) return;
    const onScroll = () => {
      if (img.current) img.current.style.transform = `translateY(${Math.min(window.scrollY, 700) * 0.12}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="relative isolate overflow-hidden bg-ink text-white">
      <div className="mx-auto grid min-h-[calc(100svh-56px)] max-w-7xl grid-cols-1 items-center gap-12 px-4 pb-10 pt-8 md:px-8 lg:grid-cols-[1fr_1.15fr] lg:pb-16">
        <div className="relative z-10 order-2 space-y-8 lg:order-1">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/50">iPhone 17 Pro · iPhone 17 Pro Max</p>
          <h1 className="text-[clamp(3.2rem,8.5vw,7.4rem)] font-semibold leading-[0.92] tracking-[-0.055em]">
            Tu próxima
            <br />
            tecnología.
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-white/65">
            Apple, accesorios y tecnología premium.
            <br />
            Todo en un solo lugar.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/productos" className="rounded-full bg-white px-6 py-3.5 text-sm font-medium text-ink transition hover:bg-white/85">Explorar productos</Link>
            <Link href="#tienda" className="flex items-center gap-2 rounded-full border border-white/20 px-6 py-3.5 text-sm font-medium transition hover:border-white/60">
              Ver iPhone <ArrowIcon />
            </Link>
          </div>

          <div className="flex items-center gap-5 pt-2">
            <div className="flex gap-2.5" role="radiogroup" aria-label="Color del iPhone 17 Pro">
              {variants.map((v, idx) => (
                <button
                  key={v.slug}
                  type="button"
                  role="radio"
                  aria-checked={idx === i}
                  aria-label={v.color}
                  onClick={() => setI(idx)}
                  className={`size-7 rounded-full border border-white/25 transition ${idx === i ? "ring-2 ring-white ring-offset-[3px] ring-offset-ink" : "hover:scale-110"}`}
                  style={{ background: v.colorHex }}
                />
              ))}
            </div>
            <p className="text-sm text-white/60">
              <span className="text-white">{active.color}</span> · desde <span className="tabular">{formatUSD(active.price ?? 0)}</span>
            </p>
          </div>
        </div>

        <div className="relative order-1 lg:order-2">
          <div ref={img} className="relative mx-auto aspect-square w-full max-w-[420px] will-change-transform lg:aspect-[4/5] lg:max-w-[560px]">
            {variants.map((v, idx) => (
              <div
                key={v.slug}
                className={`absolute inset-0 transition-all duration-[1200ms] ease-[var(--ease-soft)] ${idx === i ? "scale-100 opacity-100" : "scale-[1.03] opacity-0"}`}
                aria-hidden={idx !== i}
              >
                {v.image && (
                  <Image
                    src={v.image}
                    alt={`iPhone 17 Pro ${v.color}`}
                    fill
                    priority={idx === 0}
                    sizes="(max-width: 1024px) 100vw, 560px"
                    className="animate-float rounded-[40px] object-cover [mask-image:radial-gradient(85%_80%_at_50%_45%,#000_55%,transparent_100%)]"
                  />
                )}
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-x-0 -bottom-10 mx-auto h-40 max-w-md rounded-full blur-3xl transition-colors duration-1000" style={{ background: `${active.colorHex}40` }} />
        </div>
      </div>

      {/* Dos caminos */}
      <div className="relative z-10 mx-auto grid max-w-7xl gap-3 px-4 pb-10 md:grid-cols-2 md:px-8">
        <Link href="/productos" className="group flex items-center justify-between rounded-3xl bg-white/[0.06] px-6 py-5 ring-1 ring-white/10 transition hover:bg-white/10">
          <span>
            <span className="block text-sm text-white/50">Sé lo que quiero</span>
            <span className="text-lg font-medium">Ir a comprar</span>
          </span>
          <ArrowIcon className="size-5 transition group-hover:translate-x-1" />
        </Link>
        <Link href="/encontra-tu-iphone" className="group flex items-center justify-between rounded-3xl bg-white/[0.06] px-6 py-5 ring-1 ring-white/10 transition hover:bg-white/10">
          <span>
            <span className="block text-sm text-white/50">No sé cuál elegir</span>
            <span className="text-lg font-medium">Encontrá tu iPhone</span>
          </span>
          <ArrowIcon className="size-5 transition group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
