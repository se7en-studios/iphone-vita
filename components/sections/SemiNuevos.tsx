import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";
import { productMessage, waLink } from "@/lib/whatsapp";
import { ProductVisual } from "../ProductVisual";
import { ChatIcon } from "../ui/Icons";

function Battery({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-2" aria-label={`Salud de batería ${value}%`}>
      <span className="relative h-2.5 w-9 rounded-[3px] border border-white/40 p-[1.5px]">
        <span className="block h-full rounded-[1.5px] bg-vita" style={{ width: `${value}%` }} />
        <span className="absolute -right-[3px] top-1/2 h-1 w-[2px] -translate-y-1/2 rounded-r bg-white/40" />
      </span>
      <span className="tabular text-sm">{value}% batería</span>
    </span>
  );
}

export function SemiNuevos({ items }: { items: Product[] }) {
  return (
    <section className="bg-ink py-24 text-white md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid items-end gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div data-reveal className="space-y-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">Semi nuevos</p>
            <h2 className="text-[clamp(2.6rem,6.4vw,5.4rem)] font-semibold leading-[0.95] tracking-[-0.05em]">
              Más iPhone.
              <br />
              <span className="text-white/45">Menos precio.</span>
            </h2>
            <p className="max-w-md text-lg text-white/60">
              Equipos seleccionados y revisados. La forma inteligente de llegar a un iPhone Pro, con la salud de batería a la vista.
            </p>
          </div>
          <div data-reveal className="relative aspect-[16/10] overflow-hidden rounded-[36px]">
            <Image src="/images/lifestyle-lineup.jpg" alt="Varios iPhone Pro en la mano" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
        </div>

        <ul className="mt-14 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-5">
          {items.map((p) => (
            <li key={p.slug} data-reveal className="group flex flex-col overflow-hidden rounded-[28px] bg-ink-2 ring-1 ring-line-dark transition hover:ring-white/20">
              <Link href={`/producto/${p.slug}`} className="block">
                <ProductVisual product={p} tone="dark" className="aspect-square" sizes="(max-width: 640px) 100vw, 20vw" />
              </Link>
              <div className="flex flex-1 flex-col gap-3 p-4 md:p-5">
                <Link href={`/producto/${p.slug}`} className="space-y-0.5">
                  <h3 className="text-[15px] font-semibold tracking-tight md:text-[17px]">{p.name}</h3>
                  <p className="text-sm text-white/55">{p.storage} · {p.color}</p>
                </Link>
                {p.batteryHealth && <Battery value={p.batteryHealth} />}
                <p className="text-xs text-white/45">1 unidad disponible · Consultar precio</p>
                <a
                  href={waLink(productMessage(p))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto flex items-center justify-center gap-2 rounded-full bg-white py-2.5 text-sm font-medium text-ink transition hover:bg-white/85"
                >
                  <ChatIcon className="size-4" /> Consultar
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
