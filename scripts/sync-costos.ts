/**
 * Copia los precios de la lista del proveedor (Store Sur) al costo de cada producto.
 *
 *   npx tsx scripts/sync-costos.ts            -> simulacro: muestra qué cambiaría
 *   npx tsx scripts/sync-costos.ts --apply    -> escribe en Supabase
 *
 * Variables (.env.local o secretos de GitHub): SUPPLIER_EMAIL, SUPPLIER_PASSWORD,
 * NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
 * El cruce proveedor -> producto vive en data/supplier-map.json ("nombre del proveedor": "slug").
 * Necesita `playwright` (en CI se instala con npm i --no-save playwright).
 */
import { createClient } from "@supabase/supabase-js";
import { chromium, type Page } from "playwright";
import * as fs from "fs";
import * as path from "path";
import { slugify } from "../lib/slug";

const STOCK_URL = "https://www.storesurdistribuidora.com.ar/stock";
const MIN_ROWS = 30; // ponytail: si el scraping trae menos, algo se rompió: no tocar nada
const MAX_JUMP = 0.3; // cambios de costo mayores a 30% se frenan para revisión manual
const apply = process.argv.includes("--apply");

for (const file of [".env.local"]) {
  const p = path.resolve(process.cwd(), file);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf-8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\r\n]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

function need(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Falta la variable ${name}`);
  return v;
}

interface SupplierRow {
  name: string;
  category: string;
  stock: string;
  price: number | null; // null = "Consultar"
}

/** "USD 1.555" -> 1555 ; "Consultar" -> null */
function parsePrice(text: string): number | null {
  const m = text.match(/USD\s*([\d.,]+)/i);
  if (!m) return null;
  const n = Number(m[1].replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

// Categoría del proveedor -> categoría de la tienda. Lo que no está acá no se crea solo.
const CATEGORY_MAP: Record<string, { category: string; brand?: string }> = {
  "Equipos Nuevos Iphone": { category: "iphone" },
  "Equipos Nuevos Macbooks": { category: "mac" },
  "Equipos Nuevos Ipads": { category: "ipad" },
  "Equipos Nuevos Iwatch": { category: "apple-watch" },
  "Equipos Nuevos Acceosorios": { category: "accesorios" },
  Casio: { category: "wearables", brand: "Casio" },
  Consolas: { category: "gaming", brand: "Sony" },
  Joystick: { category: "gaming", brand: "Sony" },
};

/** Producto nuevo OCULTO con el costo del proveedor: el dueño solo le pone precio y lo activa. */
function newProductRow(r: SupplierRow) {
  const map = CATEGORY_MAP[r.category];
  const clean = r.name.replace(/\.$/, "").trim();
  const isCasio = map.category === "wearables";
  const isIphone = map.category === "iphone" && /^\d/.test(clean);
  const name = isCasio
    ? `Casio ${clean}`
    : isIphone
      ? `iPhone ${clean}`
      : clean;
  const level = r.stock.toLowerCase();
  return {
    slug: slugify(name),
    name,
    model: slugify(name),
    brand: map.brand ?? "Apple",
    category: /airpods/i.test(clean) ? "airpods" : map.category,
    condition: "nuevo",
    price: null,
    stock_level: ["alto", "medio", "bajo"].includes(level) ? level : "medio",
    active: false,
    specifications: { _cost_usd: String(r.price), _supplier_name: r.name },
  };
}

async function login(page: Page) {
  const password = page.locator('input[type="password"]');
  if (!(await password.isVisible({ timeout: 8000 }).catch(() => false))) return;
  await page
    .locator('input[type="email"], input[name*="mail" i], input[type="text"]')
    .first()
    .fill(need("SUPPLIER_EMAIL"));
  await password.fill(need("SUPPLIER_PASSWORD"));
  await page.getByRole("button", { name: /log ?in/i }).click();
}

async function scrape(): Promise<SupplierRow[]> {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    await page.goto(STOCK_URL, { waitUntil: "networkidle" });
    await login(page);
    await page.waitForSelector("tr.mat-mdc-row", { timeout: 30000 });

    const rows = new Map<string, SupplierRow>();
    for (let guard = 0; guard < 50; guard++) {
      const batch = await page.$$eval("tr.mat-mdc-row", (trs) =>
        trs.map((tr) => ({
          name:
            tr.querySelector(".cdk-column-productName")?.textContent?.trim() ??
            "",
          stock:
            tr
              .querySelector(".cdk-column-productBalance")
              ?.textContent?.trim() ?? "",
          category:
            tr
              .querySelector(".cdk-column-productCategory")
              ?.textContent?.trim() ?? "",
          price:
            tr.querySelector(".cdk-column-price")?.textContent?.trim() ?? "",
        })),
      );
      for (const r of batch)
        if (r.name)
          rows.set(r.name, {
            name: r.name,
            category: r.category,
            stock: r.stock,
            price: parsePrice(r.price),
          });
      const next = page.locator("button.mat-mdc-paginator-navigation-next");
      if (await next.isDisabled()) break;
      await next.click();
      await page.waitForTimeout(500);
    }
    return [...rows.values()];
  } catch (e) {
    await page
      .screenshot({ path: "sync-costos-error.png", fullPage: true })
      .catch(() => {});
    throw e;
  } finally {
    await browser.close();
  }
}

async function main() {
  const rows = await scrape();
  console.log(`Proveedor: ${rows.length} productos leídos`);
  if (rows.length < MIN_ROWS)
    throw new Error(
      `Solo ${rows.length} filas (mínimo ${MIN_ROWS}): no se toca nada`,
    );

  const map: Record<string, string> = JSON.parse(
    fs.readFileSync(
      path.resolve(process.cwd(), "data/supplier-map.json"),
      "utf-8",
    ),
  );
  const supabase = createClient(
    need("NEXT_PUBLIC_SUPABASE_URL"),
    need("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: { persistSession: false },
    },
  );
  const { data: products, error } = await supabase
    .from("products")
    .select("slug, name, storage, color, specifications");
  if (error) throw error;
  const bySlug = new Map(
    (products ?? []).map((p) => [
      p.slug as string,
      p.specifications as Record<string, string> | null,
    ]),
  );

  const bySupplierName = new Map(
    (products ?? [])
      .filter((p) => p.specifications?._supplier_name)
      .map((p) => [
        p.specifications._supplier_name as string,
        p.slug as string,
      ]),
  );
  const slugOf = (name: string) => map[name] ?? bySupplierName.get(name);
  const unmapped = rows.filter((r) => !slugOf(r.name));
  const report = {
    updated: 0,
    same: 0,
    consultar: 0,
    jumps: [] as string[],
    missing: [] as string[],
  };

  for (const r of rows) {
    const slug = slugOf(r.name);
    if (!slug) continue;
    if (r.price == null) {
      report.consultar++;
      continue;
    }
    const specs = bySlug.get(slug);
    if (specs === undefined) {
      report.missing.push(`${r.name} -> ${slug}`);
      continue;
    }
    const old = Number(specs?._cost_usd);
    if (old === r.price) {
      report.same++;
      continue;
    }
    if (old > 0 && Math.abs(r.price - old) / old > MAX_JUMP) {
      report.jumps.push(`${r.name}: ${old} -> ${r.price}`);
      continue;
    }
    console.log(
      `${apply ? "ACTUALIZA" : "CAMBIARÍA"} ${slug}: ${Number.isFinite(old) ? old : "-"} -> ${r.price}`,
    );
    if (apply) {
      const { error: upErr } = await supabase
        .from("products")
        .update({
          specifications: { ...(specs ?? {}), _cost_usd: String(r.price) },
        })
        .eq("slug", slug);
      if (upErr) throw upErr;
    }
    report.updated++;
  }

  const toCreate = unmapped.filter(
    (r) => r.price != null && r.category in CATEGORY_MAP,
  );
  for (const r of toCreate) {
    const row = newProductRow(r);
    console.log(
      `${apply ? "CREA" : "CREARÍA"} (oculto) ${row.slug}: costo ${r.price}`,
    );
    if (apply) {
      const { error: insErr } = await supabase.from("products").insert(row);
      if (insErr) throw insErr;
    }
  }

  console.log(
    `\nActualizados: ${report.updated} | Sin cambio: ${report.same} | "Consultar": ${report.consultar} | Creados ocultos: ${toCreate.length}`,
  );
  if (report.jumps.length)
    console.log(
      `\nREVISAR (cambio > ${MAX_JUMP * 100}%, no se aplicó):\n  ${report.jumps.join("\n  ")}`,
    );
  if (report.missing.length)
    console.log(
      `\nEl mapa apunta a productos que no existen:\n  ${report.missing.join("\n  ")}`,
    );
  if (unmapped.length) {
    console.log(
      `\nSin mapear (${unmapped.length}):\n  ${unmapped.map((r) => r.name).join("\n  ")}`,
    );
    console.log(
      "\nProductos de la tienda (para armar data/supplier-map.json):",
    );
    for (const p of products ?? [])
      console.log(
        `  ${p.slug} | ${p.name} ${p.storage ?? ""} ${p.color ?? ""}`,
      );
  }
  if (report.jumps.length || report.missing.length) process.exitCode = 1; // dispara el mail de GitHub
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
