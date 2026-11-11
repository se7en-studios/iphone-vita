import Link from "next/link";
import { waLink } from "@/lib/whatsapp";
import { ArrowIcon, ChatIcon } from "@/components/ui/Icons";

const SUGGESTIONS = [
  { label: "Inicio", href: "/" },
  { label: "iPhone", href: "/productos?categoria=iphone&condicion=nuevo" },
  { label: "Semi nuevos", href: "/productos?condicion=semi-nuevo" },
  { label: "Mac", href: "/productos?categoria=mac" },
  { label: "Encontrá tu iPhone", href: "/encontra-tu-iphone" },
];

export default function NotFound() {
  return (
    <section className="bg-bg px-4 py-24 text-fg md:px-8 md:py-32">
      <div className="mx-auto flex min-h-[50vh] max-w-[640px] flex-col items-center justify-center text-center">
        <p className="tabular text-[15px] font-semibold tracking-[-0.005em] text-vita md:text-[17px]">
          Error 404
        </p>
        <h1 className="mt-2 text-[clamp(2.5rem,7vw,4.5rem)] font-bold leading-[1.04] tracking-[-0.035em]">
          Esta página no existe.
        </h1>
        <p className="mt-5 max-w-[42ch] text-[17px] leading-relaxed text-fg/60 md:text-lg">
          Puede que el producto ya no esté disponible o que el enlace haya
          cambiado. Te ayudamos a encontrar lo que buscás.
        </p>
        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/productos"
            className="sheen inline-flex h-12 items-center gap-2 rounded-full bg-fg px-7 text-[15px] font-semibold text-surface shadow-[0_8px_24px_-12px_rgba(0,0,0,0.45)] transition-colors hover:bg-fg/90"
          >
            Ver productos <ArrowIcon className="size-4" />
          </Link>
          <a
            href={waLink(
              "Hola iPhone Vita! Busco un equipo que no encontré en la web.",
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-surface px-7 text-[15px] font-semibold text-fg ring-1 ring-fg/10 transition hover:ring-fg/25"
          >
            <ChatIcon className="size-4" /> Consultar por WhatsApp
          </a>
        </div>
        <nav aria-label="Sugerencias" className="mt-12 w-full border-t border-fg/[0.08] pt-8">
          <p className="text-[13px] text-fg/45">O andá directo a</p>
          <ul className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-2">
            {SUGGESTIONS.map((s) => (
              <li key={s.href}>
                <Link
                  href={s.href}
                  className="inline-flex items-center gap-1 text-[15px] font-medium text-vita hover:underline hover:underline-offset-4"
                >
                  {s.label} <ArrowIcon className="size-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
