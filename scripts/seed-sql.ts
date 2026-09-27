/*
 * Genera supabase/seed.sql a partir de data/products.ts (el catálogo actual).
 * Uso: npx tsx scripts/seed-sql.ts
 * Re-ejecutable: los slugs que ya existen se saltean, nunca pisa lo que el dueño editó.
 */
import { writeFileSync } from "node:fs";
import { products } from "../data/products";
import { inputToRow } from "../lib/product-row";

const lit = (v: unknown): string => {
  if (v == null) return "null";
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return `array[${v.map(lit).join(",")}]::text[]`;
  if (typeof v === "object") return `${lit(JSON.stringify(v))}::jsonb`;
  return `'${String(v).replace(/'/g, "''")}'`;
};

const rows = products.map((p, i) => {
  const row = { ...inputToRow({ ...p, sortOrder: (i + 1) * 10 }), created_at: p.createdAt };
  return row;
});
const cols = Object.keys(rows[0]);
const values = rows.map((r) => `(${cols.map((c) => lit(r[c as keyof typeof r])).join(", ")})`);
const sql = `-- Generado por scripts/seed-sql.ts — ${products.length} productos.
-- Correr después de schema.sql. Re-ejecutable: saltea slugs existentes, no pisa ediciones.
insert into public.products (${cols.join(", ")}) values
${values.join(",\n")}
on conflict (slug) do nothing;
`;
writeFileSync("supabase/seed.sql", sql);
console.log(`supabase/seed.sql: ${products.length} productos`);
