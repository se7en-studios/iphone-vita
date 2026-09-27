import type { NextRequest } from "next/server";
import { handle } from "@/lib/api-guard";
import {
  createProduct,
  listAllProducts,
  revalidateStore,
} from "@/lib/admin-products";
import { validateProduct } from "@/lib/validation";

export async function GET() {
  return handle("GET products", () => listAllProducts());
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  return handle(
    "POST products",
    async () => {
      const product = await createProduct(validateProduct(body));
      revalidateStore();
      return product;
    },
    { status: 201 },
  );
}
