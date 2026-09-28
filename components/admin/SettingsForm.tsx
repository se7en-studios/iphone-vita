"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AlertTriangle, Check, Lock, RefreshCw, Sparkles, TrendingUp } from "lucide-react";
import type { StoreSettings } from "@/types";
import { formatARS } from "@/lib/format";
import { adminApi } from "@/lib/admin-client";
import { AdminButton } from "./AdminButton";
import { AdminCard, AdminPageHeader } from "./AdminCard";
import { AdminField } from "./AdminField";
import { EmptyState } from "./EmptyState";
import { TableSkeleton } from "./TableSkeleton";
import { errorMessage, useAdminToast } from "./AdminToast";
import { useAdminUser } from "./AdminUserContext";

// Mismos límites que validateSettings() en lib/validation.ts.
const MAX_RATE = 1_000_000;
const MAX_ANNOUNCEMENT = 160;
const EXAMPLE_USD = 1000;

export function SettingsForm() {
  const { isOwner } = useAdminUser();
  const showToast = useAdminToast();
  const [rate, setRate] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [saved, setSaved] = useState<StoreSettings | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Consulta en vivo del Dólar Blue
  const [fetchingDolar, setFetchingDolar] = useState(false);
  const [dolarInfo, setDolarInfo] = useState<{
    compra: number;
    venta: number;
    fecha?: string;
    source: string;
  } | null>(null);
  const [dolarError, setDolarError] = useState<string | null>(null);

  async function fetchLiveDollar() {
    setFetchingDolar(true);
    setDolarError(null);
    try {
      const res = await fetch("https://dolarapi.com/v1/dolares/blue");
      if (res.ok) {
        const data = await res.json();
        if (data.venta) {
          setDolarInfo({
            compra: Number(data.compra),
            venta: Number(data.venta),
            fecha: data.fechaActualizacion
              ? new Date(data.fechaActualizacion).toLocaleTimeString("es-AR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : undefined,
            source: "DolarApi (Blue)",
          });
          return;
        }
      }
      // Fallback
      const fbRes = await fetch("https://api.bluelytics.com.ar/v2/latest");
      if (fbRes.ok) {
        const fbData = await fbRes.json();
        if (fbData.blue?.value_sell) {
          setDolarInfo({
            compra: Number(fbData.blue.value_buy),
            venta: Number(fbData.blue.value_sell),
            source: "Bluelytics (Blue)",
          });
          return;
        }
      }
      throw new Error("No se pudo obtener la cotización");
    } catch {
      setDolarError("No se pudo conectar con el servicio de cotización. Podés ingresarla a mano.");
    } finally {
      setFetchingDolar(false);
    }
  }

  function load() {
    setLoadError(null);
    adminApi<StoreSettings>("/api/admin/settings")
      .then((s) => {
        setSaved(s);
        setRate(String(s.arsRate));
        setAnnouncement(s.announcement);
      })
      .catch((err) =>
        setLoadError(errorMessage(err, "No se pudo leer la configuración")),
      );
  }
  useEffect(load, []);

  const rateNum = Number(rate);
  const rateError =
    rate.trim() === "" ||
    !Number.isFinite(rateNum) ||
    rateNum <= 0 ||
    rateNum > MAX_RATE
      ? "Ingresá una cotización mayor a 0"
      : undefined;
  const dirty =
    saved != null &&
    (rateNum !== saved.arsRate || announcement.trim() !== saved.announcement);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (rateError || !isOwner) return;
    setSaving(true);
    try {
      const next = await adminApi<StoreSettings>("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify({
          arsRate: rateNum,
          announcement: announcement.trim(),
        }),
      });
      setSaved(next);
      setRate(String(next.arsRate));
      setAnnouncement(next.announcement);
      showToast(
        "Configuración guardada. La tienda se actualiza en unos segundos.",
      );
    } catch (err) {
      showToast(errorMessage(err, "No se pudo guardar"), "error");
    } finally {
      setSaving(false);
    }
  }

  if (loadError) {
    return (
      <>
        <AdminPageHeader title="Configuración" />
        <EmptyState
          icon={AlertTriangle}
          title="No se pudo cargar"
          description={loadError}
          action={
            <AdminButton variant="secondary" onClick={load}>
              Reintentar
            </AdminButton>
          }
        />
      </>
    );
  }

  return (
    <>
      <AdminPageHeader
        title="Configuración"
        description="Cotización y barra de anuncios de la tienda."
      />
      {!saved ? (
        <TableSkeleton rows={3} />
      ) : (
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
          {!isOwner && (
            <p className="flex items-center gap-2 rounded-xl bg-[var(--a-surface-3)] px-4 py-3 text-sm text-[var(--a-muted)]">
              <Lock size={16} aria-hidden /> Solo el dueño puede cambiar la
              configuración. La ves en modo lectura.
            </p>
          )}
          <AdminCard className="space-y-4">
            <AdminField
              label="Cotización USD → ARS"
              htmlFor="set-rate"
              error={rateError}
              hint={
                !rateError
                  ? `Ejemplo: USD ${EXAMPLE_USD.toLocaleString("es-AR")} = ${formatARS(EXAMPLE_USD, rateNum)}`
                  : undefined
              }
            >
              <div className="relative sm:max-w-[240px]">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-[var(--a-muted)]">
                  $
                </span>
                <input
                  id="set-rate"
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  className="admin-input !pl-7"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  disabled={!isOwner}
                  aria-invalid={Boolean(rateError)}
                />
              </div>
            </AdminField>
            <div className="rounded-xl border border-[var(--a-border)] bg-[var(--a-surface-2)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} className="text-[var(--a-accent)]" />
                  <span className="text-sm font-semibold">Cotización Dólar Blue en vivo</span>
                </div>
                <button
                  type="button"
                  onClick={fetchLiveDollar}
                  disabled={fetchingDolar}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--a-border)] bg-[var(--a-surface-1)] px-3 py-1.5 text-xs font-medium text-[var(--a-fg)] transition hover:bg-[var(--a-surface-3)] disabled:opacity-60"
                >
                  <RefreshCw
                    size={13}
                    className={fetchingDolar ? "animate-spin" : ""}
                  />
                  {fetchingDolar ? "Consultando…" : "Consultar ahora"}
                </button>
              </div>

              {dolarError && (
                <p className="mt-2 text-xs text-[var(--a-danger)]">{dolarError}</p>
              )}

              {dolarInfo && (
                <div className="mt-3 space-y-2.5 border-t border-[var(--a-border)] pt-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-[var(--a-muted)]">
                        Compra:{" "}
                        <strong className="text-[var(--a-fg)]">
                          ${dolarInfo.compra.toLocaleString("es-AR")}
                        </strong>
                      </span>
                      <span className="text-[var(--a-muted)]">
                        Venta:{" "}
                        <strong className="text-[var(--a-fg)]">
                          ${dolarInfo.venta.toLocaleString("es-AR")}
                        </strong>
                      </span>
                    </div>
                    <span className="text-[var(--a-muted)]">
                      {dolarInfo.source} {dolarInfo.fecha && `· ${dolarInfo.fecha}`}
                    </span>
                  </div>

                  {isOwner && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setRate(String(dolarInfo.venta))}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--a-accent)] px-3 py-1 text-xs font-semibold text-white transition hover:opacity-90"
                      >
                        <Check size={13} />
                        Aplicar ${dolarInfo.venta.toLocaleString("es-AR")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setRate(String(dolarInfo.venta + 10))}
                        className="rounded-lg border border-[var(--a-border)] bg-[var(--a-surface-1)] px-2.5 py-1 text-xs font-medium text-[var(--a-fg)] hover:bg-[var(--a-surface-3)]"
                      >
                        + $10 (${(dolarInfo.venta + 10).toLocaleString("es-AR")})
                      </button>
                      <button
                        type="button"
                        onClick={() => setRate(String(dolarInfo.venta + 20))}
                        className="rounded-lg border border-[var(--a-border)] bg-[var(--a-surface-1)] px-2.5 py-1 text-xs font-medium text-[var(--a-fg)] hover:bg-[var(--a-surface-3)]"
                      >
                        + $20 (${(dolarInfo.venta + 20).toLocaleString("es-AR")})
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <p className="text-xs text-[var(--a-muted)]">
              Todos los precios en pesos de la tienda se calculan con este
              valor.
            </p>
          </AdminCard>

          <AdminCard className="space-y-4">
            <AdminField
              label="Barra de anuncios"
              htmlFor="set-announcement"
              hint={`${announcement.length}/${MAX_ANNOUNCEMENT} · Vacío = se muestra el mensaje por defecto.`}
            >
              <input
                id="set-announcement"
                className="admin-input"
                maxLength={MAX_ANNOUNCEMENT}
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                disabled={!isOwner}
                placeholder="Ej: Envíos gratis a todo el país esta semana"
              />
            </AdminField>
            {announcement.trim() && (
              <div
                className="rounded-lg bg-[#1d1d1f] px-4 py-2 text-center text-xs text-white"
                aria-label="Vista previa del anuncio"
              >
                {announcement.trim()}
              </div>
            )}
          </AdminCard>

          {isOwner && (
            <div className="flex justify-end">
              <AdminButton
                type="submit"
                loading={saving}
                disabled={!dirty || Boolean(rateError)}
              >
                {saving ? "Guardando…" : "Guardar cambios"}
              </AdminButton>
            </div>
          )}
        </form>
      )}
    </>
  );
}
