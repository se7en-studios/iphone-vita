import Link from "next/link";
import type { Product } from "@/types";
import { ProductCard } from "../ProductCard";
import { SectionHead } from "../ui/SectionHead";

export function Accessories({ items }: { items: Product[] }) {
  return (
    <section className="bg-paper py-24 md:py-32">
      <div className="mx-auto max-w-7xl space-y-12 px-4 md:px-8">
        <SectionHead
          eyebrow="Accesorios"
          title="Completá tu setup."
          lede="AirPods, Apple Pencil, AirTag, cables y cargadores originales."
          action={<Link href="/productos?categoria=accesorios" className="text-sm font-medium text-vita hover:underline">Ver todos los accesorios →</Link>}
        />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {items.map((p) => (
            <div key={p.slug} data-reveal>
              <ProductCard product={p} compact />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
