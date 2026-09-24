const BRANDS = ["Apple", "JBL", "DJI", "Anker", "Casio", "PlayStation"];

/** Marcas en texto, sin logos: sobrio y liviano. */
export function Brands() {
  return (
    <section className="border-y border-line bg-paper py-14">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 md:flex-row md:justify-between md:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Marcas que trabajamos</p>
        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 md:gap-x-14">
          {BRANDS.map((b) => (
            <li key={b} className="text-xl font-semibold tracking-[-0.03em] text-ink/35 transition hover:text-ink md:text-2xl">{b}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
