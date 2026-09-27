import type { NextRequest } from "next/server";
import { handle, requireAdmin } from "@/lib/api-guard";
import {
  adjustPrices,
  deleteProducts,
  deleteUnreferencedImages,
  patchProducts,
  productImages,
  revalidateStore,
} from "@/lib/admin-products";
import { validateIds, validatePatch, ValidationError } from "@/lib/validation";

/*
 * Acciones sobre uno o varios productos:
 *   { ids, action: "patch", patch: { price?, stock?, stockLevel?, active?, featured? } }
 *   { ids, action: "adjust-price", percent }   (ej: 5 = +5%, -10 = -10%)
 *   { ids, action: "delete" }                  (solo owner)
 * La edición rápida de una fila usa "patch" con un solo id.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  return handle("POST products/bulk", async () => {
    if (!body) throw new ValidationError("Cuerpo inválido");
    const ids = validateIds(body.ids);
    let result;
    switch (body.action) {
      case "patch":
        result = await patchProducts(ids, validatePatch(body.patch));
        break;
      case "adjust-price":
        result = await adjustPrices(ids, Number(body.percent));
        break;
      case "delete": {
        await requireAdmin("owner");
        const deleted = await deleteProducts(ids);
        await deleteUnreferencedImages(deleted.flatMap(productImages));
        result = deleted;
        break;
      }
      default:
        throw new ValidationError("Acción inválida");
    }
    revalidateStore();
    return { count: result.length, products: result };
  });
}
