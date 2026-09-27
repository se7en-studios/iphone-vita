import type { ReactNode } from "react";
import type { FormErrors, FormState } from "./formState";

export interface SectionProps {
  state: FormState;
  set: (patch: Partial<FormState>) => void;
  errors: FormErrors;
}

export function FormSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="space-y-4 border-t border-[var(--a-border)] pt-5 first:border-t-0 first:pt-0">
      <legend className="float-left mb-4 w-full text-[15px] font-semibold">
        {title}
      </legend>
      {children}
    </fieldset>
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
