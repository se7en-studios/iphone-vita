"use client";

import { useState } from "react";
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
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative flex shrink-0 items-center justify-center overflow-visible"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="flex shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-[var(--a-border)] bg-[var(--a-surface-2)] transition-all duration-200 hover:border-[var(--a-accent)]/50"
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

      {/* Floating HD Preview on hover */}
      {hovered && src && (
        <div
          className="pointer-events-none fixed z-[9999] hidden md:flex items-center justify-center overflow-hidden rounded-2xl border border-[var(--a-accent)]/40 bg-black/95 p-3 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_24px_rgba(235,215,190,0.18)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150"
          style={{
            width: 180,
            height: 180,
            transform: "translate(60px, -45%)",
          }}
        >
          <img
            src={src}
            alt=""
            className="h-full w-full object-contain filter drop-shadow-md"
          />
        </div>
      )}
    </div>
  );
}

