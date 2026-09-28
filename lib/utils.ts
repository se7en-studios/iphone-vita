/**
 * Une clases condicionales. ponytail: sin tailwind-merge, así que no resuelve
 * conflictos (dos alturas, etc.): quien lo usa no debe pasar clases que choquen.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
