import Image from "next/image";
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
  const cls =
    "block py-2.5 transition-colors duration-200 hover:text-white md:inline-block md:py-0";
  return (
    <ul className="pb-3 text-sm text-white/55 md:space-y-2.5 md:pb-0 md:text-[13px]">
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

      <div className="mx-auto max-w-[1080px] px-4 pb-10 pt-14 md:px-8 md:pb-12 md:pt-20">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(4,1fr)] md:gap-8">
          <div className="space-y-4">
            <Wordmark dark className="text-2xl" />
            <p className="max-w-[30ch] text-[13px] leading-relaxed text-white/55">
              Apple, accesorios y tecnología premium. Equipos sellados en caja y
              semi nuevos rigurosamente testeados.
            </p>
            <a
              href={waLink("Hola iPhone Vita!")}
              target="_blank"
              rel="noopener noreferrer"
              className="tabular inline-flex items-center gap-2 text-[13px] font-medium text-champagne transition-colors hover:text-champagne-light"
            >
              <ChatIcon className="size-4" />
              {pretty(WHATSAPP_NUMBER)}
            </a>
          </div>
          <div className="divide-y divide-white/10 border-y border-white/10 md:hidden">
            {cols.map((c) => (
              <details key={c.title} className="group">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between text-sm font-semibold text-white/90 [&::-webkit-details-marker]:hidden">
                  {c.title}
                  <ChevronIcon className="size-4 rotate-90 text-white/50 transition group-open:-rotate-90 motion-reduce:transition-none" />
                </summary>
                <FooterLinks links={c.links} />
              </details>
            ))}
          </div>
          {cols.map((c) => (
            <div key={c.title} className="hidden md:block">
              <p className="mb-4 text-[13px] font-semibold text-white">
                {c.title}
              </p>
              <FooterLinks links={c.links} />
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-6 border-t border-white/10 pt-6 text-xs leading-relaxed text-white/50 md:mt-16 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p>
              © {new Date().getFullYear()} iPhone Vita. Precios de referencia en
              USD · Se aceptan Pesos (Dólar Blue del día), USDT y transferencias.
            </p>
            <p className="font-medium text-champagne/80">
              Funda y templado de regalo con tu iPhone nuevo.
            </p>
          </div>
          {/* La imagen era lazy y al fondo de la página a veces no llegaba a pedirse: el chip
              quedaba vacío. Es un PNG de 6 KB, se carga directo. */}
          <a
            href="https://se7endev.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex shrink-0 items-center gap-2.5 self-start rounded-full border border-white/10 px-3.5 py-1.5 transition-colors hover:border-white/25 hover:bg-white/[0.04] md:self-auto"
          >
            <span className="text-white/45 transition-colors group-hover:text-white/70">
              Creado por
            </span>
            <Image
              src="/se7en-logo.png"
              alt="Se7en"
              width={64}
              height={18}
              loading="eager"
              unoptimized
              className="h-4 w-auto object-contain opacity-80 transition-opacity group-hover:opacity-100"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
