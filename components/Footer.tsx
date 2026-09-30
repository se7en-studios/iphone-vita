import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { waLink, WHATSAPP_NUMBER } from "@/lib/whatsapp";
import {
  ChatIcon,
  ChevronIcon,
  ShieldIcon,
  SwapIcon,
  TruckIcon,
} from "./ui/Icons";

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
      { label: "Preguntas Frecuentes", href: "/#faq" },
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
      { label: "Instagram Oficial", href: INSTAGRAM, external: true },
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
  const cls = "block py-2.5 transition hover:text-fg hover:underline md:py-0";
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
    <footer className="theme-dark relative border-t border-white/10 bg-black text-white">
      {/* 4-Pillar Trust Guarantee Banner */}
      <div className="footer-trust border-b border-white/10 bg-[#0a0a0c] px-4 py-6 md:px-8 md:py-10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-5 md:gap-6 lg:grid-cols-4">
          <div className="flex items-center gap-3 sm:items-start sm:gap-3.5">
            <span className="flex size-9 shrink-0 items-center md:size-10 justify-center rounded-2xl bg-champagne/10 text-champagne border border-champagne/25">
              <ShieldIcon className="size-5" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-white tracking-tight">
                Garantía Oficial Escrita
              </h4>
              <p className="mt-1 hidden text-xs leading-relaxed text-white/55 sm:block">
                1 año oficial en sellados y 3 meses de respaldo integral Vita en
                seleccionados.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:items-start sm:gap-3.5">
            <span className="flex size-9 shrink-0 items-center md:size-10 justify-center rounded-2xl bg-champagne/10 text-champagne border border-champagne/25">
              <TruckIcon className="size-5" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-white tracking-tight">
                Envíos Asegurados
              </h4>
              <p className="mt-1 hidden text-xs leading-relaxed text-white/55 sm:block">
                A toda la Argentina con seguro de valor declarado o retiro en
                persona coordinado.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:items-start sm:gap-3.5">
            <span className="flex size-9 shrink-0 items-center md:size-10 justify-center rounded-2xl bg-champagne/10 text-champagne border border-champagne/25">
              <SwapIcon className="size-5" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-white tracking-tight">
                Plan Canje Inmediato
              </h4>
              <p className="mt-1 hidden text-xs leading-relaxed text-white/55 sm:block">
                Tomamos tu iPhone usado en el acto para que te lleves el último
                modelo pagando solo la diferencia.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:items-start sm:gap-3.5">
            <span className="flex size-9 shrink-0 items-center md:size-10 justify-center rounded-2xl bg-champagne/10 text-champagne border border-champagne/25">
              <ChatIcon className="size-5" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-white tracking-tight">
                Atención Humana 1 a 1
              </h4>
              <p className="mt-1 hidden text-xs leading-relaxed text-white/55 sm:block">
                Asesoramiento sin bots en WhatsApp. Despejamos tus dudas en
                minutos.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[980px] px-4 pb-12 pt-16 md:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="space-y-4">
            <Wordmark dark className="text-2xl" />
            <p className="max-w-xs text-xs leading-relaxed text-white/55">
              Apple, accesorios y tecnología premium. Equipos sellados en caja y
              semi nuevos rigurosamente testeados.
            </p>
            <p className="tabular font-mono text-xs text-champagne font-bold">
              {pretty(WHATSAPP_NUMBER)}
            </p>
          </div>
          <div className="-mt-4 divide-y divide-white/10 border-y border-white/10 md:hidden">
            {cols.map((c) => (
              <details key={c.title} className="group">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between text-sm font-semibold text-white/90 [&::-webkit-details-marker]:hidden">
                  {c.title}
                  <ChevronIcon className="size-4 rotate-90 text-white/50 transition group-open:-rotate-90" />
                </summary>
                <FooterLinks links={c.links} />
              </details>
            ))}
          </div>
          {cols.map((c) => (
            <div key={c.title} className="hidden md:block">
              <p className="mb-3 text-xs font-bold text-white tracking-wider uppercase">
                {c.title}
              </p>
              <FooterLinks links={c.links} />
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col justify-between gap-3 border-t border-white/10 pt-6 md:mt-16 text-xs text-white/40 sm:flex-row">
          <p>
            © {new Date().getFullYear()} iPhone Vita. Precios de referencia en
            USD · Se aceptan Pesos (Dólar Blue del día), USDT y transferencias.
            {" · "}
            <Link
              href="/admin"
              rel="nofollow"
              className="transition hover:text-white/70"
            >
              Acceso
            </Link>
          </p>
          <p className="text-champagne/80 font-medium">
            Funda y templado de regalo con tu iPhone nuevo.
          </p>
        </div>
      </div>
    </footer>
  );
}
