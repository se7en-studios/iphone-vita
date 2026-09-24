"use client";

import Link from "next/link";
import { useState } from "react";
import type { ModelGroup } from "@/lib/products";
import { ModelCard } from "../ModelCard";
import { SectionHead } from "../ui/SectionHead";

export function IphoneSection({ groups }: { groups: ModelGroup[] }) {
  const [filter, setFilter] = useState<string>("todos");
  const shown = filter === "todos" ? groups : groups.filter((g) => g.model === filter);

  return (
    <section id="iphone" className="scroll-mt-16 bg-paper py-24 md:py-32">
      <div className="mx-auto max-w-7xl space-y-12 px-4 md:px-8">
        <SectionHead
          eyebrow="iPhone nuevos"
          title={<>El iPhone que<br />estabas buscando.</>}
          action={
            <Link href="/encontra-tu-iphone" className="text-sm font-medium text-vita hover:underline">¿No sabés cuál? Encontrá el tuyo →</Link>
          }
        />
        <div data-reveal className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0" role="tablist" aria-label="Filtrar por modelo">
          {[{ model: "todos", name: "Todos" }, ...groups].map((g) => (
            <button
              key={g.model}
              type="button"
              role="tab"
              aria-selected={filter === g.model}
              onClick={() => setFilter(g.model)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${filter === g.model ? "bg-ink text-white" : "bg-mist text-ink/75 hover:bg-fog"}`}
            >
              {g.name}
            </button>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-6">
          {shown.map((g, idx) => (
            <div key={g.model} className={`${idx === shown.length - 1 && shown.length % 2 === 1 && shown.length > 1 ? "sm:col-span-2 " : ""}${shown.length === 1 || idx < 2 ? "lg:col-span-3" : "lg:col-span-2"}`}>
              <ModelCard group={g} size={shown.length > 1 && idx >= 2 ? "md" : "lg"} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
