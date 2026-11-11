"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import type { Category, CategorySlug, Condition, Product, StockLevel, SubcategorySlug } from "@/types";
import { groupByModel } from "@/lib/catalog";
import { isOutOfStock, STOCK_LABEL } from "@/lib/format";
import { GENERAL_MESSAGE, waLink } from "@/lib/whatsapp";
import { CatalogCard } from "./CatalogCard";
import { CheckIcon, ChevronIcon, CloseIcon, FilterIcon, SearchIcon } from "./ui/Icons";

type Sort = "destacados" | "precio-asc" | "precio-desc" | "recientes";
type PriceBucket = "hasta-150" | "150-500" | "500-1000" | "mas-1000" | "consultar";

const PRICE_BUCKETS: { value: PriceBucket; label: string; test: (p: Product) => boolean }[] = [
  { value: "hasta-150", label: "Hasta USD 150", test: (p) => p.price != null && p.price <= 150 },
  { value: "150-500", label: "USD 150 a 500", test: (p) => p.price != null && p.price > 150 && p.price <= 500 },
  { value: "500-1000", label: "USD 500 a 1.000", test: (p) => p.price != null && p.price > 500 && p.price <= 1000 },
  { value: "mas-1000", label: "Más de USD 1.000", test: (p) => p.price != null && p.price > 1000 },
  { value: "consultar", label: "Precio a consultar", test: (p) => p.priceType === "consultar" },
];

const CONDITIONS: { value: Condition | null; label: string }[] = [
  { value: null, label: "Todos" },
  { value: "nuevo", label: "Nuevos" },
  { value: "semi-nuevo", label: "Semi nuevos" },
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

/** Pill de filtro (categoría): borde fino, activo en tinta sólida como el Apple Store. */
const PILL =
  "inline-flex h-9 shrink-0 snap-start items-center whitespace-nowrap rounded-full px-4 text-[13px] font-medium transition duration-300 ease-[var(--ease-soft)] motion-reduce:transition-none";
const PILL_ON = "bg-fg text-surface shadow-[0_1px_2px_rgba(0,0,0,0.12)]";
const PILL_OFF = "bg-surface text-fg/75 ring-1 ring-inset ring-fg/10 hover:text-fg hover:ring-fg/25";

export function ProductsExplorer({
  products,
  categories,
  initial,
  headingLevel = "h2",
}: {
  products: Product[];
  categories: Category[];
  initial: Partial<Filters> & { sort?: Sort; q?: string };
  /** h1 cuando el catálogo es lo primero de la página (sin la vitrina arriba). */
  headingLevel?: "h1" | "h2";
}) {
  const [f, setF] = useState<Filters>({ ...empty, ...initial });
  const [sort, setSort] = useState<Sort>(initial.sort ?? "destacados");
  const [drawer, setDrawer] = useState(false);
  const drawerTitle = useId();
  const openBtn = useRef<HTMLButtonElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  // Marcas de las categorías elegidas (más las ya tildadas): ver JBL con Mac elegido no ayuda.
  const brands = useMemo(
    () => [
      ...new Set([
        ...products.filter((p) => !f.categories.length || f.categories.includes(p.category)).map((p) => p.brand),
        ...f.brands,
      ]),
    ],
    [products, f.categories, f.brands],
  );
  // Solo las categorías que tienen algo cargado: un chip que lleva a cero resultados no sirve.
  const shownCategories = useMemo(
    () => categories.filter((c) => products.some((p) => p.category === c.slug)),
    [categories, products],
  );

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
    // Foco adentro al abrir y de vuelta al botón al cerrar.
    if (!drawer) {
      if (wasOpen.current) openBtn.current?.focus();
      wasOpen.current = false;
      return;
    }
    wasOpen.current = true;
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
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
  // Lo que se filtra desde el panel (categoría y condición ya se ven en la barra).
  const panelActive = f.subcategories.length + f.brands.length + f.prices.length + f.stock.length;
  const resultsLabel = `${groups.length} ${groups.length === 1 ? "modelo" : "modelos"}`;

  const accesorios = categories.find((c) => c.slug === "accesorios");
  const oneCategory = f.categories.length === 1 ? categories.find((c) => c.slug === f.categories[0]) : undefined;
  const oneCondition = f.conditions.length === 1 ? f.conditions[0] : undefined;

  /* Título vivo: sigue a los filtros (la URL cambia con replaceState, el server no re-renderiza). */
  const condWord = oneCondition === "nuevo" ? "nuevos" : oneCondition === "semi-nuevo" ? "semi nuevos" : "";
  const title = oneCategory
    ? `${oneCategory.name}${condWord ? ` ${condWord}` : ""}.`
    : oneCondition === "nuevo"
      ? "Nuevos."
      : oneCondition === "semi-nuevo"
        ? "Semi nuevos."
        : "Todos los productos.";
  const tail =
    oneCondition === "semi-nuevo"
      ? "Revisados uno por uno, con batería real."
      : oneCondition === "nuevo"
        ? "Sellados, con garantía oficial."
        : oneCategory
          ? `${oneCategory.tagline}.`
          : "Nuevos y semi nuevos, en un solo lugar.";
  const Heading = headingLevel;

  const setCategory = (slug: CategorySlug | null) => {
    if (slug == null) return setF({ ...f, categories: [], subcategories: [] });
    const next = f.categories.length === 1 && f.categories[0] === slug ? [] : [slug];
    setF({ ...f, categories: next, subcategories: next.includes("accesorios") ? f.subcategories : [] });
  };

  const chips: { key: string; label: string; remove: () => void }[] = [
    ...f.subcategories.map((v) => ({ key: `s-${v}`, label: accesorios?.subcategories?.find((s) => s.slug === v)?.name ?? v, remove: () => setF({ ...f, subcategories: toggle(f.subcategories, v) }) })),
    ...f.brands.map((v) => ({ key: `b-${v}`, label: v, remove: () => setF({ ...f, brands: toggle(f.brands, v) }) })),
    ...f.prices.map((v) => ({ key: `p-${v}`, label: PRICE_BUCKETS.find((b) => b.value === v)?.label ?? v, remove: () => setF({ ...f, prices: toggle(f.prices, v) }) })),
    ...f.stock.map((v) => ({ key: `k-${v}`, label: STOCK_LABEL[v], remove: () => setF({ ...f, stock: toggle(f.stock, v) }) })),
  ];

  const panel = (
    <div className="space-y-7">
      {f.categories.includes("accesorios") && accesorios?.subcategories?.length ? (
        <Group title="Tipo de accesorio">
          {accesorios.subcategories.map((s) => (
            <Check key={s.slug} label={s.name} checked={f.subcategories.includes(s.slug)} onChange={() => setF({ ...f, subcategories: toggle(f.subcategories, s.slug) })} />
          ))}
        </Group>
      ) : null}
      {brands.length > 1 || f.brands.length ? (
        <Group title="Marca">
          {brands.map((b) => (
            <Check key={b} label={b} checked={f.brands.includes(b)} onChange={() => setF({ ...f, brands: toggle(f.brands, b) })} />
          ))}
        </Group>
      ) : null}
      <Group title="Precio">
        {PRICE_BUCKETS.map((b) => (
          <Check key={b.value} label={b.label} checked={f.prices.includes(b.value)} onChange={() => setF({ ...f, prices: toggle(f.prices, b.value) })} />
        ))}
      </Group>
      <Group title="Disponibilidad">
        {(Object.keys(STOCK_LABEL) as StockLevel[]).map((s) => (
          <Check key={s} label={STOCK_LABEL[s]} checked={f.stock.includes(s)} onChange={() => setF({ ...f, stock: toggle(f.stock, s) })} />
        ))}
      </Group>
    </div>
  );

  return (
    <section aria-labelledby="catalogo-titulo" className="mx-auto max-w-7xl px-4 pb-24 md:px-8">
      <header className="pb-7 pt-10 md:pb-10 md:pt-16">
        <p className="text-[15px] font-semibold tracking-[-0.005em] text-vita md:text-[17px]">
          {oneCategory || oneCondition ? "Tienda" : "Catálogo completo"}
        </p>
        <Heading
          id="catalogo-titulo"
          className="mt-2 max-w-4xl text-[32px] md:text-[clamp(2.5rem,4.5vw,3.5rem)] font-bold leading-[1.03] tracking-[-0.035em]"
        >
          {title} <span className="text-fg/45">{tail}</span>
        </Heading>
      </header>

      {/* Barra de filtros: categorías + condición, pegada debajo de la isla de la navbar. */}
      <div className="sticky top-[3.75rem] z-30 -mx-4 bg-bg/85 px-4 pb-3 pt-3.5 backdrop-blur-xl backdrop-saturate-150 after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-4 after:bg-gradient-to-b after:from-bg/70 after:to-transparent md:-mx-8 md:px-8">
        <div className="relative -mx-4 md:mx-0">
          <nav
            aria-label="Categorías"
            className="no-scrollbar flex snap-x gap-2 overflow-x-auto scroll-px-4 px-4 py-1 [mask-image:linear-gradient(90deg,transparent,#000_16px,#000_calc(100%-24px),transparent)] md:scroll-px-0 md:px-0 md:[mask-image:linear-gradient(90deg,#000_calc(100%-32px),transparent)] lg:flex-wrap lg:[mask-image:none]"
          >
            <button type="button" aria-pressed={!f.categories.length} onClick={() => setCategory(null)} className={`${PILL} ${f.categories.length ? PILL_OFF : PILL_ON}`}>
              Todo
            </button>
            {shownCategories.map((c) => {
              const on = f.categories.includes(c.slug);
              return (
                <button key={c.slug} type="button" aria-pressed={on} onClick={() => setCategory(c.slug)} className={`${PILL} ${on ? PILL_ON : PILL_OFF}`}>
                  {c.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-2">
          <div role="group" aria-label="Condición" className="flex h-9 shrink-0 items-center rounded-full bg-fg/[0.06] p-[3px]">
            {CONDITIONS.map(({ value, label }) => {
              const on = value == null ? !f.conditions.length : f.conditions.length === 1 && f.conditions[0] === value;
              return (
                <button
                  key={label}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setF({ ...f, conditions: value ? [value] : [] })}
                  className={`h-full whitespace-nowrap rounded-full px-3 text-[13px] font-medium transition duration-300 ease-[var(--ease-soft)] motion-reduce:transition-none sm:px-4 ${
                    on ? "bg-surface text-fg shadow-[0_1px_3px_rgba(0,0,0,0.1),0_0_0_0.5px_rgba(0,0,0,0.04)]" : "text-fg/60 hover:text-fg"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="flex min-w-0 items-center gap-2">
            <div className="relative hidden sm:block">
              <label htmlFor="orden" className="sr-only">Ordenar</label>
              <select
                id="orden"
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="h-9 cursor-pointer appearance-none rounded-full bg-surface pl-4 pr-9 text-[13px] font-medium text-fg ring-1 ring-inset ring-fg/10 outline-none transition hover:ring-fg/25 focus-visible:ring-2 focus-visible:ring-accent"
              >
                <option value="destacados">Destacados</option>
                <option value="precio-asc">Precio: menor a mayor</option>
                <option value="precio-desc">Precio: mayor a menor</option>
                <option value="recientes">Más recientes</option>
              </select>
              <ChevronIcon className="pointer-events-none absolute right-3.5 top-1/2 size-3.5 -translate-y-1/2 rotate-90 text-fg/50" />
            </div>
            <button
              type="button"
              ref={openBtn}
              onClick={() => setDrawer(true)}
              aria-haspopup="dialog"
              className="flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-surface px-3.5 text-[13px] font-medium text-fg ring-1 ring-inset ring-fg/10 transition hover:ring-fg/25 lg:hidden"
            >
              <FilterIcon className="size-4 text-fg/70" />
              Filtros
              {panelActive ? (
                <span className="tabular grid size-[18px] place-items-center rounded-full bg-fg text-[10px] font-semibold text-surface">{panelActive}</span>
              ) : null}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-10 pt-5 lg:grid-cols-[208px_1fr] lg:gap-12 lg:pt-7">
        <aside aria-label="Más filtros" className="hidden lg:block">
          <div className="no-scrollbar sticky top-[12.25rem] max-h-[calc(100vh-13rem)] overflow-y-auto pb-6 pr-2">
            {panel}
            {panelActive > 0 && (
              <button type="button" onClick={() => setF({ ...f, subcategories: [], brands: [], prices: [], stock: [] })} className="mt-7 text-[13px] font-medium text-vita underline-offset-4 hover:underline">
                Limpiar filtros ({panelActive})
              </button>
            )}
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-4 flex min-h-8 flex-wrap items-center gap-x-3 gap-y-2 md:mb-5">
            <p aria-live="polite" className="tabular whitespace-nowrap text-[13px] font-medium text-fg/55">
              {resultsLabel}
            </p>
            {chips.length > 0 && <span aria-hidden="true" className="h-4 w-px bg-fg/15" />}
            {chips.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={c.remove}
                aria-label={`Quitar filtro ${c.label}`}
                className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-vita-soft pl-3 pr-2 text-xs font-medium text-vita ring-1 ring-inset ring-vita/20 transition hover:ring-vita/45"
              >
                {c.label} <CloseIcon className="size-3.5" />
              </button>
            ))}
            {active > 0 && (
              <button type="button" onClick={() => setF(empty)} className="h-8 shrink-0 px-1 text-xs font-medium text-fg/55 underline-offset-4 transition hover:text-fg hover:underline">
                Limpiar todo
              </button>
            )}
          </div>

          {groups.length ? (
            <div data-stagger className="grid grid-cols-2 gap-3 md:gap-4 lg:gap-5 xl:grid-cols-3">
              {groups.map((g) => (
                <CatalogCard key={`${g.model}-${g.variants.map((v) => v.slug).join()}`} variants={g.variants} />
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] bg-surface px-6 py-14 text-center ring-1 ring-fg/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.04)] md:px-12 md:py-20">
              <span aria-hidden="true" className="mx-auto grid size-14 place-items-center rounded-full bg-bg text-fg/45 ring-1 ring-fg/[0.06]">
                <SearchIcon className="size-6" />
              </span>
              <p className="mt-6 text-2xl font-semibold tracking-[-0.025em] text-fg md:text-[28px]">No encontramos productos con esos filtros.</p>
              <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-fg/60">
                Probá sacando alguno, o escribinos directo por WhatsApp y te decimos si tenemos el equipo que buscás en stock.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setF(empty)}
                  className="inline-flex h-12 items-center rounded-full bg-fg px-7 text-[15px] font-semibold text-surface transition-colors duration-300 hover:bg-fg/85"
                >
                  Ver todos los productos
                </button>
                <a
                  href={waLink(GENERAL_MESSAGE)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center gap-1 rounded-full px-5 text-[15px] font-medium text-vita underline-offset-4 hover:underline"
                >
                  Consultar por WhatsApp <span aria-hidden="true">›</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hoja de filtros en mobile */}
      <div className={`fixed inset-0 z-[60] transition-[visibility] duration-500 motion-reduce:duration-0 lg:hidden ${drawer ? "" : "pointer-events-none invisible"}`} aria-hidden={!drawer}>
        <div
          onClick={() => setDrawer(false)}
          className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 motion-reduce:transition-none ${drawer ? "opacity-100" : "opacity-0"}`}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={drawerTitle}
          className={`absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-[28px] bg-surface text-fg shadow-[0_-12px_40px_rgba(0,0,0,0.18)] transition-transform duration-500 ease-[var(--ease-sheet)] motion-reduce:transition-none ${drawer ? "translate-y-0" : "translate-y-full"}`}
        >
          <div className="px-5 pt-2.5">
            <div aria-hidden="true" className="mx-auto h-1 w-9 rounded-full bg-fg/15" />
            <div className="flex items-center justify-between py-3">
              <p id={drawerTitle} className="text-[19px] font-semibold tracking-[-0.02em]">Filtros</p>
              <button ref={closeBtn} type="button" onClick={() => setDrawer(false)} aria-label="Cerrar filtros" className="grid size-9 place-items-center rounded-full bg-fg/[0.06] text-fg/70 transition hover:bg-fg/10 hover:text-fg">
                <CloseIcon className="size-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain border-t border-fg/[0.08] px-5 py-6">
            <div className="mb-7 sm:hidden">
              <Group title="Ordenar por">
                {(
                  [
                    ["destacados", "Destacados"],
                    ["precio-asc", "Precio: menor a mayor"],
                    ["precio-desc", "Precio: mayor a menor"],
                    ["recientes", "Más recientes"],
                  ] as [Sort, string][]
                ).map(([v, l]) => (
                  <Check key={v} radio name="orden-mobile" label={l} checked={sort === v} onChange={() => setSort(v)} />
                ))}
              </Group>
            </div>
            {panel}
          </div>
          <div className="flex items-center gap-3 border-t border-fg/[0.08] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
            {panelActive > 0 && (
              <button type="button" onClick={() => setF({ ...f, subcategories: [], brands: [], prices: [], stock: [] })} className="h-12 shrink-0 px-2 text-sm font-medium text-fg/60 transition hover:text-fg">
                Limpiar
              </button>
            )}
            <button
              type="button"
              onClick={() => setDrawer(false)}
              className="h-12 flex-1 rounded-full bg-fg text-[15px] font-semibold text-surface transition-colors hover:bg-fg/85"
            >
              Ver {resultsLabel}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2.5 text-[13px] font-semibold tracking-[-0.005em] text-fg">{title}</legend>
      <div className="space-y-0.5">{children}</div>
    </fieldset>
  );
}

function Check({
  label,
  checked,
  onChange,
  radio,
  name,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  radio?: boolean;
  name?: string;
}) {
  return (
    <label className={`group flex cursor-pointer items-center gap-3 rounded-lg py-1.5 text-sm transition-colors ${checked ? "text-fg" : "text-fg/65 hover:text-fg"}`}>
      <span className="relative grid size-[18px] shrink-0 place-items-center">
        <input
          type={radio ? "radio" : "checkbox"}
          name={name}
          checked={checked}
          onChange={onChange}
          className={`peer absolute inset-0 m-0 cursor-pointer appearance-none bg-surface ring-1 ring-inset ring-fg/20 transition duration-200 checked:bg-fg checked:ring-fg group-hover:ring-fg/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none ${radio ? "rounded-full" : "rounded-[5px]"}`}
        />
        <CheckIcon className="pointer-events-none relative size-3 text-surface opacity-0 transition-opacity peer-checked:opacity-100" />
      </span>
      {label}
    </label>
  );
}
