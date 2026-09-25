import type { Metadata } from "next";
import { getCategories, getProducts } from "@/lib/products";
import { ProductsExplorer } from "@/components/ProductsExplorer";

export const metadata: Metadata = {
  title: "Productos",
  description: "iPhone nuevos y semi nuevos, Mac, iPad, Apple Watch, AirPods, accesorios, audio, gaming y más.",
};

type SP = Record<string, string | string[] | undefined>;
const arr = (v: string | string[] | undefined) => (v == null ? [] : Array.isArray(v) ? v : [v]);

export default async function ProductosPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  const initial = {
    categories: arr(sp.categoria) as never[],
    subcategories: arr(sp.sub) as never[],
    brands: arr(sp.marca),
    prices: arr(sp.precio) as never[],
    stock: arr(sp.stock) as never[],
    conditions: arr(sp.condicion) as never[],
    sort: (typeof sp.orden === "string" ? sp.orden : undefined) as never,
  };

  return (
    <div className="bg-[#050b18] text-white min-h-screen">
      <section className="mx-auto max-w-7xl px-4 pb-10 pt-16 md:px-8 md:pt-24">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#ebd7be]">Catálogo Completo</p>
        <h1 className="mt-3 text-[clamp(2.6rem,6vw,4.8rem)] font-bold leading-[0.95] tracking-tight">
          Todos los <span className="font-serif-luxury text-[#ebd7be]">productos.</span>
        </h1>
      </section>
      <ProductsExplorer key={JSON.stringify(initial)} products={products} categories={categories} initial={initial} />
    </div>
  );
}
