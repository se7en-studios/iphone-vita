import type { NextRequest } from "next/server";
import { handle } from "@/lib/api-guard";
import { supabaseAdmin } from "@/lib/supabase";
import { validateIds, ValidationError } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

/** Borrar una venta cambia la facturación: solo el dueño. */
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return handle(
    "DELETE sale",
    async () => {
      const [valid] = validateIds([id]);
      const { data, error } = await supabaseAdmin()
        .from("sales")
        .delete()
        .eq("id", valid)
        .select("id");
      if (error) throw new Error(error.message);
      if (data.length === 0) throw new ValidationError("La venta no existe");
      return { ok: true };
    },
    { role: "owner" },
  );
}
