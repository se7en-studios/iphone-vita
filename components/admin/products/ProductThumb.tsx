import { ImageOff } from "lucide-react";

// ponytail: <img> y no next/image: el admin acepta URLs pegadas de cualquier https
// y next/image rompe con hosts fuera de remotePatterns.
export function ProductThumb({
  src,
  size = 44,
}: {
  src: string | null;
  size?: number;
}) {
  return (
    <div
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-[var(--a-border)] bg-[var(--a-surface-2)]"
      style={{ width: size, height: size }}
    >
      {src ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          className="h-full w-full object-contain"
        />
      ) : (
        <ImageOff
          size={size * 0.4}
          className="text-[var(--a-muted)]"
          aria-label="Sin foto"
        />
      )}
    </div>
  );
}
