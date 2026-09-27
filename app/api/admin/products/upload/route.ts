import type { NextRequest } from "next/server";
import { handle } from "@/lib/api-guard";
import { PRODUCT_IMAGE_BUCKET } from "@/lib/admin-products";
import { supabaseAdmin } from "@/lib/supabase";
import { ValidationError } from "@/lib/validation";

const MAX_BYTES = 5 * 1024 * 1024;
const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// file.type lo manda el navegador y puede mentir: se chequean los magic bytes.
function matchesSignature(buf: Buffer, ext: string): boolean {
  if (ext === "jpg")
    return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  if (ext === "png")
    return buf.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  if (ext === "webp") {
    return (
      buf.subarray(0, 4).toString("ascii") === "RIFF" &&
      buf.subarray(8, 12).toString("ascii") === "WEBP"
    );
  }
  return false;
}

export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  return handle(
    "POST products/upload",
    async () => {
      const file = form?.get("file");
      if (!(file instanceof File)) throw new ValidationError("Falta la imagen");
      if (file.size > MAX_BYTES)
        throw new ValidationError("La imagen no puede superar 5 MB");
      const ext = MIME_EXT[file.type];
      if (!ext)
        throw new ValidationError("Formato no permitido. Usá JPG, PNG o WebP.");
      const buffer = Buffer.from(await file.arrayBuffer());
      if (!matchesSignature(buffer, ext))
        throw new ValidationError("El archivo no es una imagen válida");

      const path = `${crypto.randomUUID()}.${ext}`;
      const storage = supabaseAdmin().storage.from(PRODUCT_IMAGE_BUCKET);
      const { error } = await storage.upload(path, buffer, {
        contentType: file.type,
        cacheControl: "31536000",
      });
      if (error) throw new Error(error.message);
      return { url: storage.getPublicUrl(path).data.publicUrl };
    },
    { status: 201 },
  );
}
