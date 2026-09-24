import type { Product } from "@/types";

/*
 * "Encontrá tu iPhone": lógica por filtros y puntaje, sin IA.
 * Cada respuesta suma o descarta modelos según reglas simples y explicables.
 */

export type Budget = "hasta-900" | "hasta-1300" | "sin-tope";
export type Use = "basico" | "fotos" | "trabajo";
export type Size = "compacto" | "grande" | "indistinto";
export type Preference = "camara" | "bateria" | "precio";
export type CondPref = "nuevo" | "semi-nuevo" | "cualquiera";

export interface FinderAnswers {
  budget?: Budget;
  use?: Use;
  size?: Size;
  preference?: Preference;
  condition?: CondPref;
}

export const QUESTIONS = [
  {
    key: "budget",
    title: "¿Cuánto querés invertir?",
    options: [
      { value: "hasta-900", label: "Hasta USD 900" },
      { value: "hasta-1300", label: "Hasta USD 1.300" },
      { value: "sin-tope", label: "Sin tope" },
    ],
  },
  {
    key: "use",
    title: "¿Para qué lo vas a usar?",
    options: [
      { value: "basico", label: "Redes, mensajes y lo diario" },
      { value: "fotos", label: "Fotos y video" },
      { value: "trabajo", label: "Trabajo y juegos" },
    ],
  },
  {
    key: "size",
    title: "¿Qué tamaño preferís?",
    options: [
      { value: "compacto", label: "Que entre en una mano" },
      { value: "grande", label: "Pantalla grande" },
      { value: "indistinto", label: "Me da igual" },
    ],
  },
  {
    key: "preference",
    title: "¿Qué es lo que más te importa?",
    options: [
      { value: "camara", label: "La cámara" },
      { value: "bateria", label: "La batería" },
      { value: "precio", label: "El precio" },
    ],
  },
  {
    key: "condition",
    title: "¿Nuevo o semi nuevo?",
    options: [
      { value: "nuevo", label: "Nuevo" },
      { value: "semi-nuevo", label: "Semi nuevo, para llegar a un Pro" },
      { value: "cualquiera", label: "Mostrame los dos" },
    ],
  },
] as const;

const isPro = (p: Product) => /Pro/.test(p.name);
const isMax = (p: Product) => /Max/.test(p.name);

export function matchIphones(all: Product[], a: FinderAnswers): Product[] {
  let list = all.filter((p) => p.category === "iphone");

  if (a.condition === "nuevo") list = list.filter((p) => p.condition === "nuevo");
  if (a.condition === "semi-nuevo") list = list.filter((p) => p.condition === "semi-nuevo");

  if (a.budget && a.budget !== "sin-tope") {
    const cap = a.budget === "hasta-900" ? 900 : 1300;
    // Los semi nuevos se muestran siempre: su precio se consulta y suelen ser la alternativa accesible.
    list = list.filter((p) => p.price == null || p.price <= cap);
  }

  if (a.size === "compacto") list = list.filter((p) => !isMax(p));
  if (a.size === "grande") list = list.filter((p) => isMax(p));

  const score = (p: Product) => {
    let s = 0;
    if ((a.use === "fotos" || a.use === "trabajo") && isPro(p)) s += 3;
    if (a.use === "basico" && !isPro(p)) s += 2;
    if (a.preference === "camara" && isPro(p)) s += 2;
    if (a.preference === "bateria" && isMax(p)) s += 2;
    if (a.preference === "bateria" && p.batteryHealth) s += p.batteryHealth >= 90 ? 1 : 0;
    if (a.preference === "precio") s += p.condition === "semi-nuevo" ? 2 : p.price ? Math.max(0, 2 - p.price / 800) : 0;
    if (p.stockLevel !== "bajo") s += 0.5;
    return s;
  };

  // Un resultado por modelo+condición para no repetir colores.
  const best = new Map<string, Product>();
  for (const p of list.sort((x, y) => score(y) - score(x))) {
    if (!best.has(p.model)) best.set(p.model, p);
  }
  return [...best.values()].slice(0, 6);
}
