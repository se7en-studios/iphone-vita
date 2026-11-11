import Link from "next/link";
import type { Product } from "@/types";
import { formatUSD } from "@/lib/format";
import { ProductVisual } from "../ProductVisual";
import { CompareMobile } from "./CompareMobile";

// Specs oficiales de apple.com/la (iPhone 18 Pro specs, familia iPhone 17 Pro).
const SPECS: Record<string, Record<string, string>> = {
  "iphone-17-pro": {
    Pantalla: "6.3” Super Retina XDR con ProMotion",
    Chip: "A19 Pro",
    "Cámara principal": "Fusion de 48 MP",
    Zoom: "Hasta 8x con calidad óptica",
    Batería: "Hasta 31 h de video",
    Diseño: "Aluminio forjado",
  },
  "iphone-17-pro-max": {
    Pantalla: "6.9” Super Retina XDR con ProMotion",
    Chip: "A19 Pro",
    "Cámara principal": "Fusion de 48 MP",
    Zoom: "Hasta 8x con calidad óptica",
    Batería: "Hasta 37 h de video",
    Diseño: "Aluminio forjado",
  },
  "iphone-18-pro": {
    Pantalla: "6.3” Super Retina XDR con ProMotion",
    Chip: "A20 Pro",
    "Cámara principal": "Fusion de 48 MP con apertura variable",
    Zoom: "Hasta 8x con calidad óptica",
    Batería: "Hasta 34 h de video",
    Diseño: "Aluminio unibody",
  },
};
const ROWS = [
  "Pantalla",
  "Chip",
  "Cámara principal",
  "Zoom",
  "Batería",
  "Diseño",
];

/** Modelos con specs cargadas: la home solo compara los que siguen en el catálogo. */
export const COMPARABLE_MODELS = Object.keys(SPECS);

/**
 * Escenario de las miniaturas del comparador: gris claro en vez del blanco del escenario común,
 * para que los equipos plateados no se pierdan sobre la sección blanca.
 */
const COMPARE_THUMB =
  "aspect-[4/5] w-full rounded-[22px] bg-none! bg-bg! ring-1 ring-fg/[0.05] ring-inset";

/** True si el valor de esa fila cambia entre los modelos: lo distinto se lee más fuerte. */
function rowDiffers(
  models: Product[],
  specs: Record<string, Record<string, string>>,
  row: string,
) {
  return new Set(models.map((m) => specs[m.model]?.[row] ?? "—")).size > 1;
}

/** Comparador minimalista, como el de apple.com. Con menos de 2 modelos no se muestra. */
export function CompareSection({ models }: { models: Product[] }) {
  if (models.length < 2) return null;
  return (
    <section
      id="comparar"
      className="scroll-mt-28 border-t border-fg/10 bg-surface py-20 text-fg md:py-32"
    >
      <div
        data-reveal
        className="mx-auto max-w-[980px] px-4 text-center md:px-8"
      >
        <p className="text-[15px] font-semibold tracking-[-0.005em] text-vita md:text-[17px]">
          Comparar
        </p>
        <h2 className="mt-2 text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[1.04] tracking-[-0.035em]">
          ¿Cuál es para vos?
        </h2>
      </div>

      <div className="mt-10 md:hidden">
        <CompareMobile models={models} specs={SPECS} rows={ROWS} />
      </div>

      <div
        data-reveal
        className="no-scrollbar mt-16 hidden overflow-x-auto px-8 md:block"
      >
        <table className="mx-auto w-full min-w-[760px] max-w-5xl table-fixed border-collapse text-center">
          <caption className="sr-only">
            Comparación de {models.map((m) => m.name).join(", ")}
          </caption>
          <thead>
            <tr>
              <th scope="col" className="w-36 lg:w-44">
                <span className="sr-only">Característica</span>
              </th>
              {models.map((m) => (
                <th
                  key={m.model}
                  scope="col"
                  className="px-3 pb-12 align-bottom font-normal lg:px-5"
                >
                  <Link
                    href={`/producto/${m.slug}`}
                    tabIndex={-1}
                    aria-hidden="true"
                    className="group mx-auto block max-w-[220px]"
                  >
                    <ProductVisual
                      product={m}
                      className={COMPARE_THUMB}
                      sizes="220px"
                    />
                  </Link>
                  <p className="mt-6 text-[22px] font-semibold leading-tight tracking-[-0.02em]">
                    {m.name}
                  </p>
                  {m.price != null && (
                    <p className="tabular mt-1.5 text-[15px] text-fg/55">
                      Desde {formatUSD(m.price)}
                    </p>
                  )}
                  <Link
                    href={`/producto/${m.slug}`}
                    aria-label={`Comprar ${m.name}`}
                    className="mt-5 inline-flex h-10 items-center rounded-full bg-champagne px-5 text-sm font-semibold text-black transition-colors duration-300 hover:bg-champagne-light"
                  >
                    Comprar
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => {
              const differs = rowDiffers(models, SPECS, row);
              return (
                <tr
                  key={row}
                  className="border-t border-fg/[0.08] transition-colors duration-300 hover:bg-fg/[0.02]"
                >
                  <th
                    scope="row"
                    className="py-6 pl-1 pr-4 text-left align-middle text-[13px] font-semibold tracking-[-0.005em] text-fg/50"
                  >
                    {row}
                  </th>
                  {models.map((m) => (
                    <td
                      key={m.model}
                      className={`px-4 py-6 align-middle text-[15px] leading-snug lg:px-6 ${
                        differs ? "font-medium text-fg" : "text-fg/65"
                      }`}
                    >
                      {SPECS[m.model]?.[row] ?? "—"}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
