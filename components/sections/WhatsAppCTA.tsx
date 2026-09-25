import { GENERAL_MESSAGE, waLink } from "@/lib/whatsapp";
import { ChatIcon } from "../ui/Icons";

export function WhatsAppCTA() {
  return (
    <section className="border-t border-white/10 bg-[#050b18] py-20 text-white md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div data-reveal className="relative overflow-hidden rounded-[44px] bg-[#091224] px-6 py-16 text-center text-white ring-1 ring-white/10 md:px-16 md:py-24">
          <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[70%] -translate-x-1/2 rounded-full bg-[#3877ff]/20 blur-3xl" />
          <div className="relative mx-auto max-w-2xl space-y-6">
            <h2 className="text-[clamp(2.2rem,5.4vw,4.2rem)] font-semibold leading-[1] tracking-[-0.045em]">
              ¿Dudas? <span className="font-serif-luxury text-[#ebd7be]">Hablemos.</span>
            </h2>
            <p className="text-lg text-white/70">Stock, colores, cotización en pesos o el equipo que estás buscando. Te asesoramos directo por WhatsApp con atención personalizada.</p>
            <a href={waLink(GENERAL_MESSAGE)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#ebd7be] px-8 py-4 text-sm font-semibold text-[#050b18] shadow-lg shadow-[#ebd7be]/20 transition hover:bg-[#f7ede0]">
              <ChatIcon className="size-4" /> Consultar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
