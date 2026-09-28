import type { NextRequest } from "next/server";
import { handle } from "@/lib/api-guard";
import { supabaseAdmin } from "@/lib/supabase";
import { ValidationError } from "@/lib/validation";
import { PAYMENT_METHODS, rowToSale, SALE_COLUMNS } from "@/lib/sales";

const MAX_PRICE = 1_000_000;
const MAX_PRICE_ARS = 100_000_000_000;
// Tope por pedido: alcanza para años de ventas de una tienda y evita respuestas enormes.
const LIST_LIMIT = 2000;
// El import de ventas viejas del navegador puede mandar varias juntas.
const MAX_BATCH = 500;

type Obj = Record<string, unknown>;

function text(
  o: Obj,
  key: string,
  label: string,
  max: number,
  required = false,
) {
  const v = o[key];
  if (v == null || (typeof v === "string" && v.trim() === "")) {
    if (required) throw new ValidationError(`${label} es obligatorio`);
    return null;
  }
  if (typeof v !== "string" || v.trim().length > max)
    throw new ValidationError(`${label} inválido (máximo ${max} caracteres)`);
  return v.trim();
}

function money(o: Obj, key: string, label: string, min: number, max: number) {
  const n = Number(o[key] ?? 0);
  if (!Number.isFinite(n) || n < min || n > max)
    throw new ValidationError(`${label} inválido`);
  return Math.round(n * 100) / 100;
}

function toRow(body: unknown, createdBy: string) {
  if (!body || typeof body !== "object")
    throw new ValidationError("Venta inválida");
  const o = body as Obj;
  const salePrice = money(o, "salePriceUSD", "Precio de venta", 0.01, MAX_PRICE);
  const condition = o.condition === "semi-nuevo" ? "semi-nuevo" : "nuevo";
  const payment = o.paymentMethod;
  if (
    typeof payment !== "string" ||
    !PAYMENT_METHODS.includes(payment as never)
  )
    throw new ValidationError("Método de pago inválido");
  const quantity = Number(o.quantity ?? 1);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 1000)
    throw new ValidationError("Cantidad inválida");
  const productId =
    typeof o.productId === "string" && /^[0-9a-f-]{36}$/i.test(o.productId)
      ? o.productId
      : null;
  const createdAt =
    typeof o.createdAt === "string" && !Number.isNaN(Date.parse(o.createdAt))
      ? o.createdAt
      : undefined;

  return {
    product_id: productId,
    product_name: text(o, "productName", "Producto", 200, true),
    condition,
    quantity,
    sale_price_usd: salePrice,
    cost_usd: money(o, "costUSD", "Costo", 0, MAX_PRICE),
    sale_price_ars: money(o, "salePriceARS", "Precio en pesos", 0, MAX_PRICE_ARS),
    payment_method: payment,
    customer_name: text(o, "customerName", "Cliente", 200),
    trade_in_model: text(o, "tradeInModel", "Equipo de canje", 200),
    notes: text(o, "notes", "Nota", 500),
    created_by: createdBy,
    // Solo lo manda el import de ventas viejas, para conservar su fecha real.
    ...(createdAt && { created_at: createdAt }),
  };
}

export async function GET() {
  return handle("GET sales", async () => {
    const { data, error } = await supabaseAdmin()
      .from("sales")
      .select(SALE_COLUMNS)
      .order("created_at", { ascending: false })
      .limit(LIST_LIMIT);
    if (error) throw new Error(error.message);
    return data.map(rowToSale);
  });
}

/** Una venta (objeto) o varias (array, para el import desde el navegador). */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  return handle(
    "POST sales",
    async (admin) => {
      const items = Array.isArray(body) ? body : [body];
      if (items.length === 0 || items.length > MAX_BATCH)
        throw new ValidationError(`Mandá entre 1 y ${MAX_BATCH} ventas`);
      const rows = items.map((item) => toRow(item, admin.email));
      const { data, error } = await supabaseAdmin()
        .from("sales")
        .insert(rows)
        .select(SALE_COLUMNS);
      if (error) throw new Error(error.message);
      const sales = data.map(rowToSale);
      return Array.isArray(body) ? sales : sales[0];
    },
    { status: 201 },
  );
}
