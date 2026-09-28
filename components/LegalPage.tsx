import type { ReactNode } from "react";
import { LEGAL_UPDATED, SELLER } from "@/lib/legal";
import { WHATSAPP_NUMBER } from "@/lib/whatsapp";

export interface LegalSection {
  title: string;
  body: ReactNode;
}

/** "5492994386853" → "+54 9 299 438-6853" */
function prettyPhone(n: string): string {
  const m = n.match(/^54(9)(\d{3})(\d{3})(\d{4})$/);
  return m ? `+54 ${m[1]} ${m[2]} ${m[3]}-${m[4]}` : `+${n}`;
}

/** Datos del vendedor: solo se muestran los que están cargados en lib/legal.ts. */
export function SellerData() {
  const rows: [string, string][] = [
    ["Titular", SELLER.holder],
    ["CUIT", SELLER.cuit],
    ["Domicilio", SELLER.address],
    ["Email", SELLER.email],
    ["WhatsApp", prettyPhone(WHATSAPP_NUMBER)],
  ];
  return (
    <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
      {rows
        .filter(([, value]) => value)
        .map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-fg/50">{label}</dt>
            <dd className="text-fg">{value}</dd>
          </div>
        ))}
    </dl>
  );
}

export function LegalPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: ReactNode;
  sections: LegalSection[];
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 pb-24 pt-16 md:px-8 md:pt-24">
      <h1 className="text-[clamp(2.2rem,5vw,3.6rem)] font-semibold leading-[1] tracking-[-0.045em]">
        {title}
      </h1>
      <p className="mt-4 text-sm text-muted">
        Última actualización: {LEGAL_UPDATED}
      </p>
      <div className="mt-6 text-lg leading-relaxed text-fg/75">{intro}</div>
      <ol className="mt-12 space-y-10">
        {sections.map((s, i) => (
          <li key={s.title}>
            <h2 className="text-xl font-semibold tracking-tight text-fg">
              {i + 1}. {s.title}
            </h2>
            <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-fg/70 [&_a]:text-link [&_a]:underline [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
              {s.body}
            </div>
          </li>
        ))}
      </ol>
    </article>
  );
}
