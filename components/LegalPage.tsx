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
    <dl className="mt-4 divide-y divide-fg/[0.08] rounded-2xl bg-bg px-5 text-[15px] ring-1 ring-fg/[0.06]">
      {rows
        .filter(([, value]) => value)
        .map(([label, value]) => (
          <div
            key={label}
            className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-baseline sm:gap-6"
          >
            <dt className="text-[13px] text-fg/50 sm:w-24 sm:shrink-0">{label}</dt>
            <dd className="tabular break-words text-fg">{value}</dd>
          </div>
        ))}
    </dl>
  );
}

const slug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

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
    <div className="bg-bg text-fg">
      <article className="mx-auto max-w-[1100px] px-4 pb-24 pt-14 md:px-8 md:pt-24">
        <header className="max-w-[720px]">
          <p className="text-[15px] font-semibold tracking-[-0.005em] text-vita md:text-[17px]">
            Legal
          </p>
          <h1 className="mt-2 text-[clamp(2.4rem,5.5vw,4rem)] font-bold leading-[1.04] tracking-[-0.035em]">
            {title}
          </h1>
          <p className="mt-4 text-[13px] text-fg/50">
            Última actualización: {LEGAL_UPDATED}
          </p>
          <div className="mt-6 text-[17px] leading-[1.6] text-fg/70 md:text-[19px] [&_a]:text-link [&_a]:underline [&_a]:decoration-link/30 [&_a]:underline-offset-4 [&_a:hover]:decoration-link">
            {intro}
          </div>
        </header>

        <div className="mt-12 grid gap-10 border-t border-fg/[0.08] pt-10 md:mt-16 md:pt-14 lg:grid-cols-[220px_1fr] lg:gap-16">
          {/* Índice: en escritorio queda fijo al costado. */}
          <nav aria-label="Contenido" className="hidden lg:block">
            <div className="sticky top-28">
              <p className="text-[13px] font-semibold text-fg/50">En esta página</p>
              <ol className="mt-3 space-y-2 border-l border-fg/[0.08]">
                {sections.map((s, i) => (
                  <li key={s.title}>
                    <a
                      href={`#${slug(s.title)}`}
                      className="-ml-px block border-l border-transparent py-0.5 pl-4 text-[13px] leading-snug text-fg/60 transition hover:border-fg/40 hover:text-fg"
                    >
                      <span className="tabular text-fg/35">{i + 1}.</span> {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          <ol className="max-w-[680px] space-y-12">
            {sections.map((s, i) => (
              <li key={s.title} id={slug(s.title)} className="scroll-mt-28">
                <h2 className="flex gap-3 text-[22px] font-semibold leading-tight tracking-[-0.02em] text-fg md:text-2xl">
                  <span className="tabular text-fg/30">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {s.title}
                </h2>
                <div className="mt-4 space-y-4 text-[16px] leading-[1.7] text-fg/75 md:text-[17px] [&_a]:text-link [&_a]:underline [&_a]:decoration-link/30 [&_a]:underline-offset-4 [&_a:hover]:decoration-link [&_li]:pl-1 [&_strong]:font-semibold [&_strong]:text-fg [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:marker:text-fg/30 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5">
                  {s.body}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </article>
    </div>
  );
}
