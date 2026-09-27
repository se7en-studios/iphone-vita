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
    <section className="bg-bg text-fg min-h-screen">
      <div className="mx-auto min-h-[calc(100svh-56px)] max-w-5xl px-4 pb-24 pt-16 md:px-8 md:pt-24">
        <p className="text-lg font-semibold text-highlight md:text-xl">Encontrá tu iPhone</p>
        <h1 className="mt-3 text-[clamp(2.4rem,6vw,4.5rem)] font-bold leading-[1.05] tracking-[-0.03em]">
          ¿Qué iPhone <span className="text-highlight">estás buscando?</span>
        </h1>

        {/* progreso */}
        <div className="mt-10 flex gap-1.5" aria-hidden="true">
          {QUESTIONS.map((_, i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${i < step ? "bg-accent" : i === step ? "bg-fg/50" : "bg-fg/10"}`} />
          ))}
        </div>

        {!done ? (
          <div key={step} className="mt-12 space-y-8">
            <p className="text-xs text-fg/50 font-semibold">Paso {step + 1} de {QUESTIONS.length}</p>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl text-fg">{q.title}</h2>
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
                        ? "bg-accent text-accent-fg font-semibold"
                        : "bg-fg/[0.04] ring-1 ring-fg/10 hover:bg-fg/10 text-fg hover:ring-accent/40"
                    }`}
                  >
                    {o.label}
                    <ArrowIcon className="size-5 opacity-40 transition group-hover:translate-x-1 group-hover:opacity-100" />
                  </button>
                );
              })}
            </div>
            {step > 0 && (
              <button type="button" onClick={() => setStep(step - 1)} className="text-sm text-fg/55 underline-offset-4 hover:text-highlight hover:underline">← Volver</button>
            )}
          </div>
        ) : (
          <div className="mt-12 space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-2xl font-bold text-fg md:text-3xl">
                {results.length ? "Modelos recomendados para vos:" : "No encontramos una coincidencia exacta."}
              </h2>
              <button type="button" onClick={() => { setAnswers({}); setStep(0); }} className="text-sm text-fg/55 underline-offset-4 hover:text-highlight hover:underline">Empezar de nuevo</button>
            </div>
            {results.length ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
                {results.map((p) => <ProductCard key={p.slug} product={p} dark />)}
              </div>
            ) : (
              <p className="text-fg/60">Escribinos por WhatsApp y un asesor te ayuda a elegir el equipo ideal.</p>
            )}
            <a
              href={waLink(results[0] ? `${productMessage(results[0])} También quiero que me asesoren según las respuestas del test.` : "Hola iPhone Vita! Hice el test en la web y quiero que me ayuden a elegir un iPhone.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-4 text-sm font-bold text-accent-fg transition hover:brightness-110"
            >
              Hablar con un asesor por WhatsApp
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
