import { GENERAL_MESSAGE, waLink } from "@/lib/whatsapp";
import { ChatIcon } from "../ui/Icons";

export function WhatsAppCTA() {
  return (
    <section className="bg-paper py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div data-reveal className="relative overflow-hidden rounded-[44px] bg-ink px-6 py-16 text-center text-white md:px-16 md:py-24">
          <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[70%] -translate-x-1/2 rounded-full bg-vita/25 blur-3xl" />
          <div className="relative mx-auto max-w-2xl space-y-6">
            <h2 className="text-[clamp(2.2rem,5.4vw,4.2rem)] font-semibold leading-[1] tracking-[-0.045em]">¿Dudas? Hablemos.</h2>
            <p className="text-lg text-white/60">Stock, colores, formas de pago o el equipo que estás buscando. Te respondemos por WhatsApp.</p>
            <a href={waLink(GENERAL_MESSAGE)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-medium text-ink transition hover:bg-white/85">
              <ChatIcon className="size-4" /> Escribinos por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
