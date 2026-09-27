import type { NextRequest } from "next/server";
import { handle } from "@/lib/api-guard";
import {
  deleteProducts,
  deleteUnreferencedImages,
  getProductById,
  productImages,
  revalidateStore,
  updateProduct,
} from "@/lib/admin-products";
import {
  validateIds,
  validateProduct,
  ValidationError,
} from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return handle("GET product", async () => {
    const [valid] = validateIds([id]);
    const product = await getProductById(valid);
    if (!product) throw new ValidationError("El producto no existe");
    return product;
  });
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  return handle("PUT product", async () => {
    const [valid] = validateIds([id]);
    const before = await getProductById(valid);
    if (!before) throw new ValidationError("El producto no existe");
    const product = await updateProduct(valid, validateProduct(body));
    const kept = new Set(productImages(product));
    await deleteUnreferencedImages(
      productImages(before).filter((u) => !kept.has(u)),
    );
    revalidateStore();
    return product;
  });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return handle(
    "DELETE product",
    async () => {
      const deleted = await deleteProducts(validateIds([id]));
      await deleteUnreferencedImages(deleted.flatMap(productImages));
      revalidateStore();
      return { ok: true };
    },
    { role: "owner" },
  );
}
