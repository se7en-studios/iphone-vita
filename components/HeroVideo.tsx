"use client";

import { useEffect, useRef } from "react";

/**
 * Video de campaña que se reproduce una sola vez al entrar en pantalla y queda en el último cuadro.
 * Con reduced-motion el CSS oculta el video y muestra la foto final (`endSrc`).
 */
export function HeroVideo({
  src,
  poster,
  endSrc,
  alt,
}: {
  src: string;
  poster: string;
  endSrc: string;
  alt: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        // Autoplay bloqueado (modo ahorro, etc.): queda el poster, no es un error.
        video.play().catch(() => {});
        io.disconnect();
      },
      { threshold: 0.5 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <video
        ref={ref}
        src={src}
        poster={poster}
        muted
        playsInline
        preload="auto"
        aria-label={alt}
        className="size-full object-cover motion-reduce:hidden"
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- solo se ve con reduced-motion */}
      <img
        src={endSrc}
        alt={alt}
        loading="lazy"
        className="hidden size-full object-cover motion-reduce:block"
      />
    </>
  );
}
