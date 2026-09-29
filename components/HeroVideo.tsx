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
    if (!video || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Cerca de la pantalla empieza a bajar (1.4 MB); a la mitad visible, se reproduce.
    const near = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        video.preload = "auto";
        near.disconnect();
      },
      // Chico a propósito: con más margen arrancaría a bajar ya detrás del intro.
      { rootMargin: "300px 0px" },
    );
    const visible = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        // Autoplay bloqueado (modo ahorro, etc.): queda el poster, no es un error.
        video.play().catch(() => {});
        visible.disconnect();
      },
      { threshold: 0.5 },
    );
    near.observe(video);
    visible.observe(video);
    return () => {
      near.disconnect();
      visible.disconnect();
    };
  }, []);

  return (
    <>
      <video
        ref={ref}
        src={src}
        poster={poster}
        muted
        playsInline
        preload="none"
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
