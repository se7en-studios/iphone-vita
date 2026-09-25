"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/types";
import { matchIphones, QUESTIONS, type FinderAnswers } from "@/lib/finder";
import { ProductCard } from "./ProductCard";
import { ArrowIcon } from "./ui/Icons";
import { productMessage, waLink } from "@/lib/whatsapp";

export function IphoneFinder({ products }: { products: Product[] }) {
  const [answers, setAnswers] = useState<FinderAnswers>({});
  const [step, setStep] = useState(0);
  const done = step >= QUESTIONS.length;
  const results = useMemo(() => (done ? matchIphones(products, answers) : []), [done, products, answers]);
  const q = QUESTIONS[Math.min(step, QUESTIONS.length - 1)];

  return (
    <section className="bg-[#050b18] text-white min-h-screen">
      <div className="mx-auto min-h-[calc(100svh-56px)] max-w-5xl px-4 pb-24 pt-16 md:px-8 md:pt-24">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#ebd7be]">Concierge Digital</p>
        <h1 className="mt-3 text-[clamp(2.4rem,6vw,4.5rem)] font-bold leading-[0.95] tracking-tight">
          ¿Qué iPhone <span className="font-serif-luxury text-[#ebd7be]">estás buscando?</span>
        </h1>

        {/* progreso */}
        <div className="mt-10 flex gap-1.5" aria-hidden="true">
          {QUESTIONS.map((_, i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${i < step ? "bg-[#ebd7be]" : i === step ? "bg-white/50" : "bg-white/10"}`} />
          ))}
        </div>

        {!done ? (
          <div key={step} className="mt-12 space-y-8">
            <p className="text-xs uppercase tracking-wider text-white/50 font-mono">Paso {step + 1} de {QUESTIONS.length}</p>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl text-white">{q.title}</h2>
            <div className="grid gap-3 md:grid-cols-3">
              {q.options.map((o) => {
                const selected = (answers as Record<string, string | undefined>)[q.key] === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => {
                      setAnswers({ ...answers, [q.key]: o.value });
                      setStep(step + 1);
                    }}
                    className={`group flex items-center justify-between rounded-3xl p-6 text-left text-base font-medium transition ${
                      selected
                        ? "bg-[#ebd7be] text-[#050b18] font-semibold shadow-lg shadow-[#ebd7be]/20"
                        : "bg-white/[0.04] ring-1 ring-white/10 hover:bg-white/10 text-white hover:ring-[#ebd7be]/40"
                    }`}
                  >
                    {o.label}
                    <ArrowIcon className="size-5 opacity-40 transition group-hover:translate-x-1 group-hover:opacity-100" />
                  </button>
                );
              })}
            </div>
            {step > 0 && (
              <button type="button" onClick={() => setStep(step - 1)} className="text-sm text-white/55 underline-offset-4 hover:text-[#ebd7be] hover:underline">← Volver</button>
            )}
          </div>
        ) : (
          <div className="mt-12 space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-serif-luxury text-2xl font-bold tracking-wide text-white md:text-3xl">
                {results.length ? "Modelos recomendados para vos:" : "No encontramos una coincidencia exacta."}
              </h2>
              <button type="button" onClick={() => { setAnswers({}); setStep(0); }} className="text-sm text-white/55 underline-offset-4 hover:text-[#ebd7be] hover:underline">Empezar de nuevo</button>
            </div>
            {results.length ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
                {results.map((p) => <ProductCard key={p.slug} product={p} dark />)}
              </div>
            ) : (
              <p className="text-white/60">Escribinos por WhatsApp y un asesor te ayuda a elegir el equipo ideal.</p>
            )}
            <a
              href={waLink(results[0] ? `${productMessage(results[0])} También quiero que me asesoren según las respuestas del test.` : "Hola iPhone Vita! Hice el test en la web y quiero que me ayuden a elegir un iPhone.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#ebd7be] px-7 py-4 text-sm font-bold text-[#050b18] shadow-lg shadow-[#ebd7be]/20 transition hover:bg-[#f7ede0]"
            >
              Hablar con un asesor por WhatsApp
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
