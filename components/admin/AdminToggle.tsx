"use client";

export function AdminToggle({
  checked,
  onChange,
  label,
  hideLabel = false,
  disabled = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  /** En la tabla solo se ve el switch; el label queda para lectores de pantalla. */
  hideLabel?: boolean;
  disabled?: boolean;
}) {
  return (
    <label className="admin-toggle" title={hideLabel ? label : undefined}>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="admin-toggle-track" aria-hidden>
        <span className="admin-toggle-thumb" />
      </span>
      <span className={hideLabel ? "sr-only" : ""}>{label}</span>
    </label>
  );
}
