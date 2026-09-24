import type { ReactNode } from "react";

export function SectionHead({ eyebrow, title, lede, dark = false, align = "left", action }: { eyebrow?: string; title: ReactNode; lede?: ReactNode; dark?: boolean; align?: "left" | "center"; action?: ReactNode }) {
  return (
    <div data-reveal className={`flex flex-col gap-6 md:flex-row md:items-end md:justify-between ${align === "center" ? "items-center text-center md:flex-col md:items-center" : ""}`}>
      <div className={`space-y-4 ${align === "center" ? "mx-auto max-w-3xl" : "max-w-3xl"}`}>
        {eyebrow && <p className={`font-mono text-[11px] uppercase tracking-[0.2em] ${dark ? "text-white/45" : "text-muted"}`}>{eyebrow}</p>}
        <h2 className={`text-[clamp(2.2rem,5.4vw,4.4rem)] font-semibold leading-[1.02] tracking-[-0.04em] ${dark ? "text-white" : "text-ink"}`}>{title}</h2>
        {lede && <p className={`max-w-xl text-lg leading-relaxed ${dark ? "text-white/60" : "text-muted"}`}>{lede}</p>}
      </div>
      {action}
    </div>
  );
}
