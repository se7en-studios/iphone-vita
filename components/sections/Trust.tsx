import Image from "next/image";

const POINTS = [
  { icon: "🎁", title: "Funda y templado de regalo", body: "En cada iPhone nuevo sellado te llevás funda de silicona y vidrio templado sin cargo." },
  { icon: "💵", title: "Aceptamos pesos y dólares", body: "Aboná en USD efectivo, USDT o pesos al tipo de cambio blue transparente del día." },
  { icon: "🛡️", title: "Garantía oficial Apple", body: "Equipos nuevos sellados de fábrica con 1 año de garantía oficial internacional." },
  { icon: "📱", title: "Semi nuevos seleccionados", body: "Revisados punto por punto con diagnóstico de batería real y listos para usar." },
];

export function Trust() {
  return (
    <section id="nosotros" className="scroll-mt-16 border-t border-white/10 bg-[#071026] py-24 text-white md:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 md:px-8 lg:grid-cols-2">
        <div data-reveal className="relative aspect-[4/5] overflow-hidden rounded-[40px] bg-[#050b18] p-4 ring-1 ring-white/10 md:aspect-[5/4] lg:aspect-[4/5]">
          <Image
            src="/images/showcase/iphone-17-pro.jpg"
            alt="iPhone 17 Pro Sellado iPhone Vita"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
          />
        </div>
        <div className="space-y-10">
          <div data-reveal className="space-y-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#ebd7be]">Por qué iPhone Vita</p>
            <h2 className="text-[clamp(2.2rem,5vw,3.8rem)] font-semibold leading-[1.05] tracking-[-0.04em]">
              <span className="font-serif-luxury text-[#ebd7be]">Tecnología premium</span> que se compra con confianza.
            </h2>
          </div>
          <dl className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
            {POINTS.map((p) => (
              <div key={p.title} data-reveal className="space-y-2 border-t border-white/10 pt-5">
                <dt className="flex items-center gap-2 font-semibold tracking-tight text-white">
                  <span>{p.icon}</span>
                  <span>{p.title}</span>
                </dt>
                <dd className="text-[14px] leading-relaxed text-white/60">{p.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
