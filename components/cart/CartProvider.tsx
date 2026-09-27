"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, Product } from "@/types";
import type { CartLine } from "@/lib/whatsapp";
import { canBuy, fullName } from "@/lib/format";

interface CartCtx {
  lines: CartLine[];
  count: number;
  subtotal: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  products: Product[];
  /** Aviso de productos que sacamos del carrito porque ya no se pueden comprar. */
  notice: string | null;
  dismissNotice: () => void;
}

const Ctx = createContext<CartCtx | null>(null);
const KEY = "iphone-vita-cart";

/** Tope por línea: las unidades cargadas en el admin, si se conocen. */
export const maxQty = (p: Product) =>
  p.stock != null && p.stock > 0 ? p.stock : Infinity;

function readStored(): CartItem[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (i): i is CartItem =>
        typeof i?.slug === "string" &&
        Number.isInteger(i?.quantity) &&
        i.quantity > 0,
    );
  } catch {
    return [];
  }
}

function removedNotice(names: string[]): string {
  const list = names.join(", ");
  return names.length === 1
    ? `Sacamos ${list} de tu carrito porque ya no está disponible.`
    : `Sacamos de tu carrito ${list} porque ya no están disponibles.`;
}

/**
 * Carrito en el navegador (localStorage). Solo acepta productos con precio fijo y stock:
 * los de precio "consultar" van directo a WhatsApp. Si el admin oculta, borra o deja sin
 * stock algo que estaba en el carrito, se saca solo y se avisa.
 */
export function CartProvider({
  products,
  children,
}: {
  products: Product[];
  children: ReactNode;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setItems(readStored());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      // Sin storage (modo privado): el carrito vive solo en esta pestaña.
    }
  }, [items, loaded]);

  const bySlug = useMemo(
    () => new Map(products.map((p) => [p.slug, p])),
    [products],
  );

  // Depurar líneas que dejaron de ser comprables.
  useEffect(() => {
    const gone = items.filter((i) => {
      const p = bySlug.get(i.slug);
      return !p || !canBuy(p);
    });
    if (!gone.length) return;
    const goneSlugs = new Set(gone.map((i) => i.slug));
    setItems((prev) => prev.filter((i) => !goneSlugs.has(i.slug)));
    setNotice(
      removedNotice(
        gone.map((i) => {
          const p = bySlug.get(i.slug);
          return p
            ? `el ${fullName(p)}`
            : "un producto que ya no está en el catálogo";
        }),
      ),
    );
  }, [items, bySlug]);

  const add = useCallback(
    (slug: string, qty = 1) => {
      const p = bySlug.get(slug);
      if (!p || !canBuy(p)) return;
      setItems((prev) => {
        const found = prev.find((i) => i.slug === slug);
        if (!found)
          return [...prev, { slug, quantity: Math.min(qty, maxQty(p)) }];
        return prev.map((i) =>
          i.slug === slug
            ? { ...i, quantity: Math.min(i.quantity + qty, maxQty(p)) }
            : i,
        );
      });
    },
    [bySlug],
  );

  const setQty = useCallback(
    (slug: string, qty: number) => {
      const p = bySlug.get(slug);
      const capped = p ? Math.min(qty, maxQty(p)) : qty;
      setItems((prev) =>
        capped <= 0
          ? prev.filter((i) => i.slug !== slug)
          : prev.map((i) => (i.slug === slug ? { ...i, quantity: capped } : i)),
      );
    },
    [bySlug],
  );

  const remove = useCallback(
    (slug: string) => setItems((prev) => prev.filter((i) => i.slug !== slug)),
    [],
  );
  const clear = useCallback(() => setItems([]), []);
  const dismissNotice = useCallback(() => setNotice(null), []);

  const lines = useMemo(
    () =>
      items.flatMap((i) => {
        const product = bySlug.get(i.slug);
        return product && canBuy(product)
          ? [{ product, quantity: Math.min(i.quantity, maxQty(product)) }]
          : [];
      }),
    [items, bySlug],
  );
  const count = lines.reduce((s, l) => s + l.quantity, 0);
  const subtotal = lines.reduce(
    (s, l) => s + (l.product.price ?? 0) * l.quantity,
    0,
  );

  return (
    <Ctx.Provider
      value={{
        lines,
        count,
        subtotal,
        open,
        setOpen,
        add,
        setQty,
        remove,
        clear,
        products,
        notice,
        dismissNotice,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart debe usarse dentro de CartProvider");
  return c;
}
