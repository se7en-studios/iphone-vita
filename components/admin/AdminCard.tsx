import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export function AdminCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`admin-card ${className}`.trim()}>{children}</div>;
}

type Tone = "default" | "warning" | "danger" | "success";

const TONE: Record<Tone, string> = {
  default: "bg-[var(--a-accent-bg)] text-[var(--a-accent)]",
  warning: "bg-[var(--a-warning-bg)] text-[var(--a-warning)]",
  danger: "bg-[var(--a-danger-bg)] text-[var(--a-danger)]",
  success: "bg-[var(--a-success-bg)] text-[var(--a-success)]",
};

/** KPI del Resumen. Con `href` es un link al listado ya filtrado. */
export function AdminKpiCard({
  label,
  value,
  icon: Icon,
  href,
  tone = "default",
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  href?: string;
  tone?: Tone;
}) {
  const body = (
    <>
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="text-[13px] font-medium text-[var(--a-muted)]">
          {label}
        </span>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${TONE[tone]}`}
        >
          <Icon size={16} aria-hidden />
        </span>
      </div>
      <span className="text-[28px] font-semibold tabular-nums tracking-tight">
        {value}
      </span>
    </>
  );
  if (!href) return <div className="admin-card">{body}</div>;
  return (
    <Link href={href} className="admin-card admin-card--interactive block">
      {body}
    </Link>
  );
}

/** Título de la pantalla + acciones a la derecha. */
export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-[26px] font-semibold tracking-tight sm:text-[30px]">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-[var(--a-muted)]">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
