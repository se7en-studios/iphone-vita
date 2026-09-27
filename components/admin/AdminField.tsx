import type { ReactNode } from "react";

/** Label real + control + error. `htmlFor` debe coincidir con el id del control. */
export function AdminField({
  label,
  htmlFor,
  error,
  hint,
  children,
  className = "",
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`.trim()}>
      <label
        htmlFor={htmlFor}
        className="block text-[13px] font-medium text-[var(--a-text)]"
      >
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-[var(--a-muted)]">{hint}</p>
      )}
      {error && (
        <p
          id={`${htmlFor}-error`}
          className="text-xs font-medium text-[var(--a-danger)]"
        >
          {error}
        </p>
      )}
    </div>
  );
}
