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
          <div className="inline-flex items-center gap-2 rounded-full border border-[#ebd7be]/30 bg-[#ebd7be]/10 px-4 py-1.5 text-xs font-semibold text-[#ebd7be]">
            <span>🎁</span> Funda de silicona + Templado de Regalo
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#ebd7be]/70">Lanzamiento Oficial · iPhone 17 Pro</p>
          <h1 className="text-[clamp(3.2rem,8vw,6.5rem)] font-bold leading-[0.94] tracking-[-0.03em]">
            Tu próxima <br />
            <span className="font-serif-luxury text-[#ebd7be]">tecnología.</span>
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-white/70">
            Equipos sellados, garantía oficial Apple y accesorios premium. Aceptamos pesos y enviamos a todo el país.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="#tienda" className="rounded-full bg-[#ebd7be] px-7 py-3.5 text-sm font-semibold text-[#050b18] shadow-lg shadow-[#ebd7be]/20 transition hover:bg-[#f7ede0]">
              Ver ofertas con regalo
            </Link>
            <Link href="/productos" className="flex items-center gap-2 rounded-full border border-white/20 px-6 py-3.5 text-sm font-medium text-white transition hover:border-[#ebd7be] hover:text-[#ebd7be]">
              Explorar catálogo <ArrowIcon />
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
          <div ref={img} className="relative mx-auto aspect-[3/4] w-full max-w-[400px] will-change-transform lg:aspect-[9/14] lg:max-w-[480px]">
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
                    className="animate-float rounded-[36px] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
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
