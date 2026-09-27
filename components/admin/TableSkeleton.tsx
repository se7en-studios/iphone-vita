export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div
      className="flex flex-col gap-2.5"
      aria-busy="true"
      aria-label="Cargando"
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="admin-skeleton h-[60px] rounded-xl"
          style={{ opacity: 1 - i * 0.1 }}
        />
      ))}
    </div>
  );
}

export function KpiSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="admin-skeleton h-[96px] rounded-[18px]" />
      ))}
    </div>
  );
}
