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
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.innerWidth < 1024
    )
      return;
    const onScroll = () => {
      if (img.current)
        img.current.style.transform = `translateY(${Math.min(window.scrollY, 700) * 0.12}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="relative isolate overflow-hidden bg-black text-white">
      <div className="mx-auto grid min-h-[calc(100svh-56px)] max-w-7xl grid-cols-1 items-center gap-10 px-4 pb-10 pt-8 md:px-8 lg:grid-cols-[1fr_1.15fr] lg:pb-16">
        <div className="relative z-10 order-2 space-y-6 lg:order-1">
          <p className="text-sm font-semibold text-white/60">iPhone 17 Pro</p>
          <h1 className="text-[clamp(3.4rem,8vw,7rem)] font-bold leading-[0.94] tracking-[-0.03em]">
            Tu próxima <br />
            <span className="text-[#ebd7be]">tecnología.</span>
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-white/60">
            Equipos sellados, garantía oficial Apple. Funda y templado de
            regalo. Aceptamos pesos y enviamos a todo el país.
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
            <Link
              href="#tienda"
              className="rounded-full bg-[#ebd7be] px-7 py-3 text-sm font-semibold text-black transition hover:bg-white"
            >
              Comprar
            </Link>
            <Link
              href="/productos"
              className="flex items-center gap-1.5 text-sm font-medium text-[#ebd7be] transition hover:text-white"
            >
              Explorar catálogo <ArrowIcon className="size-4" />
            </Link>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <div
              className="flex gap-2.5"
              role="radiogroup"
              aria-label="Color del iPhone 17 Pro"
            >
              {variants.map((v, idx) => (
                <button
                  key={v.slug}
                  type="button"
                  role="radio"
                  aria-checked={idx === i}
                  aria-label={v.color}
                  onClick={() => setI(idx)}
                  className={`size-6 rounded-full border border-white/25 transition ${idx === i ? "ring-2 ring-white ring-offset-2 ring-offset-black" : "hover:scale-110"}`}
                  style={{ background: v.colorHex }}
                />
              ))}
            </div>
            <p className="text-sm text-white/50">
              <span className="text-white">{active.color}</span> · desde{" "}
              <span className="tabular">{formatUSD(active.price ?? 0)}</span>
            </p>
          </div>
        </div>

        <div className="relative order-1 lg:order-2">
          <div
            className="pointer-events-none absolute -inset-6 rounded-[48px] blur-3xl transition-colors duration-1000 md:-inset-10"
            style={{ background: `${active.colorHex}2e` }}
          />
          <div
            ref={img}
            className="relative mx-auto aspect-[4/5] w-full max-w-[420px] overflow-hidden rounded-[40px] bg-[#0a0a0a] shadow-[0_30px_70px_rgba(0,0,0,0.8)] ring-1 ring-white/10 will-change-transform lg:max-w-[540px]"
          >
            {variants.map((v, idx) => (
              <div
                key={v.slug}
                className={`absolute inset-0 transition-all duration-[1200ms] ease-[var(--ease-soft)] ${idx === i ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"}`}
                aria-hidden={idx !== i}
              >
                {v.image && (
                  <Image
                    src={v.image}
                    alt={`iPhone 17 Pro ${v.color}`}
                    fill
                    priority={idx === 0}
                    sizes="(max-width: 1024px) 100vw, 540px"
                    className="object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
