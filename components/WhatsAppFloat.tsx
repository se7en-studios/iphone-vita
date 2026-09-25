import { GENERAL_MESSAGE, waLink } from "@/lib/whatsapp";
import { ChatIcon } from "./ui/Icons";

export function WhatsAppFloat() {
  return (
    <a
      href={waLink(GENERAL_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      className="group fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[#1d1d1f] py-3 pl-3.5 pr-4 ring-1 ring-white/10 text-sm font-medium text-white shadow-[0_12px_40px_-12px_rgba(0,0,0,0.5)] transition hover:-translate-y-0.5 md:bottom-7 md:right-7"
      style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <span className="grid size-7 place-items-center rounded-full bg-vita text-black"><ChatIcon className="size-4" /></span>
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
