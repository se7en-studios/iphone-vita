import { GENERAL_MESSAGE, WHATSAPP_NUMBER, waLink } from "@/lib/whatsapp";
import { ChatIcon } from "../ui/Icons";

const pretty = (n: string) =>
  `+${n.slice(0, 2)} ${n.slice(2, 3)} ${n.slice(3, 7)} ${n.slice(7, 9)}-${n.slice(9)}`;

/**
 * Cierre de la home: un panel champagne a lo ancho. El fondo es un degradé lineal entre dos tonos
 * del acento (sin blur ni halos radiales de baja opacidad, que dejaban anillos/banding).
 */
export function WhatsAppCTA() {
  return (
    <section className="border-t border-fg/10 bg-bg px-4 py-16 text-fg md:px-8 md:py-24">
      <div
        data-reveal
        className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[28px] bg-[linear-gradient(160deg,var(--color-champagne-light)_0%,var(--color-champagne)_100%)] px-6 py-16 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04] md:rounded-[40px] md:px-12 md:py-28"
      >
        {/* Filo de luz arriba: da volumen sin sombra pesada. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
        />
        <div className="relative mx-auto max-w-[920px]">
          <span
            aria-hidden="true"
            className="mx-auto mb-7 grid size-14 place-items-center rounded-full bg-surface/70 text-fg shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05] md:size-16"
          >
            <ChatIcon className="size-6 md:size-7" />
          </span>
          <h2 className="text-[clamp(2.75rem,7vw,5.5rem)] font-bold leading-[1.02] tracking-[-0.04em] text-fg">
            ¿Dudas? <span className="text-vita">Hablemos.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-[46ch] text-[17px] leading-relaxed text-fg/70 md:mt-6 md:text-xl">
            Stock, colores, cotización en pesos o el equipo que estás buscando.
            Te asesoramos directo por WhatsApp.
          </p>
          <div className="mt-9 flex flex-col items-center gap-4 md:mt-10">
            <a
              href={waLink(GENERAL_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="sheen inline-flex h-14 items-center gap-2.5 rounded-full bg-fg px-8 text-base font-semibold text-surface shadow-[0_8px_24px_-12px_rgba(0,0,0,0.45)] transition-colors duration-300 hover:bg-fg/90"
            >
              <ChatIcon className="size-5" /> Consultar por WhatsApp
            </a>
            <p className="tabular text-sm text-fg/60">
              o escribinos al{" "}
              <a
                href={waLink(GENERAL_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-fg/80 underline decoration-fg/25 underline-offset-4 transition hover:text-fg hover:decoration-fg/60"
              >
                {pretty(WHATSAPP_NUMBER)}
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
