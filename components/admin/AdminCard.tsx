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

type Tone = "default" | "warning" | "danger" | "success" | "gold" | "purple";

const TONE_STYLES: Record<
  Tone,
  {
    iconWrap: string;
    glow: string;
    border: string;
  }
> = {
  default: {
    iconWrap: "bg-[var(--a-accent-bg)] text-[var(--a-accent)]",
    glow: "group-hover:shadow-[0_0_24px_rgba(235,215,190,0.22)]",
    border: "group-hover:border-[var(--a-accent)]/40",
  },
  warning: {
    iconWrap: "bg-[var(--a-warning-bg)] text-[var(--a-warning)]",
    glow: "group-hover:shadow-[0_0_24px_rgba(255,159,10,0.18)]",
    border: "group-hover:border-[var(--a-warning)]/40",
  },
  danger: {
    iconWrap: "bg-[var(--a-danger-bg)] text-[var(--a-danger)]",
    glow: "group-hover:shadow-[0_0_24px_rgba(255,69,58,0.18)]",
    border: "group-hover:border-[var(--a-danger)]/40",
  },
  success: {
    iconWrap: "bg-[var(--a-success-bg)] text-[var(--a-success)]",
    glow: "group-hover:shadow-[0_0_24px_rgba(48,209,88,0.18)]",
    border: "group-hover:border-[var(--a-success)]/40",
  },
  gold: {
    iconWrap: "bg-[var(--a-gold-bg)] text-[var(--a-gold)]",
    glow: "group-hover:shadow-[0_0_24px_rgba(235,215,190,0.18)]",
    border: "group-hover:border-[var(--a-gold)]/40",
  },
  purple: {
    iconWrap: "bg-[var(--a-purple-bg)] text-[var(--a-purple)]",
    glow: "group-hover:shadow-[0_0_24px_rgba(191,90,242,0.18)]",
    border: "group-hover:border-[var(--a-purple)]/40",
  },
};

/** KPI del Resumen. Con `href` es un link al listado ya filtrado. */
export function AdminKpiCard({
  label,
  value,
  subvalue,
  trend,
  icon: Icon,
  href,
  tone = "default",
}: {
  label: string;
  value: number | string;
  subvalue?: string;
  trend?: { value: string; positive?: boolean };
  icon: LucideIcon;
  href?: string;
  tone?: Tone;
}) {
  const t = TONE_STYLES[tone] || TONE_STYLES.default;

  const body = (
    <div className="relative flex flex-col justify-between h-full">
      <div className="mb-3 flex items-start justify-between gap-2">
        <span className="text-[13px] font-medium text-[var(--a-muted)]">
          {label}
        </span>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${t.iconWrap}`}
        >
          <Icon size={17} aria-hidden />
        </span>
      </div>
      <div>
        <div className="flex items-baseline gap-2">
          <div className="text-[28px] sm:text-[32px] font-bold tabular-nums tracking-tight text-[var(--a-text)]">
            {value}
          </div>
          {trend && (
            <span
              className={`inline-flex items-center text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${
                trend.positive
                  ? "bg-[rgba(48,209,88,0.15)] text-[#30d158]"
                  : "bg-[rgba(255,69,58,0.15)] text-[#ff453a]"
              }`}
            >
              {trend.positive ? "↑" : "↓"} {trend.value}
            </span>
          )}
        </div>
        {subvalue && (
          <p className="mt-1 text-xs text-[var(--a-muted)] font-medium">
            {subvalue}
          </p>
        )}
      </div>
    </div>
  );

  const containerClasses = `admin-card group relative overflow-hidden transition-all duration-300 ${t.glow} ${t.border}`;

  if (!href) return <div className={containerClasses}>{body}</div>;
  return (
    <Link
      href={href}
      className={`${containerClasses} admin-card--interactive block`}
    >
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
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-[26px] font-bold tracking-tight sm:text-[32px] text-[var(--a-text)]">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-sm text-[var(--a-muted)] leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2.5">{actions}</div>
      )}
    </div>
  );
}
