import Link from "next/link";
import type { Category } from "@/types";
import { CategoryGlyph } from "../ui/Icons";

const hrefFor = (slug: string) => `/productos?categoria=${slug}`;

export function CategoryStrip({ categories }: { categories: Category[] }) {
  const tiles = [...categories.slice(0, 6), { slug: "semi-nuevos" as const, name: "Semi Nuevos", tagline: "Revisados, con batería informada" }, ...categories.slice(6)];
  return (
    <section className="border-y border-line bg-mist py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div data-reveal className="mb-8 flex items-end justify-between gap-4">
          <h2 className="text-3xl font-semibold tracking-[-0.03em] md:text-4xl">Comprar por categoría</h2>
          <Link href="/productos" className="hidden text-sm font-medium text-vita hover:underline sm:block">Ver todo</Link>
        </div>
        <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 py-2 md:-mx-8 md:px-8">
          {tiles.map((c) => (
            <Link
              key={c.slug}
              href={c.slug === "semi-nuevos" ? "/productos?condicion=semi-nuevo" : hrefFor(c.slug)}
              className="group flex w-40 shrink-0 snap-start flex-col gap-4 rounded-3xl bg-paper p-5 transition hover:-translate-y-1 hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.3)] md:w-48"
            >
              <span className="block size-12 text-ink/70 transition group-hover:text-vita">
                <CategoryGlyph category={c.slug === "semi-nuevos" ? "iphone" : c.slug} />
              </span>
              <span>
                <span className="block text-[15px] font-semibold tracking-tight">{c.name}</span>
                <span className="block text-xs text-muted">{c.tagline}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
