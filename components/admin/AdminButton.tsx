"use client";

import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

export interface AdminButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md";
  fullWidth?: boolean;
  loading?: boolean;
}

export function AdminButton({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  disabled,
  type = "button",
  className = "",
  children,
  ...rest
}: AdminButtonProps) {
  const classes = [
    "admin-btn",
    `admin-btn--${variant}`,
    size === "sm" && "admin-btn--sm",
    fullWidth && "admin-btn--full",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={classes}
      {...rest}
    >
      {loading && <Loader2 size={15} className="animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
