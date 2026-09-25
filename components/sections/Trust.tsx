import Image from "next/image";
import type { ReactNode } from "react";
import { CashIcon, GiftIcon, PhoneIcon, ShieldIcon } from "../ui/Icons";

const POINTS: { icon: ReactNode; title: string; body: string }[] = [
  {
    icon: <GiftIcon />,
    title: "Funda y templado de regalo",
    body: "En cada iPhone nuevo sellado te llevás funda de silicona y vidrio templado sin cargo.",
  },
  {
    icon: <CashIcon />,
    title: "Aceptamos pesos y dólares",
    body: "Pagá en USD efectivo, USDT o pesos al tipo de cambio del día, sin vueltas.",
  },
  {
    icon: <ShieldIcon />,
    title: "Garantía oficial Apple",
    body: "Equipos nuevos sellados de fábrica con 1 año de garantía oficial internacional.",
  },
  {
    icon: <PhoneIcon />,
    title: "Semi nuevos seleccionados",
    body: "Revisados punto por punto, con diagnóstico de batería real y listos para usar.",
  },
];

export function Trust() {
  return (
    <section
      id="nosotros"
      className="scroll-mt-28 border-t border-white/10 bg-black py-28 text-white md:py-40"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div
          data-reveal
          className="mx-auto max-w-[980px] space-y-5 text-center"
        >
          <p className="text-lg font-semibold text-[#ebd7be] md:text-xl">
            Por qué iPhone Vita
          </p>
          <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[1.05] tracking-[-0.03em]">
            Comprá con tranquilidad.
          </h2>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl items-center gap-14 lg:grid-cols-2">
          <div
            data-reveal
            className="relative mx-auto aspect-[4/5] w-full max-w-[460px] overflow-hidden rounded-[28px] bg-[#0a0a0a]"
          >
            <Image
              src="/images/iphone-pro-blue-box.jpg"
              alt="iPhone sellado apoyado sobre su caja original"
              fill
              sizes="(max-width: 1024px) 100vw, 460px"
              className="object-cover"
            />
          </div>

          <dl className="grid gap-x-10 gap-y-12 sm:grid-cols-2">
            {POINTS.map((p) => (
              <div key={p.title} data-reveal className="space-y-3">
                <span className="text-[#ebd7be]">{p.icon}</span>
                <dt className="text-lg font-semibold tracking-tight">
                  {p.title}
                </dt>
                <dd className="text-[15px] leading-relaxed text-white/60">
                  {p.body}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
