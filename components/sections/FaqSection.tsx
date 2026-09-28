"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

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
      "Realizamos envíos a todo el territorio argentino a través de encomiendas de máxima seguridad (Andreani Express / Correo Argentino prioritario) con código de seguimiento en tiempo real y seguro de carga incluido. El equipo viaja blindado y embalado con protección antigolpes. En Córdoba y zonas coordinadas, realizamos entregas presenciales.",
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
      className="scroll-mt-24 border-t border-white/10 bg-black py-20 text-white md:py-32"
    >
      <div className="mx-auto max-w-4xl px-4 md:px-8">
        {/* Header */}
        <div data-reveal className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#ebd7be]">
            <HelpCircle size={14} className="text-[#ebd7be]" />
            Respuestas Claras
          </div>
          <h2 className="mt-4 text-[clamp(2.2rem,5vw,3.8rem)] font-bold leading-[1.1] tracking-[-0.03em]">
            Preguntas frecuentes.
          </h2>
          <p className="mx-auto mt-4 max-w-[50ch] text-base text-white/60 md:text-lg">
            Todo lo que necesitás saber sobre envíos, métodos de pago, garantías y el Plan Canje.
          </p>
        </div>

        {/* Acordeón de preguntas */}
        <div data-reveal className="mt-12 space-y-3.5">
          {FAQS.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                  isOpen
                    ? "border-[#ebd7be]/40 bg-white/[0.04] shadow-lg shadow-black/40"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.03]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(faq.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left md:p-6"
                >
                  <span className="text-base font-semibold text-white md:text-lg">
                    {faq.question}
                  </span>
                  <div
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-transform duration-300 ${
                      isOpen ? "rotate-180 border-[#ebd7be]/50 text-[#ebd7be]" : "text-white/60"
                    }`}
                  >
                    <ChevronDown size={18} />
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-white/5 px-5 pb-6 pt-3 text-sm leading-relaxed text-white/70 md:px-6 md:text-base">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Banner soporte adicional */}
        <div
          data-reveal
          className="mt-12 rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.04] to-transparent p-6 text-center md:flex md:items-center md:justify-between md:text-left"
        >
          <div>
            <h3 className="text-base font-semibold text-white">
              ¿Tenés otra consulta específica?
            </h3>
            <p className="mt-1 text-sm text-white/60">
              Escribinos por WhatsApp y te asesoramos al instante con fotos reales del stock.
            </p>
          </div>
          <a
            href="https://wa.me/5493516599723?text=Hola%20iPhone%20Vita!%20Tengo%20una%20consulta%20antes%20de%20comprar:"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center justify-center rounded-full bg-white/10 px-6 py-2.5 text-sm font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/20 hover:text-white md:mt-0"
          >
            Hablar con un asesor
          </a>
        </div>
      </div>
    </section>
  );
}
