import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="admin-card flex flex-col items-center px-6 py-12 text-center">
      <Icon size={32} className="mb-4 text-[var(--a-muted)]" aria-hidden />
      <h2 className="mb-1.5 text-lg font-semibold">{title}</h2>
      <p className="max-w-md text-sm text-[var(--a-muted)]">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
