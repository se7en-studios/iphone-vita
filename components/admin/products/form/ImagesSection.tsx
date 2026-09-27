"use client";

import { useRef, useState, type DragEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Link as LinkIcon,
  Loader2,
  Star,
  Upload,
  X,
} from "lucide-react";
import { adminApi } from "@/lib/admin-client";
import { errorMessage, useAdminToast } from "../../AdminToast";
import { FormSection, type SectionProps } from "./FormSection";
import { LIMITS } from "./formState";

const ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_BYTES = 5 * 1024 * 1024;

export function ImagesSection({ state, set, errors }: SectionProps) {
  const [uploading, setUploading] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [url, setUrl] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const showToast = useAdminToast();
  const images = state.images;
  const room = LIMITS.gallery - images.length;

  async function uploadFiles(files: File[]) {
    const valid = files.filter(
      (f) => ACCEPT.split(",").includes(f.type) && f.size <= MAX_BYTES,
    );
    if (valid.length < files.length)
      showToast(
        "Algunas fotos no se subieron: solo JPG, PNG o WebP de hasta 5 MB.",
        "error",
      );
    const batch = valid.slice(0, Math.max(0, room));
    if (valid.length > batch.length)
      showToast(`La galería admite hasta ${LIMITS.gallery} fotos.`, "error");
    if (batch.length === 0) return;

    setUploading(batch.length);
    const uploaded: string[] = [];
    for (const file of batch) {
      const form = new FormData();
      form.append("file", file);
      try {
        const { url: uploadedUrl } = await adminApi<{ url: string }>(
          "/api/admin/products/upload",
          { method: "POST", body: form },
        );
        uploaded.push(uploadedUrl);
      } catch (err) {
        showToast(
          `${file.name}: ${errorMessage(err, "no se pudo subir")}`,
          "error",
        );
      }
      setUploading((n) => n - 1);
    }
    if (uploaded.length) set({ images: [...images, ...uploaded] });
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    uploadFiles(Array.from(e.dataTransfer.files));
  }

  function move(from: number, to: number) {
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    set({ images: next });
  }

  function addUrl() {
    const value = url.trim();
    if (!/^https:\/\/\S+$/.test(value) && !/^\/images\/\S+$/.test(value)) {
      showToast("La URL tiene que empezar con https:// o /images/", "error");
      return;
    }
    set({ images: [...images, value] });
    setUrl("");
  }

  return (
    <FormSection title={`Fotos (${images.length}/${LIMITS.gallery})`}>
      {images.length > 0 && (
        <ul className="flex flex-wrap gap-2.5">
          {images.map((src, i) => (
            <li
              key={src}
              className={`group relative h-24 w-24 overflow-hidden rounded-xl border bg-[var(--a-surface-2)] ${
                i === 0
                  ? "border-[var(--a-accent)] ring-1 ring-[var(--a-accent)]"
                  : "border-[var(--a-border)]"
              }`}
            >
              {/* ponytail: <img> porque puede ser una URL pegada de cualquier host */}
              <img
                src={src}
                alt={`Foto ${i + 1}`}
                className="h-full w-full object-contain"
              />
              {i === 0 && (
                <span className="absolute inset-x-1 bottom-1 rounded bg-[var(--a-accent)] py-0.5 text-center text-[10px] font-semibold text-white">
                  Principal
                </span>
              )}
              <div className="absolute inset-x-0 top-0 flex justify-between p-1 opacity-100 sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
                <div className="flex gap-0.5">
                  {i > 0 && (
                    <button
                      type="button"
                      onClick={() => move(i, i - 1)}
                      aria-label={`Mover foto ${i + 1} a la izquierda`}
                      className="flex h-6 w-6 items-center justify-center rounded-md bg-black/60 text-white"
                    >
                      <ArrowLeft size={12} />
                    </button>
                  )}
                  {i < images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => move(i, i + 1)}
                      aria-label={`Mover foto ${i + 1} a la derecha`}
                      className="flex h-6 w-6 items-center justify-center rounded-md bg-black/60 text-white"
                    >
                      <ArrowRight size={12} />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    set({ images: images.filter((_, j) => j !== i) })
                  }
                  aria-label={`Quitar foto ${i + 1}`}
                  className="flex h-6 w-6 items-center justify-center rounded-md bg-black/60 text-white hover:bg-[var(--a-danger)]"
                >
                  <X size={12} />
                </button>
              </div>
              {i > 0 && (
                <button
                  type="button"
                  onClick={() => move(i, 0)}
                  aria-label={`Usar foto ${i + 1} como principal`}
                  className="absolute inset-x-1 bottom-1 flex items-center justify-center gap-1 rounded bg-black/60 py-0.5 text-[10px] font-semibold text-white opacity-100 sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100"
                >
                  <Star size={10} /> Principal
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {room > 0 && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`flex w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed p-5 transition ${
            dragOver
              ? "border-[var(--a-accent)] bg-[var(--a-accent-bg)]"
              : "border-[var(--a-border-strong)] bg-[var(--a-surface-2)] hover:border-[var(--a-accent)]"
          }`}
        >
          {uploading > 0 ? (
            <span className="flex items-center gap-2 text-sm font-medium text-[var(--a-accent)]">
              <Loader2 size={16} className="animate-spin" /> Subiendo{" "}
              {uploading} foto{uploading === 1 ? "" : "s"}…
            </span>
          ) : (
            <>
              <span className="flex items-center gap-2 text-sm font-medium text-[var(--a-accent)]">
                <Upload size={16} /> Hacé clic o arrastrá fotos acá
              </span>
              <span className="text-xs text-[var(--a-muted)]">
                JPG, PNG o WebP · hasta 5 MB cada una · la primera es la
                principal
              </span>
            </>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          uploadFiles(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />

      <div className="flex gap-2">
        <div className="relative flex-1">
          <LinkIcon
            size={14}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[var(--a-muted)]"
            aria-hidden
          />
          <input
            aria-label="Pegar URL de una foto"
            className="admin-input !pl-8"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addUrl();
              }
            }}
            placeholder="O pegá una URL (https://… o /images/…)"
          />
        </div>
        <button
          type="button"
          onClick={addUrl}
          disabled={!url.trim() || room <= 0}
          className="admin-btn admin-btn--secondary"
        >
          Agregar
        </button>
      </div>
      {errors.images && (
        <p className="text-xs font-medium text-[var(--a-danger)]">
          {errors.images}
        </p>
      )}
    </FormSection>
  );
}
