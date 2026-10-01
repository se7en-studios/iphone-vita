/**
 * URL pública del sitio, en un solo lugar: metadataBase (Open Graph), sitemap, robots y datos
 * estructurados salen de acá. Para un dominio propio alcanza con NEXT_PUBLIC_SITE_URL en Vercel.
 * Sin la variable (o vacía) cae en el dominio actual: antes caía en uno con guion que no existe
 * y los links compartidos por WhatsApp e Instagram salían sin imagen.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://iphonevita.vercel.app"
).replace(/\/+$/, "");

export const SITE_NAME = "iPhone Vita";

/** Open Graph común. Next reemplaza el bloque entero en cada página: las que definen el suyo lo extienden. */
export const OPEN_GRAPH_BASE = {
  type: "website",
  locale: "es_AR",
  siteName: SITE_NAME,
} as const;

/** URL absoluta (JSON-LD no resuelve rutas relativas). Las que ya son absolutas quedan igual. */
export function absoluteUrl(path: string): string {
  return new URL(path, `${SITE_URL}/`).toString();
}
