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
    <section className="bg-ink text-white">
      <div className="mx-auto min-h-[calc(100svh-56px)] max-w-5xl px-4 pb-24 pt-16 md:px-8 md:pt-24">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">Encontrá tu iPhone</p>
        <h1 className="mt-3 text-[clamp(2.4rem,6vw,4.8rem)] font-semibold leading-[0.95] tracking-[-0.05em]">¿Qué iPhone estás buscando?</h1>

        {/* progreso */}
        <div className="mt-10 flex gap-1.5" aria-hidden="true">
          {QUESTIONS.map((_, i) => (
            <span key={i} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i < step ? "bg-vita" : i === step ? "bg-white/50" : "bg-white/10"}`} />
          ))}
        </div>

        {!done ? (
          <div key={step} className="mt-12 space-y-8">
            <p className="text-sm text-white/45">Pregunta {step + 1} de {QUESTIONS.length}</p>
            <h2 className="text-3xl font-semibold tracking-[-0.03em] md:text-4xl">{q.title}</h2>
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
                    className={`group flex items-center justify-between rounded-3xl p-6 text-left text-lg transition ${selected ? "bg-white text-ink" : "bg-white/[0.06] ring-1 ring-white/10 hover:bg-white/10"}`}
                  >
                    {o.label}
                    <ArrowIcon className="size-5 opacity-40 transition group-hover:translate-x-1 group-hover:opacity-100" />
                  </button>
                );
              })}
            </div>
            {step > 0 && (
              <button type="button" onClick={() => setStep(step - 1)} className="text-sm text-white/55 underline-offset-4 hover:text-white hover:underline">← Volver</button>
            )}
          </div>
        ) : (
          <div className="mt-12 space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
                {results.length ? "Estos te van a quedar bien." : "No encontramos una coincidencia exacta."}
              </h2>
              <button type="button" onClick={() => { setAnswers({}); setStep(0); }} className="text-sm text-white/55 underline-offset-4 hover:text-white hover:underline">Empezar de nuevo</button>
            </div>
            {results.length ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
                {results.map((p) => <ProductCard key={p.slug} product={p} dark />)}
              </div>
            ) : (
              <p className="text-white/60">Escribinos y te ayudamos a elegir.</p>
            )}
            <a href={waLink(results[0] ? `${productMessage(results[0])} También quiero que me asesoren.` : "Hola iPhone Vita! Quiero que me ayuden a elegir un iPhone.")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-medium text-ink">
              Hablar con un asesor por WhatsApp
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
