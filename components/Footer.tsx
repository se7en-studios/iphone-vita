import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { waLink, WHATSAPP_NUMBER } from "@/lib/whatsapp";
import { ChevronIcon } from "./ui/Icons";

const INSTAGRAM = "https://www.instagram.com/iphone_vita/";

const cols: { title: string; links: FooterLink[] }[] = [
  {
    title: "Productos",
    links: [
      { label: "iPhone", href: "/productos?categoria=iphone" },
      { label: "Plan Canje", href: "/#plan-canje" },
      { label: "Mac", href: "/productos?categoria=mac" },
      { label: "iPad", href: "/productos?categoria=ipad" },
      { label: "Apple Watch", href: "/productos?categoria=apple-watch" },
      { label: "Accesorios", href: "/productos?categoria=accesorios" },
    ],
  },
  {
    title: "Ayuda",
    links: [
      { label: "Plan Canje Usados", href: "/#plan-canje" },
      {
        label: "Contacto Directo",
        href: waLink("Hola iPhone Vita! Quiero hacer una consulta."),
        external: true,
      },
      {
        label: "WhatsApp Oficial",
        href: waLink("Hola iPhone Vita!"),
        external: true,
      },
      {
        label: "Envíos y Entregas",
        href: waLink("Hola! Quiero consultar por envíos."),
        external: true,
      },
      {
        label: "Garantía Oficial",
        href: waLink("Hola! Quiero consultar por la garantía."),
        external: true,
      },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Sobre nosotros", href: "/#nosotros" },
      { label: "Instagram", href: INSTAGRAM, external: true },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Términos", href: "/terminos" },
      { label: "Privacidad", href: "/privacidad" },
    ],
  },
];

type FooterLink = { label: string; href: string; external?: boolean };

function FooterLinks({ links }: { links: FooterLink[] }) {
  const cls =
    "block py-2.5 transition hover:text-fg hover:underline md:py-0";
  return (
    <ul className="pb-3 text-sm text-fg/60 md:space-y-2 md:pb-0 md:text-xs">
      {links.map((l) => (
        <li key={l.label}>
          {l.external ? (
            <a
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cls}
            >
              {l.label}
            </a>
          ) : (
            <Link href={l.href} className={cls}>
              {l.label}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}

const pretty = (n: string) =>
  `+${n.slice(0, 2)} ${n.slice(2, 3)} ${n.slice(3, 7)} ${n.slice(7, 9)}-${n.slice(9)}`;

export function Footer() {
  return (
    <footer className="border-t border-fg/10 bg-bg text-fg">
      <div className="mx-auto max-w-[980px] px-4 pb-10 pt-16 md:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="space-y-4">
            <Wordmark dark className="text-2xl" />
            <p className="max-w-xs text-xs leading-relaxed text-fg/55">
              Apple, accesorios y tecnología premium. Equipos sellados en caja y
              semi nuevos seleccionados.
            </p>
            <p className="tabular font-mono text-xs text-highlight/80">
              {pretty(WHATSAPP_NUMBER)}
            </p>
          </div>
          <div className="-mt-4 divide-y divide-fg/10 border-y border-fg/10 md:hidden">
            {cols.map((c) => (
              <details key={c.title} className="group">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between text-sm font-semibold text-fg/90 [&::-webkit-details-marker]:hidden">
                  {c.title}
                  <ChevronIcon className="size-4 rotate-90 text-fg/50 transition group-open:-rotate-90" />
                </summary>
                <FooterLinks links={c.links} />
              </details>
            ))}
          </div>
          {cols.map((c) => (
            <div key={c.title} className="hidden md:block">
              <p className="mb-3 text-xs font-semibold text-fg/90">
                {c.title}
              </p>
              <FooterLinks links={c.links} />
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-col justify-between gap-3 border-t border-fg/10 pt-6 md:mt-16 text-xs text-fg/40 sm:flex-row">
          <p>
            © {new Date().getFullYear()} iPhone Vita. Precios de referencia en
            USD · Se aceptan Pesos (cotización Dólar Blue del día) y
            transferencias.
          </p>
          <p className="text-fg/40">
            Funda y templado de regalo con tu iPhone nuevo.
          </p>
        </div>
      </div>
    </footer>
  );
}
