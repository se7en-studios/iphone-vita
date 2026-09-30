"use client";

import { Star, ShieldCheck, Sparkles } from "lucide-react";

interface Review {
  id: string;
  name: string;
  location: string;
  product: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

const REVIEWS: Review[] = [
  {
    id: "1",
    name: "Agustín R.",
    location: "Córdoba Capital",
    product: "iPhone 16 Pro Max 256GB Desert Titanium",
    rating: 5,
    date: "Hace 3 días",
    comment:
      "Increíble atención. Equipo 100% sellado con garantía oficial activa en Apple desde el primer encendido. El envío con seguro llegó al día siguiente impecable.",
    verified: true,
  },
  {
    id: "2",
    name: "Camila V.",
    location: "Rosario, Santa Fe",
    product: "Plan Canje: Entregó iPhone 12 → Se llevó iPhone 15 Pro",
    rating: 5,
    date: "Hace 1 semana",
    comment:
      "Hice el Plan Canje a distancia. Cotizaron mi 12 súper rápido, mandé el equipo y en 48hs tenía el 15 Pro en mano pagando la diferencia en pesos. De diez.",
    verified: true,
  },
  {
    id: "3",
    name: "Martín B.",
    location: "Buenos Aires, CABA",
    product: "iPhone 14 Pro 128GB (Semi-Nuevo)",
    rating: 5,
    date: "Hace 2 semanas",
    comment:
      "Compré un semi-nuevo y está literalmente nuevo: batería en 96%, sin un solo detalle estético. Vino con funda y templado colocados de regalo. Muy recomendables.",
    verified: true,
  },
  {
    id: "4",
    name: "Sofía M.",
    location: "Mendoza",
    product: "MacBook Air M3 & AirPods Pro 2",
    rating: 5,
    date: "Hace 3 semanas",
    comment:
      "Pagué una parte en USD y el resto por transferencia con la cotización del día fijada en el momento. La velocidad de respuesta por WhatsApp es inmejorable.",
    verified: true,
  },
];

export function ReviewsSection() {
  return (
    <section
      id="testimonios"
      className="scroll-mt-24 border-t border-fg/10 bg-surface py-20 text-fg md:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* Header de la sección */}
        <div data-reveal className="mx-auto max-w-[800px] text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-vita/30 bg-vita/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-vita">
            <Sparkles size={14} className="text-vita" />
            Experiencia iPhone Vita
          </div>
          <h2 className="mt-4 text-[clamp(2.2rem,5vw,4rem)] font-bold leading-[1.1] tracking-[-0.03em]">
            Confianza respaldada por{" "}
            <span className="text-vita">nuestra comunidad</span>.
          </h2>
          <p className="mx-auto mt-4 max-w-[58ch] text-base text-fg/60 md:text-lg">
            Cientos de personas eligen renovar su tecnología con nosotros todos los meses.
            Transparencia total, garantía certificada y trato cercano.
          </p>

          {/* Badges de Score */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 rounded-full bg-fg/5 px-4 py-2 ring-1 ring-fg/10">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="currentColor" />
                ))}
              </div>
              <span className="font-semibold text-fg">4.9 / 5.0</span>
              <span className="text-fg/40">· +400 entregas</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-fg/5 px-4 py-2 ring-1 ring-fg/10 text-fg/80">
              <ShieldCheck size={16} className="text-[light-dark(#1a7f37,#30d158)]" />
              <span>Garantía escrita y seguimiento 1 a 1</span>
            </div>
          </div>
        </div>

        {/* Grid de testimonios */}
        {/* Mobile: carrusel con snap, como Lo más elegido. Apiladas ocupaban ~1800px. */}
        <div className="no-scrollbar -mx-4 mt-14 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 md:mx-0 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:px-0 lg:grid-cols-4">
          {REVIEWS.map((r) => (
            <div
              key={r.id}
              className="flex w-[82vw] max-w-[340px] shrink-0 snap-start flex-col justify-between rounded-2xl md:w-auto md:max-w-none border border-fg/10 bg-surface p-6 transition-colors duration-200 hover:border-vita/40 hover:bg-surface-2"
            >
              <div>
                {/* Estrellas y Fecha */}
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <span className="text-xs text-fg/40">{r.date}</span>
                </div>

                {/* Comentario */}
                <p className="mt-4 text-sm leading-relaxed text-fg/80">
                  &ldquo;{r.comment}&rdquo;
                </p>
              </div>

              <div className="mt-6 border-t border-fg/5 pt-4">
                {/* Producto */}
                <p className="line-clamp-1 text-xs font-medium text-vita">
                  {r.product}
                </p>
                {/* Autor y Ubicación */}
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-fg">{r.name}</span>
                  <span className="text-fg/40">{r.location}</span>
                </div>
                {r.verified && (
                  <div className="mt-1.5 flex items-center gap-1 text-[11px] text-[light-dark(#1a7f37,#30d158)]">
                    <ShieldCheck size={12} />
                    <span>Compra verificada</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
