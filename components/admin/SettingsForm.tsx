"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  Building2,
  Check,
  CheckCircle2,
  DollarSign,
  Lock,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from "lucide-react";
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

const MAX_RATE = 1_000_000;
const MAX_ANNOUNCEMENT = 160;
const EXAMPLE_USD = 1000;

interface DolarData {
  compra: number;
  venta: number;
  fecha?: string;
  source: string;
}

export function SettingsForm() {
  const { isOwner } = useAdminUser();
  const showToast = useAdminToast();
  const [rate, setRate] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [saved, setSaved] = useState<StoreSettings | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Consulta en vivo: Banco Nación y Dólar Blue
  const [fetchingDolar, setFetchingDolar] = useState(false);
  const [blueInfo, setBlueInfo] = useState<DolarData | null>(null);
  const [bnaInfo, setBnaInfo] = useState<DolarData | null>(null);
  const [dolarError, setDolarError] = useState<string | null>(null);

  async function fetchLiveDollar() {
    setFetchingDolar(true);
    setDolarError(null);
    try {
      const [resBlue, resOficial] = await Promise.allSettled([
        fetch("https://dolarapi.com/v1/dolares/blue"),
        fetch("https://dolarapi.com/v1/dolares/oficial"),
      ]);

      if (resBlue.status === "fulfilled" && resBlue.value.ok) {
        const data = await resBlue.value.json();
        if (data.venta) {
          setBlueInfo({
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
        }
      }

      if (resOficial.status === "fulfilled" && resOficial.value.ok) {
        const data = await resOficial.value.json();
        if (data.venta) {
          setBnaInfo({
            compra: Number(data.compra),
            venta: Number(data.venta),
            fecha: data.fechaActualizacion
              ? new Date(data.fechaActualizacion).toLocaleTimeString("es-AR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : undefined,
            source: "Banco Nación (BNA)",
          });
        }
      }
    } catch {
      setDolarError(
        "No se pudo conectar con el servicio de cotización. Podés ingresarla a mano.",
      );
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

  useEffect(() => {
    load();
    fetchLiveDollar();
  }, []);

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
        "Configuración guardada. La cotización de la tienda ya está actualizada.",
      );
    } catch (err) {
      showToast(errorMessage(err, "No se pudo guardar"), "error");
    } finally {
      setSaving(false);
    }
  }

  function copyQuoteToAnnouncement(sourceLabel: string, value: number) {
    const text = `Cotización del día: 1 USD = $${value.toLocaleString("es-AR")} ARS (${sourceLabel}) · Envíos a todo el país`;
    setAnnouncement(text.slice(0, MAX_ANNOUNCEMENT));
    showToast("Texto copiado a la barra de anuncios", "success");
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
        title="Configuración de Moneda & Tienda"
        description="Cotización del dólar activa, sincronización diaria y barra de anuncios."
      />
      {!saved ? (
        <TableSkeleton rows={3} />
      ) : (
        <form onSubmit={handleSubmit} className="max-w-3xl space-y-5">
          {!isOwner && (
            <p className="flex items-center gap-2 rounded-xl bg-[var(--a-surface-3)] px-4 py-3 text-sm text-[var(--a-muted)]">
              <Lock size={16} aria-hidden /> Solo el dueño puede cambiar la
              configuración. La ves en modo lectura.
            </p>
          )}

          {/* Panel de Cotización */}
          <AdminCard className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--a-border)] pb-3">
              <div>
                <h3 className="text-base font-semibold text-[var(--a-text)]">
                  Cotización USD → ARS de la Tienda
                </h3>
                <p className="text-xs text-[var(--a-muted)]">
                  El valor que la web toma para convertir todos los precios de
                  dólares a pesos en tiempo real.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchLiveDollar}
                disabled={fetchingDolar}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--a-border)] bg-[var(--a-surface-2)] px-3 py-1.5 text-xs font-semibold text-[var(--a-text)] transition hover:bg-[var(--a-surface-3)] disabled:opacity-60"
              >
                <RefreshCw
                  size={13}
                  className={fetchingDolar ? "animate-spin text-[var(--a-accent)]" : ""}
                />
                {fetchingDolar ? "Actualizando…" : "Consultar bancos hoy"}
              </button>
            </div>

            <AdminField
              label="Valor actual en la tienda ($ ARS por cada 1 USD)"
              htmlFor="set-rate"
              error={rateError}
              hint={
                !rateError
                  ? `Ejemplo: USD ${EXAMPLE_USD.toLocaleString("es-AR")} = ${formatARS(EXAMPLE_USD, rateNum)}`
                  : undefined
              }
            >
              <div className="relative sm:max-w-[280px]">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-semibold text-[var(--a-muted)]">
                  $ ARS
                </span>
                <input
                  id="set-rate"
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  className="admin-input !pl-16 text-base font-bold tabular-nums"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  disabled={!isOwner}
                  aria-invalid={Boolean(rateError)}
                />
              </div>
            </AdminField>

            {/* Comparador de Cotizaciones Oficiales del Día */}
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--a-muted)]">
                Cotizaciones Oficiales de Hoy (DolarApi)
              </span>

              {dolarError && (
                <p className="text-xs text-[var(--a-danger)]">{dolarError}</p>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                {/* Tarjeta Dólar Blue */}
                <div className="rounded-xl border border-[var(--a-border)] bg-[var(--a-surface-2)] p-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={16} className="text-[#0071e3]" />
                      <span className="text-sm font-bold text-[var(--a-text)]">
                        Dólar Blue
                      </span>
                    </div>
                    {blueInfo?.fecha && (
                      <span className="text-[11px] text-[var(--a-muted)]">
                        Hoy {blueInfo.fecha}
                      </span>
                    )}
                  </div>

                  {blueInfo ? (
                    <div className="mt-2.5 space-y-2">
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="text-[var(--a-muted)]">
                          Compra:{" "}
                          <strong className="text-[var(--a-text)]">
                            ${blueInfo.compra.toLocaleString("es-AR")}
                          </strong>
                        </span>
                        <span className="text-[var(--a-muted)]">
                          Venta:{" "}
                          <strong className="text-sm font-bold text-[var(--a-text)]">
                            ${blueInfo.venta.toLocaleString("es-AR")}
                          </strong>
                        </span>
                      </div>

                      {isOwner && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[var(--a-border)]">
                          <button
                            type="button"
                            onClick={() => setRate(String(blueInfo.venta))}
                            className="inline-flex items-center gap-1 rounded-md bg-[var(--a-accent)] px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-[var(--a-accent-hover)]"
                          >
                            <Check size={12} />
                            Fijar ${blueInfo.venta.toLocaleString("es-AR")}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setRate(String(Math.round(blueInfo.venta * 1.02)))
                            }
                            className="rounded-md border border-[var(--a-border)] bg-[var(--a-surface)] px-2 py-1 text-[11px] font-medium text-[var(--a-text)] hover:bg-[var(--a-surface-3)]"
                            title="Sumar +2% de recargo por spread"
                          >
                            +2% (${Math.round(blueInfo.venta * 1.02)})
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-[var(--a-muted)]">
                      {fetchingDolar ? "Consultando…" : "No disponible"}
                    </p>
                  )}
                </div>

                {/* Tarjeta Banco Nación (Oficial BNA) */}
                <div className="rounded-xl border border-[var(--a-border)] bg-[var(--a-surface-2)] p-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 size={16} className="text-[#34c759]" />
                      <span className="text-sm font-bold text-[var(--a-text)]">
                        Banco Nación (BNA)
                      </span>
                    </div>
                    {bnaInfo?.fecha && (
                      <span className="text-[11px] text-[var(--a-muted)]">
                        Hoy {bnaInfo.fecha}
                      </span>
                    )}
                  </div>

                  {bnaInfo ? (
                    <div className="mt-2.5 space-y-2">
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="text-[var(--a-muted)]">
                          Compra:{" "}
                          <strong className="text-[var(--a-text)]">
                            ${bnaInfo.compra.toLocaleString("es-AR")}
                          </strong>
                        </span>
                        <span className="text-[var(--a-muted)]">
                          Venta:{" "}
                          <strong className="text-sm font-bold text-[var(--a-text)]">
                            ${bnaInfo.venta.toLocaleString("es-AR")}
                          </strong>
                        </span>
                      </div>

                      {isOwner && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[var(--a-border)]">
                          <button
                            type="button"
                            onClick={() => setRate(String(bnaInfo.venta))}
                            className="inline-flex items-center gap-1 rounded-md bg-[#34c759] px-2.5 py-1 text-xs font-semibold text-white transition hover:brightness-95"
                          >
                            <Check size={12} />
                            Fijar ${bnaInfo.venta.toLocaleString("es-AR")}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              copyQuoteToAnnouncement(
                                "Banco Nación",
                                bnaInfo.venta,
                              )
                            }
                            className="rounded-md border border-[var(--a-border)] bg-[var(--a-surface)] px-2 py-1 text-[11px] font-medium text-[var(--a-text)] hover:bg-[var(--a-surface-3)]"
                            title="Colocar en barra de anuncios de la tienda"
                          >
                            Poner en anuncio
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-[var(--a-muted)]">
                      {fetchingDolar ? "Consultando…" : "No disponible"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </AdminCard>

          {/* Barra de Anuncios */}
          <AdminCard className="space-y-4">
            <AdminField
              label="Barra de anuncios superior (en la tienda)"
              htmlFor="set-announcement"
              hint={`${announcement.length}/${MAX_ANNOUNCEMENT} caracteres · Si está vacío, rota automáticamente con mensajes oficiales y la cotización del día.`}
            >
              <textarea
                id="set-announcement"
                rows={2}
                maxLength={MAX_ANNOUNCEMENT}
                className="admin-input"
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                disabled={!isOwner}
                placeholder="Ej: Cotización del día: 1 USD = $1.380 ARS (Banco Nación / Dólar Blue al día) · Envíos a todo el país"
              />
            </AdminField>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-[var(--a-muted)]">Sugerencias rápidas:</span>
              <button
                type="button"
                onClick={() =>
                  setAnnouncement(
                    `Cotización del día: 1 USD = $${rateNum.toLocaleString("es-AR")} ARS · Aceptamos pesos y dólares`,
                  )
                }
                className="rounded-full border border-[var(--a-border-strong)] bg-[var(--a-surface)] px-2.5 py-1 text-[11px] font-medium text-[var(--a-muted)] hover:text-[var(--a-text)]"
              >
                + Cotización activa
              </button>
              <button
                type="button"
                onClick={() =>
                  setAnnouncement(
                    "Plan Canje: Tomamos tu iPhone usado en el acto · Consultá por WhatsApp",
                  )
                }
                className="rounded-full border border-[var(--a-border-strong)] bg-[var(--a-surface)] px-2.5 py-1 text-[11px] font-medium text-[var(--a-muted)] hover:text-[var(--a-text)]"
              >
                + Plan Canje
              </button>
              <button
                type="button"
                onClick={() => setAnnouncement("")}
                className="text-[11px] text-[var(--a-danger)] hover:underline"
              >
                Limpiar anuncio
              </button>
            </div>
          </AdminCard>

          {isOwner && (
            <div className="flex justify-end pt-2">
              <AdminButton
                type="submit"
                loading={saving}
                disabled={!dirty || Boolean(rateError)}
              >
                Guardar cambios de configuración
              </AdminButton>
            </div>
          )}
        </form>
      )}
    </>
  );
}
