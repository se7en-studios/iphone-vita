"use client";

import { useEffect, useRef } from "react";

const DURATION_MS = 1200;

/** Anima el último número del texto ("48 MP", "4K 120") al entrar en pantalla. SSR muestra el valor final. */
export function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const m = value.match(/(\d+)(?!.*\d)/);
    if (!el || !m || m.index == null) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Si ya se ve, no lo reseteamos: evitar que un número visible salte a 0.
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    const target = Number(m[1]);
    const pre = value.slice(0, m.index);
    const post = value.slice(m.index + m[1].length);
    const render = (n: number) => (el.textContent = `${pre}${n}${post}`);
    render(0);

    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const tick = (t: number) => {
          const k = Math.min(1, (t - t0) / DURATION_MS);
          render(Math.round(target * (1 - Math.pow(1 - k, 4))));
          if (k < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      el.textContent = value;
    };
  }, [value]);

  return <span ref={ref}>{value}</span>;
}
