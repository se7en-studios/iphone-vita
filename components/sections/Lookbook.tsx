import Image from "next/image";
import Link from "next/link";
import { ArrowIcon } from "../ui/Icons";

interface Tile {
  href: string;
  eyebrow: string;
  title: string;
  image: string;
  alt: string;
}

const TILES: Tile[] = [
  {
    href: "/productos?categoria=accesorios",
    eyebrow: "Accesorios",
    title: "Fundas y protección",
    image: "/images/cases.jpg",
    alt: "Fundas para iPhone",
  },
  {
    href: "/productos?categoria=ipad",
    eyebrow: "iPad",
    title: "iPad Pro",
    image: "/images/ipad-pro.jpg",
    alt: "iPad Pro apoyado en un escritorio",
  },
];

/** Grilla editorial estilo lookbook: fotos reales grandes con caption superpuesta. */
export function Lookbook() {
  return (
    <section className="border-t border-white/10 bg-black py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div data-reveal className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="font-semibold text-base text-[#ebd7be]">
              Lookbook
            </p>
            <h2 className="mt-3 text-[clamp(2rem,4.5vw,3.2rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
              La tienda en{" "}
              <span className="text-[#ebd7be]">
                imágenes.
              </span>
            </h2>
          </div>
          <Link
            href="/productos"
            className="hidden shrink-0 items-center gap-2 text-sm font-medium text-white/70 transition hover:text-[#ebd7be] md:flex"
          >
            Ver catálogo completo <ArrowIcon />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 md:gap-5">
          {TILES.map((t) => (
            <Tile key={t.href} tile={t} className="aspect-[4/3]" />
          ))}
        </div>

        <Link
          href="/productos?categoria=iphone"
          className="group relative mt-4 block aspect-[16/9] overflow-hidden rounded-[28px] ring-1 ring-white/10 md:mt-5 md:aspect-[21/8]"
        >
          <Image
            src="/images/lifestyle-hand-pro.jpg"
            alt="iPhone en mano"
            fill
            sizes="100vw"
            className="object-cover transition-transform duration-700 ease-[var(--ease-soft)] group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-6 md:p-10">
            <p className="font-semibold text-base text-[#ebd7be]">
              iPhone
            </p>
            <h3 className="text-2xl font-bold text-white md:text-4xl">
              Toda la línea, sellada.
            </h3>
            <span className="mt-1 inline-flex w-fit items-center gap-2 text-sm font-medium text-white/80 transition group-hover:text-[#ebd7be]">
              Ver todos los iPhone <ArrowIcon />
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}

function Tile({ tile, className = "" }: { tile: Tile; className?: string }) {
  return (
    <Link
      href={tile.href}
      className={`group relative block overflow-hidden rounded-[28px] ring-1 ring-white/10 ${className}`}
    >
      <Image
        src={tile.image}
        alt={tile.alt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover transition-transform duration-700 ease-[var(--ease-soft)] group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/5 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 md:p-7">
        <div>
          <p className="font-semibold text-xs text-[#ebd7be]">
            {tile.eyebrow}
          </p>
          <h3 className="mt-1 text-xl font-bold text-white md:text-2xl">
            {tile.title}
          </h3>
        </div>
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-white transition group-hover:translate-x-1 group-hover:bg-[#ebd7be] group-hover:text-black">
          <ArrowIcon />
        </span>
      </div>
    </Link>
  );
}
