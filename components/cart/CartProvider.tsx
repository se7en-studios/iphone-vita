"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartItem, Product } from "@/types";
import type { CartLine } from "@/lib/whatsapp";

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
}

const Ctx = createContext<CartCtx | null>(null);
const KEY = "iphone-vita-cart";

/**
 * Carrito en el navegador (localStorage). Sólo acepta productos con precio fijo:
 * los de precio "consultar" van directo a WhatsApp.
 */
export function CartProvider({ products, children }: { products: Product[]; children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const bySlug = useMemo(() => new Map(products.map((p) => [p.slug, p])), [products]);

  const add = useCallback(
    (slug: string, qty = 1) => {
      const p = bySlug.get(slug);
      if (!p || p.priceType !== "fijo") return;
      setItems((prev) => {
        const found = prev.find((i) => i.slug === slug);
        return found ? prev.map((i) => (i.slug === slug ? { ...i, quantity: i.quantity + qty } : i)) : [...prev, { slug, quantity: qty }];
      });
    },
    [bySlug],
  );

  const setQty = useCallback((slug: string, qty: number) => {
    setItems((prev) => (qty <= 0 ? prev.filter((i) => i.slug !== slug) : prev.map((i) => (i.slug === slug ? { ...i, quantity: qty } : i))));
  }, []);

  const remove = useCallback((slug: string) => setItems((prev) => prev.filter((i) => i.slug !== slug)), []);
  const clear = useCallback(() => setItems([]), []);

  const lines = useMemo(
    () => items.map((i) => ({ product: bySlug.get(i.slug), quantity: i.quantity })).filter((l): l is CartLine => !!l.product),
    [items, bySlug],
  );
  const count = lines.reduce((s, l) => s + l.quantity, 0);
  const subtotal = lines.reduce((s, l) => s + (l.product.price ?? 0) * l.quantity, 0);

  return <Ctx.Provider value={{ lines, count, subtotal, open, setOpen, add, setQty, remove, clear, products }}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart debe usarse dentro de CartProvider");
  return c;
}
