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

/** Comparador minimalista blanco sobre negro, como el de apple.com. */
export function CompareSection({ models }: { models: Product[] }) {
  if (!models.length) return null;
  return (
    <section
      id="comparar"
      className="scroll-mt-28 border-t border-white/10 bg-black py-16 text-white md:py-40"
    >
      <div
        data-reveal
        className="mx-auto max-w-[980px] px-4 text-center md:px-8"
      >
        <p className="text-lg font-semibold text-[#ebd7be] md:text-xl">
          Comparar
        </p>
        <h2 className="mt-3 text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[1.05] tracking-[-0.03em]">
          ¿Cuál es para vos?
        </h2>
      </div>

      <div className="mt-10 md:hidden">
        <CompareMobile models={models} specs={SPECS} rows={ROWS} />
      </div>

      <div className="no-scrollbar mt-16 hidden overflow-x-auto px-8 md:block">
        <table className="mx-auto w-full min-w-[720px] max-w-5xl table-fixed border-collapse text-center">
          <caption className="sr-only">
            Comparación de iPhone 17 Pro, iPhone 17 Pro Max e iPhone 18 Pro
          </caption>
          <thead>
            <tr>
              <th scope="col" className="w-36 md:w-44">
                <span className="sr-only">Característica</span>
              </th>
              {models.map((m) => (
                <th
                  key={m.model}
                  scope="col"
                  className="px-4 pb-10 align-bottom font-normal"
                >
                  <ProductVisual
                    product={m}
                    className="mx-auto aspect-square w-full max-w-[180px] rounded-[20px]"
                    sizes="180px"
                  />
                  <p className="mt-6 text-xl font-semibold">{m.name}</p>
                  {m.price != null && (
                    <p className="tabular mt-1 text-sm text-white/50">
                      Desde {formatUSD(m.price)}
                    </p>
                  )}
                  <Link
                    href={`/producto/${m.slug}`}
                    className="mt-5 inline-block rounded-full bg-[#ebd7be] px-5 py-2 text-sm font-semibold text-black transition hover:bg-white"
                  >
                    Comprar
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row} className="border-t border-white/10">
                <th
                  scope="row"
                  className="py-6 pr-4 text-left text-sm font-normal text-white/50"
                >
                  {row}
                </th>
                {models.map((m) => (
                  <td
                    key={m.model}
                    className="px-4 py-6 text-[15px] leading-snug"
                  >
                    {SPECS[m.model]?.[row] ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
