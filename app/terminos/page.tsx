import type { Metadata } from "next";

export const metadata: Metadata = { title: "Términos y condiciones" };

// [COMPLETAR] Reemplazar por el texto legal definitivo de iPhone Vita.
export default function Page() {
  return (
    <section className="mx-auto max-w-3xl px-4 pb-24 pt-16 md:px-8 md:pt-24">
      <h1 className="text-[clamp(2.2rem,5vw,3.6rem)] font-semibold leading-[1] tracking-[-0.045em]">Términos y condiciones</h1>
      <p className="mt-6 text-lg leading-relaxed text-muted">Estamos terminando de redactar este documento. Si tenés alguna consulta, escribinos por WhatsApp.</p>
    </section>
  );
}
