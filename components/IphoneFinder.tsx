"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/types";
import { matchIphones, QUESTIONS, type FinderAnswers } from "@/lib/finder";
import { ProductCard } from "./ProductCard";
import { ArrowIcon, ChatIcon, CheckIcon } from "./ui/Icons";
import { productMessage, waLink } from "@/lib/whatsapp";

/** Ayudas cortas debajo de cada opción (solo texto: el puntaje vive en lib/finder). */
const HINTS: Record<string, string> = {
  "hasta-900": "Modelos actuales y semi nuevos",
  "hasta-1300": "Llegás a la línea Pro",
  "sin-tope": "Lo mejor de lo mejor",
  basico: "WhatsApp, Instagram, mapas",
  fotos: "Cámaras más versátiles",
  trabajo: "Más potencia y pantalla",
  compacto: "Cómodo de usar con una mano",
  grande: "Los modelos Max",
  indistinto: "Te mostramos ambos",
  camara: "Fotos y video de nivel Pro",
  bateria: "Que llegue a la noche",
  precio: "La mejor relación precio/calidad",
  nuevo: "Sellado, garantía oficial Apple",
  "semi-nuevo": "Revisado, con garantía escrita",
  cualquiera: "Comparás y decidís",
};

const ease = "motion-safe:animate-[rise_0.6s_var(--ease-out-expo)_both]";

export function IphoneFinder({ products }: { products: Product[] }) {
  const [answers, setAnswers] = useState<FinderAnswers>({});
  const [step, setStep] = useState(0);
  const done = step >= QUESTIONS.length;
  const results = useMemo(
    () => (done ? matchIphones(products, answers) : []),
    [done, products, answers],
  );
  const q = QUESTIONS[Math.min(step, QUESTIONS.length - 1)];
  const record = answers as Record<string, string | undefined>;

  // Al cambiar de paso llevamos el foco al nuevo título (teclado y lectores de pantalla).
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  const chosen: { i: number; label: string }[] = QUESTIONS.flatMap((question, i) => {
    const option = question.options.find((o) => o.value === record[question.key]);
    return option ? [{ i, label: option.label as string }] : [];
  });

  const reset = () => {
    setAnswers({});
    setStep(0);
  };

  return (
    <section className="min-h-screen bg-bg text-fg">
      <div className="mx-auto min-h-[calc(100svh-56px)] max-w-[1000px] px-4 pb-24 pt-14 md:px-8 md:pt-24">
        <header className="text-center">
          <p className="text-[15px] font-semibold tracking-[-0.005em] text-vita md:text-[17px]">
            Encontrá tu iPhone
          </p>
          <h1 className="mt-2 text-[clamp(2.4rem,6vw,4.5rem)] font-bold leading-[1.04] tracking-[-0.035em]">
            {done ? "Tu iPhone ideal." : "¿Qué iPhone es para vos?"}
          </h1>
          <p className="mx-auto mt-4 max-w-[44ch] text-[17px] leading-relaxed text-fg/60 md:text-lg">
            {done
              ? "Según tus respuestas, estos son los modelos que mejor te quedan."
              : "Cinco preguntas rápidas y te recomendamos los modelos que mejor te quedan."}
          </p>
        </header>

        {/* Progreso */}
        <div className="mx-auto mt-10 max-w-[560px] md:mt-12">
          <div
            role="progressbar"
            aria-label="Progreso del test"
            aria-valuemin={0}
            aria-valuemax={QUESTIONS.length}
            aria-valuenow={Math.min(step, QUESTIONS.length)}
            className="flex gap-1.5"
          >
            {QUESTIONS.map((_, i) => (
              <span
                key={i}
                className="h-1 flex-1 overflow-hidden rounded-full bg-fg/[0.08]"
              >
                <span
                  className={`block h-full rounded-full bg-[linear-gradient(90deg,var(--vita),var(--color-champagne))] transition-[width] duration-500 ease-[var(--ease-out-expo)] motion-reduce:transition-none ${
                    i < step ? "w-full" : "w-0"
                  }`}
                />
              </span>
            ))}
          </div>
        </div>

        {!done ? (
          <div
            key={step}
            className={`mx-auto mt-8 max-w-[860px] rounded-[28px] bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-fg/[0.06] md:mt-10 md:p-10 ${ease}`}
          >
            <div className="flex items-center justify-between gap-4">
              <p className="tabular text-[13px] font-medium text-fg/50">
                Pregunta {step + 1} de {QUESTIONS.length}
              </p>
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[13px] font-medium text-link transition hover:underline hover:underline-offset-4"
                >
                  <ArrowIcon className="size-3.5 rotate-180" /> Anterior
                </button>
              )}
            </div>
            <h2
              ref={headingRef}
              tabIndex={-1}
              id="finder-question"
              className="mt-3 text-[26px] font-semibold leading-tight tracking-[-0.025em] text-fg focus:outline-none md:text-[34px]"
            >
              {q.title}
            </h2>

            <ul
              aria-labelledby="finder-question"
              className="mt-7 grid gap-3 md:mt-8 md:grid-cols-3"
            >
              {q.options.map((o) => {
                const selected = record[q.key] === o.value;
                return (
                  <li key={o.value}>
                    <button
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        setAnswers({ ...answers, [q.key]: o.value });
                        setStep(step + 1);
                      }}
                      className={`group flex h-full w-full items-center gap-4 rounded-[20px] p-5 text-left transition duration-300 md:flex-col md:items-start md:gap-6 md:p-6 ${
                        selected
                          ? "bg-vita-soft ring-2 ring-vita"
                          : "bg-bg ring-1 ring-fg/[0.06] hover:-translate-y-0.5 hover:bg-surface hover:shadow-[0_12px_28px_-16px_rgba(0,0,0,0.25)] hover:ring-fg/15 motion-reduce:hover:translate-y-0"
                      }`}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-[17px] font-semibold leading-snug tracking-[-0.01em] text-fg">
                          {o.label}
                        </span>
                        {HINTS[o.value] && (
                          <span className="mt-1 block text-[13px] leading-snug text-fg/55">
                            {HINTS[o.value]}
                          </span>
                        )}
                      </span>
                      <span
                        aria-hidden="true"
                        className={`grid size-8 shrink-0 place-items-center rounded-full transition duration-300 md:self-end ${
                          selected
                            ? "bg-vita text-surface"
                            : "bg-surface text-fg/50 ring-1 ring-fg/10 group-hover:bg-fg group-hover:text-surface group-hover:ring-fg"
                        }`}
                      >
                        {selected ? (
                          <CheckIcon className="size-4" />
                        ) : (
                          <ArrowIcon className="size-3.5" />
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {chosen.length > 0 && (
              <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-fg/[0.08] pt-6">
                <span className="mr-1 text-[13px] text-fg/45">Tus respuestas:</span>
                {chosen.map((c) => (
                  <button
                    key={c.i}
                    type="button"
                    onClick={() => setStep(c.i)}
                    aria-label={`Cambiar respuesta: ${c.label}`}
                    className="inline-flex h-8 items-center rounded-full bg-bg px-3 text-[13px] font-medium text-fg/75 ring-1 ring-fg/[0.08] transition hover:text-fg hover:ring-fg/25"
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className={`mt-10 space-y-10 md:mt-12 ${ease}`}>
            <div className="flex flex-col items-center gap-4">
              <ul aria-label="Tus respuestas" className="flex flex-wrap justify-center gap-2">
                {chosen.map((c) => (
                  <li key={c.i}>
                    <button
                      type="button"
                      onClick={() => setStep(c.i)}
                      aria-label={`Cambiar respuesta: ${c.label}`}
                      className="inline-flex h-8 items-center gap-1.5 rounded-full bg-surface px-3 text-[13px] font-medium text-fg/75 ring-1 ring-fg/[0.08] transition hover:text-fg hover:ring-fg/25"
                    >
                      <CheckIcon className="size-3.5 text-vita" />
                      {c.label}
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={reset}
                className="rounded-full px-2 py-1 text-sm font-medium text-link transition hover:underline hover:underline-offset-4"
              >
                Empezar de nuevo
              </button>
            </div>

            <h2
              ref={headingRef}
              tabIndex={-1}
              className="text-center text-2xl font-semibold tracking-[-0.025em] text-fg focus:outline-none md:text-[28px]"
            >
              {results.length
                ? results.length === 1
                  ? "Encontramos un modelo para vos."
                  : `Encontramos ${results.length} modelos para vos.`
                : "No encontramos una coincidencia exacta."}
            </h2>

            {results.length ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
                {results.map((p) => (
                  <ProductCard key={p.slug} product={p} dark />
                ))}
              </div>
            ) : (
              <div className="mx-auto max-w-md text-center">
                <p className="text-[17px] leading-relaxed text-fg/60">
                  Probá con otro presupuesto o escribinos: un asesor te ayuda a
                  elegir el equipo ideal.
                </p>
                <Link
                  href="/productos?categoria=iphone"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-link hover:underline hover:underline-offset-4"
                >
                  Ver todos los iPhone <ArrowIcon className="size-3.5" />
                </Link>
              </div>
            )}

            <div className="mx-auto flex max-w-[860px] flex-col items-center gap-5 rounded-[28px] bg-[linear-gradient(160deg,var(--color-champagne-light)_0%,var(--color-champagne)_100%)] px-6 py-10 text-center ring-1 ring-black/[0.04] md:flex-row md:justify-between md:px-10 md:text-left">
              <div>
                <p className="text-xl font-semibold tracking-[-0.02em] text-fg">
                  ¿Te quedó alguna duda?
                </p>
                <p className="mt-1 text-[15px] text-fg/65">
                  Un asesor te ayuda a decidir según tus respuestas.
                </p>
              </div>
              <a
                href={waLink(
                  results[0]
                    ? `${productMessage(results[0])} También quiero que me asesoren según las respuestas del test.`
                    : "Hola iPhone Vita! Hice el test en la web y quiero que me ayuden a elegir un iPhone.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="sheen inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-fg px-6 text-[15px] font-semibold text-surface shadow-[0_8px_24px_-12px_rgba(0,0,0,0.45)] transition-colors hover:bg-fg/90"
              >
                <ChatIcon className="size-5" /> Hablar con un asesor
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
