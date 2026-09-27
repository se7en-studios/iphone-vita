import Image from "next/image";

/** Apple Intelligence y Siri, con el copy basado en lo que comunica Apple del iPhone 18 Pro. */
export function IntelligenceSection() {
  return (
    <section
      id="intelligence"
      className="scroll-mt-28 border-t border-white/10 bg-black py-16 text-white md:py-40"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-4 px-4 md:gap-14 md:px-8 lg:grid-cols-2 lg:gap-20">
        <div data-reveal className="space-y-6">
          <p className="text-lg font-semibold text-[#ebd7be] md:text-xl">
            Apple Intelligence
          </p>
          <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[1.05] tracking-[-0.03em]">
            Una Siri nueva, que te entiende.
          </h2>
          <p className="max-w-[48ch] text-lg leading-relaxed text-white/60 md:text-xl">
            La nueva generación de Apple Intelligence es el motor de una Siri
            más personal, natural y poderosa, integrada en tus apps.
          </p>
          <p className="max-w-[48ch] text-lg leading-relaxed text-white/60 md:text-xl">
            Funciona con el chip A20 Pro y sus dos Neural Engine de 16 núcleos,
            y está diseñada desde el inicio para cuidar tu privacidad.
          </p>
          <p className="text-xs text-white/40">
            La disponibilidad de funciones varía según el idioma y la región.
          </p>
        </div>

        <div
          data-reveal
          className="relative mx-auto aspect-[696/452] w-full max-w-[696px]"
        >
          <Image
            src="/images/highlights/siri-ai-assistant.jpg"
            alt="Pantalla de bloqueo del iPhone con Siri activa en la Dynamic Island"
            fill
            sizes="(max-width: 1024px) 100vw, 696px"
            className="object-contain"
          />
        </div>
      </div>
    </section>
  );
}
