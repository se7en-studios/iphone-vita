import type { Metadata } from "next";
import Link from "next/link";
import { REVOCATION_DAYS } from "@/lib/legal";
import { waLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Botón de arrepentimiento",
  description: `Arrepentite de tu compra dentro de los ${REVOCATION_DAYS} días de recibida, sin costo.`,
};

const MESSAGE = [
  "Hola iPhone Vita! Quiero arrepentirme de mi compra (botón de arrepentimiento).",
  "",
  "Nombre y apellido:",
  "Producto:",
  "Fecha de compra o de entrega:",
].join("\n");

const STEPS = [
  "Tocá el botón y completá el mensaje con tu nombre, el producto y la fecha.",
  "Dentro de las 24 horas te respondemos con un código de trámite.",
  "Coordinamos el retiro del producto. El envío lo pagamos nosotros.",
  "Cuando lo recibimos, te devolvemos el dinero por el mismo medio que usaste para pagar.",
];

/** Botón de arrepentimiento: la ley pide que esté a la vista y sea fácil de usar. */
export default function Page() {
  return (
    <section className="mx-auto max-w-3xl px-4 pb-24 pt-16 md:px-8 md:pt-24">
      <h1 className="text-[clamp(2.2rem,5vw,3.6rem)] font-semibold leading-[1] tracking-[-0.045em]">
        Botón de arrepentimiento
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-fg/75">
        Si compraste a distancia, tenés {REVOCATION_DAYS} días corridos desde
        que recibiste el producto para arrepentirte, sin dar motivos y sin
        costo. El producto tiene que volver como lo recibiste, con su caja y sus
        accesorios.
      </p>

      <ol className="mt-10 space-y-4">
        {STEPS.map((step, i) => (
          <li
            key={step}
            className="flex gap-4 text-[15px] leading-relaxed text-fg/75"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-vita-soft text-sm font-bold text-vita">
              {i + 1}
            </span>
            <span className="pt-1">{step}</span>
          </li>
        ))}
      </ol>

      <a
        href={waLink(MESSAGE)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-10 inline-flex items-center justify-center rounded-full bg-accent px-8 py-4 text-base font-bold text-accent-fg transition hover:brightness-110"
      >
        Quiero arrepentirme de mi compra
      </a>

      <p className="mt-8 text-sm text-muted">
        Más detalles en los{" "}
        <Link href="/terminos" className="text-link underline">
          términos y condiciones
        </Link>
        .
      </p>
    </section>
  );
}
