import Image from "next/image";

interface Card {
  title: string;
  body: string;
  image: string;
  alt: string;
}

const CARDS: Card[] = [
  {
    title: "Cámara Pro de 48 MP.",
    body: "Apertura variable, mejores fotos y video en poca luz, con una profundidad de campo increíble.",
    image: "/images/highlights/main-camera.jpg",
    alt: "Primer plano del sistema de cámaras del iPhone",
  },
  {
    title: "Apple Intelligence.",
    body: "Image Playground, Genmoji y Siri entienden lo que ves y lo que necesitás, directo en tu iPhone.",
    image: "/images/highlights/siri-ai-hero.jpg",
    alt: "iPhones mostrando Apple Intelligence y Siri",
  },
  {
    title: "Diseño que se nota.",
    body: "Dynamic Island, pantalla siempre activa y un acabado en titanio que se siente distinto.",
    image: "/images/highlights/siri-ai-assistant.jpg",
    alt: "Primer plano del Dynamic Island con la hora en pantalla",
  },
];

/** Carrusel horizontal estilo Apple: fotos de producto a pantalla completa con caption breve. */
export function Highlights() {
  return (
    <section className="border-t border-white/10 bg-black py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <h2 className="text-[clamp(1.8rem,4vw,2.6rem)] font-bold tracking-tight text-white">
          Mira lo más destacado.
        </h2>
      </div>

      <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] md:px-8 [&::-webkit-scrollbar]:hidden">
        {CARDS.map((c) => (
          <article
            key={c.title}
            className="relative aspect-[4/5] w-[82vw] shrink-0 snap-start overflow-hidden rounded-[28px] bg-[#0a0a0a] sm:w-[420px]"
          >
            <Image
              src={c.image}
              alt={c.alt}
              fill
              sizes="(max-width: 640px) 82vw, 420px"
              className="object-cover"
            />
            <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/85 via-black/40 to-transparent p-6 md:p-7">
              <h3 className="text-xl font-semibold text-white md:text-2xl">
                {c.title}
              </h3>
              <p className="mt-2 max-w-[34ch] text-sm leading-relaxed text-white/70">
                {c.body}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
