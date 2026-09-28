import type { ModelGroup } from "@/lib/products";
import { ModelCard } from "../ModelCard";
import { SectionHead } from "../ui/SectionHead";

/** "Lo más elegido": modelos que el dueño marca como destacados en el admin. Mobile: carrusel con snap. */
export function BestSellers({ groups }: { groups: ModelGroup[] }) {
  if (!groups.length) return null;
  return (
    <section
      id="destacados"
      className="scroll-mt-28 border-t border-fg/10 bg-bg py-14 text-fg md:py-24"
    >
      <div className="mx-auto max-w-7xl space-y-8 px-4 md:space-y-10 md:px-8">
        <SectionHead
          eyebrow="Lo más elegido"
          title="Los que más salen."
          action={{ href: "/productos?condicion=nuevo", label: "Ver nuevos" }}
        />
        <ul
          data-stagger
          className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-4"
        >
          {groups.map((g) => (
            <li
              key={g.model}
              className="w-[78vw] max-w-[340px] shrink-0 snap-start sm:w-auto sm:max-w-none"
            >
              <ModelCard group={g} size="md" dark />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
