import Image from "next/image";

const POINTS = [
  { title: "Productos originales", body: "Equipos Apple y marcas reconocidas. Sin réplicas ni alternativos." },
  { title: "Semi nuevos revisados", body: "Cada equipo se revisa antes de publicarse y su salud de batería se informa siempre." },
  { title: "Atención por WhatsApp", body: "Te asesora una persona real, antes y después de la compra." },
  { title: "Precios claros", body: "Precios en dólares a la vista. Lo que no tiene precio fijo, se consulta sin compromiso." },
];

export function Trust() {
  return (
    <section id="nosotros" className="scroll-mt-16 bg-mist py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 md:px-8 lg:grid-cols-2">
        <div data-reveal className="relative aspect-[4/5] overflow-hidden rounded-[40px] md:aspect-[5/4] lg:aspect-[4/5]">
          <Image src="/images/lifestyle-hand-pro.jpg" alt="iPhone Pro en la mano" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
        </div>
        <div className="space-y-10">
          <div data-reveal className="space-y-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Por qué iPhone Vita</p>
            <h2 className="text-[clamp(2.2rem,5vw,4rem)] font-semibold leading-[1] tracking-[-0.045em]">Tecnología que se compra con confianza.</h2>
          </div>
          <dl className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
            {POINTS.map((p) => (
              <div key={p.title} data-reveal className="space-y-2 border-t border-line pt-5">
                <dt className="font-semibold tracking-tight">{p.title}</dt>
                <dd className="text-[15px] leading-relaxed text-muted">{p.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
