"use client";

import { useState } from "react";
import { ChatIcon, PlusIcon } from "../ui/Icons";
import { waLink } from "@/lib/whatsapp";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

const FAQS: FaqItem[] = [
  {
    id: "garantia",
    question: "¿Qué garantía tienen los productos?",
    answer:
      "Los equipos nuevos y sellados cuentan con 1 año de garantía oficial Apple a nivel mundial, válida en cualquier Apple Store o servicio técnico autorizado oficial desde la fecha de activación. Los equipos semi-nuevos cuentan con garantía propia de funcionamiento por escrito y son testeados en más de 30 puntos clave (Face ID, cámaras, micrófonos, pantalla y condición de batería).",
  },
  {
    id: "pagos",
    question: "¿Cuáles son los medios de pago aceptados?",
    answer:
      "Aceptamos dólares billete (en mano, cara grande/franja azul sin marcas), transferencia bancaria en pesos argentinos (al tipo de cambio del día fijado al momento de transferir), y criptomonedas estables (USDT vía red TRC20 o BEP20 sin comisiones adicionales). También consultanos por opciones de pago mixto o financiación.",
  },
  {
    id: "envios",
    question: "¿Cómo son los envíos al interior del país y qué tan seguros son?",
    answer:
      "Realizamos envíos a todo el territorio argentino a través de encomiendas de máxima seguridad (Andreani Express / Correo Argentino prioritario) con código de seguimiento en tiempo real y seguro de carga incluido. El equipo viaja blindado y embalado con protección antigolpes. En Neuquén y zonas coordinadas, realizamos entregas presenciales.",
  },
  {
    id: "canje",
    question: "¿Cómo funciona el Plan Canje si quiero entregar mi iPhone usado?",
    answer:
      "Es muy simple: cotizamos tu iPhone actual según el modelo, capacidad y salud de batería. Ese valor se descuenta de forma directa del precio del equipo nuevo o semi-nuevo que elijas. Podés cotizarlo online con nuestro simulador y coordinamos la entrega en mano o por correo seguro.",
  },
  {
    id: "regalos",
    question: "¿Los equipos vienen con funda y vidrio templado?",
    answer:
      "¡Sí! Con la compra de tu iPhone te llevás de regalo una funda de silicona de alta calidad y un vidrio templado 9D de máxima protección ya colocado o listo para instalar, para que uses tu equipo protegido desde el primer minuto.",
  },
];

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>("garantia");

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="faq"
      className="scroll-mt-24 border-t border-fg/10 bg-surface py-20 text-fg md:py-32"
    >
      <div className="mx-auto max-w-[860px] px-4 md:px-8">
        {/* Header */}
        <div data-reveal className="text-center">
          <p className="text-[15px] font-semibold tracking-[-0.005em] text-vita md:text-[17px]">
            Respuestas claras
          </p>
          <h2 className="mt-2 text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.04] tracking-[-0.035em]">
            Preguntas frecuentes.
          </h2>
          <p className="mx-auto mt-5 max-w-[48ch] text-[17px] leading-relaxed text-fg/60 md:text-lg">
            Todo lo que necesitás saber sobre envíos, métodos de pago, garantías y el Plan Canje.
          </p>
        </div>

        {/* Acordeón de preguntas: separadores finos, sin cajas */}
        <ul data-reveal className="mt-12 border-b border-fg/10 md:mt-16">
          {FAQS.map((faq) => {
            const isOpen = openId === faq.id;
            const panelId = `faq-panel-${faq.id}`;
            const buttonId = `faq-button-${faq.id}`;
            return (
              <li key={faq.id} className="border-t border-fg/10">
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    onClick={() => toggle(faq.id)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="group flex w-full items-center justify-between gap-6 rounded-none py-5 text-left md:py-6"
                  >
                    <span className="text-[17px] font-semibold leading-snug tracking-[-0.01em] text-pretty text-fg transition-colors duration-300 group-hover:text-vita md:text-xl">
                      {faq.question}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`grid size-8 shrink-0 place-items-center rounded-full transition duration-300 ${
                        isOpen
                          ? "bg-fg text-surface"
                          : "bg-fg/[0.06] text-fg/70 group-hover:bg-fg/10"
                      }`}
                    >
                      <PlusIcon
                        className={`size-4 transition-transform duration-500 ease-[var(--ease-out-expo)] ${
                          isOpen ? "rotate-45" : ""
                        }`}
                      />
                    </span>
                  </button>
                </h3>

                {/* Alto animado con grid 0fr → 1fr; cerrado queda inerte para teclado y lectores. */}
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  inert={!isOpen}
                  className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-out-expo)] motion-reduce:transition-none ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-[68ch] pb-7 md:pr-12 text-[15px] leading-relaxed text-fg/65 md:text-[17px]">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Banner soporte adicional */}
        <div
          data-reveal
          className="mt-12 flex flex-col items-center gap-5 rounded-[24px] bg-bg p-6 text-center md:mt-16 md:flex-row md:gap-6 md:p-8 md:text-left"
        >
          <span
            aria-hidden="true"
            className="grid size-12 shrink-0 place-items-center rounded-full bg-surface text-vita shadow-[0_1px_2px_rgba(0,0,0,0.05)] ring-1 ring-fg/[0.06]"
          >
            <ChatIcon className="size-5" />
          </span>
          <div className="flex-1">
            <h3 className="text-[17px] font-semibold tracking-[-0.01em] text-fg">
              ¿Tenés otra consulta específica?
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-fg/60">
              Escribinos por WhatsApp y te asesoramos al instante con fotos reales del stock.
            </p>
          </div>
          <a
            href={waLink("Hola iPhone Vita! Tengo una consulta antes de comprar:")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-fg px-6 text-sm font-semibold text-surface transition-colors duration-300 hover:bg-fg/85"
          >
            Hablar con un asesor
          </a>
        </div>
      </div>
    </section>
  );
}
