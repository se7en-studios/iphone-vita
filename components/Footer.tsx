import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { waLink, WHATSAPP_NUMBER } from "@/lib/whatsapp";

const INSTAGRAM = "https://www.instagram.com/iphone_vita/";

const cols = [
  {
    title: "Productos",
    links: [
      { label: "iPhone", href: "/productos?categoria=iphone" },
      { label: "Mac", href: "/productos?categoria=mac" },
      { label: "iPad", href: "/productos?categoria=ipad" },
      { label: "Apple Watch", href: "/productos?categoria=apple-watch" },
      { label: "Accesorios", href: "/productos?categoria=accesorios" },
    ],
  },
  {
    title: "Ayuda",
    links: [
      { label: "Contacto", href: waLink("Hola iPhone Vita! Quiero hacer una consulta."), external: true },
      { label: "WhatsApp", href: waLink("Hola iPhone Vita!"), external: true },
      { label: "Envíos", href: waLink("Hola! Quiero consultar por envíos."), external: true },
      { label: "Garantía", href: waLink("Hola! Quiero consultar por la garantía."), external: true },
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

const pretty = (n: string) => `+${n.slice(0, 2)} ${n.slice(2, 3)} ${n.slice(3, 7)} ${n.slice(7, 9)}-${n.slice(9)}`;

export function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-20 md:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="space-y-4">
            <Wordmark dark className="text-2xl" />
            <p className="max-w-xs text-sm text-white/55">Apple, accesorios y tecnología premium. Todo en un solo lugar.</p>
            <p className="tabular font-mono text-xs text-white/40">{pretty(WHATSAPP_NUMBER)}</p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">{c.title}</p>
              <ul className="space-y-2.5 text-sm text-white/75">
                {c.links.map((l) => (
                  <li key={l.label}>
                    {"external" in l && l.external ? (
                      <a href={l.href} target="_blank" rel="noopener noreferrer" className="transition hover:text-white">{l.label}</a>
                    ) : (
                      <Link href={l.href} className="transition hover:text-white">{l.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 flex flex-col justify-between gap-3 border-t border-line-dark pt-6 text-xs text-white/40 sm:flex-row">
          <p>© {new Date().getFullYear()} iPhone Vita. Precios en dólares estadounidenses.</p>
          <p>Diseño y desarrollo: Se7en Studio</p>
        </div>
      </div>
    </footer>
  );
}
