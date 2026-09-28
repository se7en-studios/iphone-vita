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
      className="scroll-mt-24 border-t border-white/10 bg-[#070708] py-20 text-white md:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* Header de la sección */}
        <div data-reveal className="mx-auto max-w-[800px] text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#ebd7be]/30 bg-[#ebd7be]/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#ebd7be]">
            <Sparkles size={14} className="text-[#ebd7be]" />
            Experiencia iPhone Vita
          </div>
          <h2 className="mt-4 text-[clamp(2.2rem,5vw,4rem)] font-bold leading-[1.1] tracking-[-0.03em]">
            Confianza respaldada por{" "}
            <span className="text-[#ebd7be]">nuestra comunidad</span>.
          </h2>
          <p className="mx-auto mt-4 max-w-[58ch] text-base text-white/60 md:text-lg">
            Cientos de personas eligen renovar su tecnología con nosotros todos los meses.
            Transparencia total, garantía certificada y trato cercano.
          </p>

          {/* Badges de Score */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 ring-1 ring-white/10">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="currentColor" />
                ))}
              </div>
              <span className="font-semibold text-white">4.9 / 5.0</span>
              <span className="text-white/40">· +400 entregas</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 ring-1 ring-white/10 text-white/80">
              <ShieldCheck size={16} className="text-[#30d158]" />
              <span>Garantía escrita y seguimiento 1 a 1</span>
            </div>
          </div>
        </div>

        {/* Grid de testimonios */}
        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {REVIEWS.map((r) => (
            <div
              key={r.id}
              data-reveal
              className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md transition-all duration-300 hover:border-[#ebd7be]/40 hover:bg-white/[0.05]"
            >
              <div>
                {/* Estrellas y Fecha */}
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <span className="text-xs text-white/40">{r.date}</span>
                </div>

                {/* Comentario */}
                <p className="mt-4 text-sm leading-relaxed text-white/80">
                  &ldquo;{r.comment}&rdquo;
                </p>
              </div>

              <div className="mt-6 border-t border-white/5 pt-4">
                {/* Producto */}
                <p className="line-clamp-1 text-xs font-medium text-[#ebd7be]">
                  {r.product}
                </p>
                {/* Autor y Ubicación */}
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">{r.name}</span>
                  <span className="text-white/40">{r.location}</span>
                </div>
                {r.verified && (
                  <div className="mt-1.5 flex items-center gap-1 text-[11px] text-[#30d158]">
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
