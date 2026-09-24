import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";
import { formatUSD } from "@/lib/format";
import { ColorDots } from "../ui/ColorDots";

/** iPhone destacado: producto gigante sobre blanco, estilo vitrina. */
export function FeaturedIphone({ variants }: { variants: Product[] }) {
  const lead = variants.find((v) => v.color === "Silver") ?? variants[0];
  return (
    <section className="bg-paper py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div data-reveal className="mx-auto max-w-3xl space-y-4 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Destacado</p>
          <h2 className="text-[clamp(2.6rem,7vw,5.6rem)] font-semibold leading-[0.95] tracking-[-0.05em]">iPhone 17 Pro Max</h2>
          <p className="text-lg text-muted">
            256GB · <span className="tabular">Desde {formatUSD(lead.price ?? 0)}</span>
          </p>
          <div className="flex justify-center pt-2">
            <ColorDots variants={variants} size="md" />
          </div>
          <div className="flex justify-center gap-3 pt-4">
            <Link href={`/producto/${lead.slug}`} className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-white transition hover:bg-ink-3">Comprar</Link>
            <Link href="/productos?categoria=iphone&condicion=nuevo" className="rounded-full px-6 py-3 text-sm font-medium text-vita hover:underline">Ver todos los iPhone</Link>
          </div>
        </div>
        <div data-reveal className="relative mx-auto mt-14 aspect-[16/10] max-w-5xl overflow-hidden rounded-[44px] bg-mist md:mt-20">
          {lead.image && <Image src={lead.image} alt="iPhone 17 Pro Max Silver" fill sizes="(max-width: 1024px) 100vw, 1024px" className="object-cover" />}
        </div>
      </div>
    </section>
  );
}
