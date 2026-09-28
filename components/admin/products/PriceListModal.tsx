"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileText, Share2, Sparkles } from "lucide-react";
import type { Product } from "@/types";
import { formatARS, formatUSD, fullName } from "@/lib/format";
import { AdminButton } from "../AdminButton";
import { AdminModal } from "../AdminModal";
import { useAdminToast } from "../AdminToast";

interface PriceListModalProps {
  products: Product[];
  arsRate: number | null;
  onClose: () => void;
}

type FilterScope = "todos" | "iphones" | "nuevos" | "seminuevos";
type PriceFormat = "ambos" | "usd" | "ars";

export function PriceListModal({
  products,
  arsRate,
  onClose,
}: PriceListModalProps) {
  const showToast = useAdminToast();
  const [scope, setScope] = useState<FilterScope>("iphones");
  const [format, setFormat] = useState<PriceFormat>("ambos");
  const [includeOutStock, setIncludeOutStock] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generar lista de texto
  const priceListText = useMemo(() => {
    let list = products.filter((p) => p.active !== false);

    if (!includeOutStock) {
      list = list.filter((p) => p.stock !== 0);
    }

    if (scope === "iphones") {
      list = list.filter((p) => p.category === "iphone");
    } else if (scope === "nuevos") {
      list = list.filter((p) => p.condition === "nuevo");
    } else if (scope === "seminuevos") {
      list = list.filter((p) => p.condition === "semi-nuevo");
    }

    const nuevos = list.filter((p) => p.condition === "nuevo");
    const seminuevos = list.filter((p) => p.condition === "semi-nuevo");

    const today = new Date().toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const lines: string[] = [
      `🔥 *IPHONE VITA · LISTA DE PRECIOS HOY* 🔥`,
      `📅 Fecha: ${today}${arsRate ? ` · Cotización Dólar: $${arsRate.toLocaleString("es-AR")}` : ""}`,
      `📍 Envíos asegurados a todo el país · Entregas en mano`,
      "",
    ];

    function priceString(p: Product): string {
      if (p.price == null || p.priceType === "consultar") {
        return "Consultar";
      }
      if (format === "usd") {
        return formatUSD(p.price);
      }
      if (format === "ars") {
        return arsRate ? formatARS(p.price, arsRate) : formatUSD(p.price);
      }
      return `${formatUSD(p.price)}${arsRate ? ` (≈ ${formatARS(p.price, arsRate)})` : ""}`;
    }

    if (nuevos.length > 0) {
      lines.push(`✨ *EQUIPOS NUEVOS Y SELLADOS (1 Año Garantía Apple)*`);
      for (const p of nuevos) {
        lines.push(`• ${fullName(p)}: *${priceString(p)}*`);
      }
      lines.push("");
    }

    if (seminuevos.length > 0) {
      lines.push(`💎 *SEMI-NUEVOS SELECCIONADOS (Garantía Escrita)*`);
      for (const p of seminuevos) {
        const bat = p.batteryHealth ? ` · Bat. ${p.batteryHealth}%` : "";
        lines.push(`• ${fullName(p)}${bat}: *${priceString(p)}*`);
      }
      lines.push("");
    }

    lines.push(`🎁 *TODOS LOS IPHONE INCLUYEN:*`);
    lines.push(`✅ Funda de silicona de regalo`);
    lines.push(`✅ Vidrio templado 9D de máxima protección`);
    lines.push(`✅ Aceptamos tu usado en parte de pago (Plan Canje)`);
    lines.push("");
    lines.push(`📲 Consultas y reservas por WhatsApp:`);
    lines.push(`https://wa.me/5492994386853?text=Hola%20iPhone%20Vita!%20Quiero%20consultar%20por%20la%20lista%20de%20precios`);

    return lines.join("\n");
  }, [products, scope, format, includeOutStock, arsRate]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(priceListText);
      setCopied(true);
      showToast("¡Lista copiada al portapapeles! Lista para pegar en WhatsApp o Instagram", "success");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast("No se pudo copiar automáticamente", "error");
    }
  }

  return (
    <AdminModal
      title="Generador de Lista de Precios"
      onClose={onClose}
      maxWidth={640}
    >
      <div className="space-y-4">
        <p className="text-xs text-[var(--a-muted)]">
          Copiá en un clic la lista del día formateada con emojis para enviar por WhatsApp o subir a redes sociales.
        </p>

        {/* Controles de filtro */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-[var(--a-muted)]">
              Alcance de la lista
            </label>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as FilterScope)}
              className="admin-input mt-1"
            >
              <option value="iphones">Solo iPhones</option>
              <option value="todos">Todo el catálogo</option>
              <option value="nuevos">Solo Nuevos</option>
              <option value="seminuevos">Solo Semi-nuevos</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--a-muted)]">
              Moneda a mostrar
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as PriceFormat)}
              className="admin-input mt-1"
            >
              <option value="ambos">USD y Pesos (ARS)</option>
              <option value="usd">Solo USD</option>
              <option value="ars">Solo Pesos (ARS)</option>
            </select>
          </div>

          <div className="flex items-end pb-1">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--a-fg)]">
              <input
                type="checkbox"
                checked={includeOutStock}
                onChange={(e) => setIncludeOutStock(e.target.checked)}
                className="rounded border-[var(--a-border)]"
              />
              Incluir agotados
            </label>
          </div>
        </div>

        {/* Vista previa de texto */}
        <div className="relative">
          <textarea
            readOnly
            value={priceListText}
            rows={14}
            className="admin-input font-mono text-xs leading-relaxed"
          />
        </div>

        {/* Botones de acción */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--a-border)] pt-4">
          <span className="text-xs text-[var(--a-muted)]">
            Tip: Podés pegarla directamente en listas de difusión de WhatsApp o historias.
          </span>
          <div className="flex items-center gap-2">
            <AdminButton variant="secondary" onClick={onClose}>
              Cerrar
            </AdminButton>
            <AdminButton onClick={handleCopy}>
              {copied ? (
                <>
                  <Check size={16} /> ¡Copiado!
                </>
              ) : (
                <>
                  <Copy size={16} /> Copiar Lista Completa
                </>
              )}
            </AdminButton>
          </div>
        </div>
      </div>
    </AdminModal>
  );
}
