import type { ReactNode } from "react";
import type { CategorySlug, SubcategorySlug } from "@/types";

type P = { className?: string };
const base = "fill-none stroke-current";
const sw = { strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const SearchIcon = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={`${base} ${className}`} {...sw} aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
);
export const BagIcon = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={`${base} ${className}`} {...sw} aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8a3 3 0 0 1 6 0" /></svg>
);
export const CloseIcon = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={`${base} ${className}`} {...sw} aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const MenuIcon = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={`${base} ${className}`} {...sw} aria-hidden="true"><path d="M4 8h16M4 16h16" /></svg>
);
export const ArrowIcon = ({ className = "size-4" }: P) => (
  <svg viewBox="0 0 24 24" className={`${base} ${className}`} {...sw} aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const PlusIcon = ({ className = "size-4" }: P) => (
  <svg viewBox="0 0 24 24" className={`${base} ${className}`} {...sw} aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
);
export const MinusIcon = ({ className = "size-4" }: P) => (
  <svg viewBox="0 0 24 24" className={`${base} ${className}`} {...sw} aria-hidden="true"><path d="M5 12h14" /></svg>
);
export const FilterIcon = ({ className = "size-4" }: P) => (
  <svg viewBox="0 0 24 24" className={`${base} ${className}`} {...sw} aria-hidden="true"><path d="M4 7h16M7 12h10M10 17h4" /></svg>
);
export const CheckIcon = ({ className = "size-4" }: P) => (
  <svg viewBox="0 0 24 24" className={`${base} ${className}`} {...sw} aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
);
/** Burbuja de chat genérica para las acciones de WhatsApp. */
export const ChatIcon = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={`${base} ${className}`} {...sw} aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-11.8 7l-4.2 1.2 1.2-4A8 8 0 1 1 20 11.5Z" /><path d="M9 10.5c.5 2 2 3.6 4.2 4.3" /></svg>
);

/* ---------- ilustraciones de categoría (placeholder de producto) ---------- */

const G = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 120 120" className="h-full w-full fill-none stroke-current" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const glyphs: Record<string, ReactNode> = {
  iphone: (<G><rect x="40" y="18" width="40" height="84" rx="10" /><rect x="53" y="23" width="14" height="4" rx="2" /></G>),
  mac: (<G><rect x="24" y="30" width="72" height="46" rx="4" /><path d="M14 84h92l-5 6H19z" /></G>),
  ipad: (<G><rect x="28" y="20" width="64" height="82" rx="8" /><circle cx="60" cy="24.5" r="1.2" /></G>),
  "apple-watch": (<G><rect x="40" y="36" width="40" height="48" rx="12" /><path d="M46 36V20h28v16M46 84v16h28V84" /><path d="M80 54h3v8h-3" /></G>),
  airpods: (<G><rect x="36" y="44" width="48" height="42" rx="16" /><path d="M36 58h48" /><circle cx="60" cy="68" r="1.4" /></G>),
  accesorios: (<G><path d="M30 86c0-26 60-26 60-52" /><rect x="84" y="22" width="12" height="16" rx="2" /><rect x="24" y="84" width="12" height="16" rx="2" /></G>),
  cables: (<G><path d="M30 86c0-26 60-26 60-52" /><rect x="84" y="22" width="12" height="16" rx="2" /><rect x="24" y="84" width="12" height="16" rx="2" /></G>),
  cargadores: (<G><rect x="38" y="40" width="44" height="44" rx="10" /><path d="M52 40V28M68 40V28" /></G>),
  "apple-pencil": (<G><path d="M30 92 86 36l6 6-56 56-9 3z" /><path d="M80 42l6 6" /></G>),
  airtags: (<G><circle cx="60" cy="60" r="28" /><circle cx="60" cy="60" r="10" /></G>),
  auriculares: (<G><path d="M42 30v34a10 10 0 0 0 10 10M78 30v34a10 10 0 0 1-10 10" /><circle cx="42" cy="28" r="6" /><circle cx="78" cy="28" r="6" /><path d="M52 74v20M68 74v20" /></G>),
  audio: (<G><rect x="18" y="38" width="84" height="44" rx="18" /><circle cx="42" cy="60" r="12" /><circle cx="78" cy="60" r="12" /></G>),
  gaming: (<G><path d="M34 44h52c10 0 14 26 10 36-3 7-12 6-16-2l-4-6H44l-4 6c-4 8-13 9-16 2-4-10 0-36 10-36Z" /><path d="M42 56v10M37 61h10" /><circle cx="78" cy="58" r="2" /><circle cx="84" cy="64" r="2" /></G>),
  "camaras-creators": (<G><rect x="46" y="26" width="28" height="50" rx="10" /><path d="M52 40h16M52 48h16" /><path d="M60 76v18M48 94h24" /></G>),
  wearables: (<G><circle cx="60" cy="60" r="22" /><path d="M50 38l4-16h12l4 16M50 82l4 16h12l4-16" /><path d="M60 50v10l7 5" /></G>),
};

export function CategoryGlyph({ category, subcategory }: { category: CategorySlug; subcategory?: SubcategorySlug }) {
  return <>{(subcategory && glyphs[subcategory]) || glyphs[category] || glyphs.iphone}</>;
}
