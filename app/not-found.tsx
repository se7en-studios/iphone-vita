import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto grid min-h-[60vh] max-w-3xl place-items-center px-4 py-24 text-center">
      <div className="space-y-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Error 404</p>
        <h1 className="text-5xl font-semibold tracking-[-0.045em]">Esta página no existe.</h1>
        <p className="text-muted">Puede que el producto ya no esté disponible.</p>
        <Link href="/productos" className="inline-block rounded-full bg-ink px-6 py-3 text-sm font-medium text-white">Ver productos</Link>
      </div>
    </section>
  );
}
