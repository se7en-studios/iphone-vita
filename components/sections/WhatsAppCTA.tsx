import { GENERAL_MESSAGE, waLink } from "@/lib/whatsapp";
import { ChatIcon } from "../ui/Icons";

export function WhatsAppCTA() {
  return (
    <section className="relative overflow-hidden border-t border-white/10 bg-black py-16 text-white md:py-40">
      <div
        aria-hidden="true"
        className="hero-glow pointer-events-none absolute inset-x-0 bottom-0 mx-auto h-[420px] max-w-[900px] rounded-full bg-[radial-gradient(ellipse_50%_60%_at_50%_100%,rgba(235,215,190,0.16),transparent_70%)] blur-3xl"
      />
      <div
        data-reveal
        className="relative mx-auto max-w-[980px] space-y-6 px-4 text-center md:px-8"
      >
        <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[1.05] tracking-[-0.03em]">
          ¿Dudas? <span className="text-champagne">Hablemos.</span>
        </h2>
        <p className="mx-auto max-w-[52ch] text-lg text-white/60 md:text-xl">
          Stock, colores, cotización en pesos o el equipo que estás buscando. Te
          asesoramos directo por WhatsApp.
        </p>
        <a
          href={waLink(GENERAL_MESSAGE)}
          target="_blank"
          rel="noopener noreferrer"
          className="sheen inline-flex items-center gap-2 rounded-full bg-champagne px-7 py-3 text-sm font-semibold text-black transition hover:bg-white"
        >
          <ChatIcon className="size-4" /> Consultar por WhatsApp
        </a>
      </div>
    </section>
  );
}
