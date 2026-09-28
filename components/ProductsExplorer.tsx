"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { Category, CategorySlug, Condition, Product, StockLevel, SubcategorySlug } from "@/types";
import { groupByModel } from "@/lib/catalog";
import { isOutOfStock, STOCK_LABEL } from "@/lib/format";
import { GENERAL_MESSAGE, waLink } from "@/lib/whatsapp";
import { CatalogCard } from "./CatalogCard";
import { CloseIcon, FilterIcon } from "./ui/Icons";

type Sort = "destacados" | "precio-asc" | "precio-desc" | "recientes";
type PriceBucket = "hasta-150" | "150-500" | "500-1000" | "mas-1000" | "consultar";

const PRICE_BUCKETS: { value: PriceBucket; label: string; test: (p: Product) => boolean }[] = [
  { value: "hasta-150", label: "Hasta USD 150", test: (p) => p.price != null && p.price <= 150 },
  { value: "150-500", label: "USD 150 a 500", test: (p) => p.price != null && p.price > 150 && p.price <= 500 },
  { value: "500-1000", label: "USD 500 a 1.000", test: (p) => p.price != null && p.price > 500 && p.price <= 1000 },
  { value: "mas-1000", label: "Más de USD 1.000", test: (p) => p.price != null && p.price > 1000 },
  { value: "consultar", label: "Precio a consultar", test: (p) => p.priceType === "consultar" },
];

interface Filters {
  categories: CategorySlug[];
  subcategories: SubcategorySlug[];
  brands: string[];
  prices: PriceBucket[];
  stock: StockLevel[];
  conditions: Condition[];
}

const empty: Filters = { categories: [], subcategories: [], brands: [], prices: [], stock: [], conditions: [] };

function toggle<T>(list: T[], v: T): T[] {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

export function ProductsExplorer({ products, categories, initial }: { products: Product[]; categories: Category[]; initial: Partial<Filters> & { sort?: Sort; q?: string } }) {
  const [f, setF] = useState<Filters>({ ...empty, ...initial });
  const [sort, setSort] = useState<Sort>(initial.sort ?? "destacados");
  const [drawer, setDrawer] = useState(false);

  const brands = useMemo(() => [...new Set(products.map((p) => p.brand))], [products]);

  // Mantener la URL compartible
  useEffect(() => {
    const sp = new URLSearchParams();
    f.categories.forEach((c) => sp.append("categoria", c));
    f.subcategories.forEach((c) => sp.append("sub", c));
    f.brands.forEach((c) => sp.append("marca", c));
    f.prices.forEach((c) => sp.append("precio", c));
    f.stock.forEach((c) => sp.append("stock", c));
    f.conditions.forEach((c) => sp.append("condicion", c));
    if (sort !== "destacados") sp.set("orden", sort);
    const qs = sp.toString();
    window.history.replaceState(null, "", qs ? `/productos?${qs}` : "/productos");
  }, [f, sort]);

  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
  }, [drawer]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (f.categories.length && !f.categories.includes(p.category)) return false;
      if (f.subcategories.length && (!p.subcategory || !f.subcategories.includes(p.subcategory))) return false;
      if (f.brands.length && !f.brands.includes(p.brand)) return false;
      if (f.prices.length && !PRICE_BUCKETS.filter((b) => f.prices.includes(b.value)).some((b) => b.test(p))) return false;
      if (f.stock.length && (isOutOfStock(p) || !f.stock.includes(p.stockLevel))) return false;
      if (f.conditions.length && !f.conditions.includes(p.condition)) return false;
      return true;
    });
    const priceOr = (p: Product, fallback: number) => p.price ?? fallback;
    if (sort === "precio-asc") list = [...list].sort((a, b) => priceOr(a, Infinity) - priceOr(b, Infinity));
    if (sort === "precio-desc") list = [...list].sort((a, b) => priceOr(b, -Infinity) - priceOr(a, -Infinity));
    if (sort === "recientes") list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (sort === "destacados") list = [...list].sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
    // Sin stock siempre al final (sort estable: respeta el orden elegido dentro de cada bloque).
    return [...list].sort((a, b) => Number(isOutOfStock(a)) - Number(isOutOfStock(b)));
  }, [products, f, sort]);

  // Los semi nuevos son unidades únicas: cada uno va en su propia card.
  const groups = useMemo(() => groupByModel(filtered.map((p) => (p.condition === "semi-nuevo" ? { ...p, model: p.slug } : p))), [filtered]);
  const active = Object.values(f).reduce((s, v) => s + v.length, 0);
  const resultsLabel = `${groups.length} ${groups.length === 1 ? "resultado" : "resultados"}`;

  const accesorios = categories.find((c) => c.slug === "accesorios");

  const chips: { key: string; label: string; remove: () => void }[] = [
    ...f.categories.map((v) => ({ key: `c-${v}`, label: categories.find((c) => c.slug === v)?.name ?? v, remove: () => setF({ ...f, categories: toggle(f.categories, v) }) })),
    ...f.subcategories.map((v) => ({ key: `s-${v}`, label: accesorios?.subcategories?.find((s) => s.slug === v)?.name ?? v, remove: () => setF({ ...f, subcategories: toggle(f.subcategories, v) }) })),
    ...f.conditions.map((v) => ({ key: `n-${v}`, label: v === "nuevo" ? "Nuevo" : "Semi nuevo", remove: () => setF({ ...f, conditions: toggle(f.conditions, v) }) })),
    ...f.brands.map((v) => ({ key: `b-${v}`, label: v, remove: () => setF({ ...f, brands: toggle(f.brands, v) }) })),
    ...f.prices.map((v) => ({ key: `p-${v}`, label: PRICE_BUCKETS.find((b) => b.value === v)?.label ?? v, remove: () => setF({ ...f, prices: toggle(f.prices, v) }) })),
    ...f.stock.map((v) => ({ key: `k-${v}`, label: STOCK_LABEL[v], remove: () => setF({ ...f, stock: toggle(f.stock, v) }) })),
  ];

  const panel = (
    <div className="space-y-8">
      <Group title="Categoría">
        {categories.map((c) => (
          <div key={c.slug}>
            <Check label={c.name} checked={f.categories.includes(c.slug)} onChange={() => setF({ ...f, categories: toggle(f.categories, c.slug) })} />
            {c.slug === "accesorios" && f.categories.includes("accesorios") && (
              <div className="ml-6 mt-1 space-y-1">
                {accesorios?.subcategories?.map((s) => (
                  <Check key={s.slug} small label={s.name} checked={f.subcategories.includes(s.slug)} onChange={() => setF({ ...f, subcategories: toggle(f.subcategories, s.slug) })} />
                ))}
              </div>
            )}
          </div>
        ))}
      </Group>
      <Group title="Condición">
        <Check label="Nuevo" checked={f.conditions.includes("nuevo")} onChange={() => setF({ ...f, conditions: toggle(f.conditions, "nuevo") })} />
        <Check label="Semi nuevo" checked={f.conditions.includes("semi-nuevo")} onChange={() => setF({ ...f, conditions: toggle(f.conditions, "semi-nuevo") })} />
      </Group>
      <Group title="Marca">
        {brands.map((b) => (
          <Check key={b} label={b} checked={f.brands.includes(b)} onChange={() => setF({ ...f, brands: toggle(f.brands, b) })} />
        ))}
      </Group>
      <Group title="Precio">
        {PRICE_BUCKETS.map((b) => (
          <Check key={b.value} label={b.label} checked={f.prices.includes(b.value)} onChange={() => setF({ ...f, prices: toggle(f.prices, b.value) })} />
        ))}
      </Group>
      <Group title="Stock">
        {(Object.keys(STOCK_LABEL) as StockLevel[]).map((s) => (
          <Check key={s} label={STOCK_LABEL[s]} checked={f.stock.includes(s)} onChange={() => setF({ ...f, stock: toggle(f.stock, s) })} />
        ))}
      </Group>
      {active > 0 && (
        <button type="button" onClick={() => setF(empty)} className="text-sm text-vita underline-offset-4 hover:underline">Limpiar filtros ({active})</button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 md:px-8">
      <div className="sticky top-14 z-30 -mx-4 border-b border-fg/10 bg-bg/80 px-4 py-3.5 backdrop-blur-xl md:-mx-8 md:px-8 transition-colors">
        <div className="flex items-center justify-between gap-3">
          <p className="tabular whitespace-nowrap text-sm text-fg/60 font-medium">{resultsLabel}</p>
          <div className="flex items-center gap-2">
            <label htmlFor="orden" className="sr-only">Ordenar</label>
            <select
              id="orden"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="min-w-0 rounded-full border border-fg/15 bg-surface px-3.5 py-2 text-xs font-semibold text-fg outline-none focus:border-vita transition-colors sm:px-4"
            >
              <option value="destacados">Destacados</option>
              <option value="precio-asc">Precio menor</option>
              <option value="precio-desc">Precio mayor</option>
              <option value="recientes">Más recientes</option>
            </select>
            <button
              type="button"
              onClick={() => setDrawer(true)}
              className="flex items-center gap-2 whitespace-nowrap rounded-full border border-fg/15 bg-fg/5 px-4 py-2 text-xs font-semibold text-fg transition hover:border-vita/40 hover:bg-fg/10 lg:hidden"
            >
              <FilterIcon /> Filtros{active ? <span className="grid size-5 place-items-center rounded-full bg-accent text-[11px] font-bold text-accent-fg">{active}</span> : null}
            </button>
          </div>
        </div>
        {chips.length > 0 && (
          <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
            {chips.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={c.remove}
                aria-label={`Quitar filtro ${c.label}`}
                className="flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-vita/30 bg-vita/10 pl-3 pr-2 text-xs font-medium text-vita transition hover:bg-vita/20 hover:border-vita/50"
              >
                {c.label} <CloseIcon className="size-3.5 text-vita" />
              </button>
            ))}
            <button
              type="button"
              onClick={() => setF(empty)}
              className="h-8 shrink-0 px-2 text-xs font-semibold text-vita hover:underline"
            >
              Limpiar todos
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-10 pt-8 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-32 max-h-[calc(100vh-9rem)] overflow-y-auto pr-2">{panel}</div>
        </aside>
        <div>
          {groups.length ? (
            <div data-stagger className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-3">
              {groups.map((g) => (
                <CatalogCard key={`${g.model}-${g.variants.map((v) => v.slug).join()}`} variants={g.variants} />
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] bg-surface p-8 text-center ring-1 ring-fg/10 md:p-12 shadow-xl">
              <p className="text-xl font-bold text-fg">No encontramos productos con esos filtros.</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-fg/60">
                Probá sacando alguno, o escribinos directo por WhatsApp y te decimos si tenemos el equipo que buscás en stock.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setF(empty)}
                  className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-accent-fg transition-all hover:brightness-110"
                >
                  Ver todos los productos
                </button>
                <a
                  href={waLink(GENERAL_MESSAGE)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-fg/20 bg-fg/5 px-6 py-3 text-sm font-semibold text-fg transition hover:border-vita/40 hover:bg-fg/10"
                >
                  Consultar por WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Drawer de filtros en mobile */}
      <div className={`fixed inset-0 z-[60] lg:hidden ${drawer ? "" : "pointer-events-none"}`} aria-hidden={!drawer}>
        <div onClick={() => setDrawer(false)} className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity ${drawer ? "opacity-100" : "opacity-0"}`} />
        <div className={`absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-[32px] border-t border-fg/15 bg-surface px-6 pb-8 pt-4 text-fg shadow-2xl transition-transform duration-500 ease-[var(--ease-soft)] ${drawer ? "translate-y-0" : "translate-y-full"}`}>
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-fg/20" />
          <div className="mb-6 flex items-center justify-between">
            <p className="text-lg font-bold">Filtros</p>
            <button type="button" onClick={() => setDrawer(false)} aria-label="Cerrar filtros" className="grid size-9 place-items-center rounded-full text-fg/70 hover:bg-fg/10 hover:text-fg transition"><CloseIcon /></button>
          </div>
          {panel}
          <button
            type="button"
            onClick={() => setDrawer(false)}
            className="mt-8 w-full rounded-full bg-accent py-4 text-sm font-bold text-accent-fg transition hover:brightness-110"
          >
            Ver {resultsLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3 text-xs font-bold uppercase tracking-wider text-vita">{title}</legend>
      <div className="space-y-1.5">{children}</div>
    </fieldset>
  );
}

function Check({ label, checked, onChange, small }: { label: string; checked: boolean; onChange: () => void; small?: boolean }) {
  return (
    <label className={`flex cursor-pointer items-center gap-3 rounded-lg py-1 transition-colors hover:text-fg ${checked ? "text-fg font-medium" : "text-fg/60"} ${small ? "text-xs" : "text-sm"}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="size-4 rounded border-fg/20 bg-fg/5 accent-vita cursor-pointer"
      />
      {label}
    </label>
  );
}
