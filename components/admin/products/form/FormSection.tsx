import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import type { FormErrors, FormState } from "./formState";

export interface SectionProps {
  state: FormState;
  set: (patch: Partial<FormState>) => void;
  errors: FormErrors;
}

export function FormSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: LucideIcon;
  children: ReactNode;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-[var(--a-border)] bg-[var(--a-surface)] p-5 shadow-sm">
      <div className="flex items-center gap-2 border-b border-[var(--a-border)] pb-3">
        {Icon && <Icon size={16} className="text-[var(--a-accent)]" />}
        <h3 className="text-sm font-semibold tracking-tight text-[var(--a-text)]">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

/** Props de accesibilidad para un input con error. */
export const invalidProps = (
  errors: FormErrors,
  key: keyof FormState,
  id: string,
) =>
  errors[key]
    ? { "aria-invalid": true as const, "aria-describedby": `${id}-error` }
    : {};
