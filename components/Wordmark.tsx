/** Wordmark provisorio hasta tener el logo en alta de iPhone Vita. */
export function Wordmark({ dark = false, className = "" }: { dark?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-baseline gap-[0.18em] text-[19px] leading-none tracking-[-0.03em] ${dark ? "text-white" : "text-ink"} ${className}`}>
      <span className="font-semibold">iPhone</span>
      <span className="font-light">Vita</span>
      <span className="size-[0.28em] translate-y-[-0.05em] rounded-full bg-vita" aria-hidden="true" />
    </span>
  );
}
