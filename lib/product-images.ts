import type { Product } from "@/types";

const norm = (s?: string) => (s ?? "").trim().toLowerCase();

function rgb(hex?: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec((hex ?? "").trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function colorDistance(a?: string, b?: string): number {
  const x = rgb(a);
  const y = rgb(b);
  if (!x || !y) return Number.POSITIVE_INFINITY;
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
}

/**
 * Productos sin foto (cargados desde el admin o la sincronización del proveedor) toman la
 * mejor foto disponible: otra variante del mismo modelo y color, otra del mismo modelo, o la
 * del catálogo de la misma categoría con el color más parecido.
 */
export function fillMissingImages(list: Product[], references: Product[]): Product[] {
  if (list.every((p) => p.image)) return list;
  const pool = [...list, ...references].filter((p) => p.image);

  const pick = (p: Product): string | null => {
    const sameModel = pool.filter((r) => r.model === p.model);
    const sameColor = sameModel.find((r) => norm(r.color) && norm(r.color) === norm(p.color));
    if (sameColor) return sameColor.image;
    if (sameModel.length) return sameModel[0].image;

    const sameCategory = pool.filter(
      (r) => r.category === p.category && (r.subcategory ?? null) === (p.subcategory ?? null),
    );
    const candidates = sameCategory.length ? sameCategory : pool.filter((r) => r.category === p.category);
    if (!candidates.length) return null;
    const byColor = [...candidates].sort(
      (a, b) => colorDistance(a.colorHex, p.colorHex) - colorDistance(b.colorHex, p.colorHex),
    );
    return byColor[0].image;
  };

  return list.map((p) => (p.image ? p : { ...p, image: pick(p) }));
}
