import type { ModelGroup } from "@/lib/products";
import { ModelCard } from "../ModelCard";
import { SectionHead } from "../ui/SectionHead";

export function IpadSection({ groups }: { groups: ModelGroup[] }) {
  return (
    <section className="bg-paper py-24 md:py-32">
      <div className="mx-auto max-w-7xl space-y-12 px-4 md:px-8">
        <SectionHead eyebrow="iPad" title="Tu espacio para crear." align="center" />
        <div className="grid gap-4 md:grid-cols-2 md:gap-5">
          {groups.map((g) => (
            <div key={g.model} data-reveal>
              <ModelCard group={g} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
