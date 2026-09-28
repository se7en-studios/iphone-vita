import Link from "next/link";
import { waLink } from "@/lib/whatsapp";

export default function NotFound() {
  return (
    <section className="mx-auto grid min-h-[60vh] max-w-3xl place-items-center px-4 py-24 text-center">
      <div className="space-y-5">
        <p className="font-semibold text-base text-muted">Error 404</p>
        <h1 className="text-5xl font-semibold tracking-[-0.045em]">
          Esta página no existe.
        </h1>
        <p className="text-muted">
          Puede que el producto ya no esté disponible.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            href="/productos"
            className="sheen rounded-full bg-champagne px-6 py-3 text-sm font-bold text-black transition hover:bg-champagne-light"
          >
            Ver productos
          </Link>
          <a
            href={waLink(
              "Hola iPhone Vita! Busco un equipo que no encontré en la web.",
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full px-6 py-3 text-sm font-semibold ring-1 ring-fg/20 transition hover:ring-fg/40"
          >
            Consultar por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
